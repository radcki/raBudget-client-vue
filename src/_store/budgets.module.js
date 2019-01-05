import { budgetService } from '../_services/budget.service'
import moment from 'moment'

const state = {
  budgets: []
}

const actions = {
  fetchBudgets ({dispatch, commit}) {
    return new Promise((resolve, reject) => {
      dispatch('wait/start', 'budgets.loading', { root: true })
      budgetService.userBudgets()
        .then(response => {
          if (response.ok) {
            response.json().then(
              data => {
                var budgets = data.map(budget => {
                  return {...budget, startingDate: moment(budget.startingDate).format('YYYY-MM')}
                })
                for (var budget of budgets) {
                  for (var category of budget.spendingCategories) {
                    for (var config of category.amountConfigs) {
                      config.validFrom = moment(config.validFrom).format('YYYY-MM')
                      config.validTo = config.validTo ? moment(config.validTo).format('YYYY-MM') : null
                    }
                  }
                  for (var category of budget.incomeCategories) {
                    for (var config of category.amountConfigs) {
                      config.validFrom = moment(config.validFrom).format('YYYY-MM')
                      config.validTo = config.validTo ? moment(config.validTo).format('YYYY-MM') : null
                    }
                  }
                  for (var category of budget.savingCategories) {
                    for (var config of category.amountConfigs) {
                      config.validFrom = moment(config.validFrom).format('YYYY-MM')
                      config.validTo = config.validTo ? moment(config.validTo).format('YYYY-MM') : null
                    }
                  }
                }
                commit('setBudgets', budgets)
                dispatch('wait/end', 'budgets.loading', { root: true })
                resolve(budgets)
              }
            )
          } else if (response.status == 404) {
            commit('setBudgets', [])
            dispatch('wait/end', 'budgets.loading', { root: true })
            resolve([])
          } else {
            commit('setBudgets', [])
            dispatch('wait/end', 'budgets.loading', { root: true })
            reject(response)
          }
        })
        .catch(error => {
          dispatch('wait/end', 'budgets.loading', { root: true })
          reject(error)
        })
    })
  },
  fetchUnassignedFunds ({commit, dispatch}, budget) {
    return new Promise((resolve, reject) => {
      if (!budget) {
        reject('Budget undefinied')
      }
      /*
      if (budget.unassignedFunds) {
        resolve(budget.unassignedFunds)
      }
      */
      dispatch('wait/start', 'unassignedFunds', { root: true })
      budgetService.getUnassigned(budget.id).then(response => {
        if (response.ok) {
          response.json().then(data => {
            commit('setUnassignedFunds', {budget: budget, funds: data.funds})
            dispatch('wait/end', 'unassignedFunds', { root: true })
            resolve(data.funds)
          })
        } else {
          response.json().then(() => {
            commit('setUnassignedFunds', {budget: budget, funds: null})
            dispatch('wait/end', 'unassignedFunds', { root: true })
            resolve(null)
          })
        }
      }).catch(error => {
        dispatch('wait/end', 'unassignedFunds', { root: true })
        reject(error)
      })
    })
  },
  saveBudget ({ commit }, budget) {

  }
}

const mutations = {
  setUnassignedFunds (state, {budget, funds}) {
    var matchingBudget = state.budgets.filter(v => v.id === budget.id)[0]
    if (matchingBudget) {
      matchingBudget.unassignedFunds = funds
    }
  },
  setBudgets (state, budgets) {
    state.budgets = budgets
  }
}

export const budgets = {
  namespaced: true,
  state,
  actions,
  mutations
}
