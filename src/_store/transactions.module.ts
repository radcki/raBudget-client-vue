import { transactionsService } from '../_services/transactions.service';
import { transactionSchedulesService } from '../_services/transactionSchedules.service';
import moment from 'moment';
import { Transaction } from '@/typings/Transaction';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { MutationTree, GetterTree, ActionTree } from 'vuex';
import { RootState } from '.';
import { eCategoryType } from '@/typings/enums/eCategoryType';

export interface TranscationFilters {
  budgetId: number | null;
  limitCount: number | null;
  startDate: Date | null;
  endDate: Date | null;
  categories: BudgetCategory[];
}

export interface TransactionsState {
  transactions: {
    incomes: Transaction[];
    savings: Transaction[];
    spendings: Transaction[];
  };
  closestScheduledTransactions: any[];
  dataLoadFilters: TranscationFilters;
  mainFilters: TranscationFilters;
}

const transactionsState: TransactionsState = {
  transactions: {
    incomes: [],
    savings: [],
    spendings: []
  },
  closestScheduledTransactions: [],
  dataLoadFilters: {
    budgetId: null,
    limitCount: null,
    startDate: null,
    endDate: null,
    categories: []
  },
  mainFilters: {
    budgetId: null,
    limitCount: null,
    startDate: null,
    endDate: null,
    categories: []
  }
};

const actions: ActionTree<TransactionsState, RootState> = {
  setBudgetFilter({ commit, dispatch }, budgetId) {
    commit('setBudgetFilter', budgetId);
    dispatch('fetchTransactions');
  },
  setFilters(
    { state, commit, dispatch },
    { budgetId, limitCount, startDate, endDate, categories }
  ) {
    let requireReload = false;
    if (budgetId != state.dataLoadFilters.budgetId) {
      requireReload = true;
      commit('setBudgetFilter', budgetId);
    }
    if (!state.dataLoadFilters) {
      commit('setCountLoadFilter', limitCount);
      commit('setStartDateLoadFilter', startDate);
      commit('setEndDateLoadFilter', endDate);
      commit('setCategoriesLoadFilter', categories);
      requireReload = true;
    }

    if (
      (state.dataLoadFilters.limitCount && !limitCount) ||
      limitCount > state.dataLoadFilters.limitCount
    ) {
      requireReload = true;
      commit('setCountLoadFilter', limitCount);
    }
    commit('setCountFilter', limitCount);

    if (
      !state.dataLoadFilters.startDate ||
      (state.dataLoadFilters.startDate && !startDate) ||
      moment(state.dataLoadFilters.startDate) > moment(startDate)
    ) {
      requireReload = true;
      commit('setStartDateLoadFilter', startDate);
    }
    commit('setStartDateFilter', startDate);

    if (
      !state.dataLoadFilters.endDate ||
      (state.dataLoadFilters.endDate && !endDate) ||
      moment(state.dataLoadFilters.endDate) < moment(endDate)
    ) {
      requireReload = true;
      commit('setEndDateLoadFilter', endDate);
    }
    commit('setEndDateFilter', endDate);

    if (state.dataLoadFilters.categories && !categories) {
      requireReload = true;
      commit('setCategoriesLoadFilter', categories);
    } else if (state.mainFilters.categories && categories) {
      for (const category of state.mainFilters.categories) {
        if (
          !state.dataLoadFilters.categories ||
          !state.dataLoadFilters.categories.find(
            v => v.budgetCategoryId == category.budgetCategoryId
          )
        ) {
          requireReload = true;
          commit('setCategoriesLoadFilter', categories);
        }
      }
    }
    commit('setCategoriesFilter', categories);

    if (requireReload) {
      dispatch('fetchTransactions');
    }
  },

  fetchTransactions({ commit, dispatch, state }) {
    dispatch('wait/start', 'loading.transactions', { root: true });
    transactionsService
      .listTransactions(
        state.mainFilters.budgetId,
        state.dataLoadFilters.limitCount,
        state.dataLoadFilters.startDate,
        state.dataLoadFilters.endDate,
        state.dataLoadFilters.categories
      )
      .then(response => {
        if (response.ok) {
          response.json().then(responseData => {
            commit('setTransactions', responseData);
            dispatch('wait/end', 'loading.transactions', { root: true });
          });
        } else {
          response.json().then(responseData => {
            commit('alert/error', responseData.message, { root: true });
            dispatch('wait/end', 'loading.transactions', { root: true });
          });
        }
      });
  },

  fetchClosestScheduledTransactions({ commit, dispatch, state }) {
    dispatch('wait/start', 'loading.scheduledTransactions', { root: true });
    transactionSchedulesService
      .listClosestOccurrences(
        state.mainFilters.budgetId,
        moment()
          .add(1, 'M')
          .format('YYYY-MM-DD')
      )
      .then(response => {
        if (response.ok) {
          response.json().then(responseData => {
            commit('setClosestScheduledTransactions', responseData);
            dispatch('wait/end', 'loading.scheduledTransactions', {
              root: true
            });
          });
        } else {
          response.json().then(responseData => {
            commit('alert/error', responseData.message, { root: true });
            dispatch('wait/end', 'loading.scheduledTransactions', {
              root: true
            });
          });
        }
      });
  },

  unloadTransactionFromStore({ state, commit, dispatch }, transactionId) {
    const filteredSpendings = state.transactions.spendings.filter(
      v => v.transactionId != transactionId
    );
    const filteredSavings = state.transactions.savings.filter(
      v => v.transactionId != transactionId
    );
    const filteredIncomes = state.transactions.incomes.filter(
      v => v.transactionId != transactionId
    );

    const countChanged =
      filteredSpendings.length < state.transactions.spendings.length ||
      filteredSavings.length < state.transactions.savings.length ||
      filteredIncomes.length < state.transactions.incomes.length;

    commit('setTransactions', {
      incomes: filteredIncomes,
      savings: filteredSavings,
      spendings: filteredSpendings
    });

    if (state.mainFilters.limitCount && countChanged) {
      dispatch('fetchTransactions');
    }
    dispatch('budgets/reloadInitialized', null, { root: true });
  },

  loadTransactionToStore({ state, dispatch }, newTransaction: Transaction) {
    if (!newTransaction.budgetCategoryId ) {
      dispatch('fetchTransactions');
    }
    dispatch('budgets/reloadInitialized', null, {
      root: true
    });
  },

  updateTransactionInStore({ state, commit, dispatch }, updatedTransaction: Transaction) {
    dispatch('fetchTransactions');
    dispatch('budgets/reloadInitialized', null, {
      root: true
    });
  }
};

const getters: GetterTree<TransactionsState, RootState>  = {

  startDateMoment: (state) => {
    return state.mainFilters.startDate ? moment(state.mainFilters.startDate) : null;
  },
  endDateMoment: (state) => {
    return state.mainFilters.endDate ? moment(state.mainFilters.endDate) : null;
  },
  getTransactions: (state, getter) => {
    let transactionsClone = {}
    // tslint:disable-next-line: forin
    for (let transactionType in state.transactions) {
      if (state.mainFilters.limitCount) {
        transactionsClone[transactionType] = state.transactions[transactionType].slice(
          0,
          state.mainFilters.limitCount,
        );
      }
      if (getter.startDateMoment) {
        transactionsClone[transactionType] = state.transactions[transactionType].filter(
          (v) => moment(v.date) >= getter.startDateMoment,
        );
      }
      if (getter.endDateMoment) {
        transactionsClone[transactionType] = state.transactions[transactionType].filter(
          (v) => moment(v.date) <= getter.endDateMoment,
        );
      }
      if (state.mainFilters.categories) {
        transactionsClone[transactionType] = state.transactions[transactionType].filter(
          (v) =>
            !!state.mainFilters.categories.find(
              (c) => c.budgetCategoryId == v.budgetCategoryId,
            ),
        );
      }
    }
    return transactionsClone;
  },
};

const mutations: MutationTree<TransactionsState> = {
  setBudgetFilter(state, filter: number) {
    state.mainFilters.budgetId = filter;
  },
  setCountFilter(state, filter: number) {
    state.mainFilters.limitCount = filter;
  },
  setStartDateFilter(state, filter: Date) {
    state.mainFilters.startDate = filter;
  },
  setEndDateFilter(state, filter: Date) {
    state.mainFilters.endDate = filter;
  },
  setCategoriesFilter(state, filter: BudgetCategory[]) {
    state.mainFilters.categories = filter;
  },

  setCountLoadFilter(state, filter: number) {
    if (!state.dataLoadFilters) {
      state.dataLoadFilters = {
        budgetId: null,
        categories: [],
        endDate: null,
        limitCount: null,
        startDate: null
      };
    }
    state.dataLoadFilters.limitCount = filter;
  },
  setStartDateLoadFilter(state, filter: Date) {
    if (!state.dataLoadFilters) {
      state.dataLoadFilters = {
        budgetId: null,
        categories: [],
        endDate: null,
        limitCount: null,
        startDate: null
      };
    }
    state.dataLoadFilters.startDate = filter;
  },
  setEndDateLoadFilter(state, filter: Date) {
    if (!state.dataLoadFilters) {
      state.dataLoadFilters = {
        budgetId: null,
        categories: [],
        endDate: null,
        limitCount: null,
        startDate: null
      };
    }
    state.dataLoadFilters.endDate = filter;
  },
  setCategoriesLoadFilter(state, filter: BudgetCategory[]) {
    if (!state.dataLoadFilters) {
      state.dataLoadFilters = {
        budgetId: null,
        categories: [],
        endDate: null,
        limitCount: null,
        startDate: null
      };
    }
    state.dataLoadFilters.categories = filter;
  },
  setTransactions( state, payload: Transaction[] ) {
    payload = payload.map(function(transaction){
      transaction.transactionDate = new Date(transaction.transactionDate)
      transaction.registeredDate = new Date(transaction.registeredDate)
      return transaction
    })
    state.transactions.spendings = payload.filter(v => v.type == eCategoryType.Spending);
    state.transactions.savings = payload.filter(v => v.type == eCategoryType.Saving);
    state.transactions.incomes = payload.filter(v => v.type == eCategoryType.Income);
  },
  setClosestScheduledTransactions(state, payload) {
    state.closestScheduledTransactions = payload;
  }
};

export const transactions = {
  namespaced: true,
  getters,
  state: transactionsState,
  actions,
  mutations
};
