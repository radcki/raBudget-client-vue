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
  limitCount: LimitCountFilter;
  startDate: Date | null;
  endDate: Date | null;
  categories: BudgetCategory[];
  categoryType?: eCategoryType | null;
}

export interface TransactionsState {
  transactions: {
    incomes: Transaction[];
    savings: Transaction[];
    spendings: Transaction[];
  };
  closestScheduledTransactions: any[];
  filters: TranscationFilters;
}

export interface LimitCountFilter {
  incomes: number | null;
  savings: number | null;
  spendings: number | null;
}

const transactionsState: TransactionsState = {
  transactions: {
    incomes: [],
    savings: [],
    spendings: [],
  },
  closestScheduledTransactions: [],
  filters: {
    budgetId: null,
    limitCount: {
      incomes: null,
      savings: null,
      spendings: null,
    },
    startDate: null,
    endDate: null,
    categories: [],
    categoryType: null,
  },
};

const actions: ActionTree<TransactionsState, RootState> = {
  setBudgetFilter({ commit }, budgetId) {
    commit('setBudgetFilter', budgetId);
    commit('clearTransactions');
  },
  setFilters({ state, commit, dispatch }, filter: TranscationFilters) {
    let requireReload = false;
    if (filter.budgetId != state.filters.budgetId) {
      requireReload = true;
      commit('setBudgetFilter', filter.budgetId);
    }
    commit('setCategoryTypeFilter', filter.categoryType);
    commit('setCountFilter', filter.limitCount);
    commit('setStartDateFilter', filter.startDate);
    commit('setEndDateFilter', filter.endDate);
    commit('setCategoriesFilter', filter.categories);

    if (requireReload) {
      dispatch('fetchTransactions');
    }
  },

  async fetchTransactions({ commit, dispatch, state }) {
    if (!state.filters.budgetId) {
      return;
    }

    if (
      state.filters.categoryType == null ||
      state.filters.categoryType == undefined ||
      state.filters.categoryType == eCategoryType.Spending
    ) {
      dispatch('wait/start', 'loading.transactions.spending', { root: true });
      transactionsService
        .listTransactions(
          state.filters.budgetId,
          state.filters.limitCount.spendings,
          state.filters.startDate,
          state.filters.endDate,
          state.filters.categories,
          eCategoryType.Spending,
        )
        .then(async response => {
          if (response.ok) {
            const responseData = await response.json();

            commit('setSpendingTransactions', responseData);
            dispatch('wait/end', 'loading.transactions.spending', { root: true });
          } else {
            const responseData = await response.json<ErrorMessage>();
            commit('alert/error', responseData.message, { root: true });
            dispatch('wait/end', 'loading.transactions.spending', { root: true });
          }
        });
    }

    if (
      state.filters.categoryType == null ||
      state.filters.categoryType == undefined ||
      state.filters.categoryType == eCategoryType.Saving
    ) {
      dispatch('wait/start', 'loading.transactions.saving', { root: true });
      transactionsService
        .listTransactions(
          state.filters.budgetId,
          state.filters.limitCount.savings,
          state.filters.startDate,
          state.filters.endDate,
          state.filters.categories,
          eCategoryType.Saving,
        )
        .then(async response => {
          if (response.ok) {
            const responseData = await response.json();
            commit('setSavingTransactions', responseData);
            dispatch('wait/end', 'loading.transactions.saving', { root: true });
          } else {
            const responseData = await response.json<ErrorMessage>();
            commit('alert/error', responseData.message, { root: true });
            dispatch('wait/end', 'loading.transactions.saving', { root: true });
          }
        });
    }

    if (
      state.filters.categoryType == null ||
      state.filters.categoryType == undefined ||
      state.filters.categoryType == eCategoryType.Income
    ) {
      dispatch('wait/start', 'loading.transactions.income', { root: true });
      transactionsService
        .listTransactions(
          state.filters.budgetId,
          state.filters.limitCount.incomes,
          state.filters.startDate,
          state.filters.endDate,
          state.filters.categories,
          eCategoryType.Income,
        )
        .then(async response => {
          if (response.ok) {
            const responseData = await response.json();
            commit('setIncomeTransactions', responseData);
            dispatch('wait/end', 'loading.transactions.income', { root: true });
          } else {
            const responseData = await response.json<ErrorMessage>();
            commit('alert/error', responseData.message, { root: true });
            dispatch('wait/end', 'loading.transactions.income', { root: true });
          }
        });
    }
  },

  fetchClosestScheduledTransactions({ commit, dispatch, state }) {
    dispatch('wait/start', 'loading.scheduledTransactions', { root: true });
    transactionSchedulesService
      .listClosestOccurrences(
        state.filters.budgetId,
        format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
      )
      .then(response => {
        if (response.ok) {
          response.json().then(responseData => {
            commit('setClosestScheduledTransactions', responseData);
            dispatch('wait/end', 'loading.scheduledTransactions', {
              root: true,
            });
          });
        } else {
          response.json().then(responseData => {
            commit('alert/error', responseData.message, { root: true });
            dispatch('wait/end', 'loading.scheduledTransactions', {
              root: true,
            });
          });
        }
      });
  },

  unloadTransactionFromStore({ state, commit, dispatch }, transactionId) {
    const filteredSpendings = state.transactions.spendings.filter(
      v => v.transactionId != transactionId,
    );
    const filteredSavings = state.transactions.savings.filter(
      v => v.transactionId != transactionId,
    );
    const filteredIncomes = state.transactions.incomes.filter(
      v => v.transactionId != transactionId,
    );

    const countChanged =
      filteredSpendings.length < state.transactions.spendings.length ||
      filteredSavings.length < state.transactions.savings.length ||
      filteredIncomes.length < state.transactions.incomes.length;

    commit('setTransactions', {
      incomes: filteredIncomes,
      savings: filteredSavings,
      spendings: filteredSpendings,
    });

    commit('setSpendingTransactions', filteredSpendings);
    commit('setSavingTransactions', filteredSavings);
    commit('setIncomeTransactions', filteredIncomes);

    if (state.filters.limitCount && countChanged) {
      dispatch('fetchTransactions');
    }
    dispatch('budgets/reloadInitialized', null, { root: true });
  },

  loadTransactionToStore({ dispatch }, newTransaction: Transaction) {
    if (!newTransaction.budgetCategoryId) {
      dispatch('fetchTransactions');
    }
    dispatch('budgets/reloadInitialized', null, {
      root: true,
    });
  },

  updateTransactionInStore({ dispatch }) {
    dispatch('fetchTransactions');
    dispatch('budgets/reloadInitialized', null, {
      root: true,
    });
  },
};

const getters: GetterTree<TransactionsState, RootState> = {
  getTransactions: state => {
    return state.transactions;
  },
};

const mutations: MutationTree<TransactionsState> = {
  setBudgetFilter(state, filter: number) {
    state.filters.budgetId = filter;
  },
  setCountFilter(state, filter: LimitCountFilter) {
    state.filters.limitCount = filter;
  },
  setStartDateFilter(state, filter: Date) {
    state.filters.startDate = filter;
  },
  setEndDateFilter(state, filter: Date) {
    state.filters.endDate = filter;
  },
  setCategoriesFilter(state, filter: BudgetCategory[]) {
    state.filters.categories = filter;
  },
  setCategoryTypeFilter(state, filter: eCategoryType) {
    state.filters.categoryType = filter;
  },

  clearTransactions(state) {
    state.transactions.spendings = [];
    state.transactions.incomes = [];
    state.transactions.savings = [];
  },

  setSpendingTransactions(state, payload: Transaction[]) {
    payload = payload.map(function(transaction) {
      transaction.transactionDate = new Date(transaction.transactionDate);
      if (transaction.registeredDate) {
        transaction.registeredDate = new Date(transaction.registeredDate);
      }
      return transaction;
    });
    state.transactions.spendings = payload;
  },
  setSavingTransactions(state, payload: Transaction[]) {
    payload = payload.map(function(transaction) {
      transaction.transactionDate = new Date(transaction.transactionDate);
      if (transaction.registeredDate) {
        transaction.registeredDate = new Date(transaction.registeredDate);
      }
      return transaction;
    });
    state.transactions.savings = payload;
  },
  setIncomeTransactions(state, payload: Transaction[]) {
    payload = payload.map(function(transaction) {
      transaction.transactionDate = new Date(transaction.transactionDate);
      if (transaction.registeredDate) {
        transaction.registeredDate = new Date(transaction.registeredDate);
      }
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
  },
};

export const transactions = {
  namespaced: true,
  getters,
  state: transactionsState,
  actions,
  mutations,
};
