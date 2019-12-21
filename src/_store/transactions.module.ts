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
  dataLoadFilters: TranscationFilters;
  mainFilters: TranscationFilters;
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
  dataLoadFilters: {
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
  mainFilters: {
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
  setFilters({ state, commit }, filter: TranscationFilters) {
    let requireReload = false;
    if (filter.budgetId != state.dataLoadFilters.budgetId) {
      requireReload = true;
      commit('setBudgetFilter', filter.budgetId);
    }
    if (!state.dataLoadFilters) {
      commit('setCountLoadFilter', filter.limitCount);
      commit('setStartDateLoadFilter', filter.startDate);
      commit('setEndDateLoadFilter', filter.endDate);
      commit('setCategoriesLoadFilter', filter.categories);
      requireReload = true;
    }

    commit('setCountLoadFilter', filter.limitCount);
    commit('setCountFilter', filter.limitCount);

    if (
      !state.dataLoadFilters.startDate ||
      (state.dataLoadFilters.startDate && !filter.startDate) ||
      (filter.startDate && new Date(state.dataLoadFilters.startDate) > filter.startDate)
    ) {
      requireReload = true;
      commit('setStartDateLoadFilter', filter.startDate);
    }
    commit('setStartDateFilter', filter.startDate);

    if (
      !state.dataLoadFilters.endDate ||
      (state.dataLoadFilters.endDate && !filter.endDate) ||
      (filter.endDate && new Date(state.dataLoadFilters.endDate) < filter.endDate)
    ) {
      requireReload = true;
      commit('setEndDateLoadFilter', filter.endDate);
    }
    commit('setEndDateFilter', filter.endDate);

    if (state.dataLoadFilters.categories && !filter.categories) {
      requireReload = true;
      commit('setCategoriesLoadFilter', filter.categories);
    } else if (state.mainFilters.categories && filter.categories) {
      for (const category of state.mainFilters.categories) {
        if (
          !state.dataLoadFilters.categories ||
          !state.dataLoadFilters.categories.find(
            v => v.budgetCategoryId == category.budgetCategoryId,
          )
        ) {
          requireReload = true;
          commit('setCategoriesLoadFilter', filter.categories);
        }
      }
    }
    commit('setCategoriesFilter', filter.categories);

    if (requireReload) {
      //dispatch('fetchTransactions');
    }
  },

  async fetchTransactions({ commit, dispatch, state }) {
    if (!state.mainFilters.budgetId) {
      return;
    }

    if (
      state.dataLoadFilters.categoryType == null ||
      state.dataLoadFilters.categoryType == undefined ||
      state.dataLoadFilters.categoryType == eCategoryType.Spending
    ) {
      dispatch('wait/start', 'loading.transactions.spending', { root: true });
      transactionsService
        .listTransactions(
          state.mainFilters.budgetId,
          state.dataLoadFilters.limitCount.spendings,
          state.dataLoadFilters.startDate,
          state.dataLoadFilters.endDate,
          state.dataLoadFilters.categories,
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
      state.dataLoadFilters.categoryType == null ||
      state.dataLoadFilters.categoryType == undefined ||
      state.dataLoadFilters.categoryType == eCategoryType.Saving
    ) {
      dispatch('wait/start', 'loading.transactions.saving', { root: true });
      transactionsService
        .listTransactions(
          state.mainFilters.budgetId,
          state.dataLoadFilters.limitCount.savings,
          state.dataLoadFilters.startDate,
          state.dataLoadFilters.endDate,
          state.dataLoadFilters.categories,
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
      state.dataLoadFilters.categoryType == null ||
      state.dataLoadFilters.categoryType == undefined ||
      state.dataLoadFilters.categoryType == eCategoryType.Income
    ) {
      dispatch('wait/start', 'loading.transactions.income', { root: true });
      transactionsService
        .listTransactions(
          state.mainFilters.budgetId,
          state.dataLoadFilters.limitCount.incomes,
          state.dataLoadFilters.startDate,
          state.dataLoadFilters.endDate,
          state.dataLoadFilters.categories,
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
        state.mainFilters.budgetId,
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

    if (state.mainFilters.limitCount && countChanged) {
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
  startDateMoment: state => {
    return state.mainFilters.startDate ? new Date(state.mainFilters.startDate) : null;
  },
  endDateMoment: state => {
    return state.mainFilters.endDate ? new Date(state.mainFilters.endDate) : null;
  },
  getTransactions: (state, getter) => {
    const transactionsClone = {};
    // tslint:disable-next-line: forin
    for (const transactionType in state.transactions) {
      if (state.mainFilters.limitCount[transactionType]) {
        transactionsClone[transactionType] = state.transactions[transactionType].slice(
          0,
          state.mainFilters.limitCount[transactionType],
        );
      }
      if (getter.startDateMoment) {
        transactionsClone[transactionType] = state.transactions[transactionType].filter(
          v => new Date(v.date) >= getter.startDateMoment,
        );
      }
      if (getter.endDateMoment) {
        transactionsClone[transactionType] = state.transactions[transactionType].filter(
          v => new Date(v.date) <= getter.endDateMoment,
        );
      }
      if (state.mainFilters.categories && state.mainFilters.categories.length > 0) {
        transactionsClone[transactionType] = state.transactions[transactionType].filter(
          v => !!state.mainFilters.categories.find(c => c.budgetCategoryId == v.budgetCategoryId),
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
  setCountFilter(state, filter: LimitCountFilter) {
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

  setCountLoadFilter(state, filter: LimitCountFilter) {
    if (!state.dataLoadFilters) {
      state.dataLoadFilters = {
        budgetId: null,
        categories: [],
        endDate: null,
        limitCount: {
          incomes: null,
          savings: null,
          spendings: null,
        },
        startDate: null,
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
        limitCount: {
          incomes: null,
          savings: null,
          spendings: null,
        },
        startDate: null,
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
        limitCount: {
          incomes: null,
          savings: null,
          spendings: null,
        },
        startDate: null,
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
        limitCount: {
          incomes: null,
          savings: null,
          spendings: null,
        },
        startDate: null,
      };
    }
    state.dataLoadFilters.categories = filter;
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
