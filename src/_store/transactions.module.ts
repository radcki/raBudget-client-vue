import { transactionsService } from '../_services/transactions.service';
import { transactionSchedulesService } from '../_services/transactionSchedules.service';
import { Transaction } from '@/typings/Transaction';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { MutationTree, GetterTree, ActionTree } from 'vuex';
import { RootState } from '.';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { ErrorMessage } from '@/typings/TypedResponse';
import { addMonths, format } from 'date-fns';

export interface TranscationFilters {
  budgetId: number | null;
  limitCount: number | null;
  startDate: Date | null;
  endDate: Date | null;
  categories: BudgetCategory[];
  categoryType?: eCategoryType;
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
      new Date(state.dataLoadFilters.startDate) > new Date(startDate)
    ) {
      requireReload = true;
      commit('setStartDateLoadFilter', startDate);
    }
    commit('setStartDateFilter', startDate);

    if (
      !state.dataLoadFilters.endDate ||
      (state.dataLoadFilters.endDate && !endDate) ||
      new Date(state.dataLoadFilters.endDate) < new Date(endDate)
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

  async fetchTransactions({ commit, dispatch, state, rootGetters }) {
    dispatch('wait/start', 'loading.transactions', { root: true });

    transactionsService
      .listTransactions(
        state.mainFilters.budgetId,
        state.dataLoadFilters.limitCount,
        state.dataLoadFilters.startDate,
        state.dataLoadFilters.endDate,
        state.dataLoadFilters.categories,
        state.dataLoadFilters.categoryType
      )
      .then(response => {
        if (response.ok) {
          response.json().then(responseData => {
            let getBudgetCategoryById: (categoryId: number) => BudgetCategory = rootGetters['budgets/budgetCategoryById'];
            commit('setSpendingTransactions', responseData.filter(v=>getBudgetCategoryById(v.budgetCategoryId).type == eCategoryType.Spending));
            commit('setSavingTransactions', responseData.filter(v=>getBudgetCategoryById(v.budgetCategoryId).type == eCategoryType.Saving));
            commit('setIncomeTransactions', responseData.filter(v=>getBudgetCategoryById(v.budgetCategoryId).type == eCategoryType.Income));

            dispatch('wait/end', 'loading.transactions', { root: true });
          });
        } else {
          response.json<ErrorMessage>().then(responseData => {
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
        format(addMonths(new Date(), 1), 'yyyy-MM-dd')
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

    commit('setSpendingTransactions', filteredSpendings);
    commit('setSavingTransactions', filteredSavings);
    commit('setIncomeTransactions', filteredIncomes);

    if (state.mainFilters.limitCount && countChanged) {
      dispatch('fetchTransactions');
    }
    dispatch('budgets/reloadInitialized', null, { root: true });
  },

  loadTransactionToStore({ state, dispatch }, newTransaction: Transaction) {
    if (!newTransaction.budgetCategoryId) {
      dispatch('fetchTransactions');
    }
    dispatch('budgets/reloadInitialized', null, {
      root: true
    });
  },

  updateTransactionInStore(
    { state, commit, dispatch },
    updatedTransaction: Transaction
  ) {
    dispatch('fetchTransactions');
    dispatch('budgets/reloadInitialized', null, {
      root: true
    });
  }
};

const getters: GetterTree<TransactionsState, RootState> = {
  startDateMoment: state => {
    return state.mainFilters.startDate
      ? new Date(state.mainFilters.startDate)
      : null;
  },
  endDateMoment: state => {
    return state.mainFilters.endDate ? new Date(state.mainFilters.endDate) : null;
  },
  getTransactions: (state, getter) => {
    let transactionsClone = {};
    // tslint:disable-next-line: forin
    for (let transactionType in state.transactions) {
      if (state.mainFilters.limitCount) {
        transactionsClone[transactionType] = state.transactions[
          transactionType
        ].slice(0, state.mainFilters.limitCount);
      }
      if (getter.startDateMoment) {
        transactionsClone[transactionType] = state.transactions[
          transactionType
        ].filter(v => new Date(v.date) >= getter.startDateMoment);
      }
      if (getter.endDateMoment) {
        transactionsClone[transactionType] = state.transactions[
          transactionType
        ].filter(v => new Date(v.date) <= getter.endDateMoment);
      }
      if (state.mainFilters.categories) {
        transactionsClone[transactionType] = state.transactions[
          transactionType
        ].filter(
          v =>
            !!state.mainFilters.categories.find(
              c => c.budgetCategoryId == v.budgetCategoryId
            )
        );
      }
    }
    return transactionsClone;
  }
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

  setSpendingTransactions(state, payload: Transaction[]) {
    payload = payload.map(function(transaction) {
      transaction.transactionDate = new Date(transaction.transactionDate);
      transaction.registeredDate = new Date(transaction.registeredDate);
      return transaction;
    });
    state.transactions.spendings = payload;
  },
  setSavingTransactions(state, payload: Transaction[]) {
    payload = payload.map(function(transaction) {
      transaction.transactionDate = new Date(transaction.transactionDate);
      transaction.registeredDate = new Date(transaction.registeredDate);
      return transaction;
    });
    state.transactions.savings = payload;
  },
  setIncomeTransactions(state, payload: Transaction[]) {
    payload = payload.map(function(transaction) {
      transaction.transactionDate = new Date(transaction.transactionDate);
      transaction.registeredDate = new Date(transaction.registeredDate);
      return transaction;
    });
    state.transactions.incomes = payload;
  },
  setClosestScheduledTransactions(state, payload) {
    state.closestScheduledTransactions = payload.map(v => {
      v.transactionDate = new Date(v.transactionDate);
      v.registeredDate = new Date(v.registeredDate);
      return v;
    });
  }
};

export const transactions = {
  namespaced: true,
  getters,
  state: transactionsState,
  actions,
  mutations
};
