import { budgetService } from '../_services/budget.service';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { RootState } from '.';
import { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { Budget } from '@/typings/Budget';
import { ErrorMessage } from '@/typings/TypedResponse';

export interface BudgetsState {
  budgets: Budget[];
  activeBudgetId: number | null;
}

export const stateData: BudgetsState = {
  budgets: [],
  activeBudgetId: null
};

const actions: ActionTree<BudgetsState, RootState> = {
  reloadInitialized({ state, dispatch }, budgetId) {
    let budget = state.budgets.find(v => v.budgetId == state.activeBudgetId);

    if (budgetId && budgetId != budget.budgetId) {
      state.budgets
        .filter(v => v.budgetId != budgetId)
        .forEach(b => {
          dispatch('fetchBudget', budget.budgetId);
        });
    } else {
      if (!budget) {return}

      dispatch('fetchBudget', budget.budgetId);
      if (budget.unassignedFunds) {
        dispatch('fetchUnassignedFunds', budget.budgetId);
      }
      if (budget.spendingCategoriesBalance) {
        dispatch('fetchSpendingCategoriesBalance', budget.budgetId);
      }
      if (budget.savingCategoriesBalance) {
        dispatch('fetchSavingCategoriesBalance', budget.budgetId);
      }
    }

  },

  async fetchBudgets({ dispatch, commit }) {
    dispatch('wait/start', 'loading.budgets', { root: true });
    try {
      let response = await budgetService.userBudgets()

      if (response.ok) {
        let data = await response.json();
        commit('setBudgets', data);
      } else if (response.status == 404) {
        commit('setBudgets', []);
      } else {
        commit('setBudgets', []);
      }
        dispatch('wait/end', 'loading.budgets', { root: true });
      } catch (error) {
      dispatch('wait/end', 'loading.budgets', { root: true });
    }
  },

  fetchBudget({ dispatch, commit }, budgetId) {
    dispatch('wait/start', 'loading.budget', { root: true });
    budgetService
      .getBudget(budgetId)
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            commit('setBudget', data);
            dispatch('wait/end', 'loading.budget', { root: true });
          });
        } else if (response.status == 404) {
          dispatch('wait/end', 'loading.budget', { root: true });
        } else {
          dispatch('wait/end', 'loading.budget', { root: true });
        }
      })
      .catch(error => {
        dispatch('wait/end', 'loading.budget', { root: true });
      });
  },

  fetchUnassignedFunds({ commit, dispatch }, budgetId) {
    dispatch('wait/start', 'loading.unassignedFunds', { root: true });
    budgetService
      .getUnassigned(budgetId)
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            commit('setUnassignedFunds', data);
            dispatch('wait/end', 'loading.unassignedFunds', { root: true });
          });
        } else {
          response.json().then(() => {
            commit('setUnassignedFunds', null);
            dispatch('wait/end', 'loading.unassignedFunds', { root: true });
          });
        }
      })
      .catch(error => {
        dispatch('fetchBudgets');
      });

  },

  initializeBudgets({ state, dispatch }) {
    if (!state.budgets || state.budgets.length === 0) {
      dispatch('fetchBudgets');
    }
  },

  initializeCategoriesBalance({ state, dispatch }) {
    if (!state.activeBudgetId) {
      return;
    }
    let budget = state.budgets.find(v => v.budgetId == state.activeBudgetId);
    if (!budget) {
      return;
    }

    if (!budget.spendingCategoriesBalance) {
      dispatch('fetchSpendingCategoriesBalance', state.activeBudgetId);
    }
    if (!budget.savingCategoriesBalance) {
      dispatch('fetchSavingCategoriesBalance', state.activeBudgetId);
    }
  },

  initializeUnassignedFunds({ state, dispatch }) {
    if (!state.activeBudgetId) {
      return;
    }
    let budget = state.budgets.find(v => v.budgetId == state.activeBudgetId);
    if (!budget) {
      return;
    }

    if (!budget.unassignedFunds) {
      dispatch('fetchUnassignedFunds', state.activeBudgetId);
    }
  },

  fetchSpendingCategoriesBalance({ commit, dispatch }, budgetId) {
    dispatch('wait/start', 'loading.spendingCategoriesBalance', { root: true });
    budgetService.getCategoriesBalance(budgetId, eCategoryType.Spending).then(response => {
      if (response.ok) {
        response.json().then(data => {
          commit('setSpendingCategoriesBalance', data);
          dispatch('wait/end', 'loading.spendingCategoriesBalance', {
            root: true
          });
        });
      } else {
        response.json<ErrorMessage>().then(data => {
          commit('alert/error', data.message, { root: true });
          dispatch('wait/end', 'loading.spendingCategoriesBalance', {
            root: true
          });
        });
      }
    });
  },

  fetchSavingCategoriesBalance({ commit, dispatch }, budgetId) {
    dispatch('wait/start', 'loading.savingCategoriesBalance', { root: true });
    budgetService.getCategoriesBalance(budgetId, eCategoryType.Saving).then(response => {
      if (response.ok) {
        response.json().then(data => {
          commit('setSavingCategoriesBalance', data);
          dispatch('wait/end', 'loading.savingCategoriesBalance', {
            root: true
          });
        });
      } else {
        response.json<ErrorMessage>().then(data => {
          commit('alert/error', data.message, { root: true });
          dispatch('wait/end', 'loading.savingCategoriesBalance', {
            root: true
          });
        });
      }
    });
  },

  activeBudgetChange({ commit }, newActiveBudgetId) {
    commit('changeActiveBudget', newActiveBudgetId);
    commit('transactions/setBudgetFilter', newActiveBudgetId, { root: true });
  },

  unloadBudgetFromStore({ state, commit, dispatch }, budgetId) {
    let filteredBudgets = state.budgets.filter(v => v.budgetId != budgetId);

    if (state.activeBudgetId == budgetId && filteredBudgets.length > 1) {
      dispatch('activeBudgetChange', filteredBudgets[0].budgetId);
    }

    commit('setBudgets', filteredBudgets);
  },

  loadBudgetToStore({ commit }, newBudget) {
    commit('setBudget', newBudget);
  },

  updateBudgetInStore({ commit }, updatedTransaction) {
    commit('setBudget', updatedTransaction);
  }
};

const getters: GetterTree<BudgetsState, RootState> = {

  budget(state): Budget | null {
    if (state.activeBudgetId && state.budgets.length > 0) {
      return state.budgets.find(v => v.budgetId == state.activeBudgetId);
    } else {
      return null;
    }
  },

  budgetCategoryById: (state, getter) => (categoryId: number) => {
    if (getter.budget != null) {
      return (getter.budget as Budget).budgetCategories.find(v=>v.budgetCategoryId == categoryId)
    }
  },

  spendingCategories: (state, getter) =>
    !getter.budget
      ? null
      : (getter.budget as Budget).budgetCategories.filter(v => v.type == eCategoryType.Spending),
  savingCategories: (state, getter) =>
    !getter.budget
      ? null
      : (getter.budget as Budget).budgetCategories.filter(v => v.type == eCategoryType.Saving),
  incomeCategories: (state, getter) =>
    !getter.budget
      ? null
      : (getter.budget as Budget).budgetCategories.filter(v => v.type == eCategoryType.Income),


  spendingCategoriesBalance: (state, getter) =>
    !getter.budget ? null : getter.budget.spendingCategoriesBalance,
  unassignedFunds: (state, getter) =>
    !getter.budget ? null : getter.budget.unassignedFunds,
  savingCategoriesBalance: (state, getter) =>
    !getter.budget ? null : getter.budget.savingCategoriesBalance,
  incomeCategoriesBalance: (state, getter) =>
    !getter.budget ? null : getter.budget.incomeCategoriesBalance

};

const mutations: MutationTree<BudgetsState> = {
  changeActiveBudget(state, newActiveBudgetId) {
    state.activeBudgetId = newActiveBudgetId;
  },
  setUnassignedFunds(state, funds: number) {
    state.budgets.find(
      v => v.budgetId == state.activeBudgetId
    ).unassignedFunds = funds;
  },
  setBudgets(state, data: Budget[]) {
    let budgetsToSet = data.map(budget => {
      return {
        ...budget,
        startingDate: new Date(budget.startingDate),
        ...{
          unassignedFunds: null,
          spendingCategoriesBalance: null,
          savingCategoriesBalance: null,
          incomeCategoriesBalance: null
        }
      };
    });
    for (let budget of budgetsToSet) {
      if (budget.budgetCategories) {
        budget.budgetCategories = budget.budgetCategories.map((category) => {
          category.amountConfigs = category.amountConfigs.map((config)=>{
            config.validFrom = new Date(config.validFrom);
            config.validTo = config.validTo
              ?  new Date(config.validTo)
              : null;
              return config;
          })
          return category;
        })
      }
    }
    state.budgets = budgetsToSet;
  },
  setBudget(state, budget: Budget) {
    budget.startingDate = new Date(budget.startingDate);
    if (budget.budgetCategories) {
      for (let category of budget.budgetCategories) {
        for (let config of category.amountConfigs) {
          config.validFrom = new Date(config.validFrom);
          config.validTo = config.validTo
            ? new Date(config.validTo)
            : null;
        }
      }
    }

    let stateBudget = state.budgets.find(v => v.budgetId == budget.budgetId);

    if (stateBudget) {
      for (let param in stateBudget) {
        if (budget[param]) {
          stateBudget[param] = budget[param];
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
      });
    }

  },
  setSpendingCategoriesBalance(state, data) {
    state.budgets.find(v => v.budgetId == state.activeBudgetId
    ).spendingCategoriesBalance = data;
  },
  setSavingCategoriesBalance(state, data) {
    state.budgets.find(
      v => v.budgetId == state.activeBudgetId
    ).savingCategoriesBalance = data;
  },
  setIncomeCategoriesBalance(state, data) {
    state.budgets.find(
      v => v.budgetId == state.activeBudgetId
    ).incomeCategoriesBalance = data;
  },
  clearBudgets(state) {
    state.budgets = [];
  },
  clearSpendingCategoriesBalance(state) {
    state.budgets.find(
      v => v.budgetId == state.activeBudgetId
    ).spendingCategoriesBalance = null;
  },
  clearSavingCategoriesBalance(state) {
    state.budgets.find(
      v => v.budgetId == state.activeBudgetId
    ).savingCategoriesBalance = null;
  },
  clearIncomeCategoriesBalance(state) {
    state.budgets.find(
      v => v.budgetId == state.activeBudgetId
    ).incomeCategoriesBalance = null;
  }
};

export const budgets: Module<BudgetsState, RootState> = {
  namespaced: true,
  state: stateData,
  getters,
  actions,
  mutations
};
