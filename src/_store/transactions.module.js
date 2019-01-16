import { transactionsService } from '../_services/transactions.service'
import moment from 'moment'

const state = {
  transactions: {
    incomes: [],
    savings: [],
    spending: []
  },
  loadFilters: null,
  filters: {
    budgetId: null,
    limitCount: null,
    startDate: null,
    endDate: null,
    categories: null
  }
}

const actions = {
  setBudgetFilter ({ commit, dispatch }, budgetId) {
    commit('setBudgetFilter', budgetId)
    dispatch('fetchTransactions')
  },
  setFilters ({ state, commit, dispatch }, { budgetId, limitCount, startDate, endDate, categories }) {
    var requireReload = false
    if (budgetId != state.filters.budgetId) {
      requireReload = true
      commit('setBudgetFilter', budgetId)
    }
    if (!state.loadFilters) {
      commit('setCountLoadFilter', limitCount)
      commit('setStartDateLoadFilter', startDate)
      commit('setEndDateLoadFilter', endDate)
      commit('setCategoriesLoadFilter', categories)
      requireReload = true
    }

    if ((state.loadFilters.limitCount && !limitCount) || limitCount > state.loadFilters.limitCount) {
      requireReload = true
      commit('setCountLoadFilter', limitCount)
    }
    commit('setCountFilter', limitCount)

    if (!state.loadFilters.startDate || (state.loadFilters.startDate && !startDate) || moment(state.loadFilters.startDate) > moment(startDate)) {
      requireReload = true
      commit('setStartDateLoadFilter', startDate)
    }
    commit('setStartDateFilter', startDate)

    if (!state.loadFilters.endDate || (state.loadFilters.endDate && !endDate) || moment(state.loadFilters.endDate) < moment(endDate)) {
      requireReload = true
      commit('setEndDateLoadFilter', endDate)
    }
    commit('setEndDateFilter', endDate)

    if (state.loadFilters.categories && !categories) {
      requireReload = true
      commit('setCategoriesLoadFilter', categories)
    } else if (state.filters.categories && categories) {
      for (var category of state.filters.categories) {
        if (!state.loadFilters.categories || !state.loadFilters.categories.find(v => v.categoryId == category.categoryId)) {
          requireReload = true
          commit('setCategoriesLoadFilter', categories)
        }
      }
    }
    commit('setCategoriesFilter', categories)

    if (requireReload) {
      dispatch('fetchTransactions')
    }
  },

  fetchTransactions ({ commit, dispatch }) {
    dispatch('wait/start', 'loading.transactions', { root: true })
    transactionsService.listTransactions(state.filters.budgetId, state.loadFilters.limitCount, state.loadFilters.startDate, state.loadFilters.endDate, state.loadFilters.categories)
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            commit('setTransactions', data)
            dispatch('wait/end', 'loading.transactions', { root: true })
          })
        } else {
          response.json().then(data => {
            commit('alert/error', data.message, { root: true })
            dispatch('wait/end', 'loading.transactions', { root: true })
          })
        }
      })
  }
}

const getters = {
  startDateMoment: state => { return state.filters.startDate ? moment(state.filters.startDate) : null },
  endDateMoment: state => { return state.filters.endDate ? moment(state.filters.endDate) : null },
  getTransactions: (state, getters) => {
    var transactions = JSON.parse(JSON.stringify(state.transactions))
    for (var type in transactions) {
      if (state.filters.limitCount) {
        transactions[type] = transactions[type].slice(0, state.filters.limitCount)
      }
      if (getters.startDateMoment) {
        transactions[type] = transactions[type].filter(v => moment(v.date) >= getters.startDateMoment)
      }
      if (getters.endDateMoment) {
        transactions[type] = transactions[type].filter(v => moment(v.date) <= getters.endDateMoment)
      }
      if (state.filters.categories) {
        transactions[type] = transactions[type].filter(v => !!state.filters.categories.find(c => c.categoryId == v.category.categoryId))
      }
    }
    return transactions
  }
}

const mutations = {
  setBudgetFilter (state, filter) { state.filters.budgetId = filter },
  setCountFilter (state, filter) { state.filters.limitCount = filter },
  setStartDateFilter (state, filter) { state.filters.startDate = filter },
  setEndDateFilter (state, filter) { state.filters.endDate = filter },
  setCategoriesFilter (state, filter) { state.filters.categories = filter },

  setCountLoadFilter (state, filter) {
    if (!state.loadFilters) { state.loadFilters = {} }
    state.loadFilters.limitCount = filter
  },
  setStartDateLoadFilter (state, filter) {
    if (!state.loadFilters) { state.loadFilters = {} }
    state.loadFilters.startDate = filter
  },
  setEndDateLoadFilter (state, filter) {
    if (!state.loadFilters) { state.loadFilters = {} }
    state.loadFilters.endDate = filter
  },
  setCategoriesLoadFilter (state, filter) {
    if (!state.loadFilters) { state.loadFilters = {} }
    state.loadFilters.categories = filter
  },
  setTransactions (state, data) {
    state.transactions = data
  }
}

export const transactions = {
  namespaced: true,
  getters,
  state,
  actions,
  mutations
}