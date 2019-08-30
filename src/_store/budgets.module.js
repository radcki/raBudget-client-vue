import { budgetService } from '../_services/budget.service'

import moment from 'moment'

const state = {
  budgets: [],
  activeBudgetId: null
}

const actions = {
  reloadInitialized ({ state, dispatch }, budgetId) {
    var budget = state.budgets.find(v => v.id == state.activeBudgetId)
    if (budgetId && budgetId != budget.id) {
      state.budgets.filter(v => v.id != budgetId).forEach(b => {
        dispatch('fetchBudget', b.id)
      })
    } else {
      dispatch('fetchBudget', budget.id)

      if (budget.unassignedFunds) {
        dispatch('fetchUnassignedFunds', budget.id)
      }
      if (budget.spendingCategoriesBalance) {
        dispatch('fetchSpendingCategoriesBalance', budget.id)
      }
      if (budget.savingCategoriesBalance) {
        dispatch('fetchSavingCategoriesBalance', budget.id)
      }
    }
  },
  fetchBudgets ({ dispatch, commit }) {
    dispatch('wait/start', 'loading.budgets', { root: true })
    budgetService.userBudgets()
      .then(response => {
        if (response.ok) {
          response.json().then(
            data => {
              commit('setBudgets', data)
              dispatch('wait/end', 'loading.budgets', { root: true })
            }
          )
        } else if (response.status == 404) {
          commit('setBudgets', [])
          dispatch('wait/end', 'loading.budgets', { root: true })
        } else {
          commit('setBudgets', [])
          dispatch('wait/end', 'loading.budgets', { root: true })
        }
      })
      .catch(error => {
        dispatch('wait/end', 'loading.budgets', { root: true })
      })
  },
  fetchBudget ({ dispatch, commit }, budgetId) {
    dispatch('wait/start', 'loading.budget', { root: true })
    budgetService.getBudget(budgetId)
      .then(response => {
        if (response.ok) {
          response.json().then(
            data => {
              commit('setBudget', data)
              dispatch('wait/end', 'loading.budget', { root: true })
            }
          )
        } else if (response.status == 404) {
          dispatch('wait/end', 'loading.budget', { root: true })
        } else {
          dispatch('wait/end', 'loading.budget', { root: true })
        }
      })
      .catch(error => {
        dispatch('wait/end', 'loading.budget', { root: true })
      })
  },
  fetchUnassignedFunds ({ commit, dispatch }, budgetId) {
    dispatch('wait/start', 'loading.unassignedFunds', { root: true })
    budgetService.getUnassigned(budgetId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          commit('setUnassignedFunds', data.funds)
          dispatch('wait/end', 'loading.unassignedFunds', { root: true })
        })
      } else {
        response.json().then(() => {
          commit('setUnassignedFunds', null)
          dispatch('wait/end', 'loading.unassignedFunds', { root: true })
        })
      }
    }).catch(error => {
      dispatch('fetchBudgets')
    })
  },
  initializeBudgets ({ state, dispatch }) {
    if (!state.budgets || state.budgets.length === 0) {
      dispatch('fetchBudgets')
    }
  },
  initializeCategoriesBalance ({ state, dispatch }) {
    if (!state.activeBudgetId) { return }
    var budget = state.budgets.find(v => v.id == state.activeBudgetId)
    if (!budget) { return }

    if (!budget.spendingCategoriesBalance) {
      dispatch('fetchSpendingCategoriesBalance', state.activeBudgetId)
    }
    if (!budget.savingCategoriesBalance) {
      dispatch('fetchSavingCategoriesBalance', state.activeBudgetId)
    }
  },
  initializeUnassignedFunds ({ state, dispatch }) {
    if (!state.activeBudgetId) { return }
    var budget = state.budgets.find(v => v.id == state.activeBudgetId)
    if (!budget) { return }

    if (!budget.unassignedFunds) {
      dispatch('fetchUnassignedFunds', state.activeBudgetId)
    }
  },
  fetchSpendingCategoriesBalance ({ commit, dispatch }, budgetId) {
    dispatch('wait/start', 'loading.spendingCategoriesBalance', { root: true })
    budgetService.getSpendingCategoriesBalance(budgetId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          commit('setSpendingCategoriesBalance', data)
          dispatch('wait/end', 'loading.spendingCategoriesBalance', { root: true })
        })
      } else {
        response.json().then(data => {
          commit('alert/error', data.message, { root: true })
          dispatch('wait/end', 'loading.spendingCategoriesBalance', { root: true })
        })
      }
    })
  },
  fetchSavingCategoriesBalance ({ commit, dispatch }, budgetId) {
    dispatch('wait/start', 'loading.savingCategoriesBalance', { root: true })
    budgetService.getSavingCategoriesBalance(budgetId).then(response => {
      if (response.ok) {
        response.json().then(data => {
          commit('setSavingCategoriesBalance', data)
          dispatch('wait/end', 'loading.savingCategoriesBalance', { root: true })
        })
      } else {
        response.json().then(data => {
          commit('alert/error', data.message, { root: true })
          dispatch('wait/end', 'loading.savingCategoriesBalance', { root: true })
        })
      }
    })
  },
  activeBudgetChange ({ commit }, newActiveBudgetId) {
    commit('changeActiveBudget', newActiveBudgetId)
    commit('transactions/setBudgetFilter', newActiveBudgetId, { root: true })
  },

  unloadBudgetFromStore ({ state, commit, dispatch }, budgetId) {
    var filteredBudgets = state.budgets.filter(v => v.id != budgetId)

    if (state.activeBudgetId == budgetId && filteredBudgets > 1) {
      dispatch('activeBudgetChange', filteredBudgets[0].id)
    }

    commit('setBudgets', filteredBudgets)
  },

  loadBudgetToStore ({ commit }, newBudget) {
    commit('setBudget', newBudget)
  },

  updateBudgetInStore ({ commit }, updatedTransaction) {
    commit('setBudget', updatedTransaction)
  }
}

const getters = {
  budget: state => { return state.budgets.find(v => v.id == state.activeBudgetId) },
  spendingCategoriesBalance: (state, getters) => { return !getters.budget ? null : getters.budget.spendingCategoriesBalance },
  unassignedFunds: (state, getters) => { return !getters.budget ? null : getters.budget.unassignedFunds },
  savingCategoriesBalance: (state, getters) => { return !getters.budget ? null : getters.budget.savingCategoriesBalance },
  incomeCategoriesBalance: (state, getters) => { return !getters.budget ? null : getters.budget.incomeCategoriesBalance }
}

const mutations = {
  changeActiveBudget (state, newActiveBudgetId) {
    state.activeBudgetId = newActiveBudgetId
  },
  setUnassignedFunds (state, funds) {
    state.budgets.find(v => v.id == state.activeBudgetId).unassignedFunds = funds
  },
  setBudgets (state, data) {
    var budgets = data.map(budget => {
      return {
        ...budget,
        startingDate: moment(budget.startingDate).format('YYYY-MM'),
        ...{
          unassignedFunds: null,
          spendingCategoriesBalance: null,
          savingCategoriesBalance: null,
          incomeCategoriesBalance: null
        }
      }
    })
    for (let budget of budgets) {
      for (let category of budget.spendingCategories) {
        for (let config of category.amountConfigs) {
          config.validFrom = moment(config.validFrom).format('YYYY-MM')
          config.validTo = config.validTo ? moment(config.validTo).format('YYYY-MM') : null
        }
      }
      for (let category of budget.incomeCategories) {
        for (let config of category.amountConfigs) {
          config.validFrom = moment(config.validFrom).format('YYYY-MM')
          config.validTo = config.validTo ? moment(config.validTo).format('YYYY-MM') : null
        }
      }
      for (let category of budget.savingCategories) {
        for (let config of category.amountConfigs) {
          config.validFrom = moment(config.validFrom).format('YYYY-MM')
          config.validTo = config.validTo ? moment(config.validTo).format('YYYY-MM') : null
        }
      }
    }
    state.budgets = budgets
  },
  setBudget (state, budget) {
    budget.startingDate = moment(budget.startingDate).format('YYYY-MM')

    for (let category of budget.spendingCategories) {
      for (let config of category.amountConfigs) {
        config.validFrom = moment(config.validFrom).format('YYYY-MM')
        config.validTo = config.validTo ? moment(config.validTo).format('YYYY-MM') : null
      }
    }
    for (let category of budget.incomeCategories) {
      for (let config of category.amountConfigs) {
        config.validFrom = moment(config.validFrom).format('YYYY-MM')
        config.validTo = config.validTo ? moment(config.validTo).format('YYYY-MM') : null
      }
    }
    for (let category of budget.savingCategories) {
      for (let config of category.amountConfigs) {
        config.validFrom = moment(config.validFrom).format('YYYY-MM')
        config.validTo = config.validTo ? moment(config.validTo).format('YYYY-MM') : null
      }
    }
    var stateBudget = state.budgets.find(v => v.id == budget.id)

    if (stateBudget) {
      for (var param in stateBudget) {
        if (budget[param]) {
          stateBudget[param] = budget[param]
        }
      }
    } else {
      state.budgets.push({
        ...budget,
        ...{
          unassignedFunds: null,
          spendingCategoriesBalance: null,
          savingCategoriesBalance: null,
          incomeCategoriesBalance: null
        }
      })
    }
  },
  setSpendingCategoriesBalance (state, data) { state.budgets.find(v => v.id == state.activeBudgetId).spendingCategoriesBalance = data },
  setSavingCategoriesBalance (state, data) { state.budgets.find(v => v.id == state.activeBudgetId).savingCategoriesBalance = data },
  setIncomeCategoriesBalance (state, data) { state.budgets.find(v => v.id == state.activeBudgetId).incomeCategoriesBalance = data },
  clearBudgets (state) { state.budgets = [] },
  clearSpendingCategoriesBalance (state) { state.budgets.find(v => v.id == state.activeBudgetId).spendingCategoriesBalance = null },
  clearSavingCategoriesBalance (state) { state.budgets.find(v => v.id == state.activeBudgetId).savingCategoriesBalance = null },
  clearIncomeCategoriesBalance (state) { state.budgets.find(v => v.id == state.activeBudgetId).incomeCategoriesBalance = null }
}

export const budgets = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
