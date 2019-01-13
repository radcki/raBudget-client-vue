import { userService } from '../_services/user.service'
import { apiHandler } from '../_services/apiHandler'
import moment from 'moment'

var user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

const state = {
  user: user,
  lastAuthCheck: null,
  status: {
    loggedIn: false,
    loggingIn: false,
    registering: false,
    registered: false
  }
}

const actions = {
  login ({ dispatch, commit }, { username, password }) {
    commit('loginRequest', { username })

    return new Promise((resolve, reject) => {
      userService.login(username, password)
        .then((response) => {
          if (response.ok) {
            return response.json()
              .then((data) => {
                localStorage.setItem('user', JSON.stringify(data.user))
                apiHandler.saveAccessToken(data.token)
                apiHandler.saveRefreshToken(data.refreshToken)
                apiHandler.saveClientId(data.clientId)

                commit('loginSuccess', data.user)
                resolve(true)
              })
          } else if (response.status === 404) {
            return response.json()
              .then(error => {
                commit('loginFailure', error.message)
                dispatch('alert/error', error.message, { root: true })
                resolve(false)
              })
          } else {
            reject(response)
          }
        })
        .catch((error) => {
          reject(error)
          commit('loginFailure')
          dispatch('alert/error', 'account.loginFailed', { root: true })
        })
    })
  },
  checkLogin ({ state }) {
    return new Promise((resolve, reject) => {
      if (state.user == null) {
        state.status.loggedIn = false
        resolve(state.status.loggedIn)
        return
      }
      if (state.lastAuthCheck && state.lastAuthCheck.diff(moment(), 'minutes') < 5) {
        state.status.loggedIn = true
        resolve(state.status.loggedIn)
        return
      }
      userService.confirmAuthorization().then(response => {
        state.status.loggedIn = !!response.ok
        state.lastAuthCheck = moment()
        resolve(state.status.loggedIn)
      }).catch(() => {
        state.status.loggedIn = false
        resolve(state.status.loggedIn)
      })
    })
  },
  logout ({ commit }) {
    userService.logout()
    commit('logout')
  },
  register ({ dispatch, commit }, user) {
    commit('registerRequest')
    return new Promise((resolve, reject) => {
      userService.register(user)
        .then(response => {
          if (response.ok) {
            commit('registerSuccess', user)
            resolve(true)
            setTimeout(() => {
              dispatch('alert/success', 'account.registerOk', { root: true })
            })
          } else {
            response.json()
              .then(error => {
                commit('registerFailure')
                dispatch('alert/error', error.message, { root: true })
              })
            resolve(false)
          }
        }).catch(error => {
          reject(error)
        })
    })
  },
  updateProfile ({ dispatch, commit }, user) {
    userService.update(user)
      .then(response => {
        if (response.ok) {
          dispatch('alert/success', 'general.changesSaved', { root: true })
        } else {
          return response.json()
            .then(error => {
              dispatch('alert/error', error, { root: true })
            })
        }
      })
  },
  changePassword ({ dispatch, commit }, data) {
    return userService.changePassword(data.oldpassword, data.newpassword)
      .then(response => {
        if (response.ok) {
          dispatch('alert/success', 'general.changesSaved', { root: true })
          return true
        } else {
          return response.json()
            .then(error => {
              dispatch('alert/error', error.message, { root: true })
              return false
            })
        }
      })
  },
  verifyEmail ({ dispatch, commit, state }, verificationToken) {
    return new Promise((resolve, reject) => {
      userService.submitEmailConfirmationCode(verificationToken).then((response) => {
        if (response.ok) {
          state.user.emailVerified = true
          localStorage.setItem('user', JSON.stringify(state.user))
          resolve(true)
        } else {
          dispatch('alert/error', 'account.emailVerificationFailed', { root: true })
          resolve(false)
        }
      }).catch((error) => {
        reject(error)
        commit('loginFailure')
        dispatch('alert/error', 'account.loginFailed', { root: true })
      })
    })
  }
}

const mutations = {
  loginRequest (state) {
    state.status.loggingIn = true
    state.status.loggedIn = false
    state.user = null
  },
  loginSuccess (state, user) {
    state.status.loggingIn = false
    state.status.loggedIn = true
    state.user = user
  },
  loginFailure (state) {
    state.status.loggingIn = false
    state.status.loggedIn = false
    state.user = null
  },
  logout (state) {
    state.status.loggingIn = false
    state.status.loggedIn = false
    state.user = null
  },
  registerRequest (state) {
    state.status.registering = true
    state.status.registed = true
    state.user = null
  },
  registerSuccess (state, user) {
    state.status.registed = true
    state.status.registering = false
    state.user = user
  },
  registerFailure (state) {
    state.status.registed = false
    state.status.registering = false
    state.user = null
  }
}

export const account = {
  namespaced: true,
  state,
  actions,
  mutations
}
