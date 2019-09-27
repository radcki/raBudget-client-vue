import Vue from 'vue'

export const apiHandler = {
  logout,
  fetchAuthorized,
  getAccessToken
}

function getAccessToken () {
  return Vue.prototype.$keycloak ? Vue.prototype.$keycloak.token : null
}

function logout () {
  localStorage.removeItem('user')
  localStorage.removeItem('clientId')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('token')
}

function fetchAuthorized (url, options) {
  var jwtToken = getAccessToken()
  options = options || {}
  options.headers = options.headers || {}
  if (jwtToken) {
    options.headers['Authorization'] = 'Bearer ' + jwtToken
  }
  return fetch(url, options)
}
