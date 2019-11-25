import { apiHandler } from './apiHandler';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { Budget, CreateBudgetCommand } from '@/typings/Budget';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { format } from 'date-fns';
import { PeriodBudgetReport } from '@/typings/PeriodBudgetReport';
import { MonthlyBudgetReport } from '@/typings/MonthlyBudgetReport';
import { Currency } from '@/typings/Currency';
import { BudgetCategoryBalance } from '@/typings/BudgetCategoryBalance';

function supportedCurrencies() {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  return apiHandler.fetchAuthorized<Currency[]>(
    `${process.env.VUE_APP_APIURL}/budgets/supported-currencies`,
    requestOptions,
  );
}

function userBudgets() {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  return apiHandler.fetchAuthorized<Budget[]>(
    `${process.env.VUE_APP_APIURL}/budgets`,
    requestOptions,
  );
}

function createBudget(budgetData: CreateBudgetCommand) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: budgetData.name,
      currency: budgetData.currency,
      startingDate: format(budgetData.startingDate, 'yyyy-MM-dd'),
      budgetCategories: budgetData.budgetCategories,
    }),
  };
  return apiHandler.fetchAuthorized<any>(`${process.env.VUE_APP_APIURL}/budgets`, requestOptions);
}

function saveBudget(budgetId, budgetData: Budget) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: budgetData.name,
      startingDate: format(budgetData.startingDate, 'yyyy-MM-dd'),
      currency: budgetData.currency,
      ownedByUser: budgetData.ownedByUser,
    }),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}`,
    requestOptions,
  );
}

function setDefault(budgetId) {
  const requestOptions = {
    method: 'PATCH',
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/default`,
    requestOptions,
  );
}

function deleteBudget(budgetId: number) {
  const requestOptions = {
    method: 'DELETE',
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}`,
    requestOptions,
  );
}

function getBudget(budgetId: number) {
  const requestOptions = {
    method: 'GET',
  };
  return apiHandler.fetchAuthorized<Budget>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}`,
    requestOptions,
  );
}

function getUnassigned(budgetId: number) {
  const requestOptions = {
    method: 'GET',
  };
  return apiHandler.fetchAuthorized<number>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/unassigned-funds`,
    requestOptions,
  );
}

function getCategoriesBalance(budgetId: number, categoryType: eCategoryType) {
  const requestOptions = {
    method: 'GET',
  };
  return apiHandler.fetchAuthorized<BudgetCategoryBalance>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/categories-balance/${categoryType}`,
    requestOptions,
  );
}

function getPeriodReport(budgetId: number, startDate, endDate) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateStartFilter: startDate,
      dateEndFilter: endDate,
    }),
  };
  return apiHandler.fetchAuthorized<PeriodBudgetReport>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/period-report/`,
    requestOptions,
  );
}

function getMonthlyReport(budgetId: number, startDate, endDate) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateStartFilter: startDate,
      dateEndFilter: endDate,
    }),
  };
  return apiHandler.fetchAuthorized<MonthlyBudgetReport>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/monthly-report/`,
    requestOptions,
  );
}

function createCategory(budgetId, category: BudgetCategory) {
  category.budgetCategoryId = 0;
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/budgetcategories/`,
    requestOptions,
  );
}

function updateCategory(budgetId: number, category: BudgetCategory) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/budgetcategories/${category.budgetCategoryId}`,
    requestOptions,
  );
}

function deleteCategory(budgetId, categoryId) {
  const requestOptions = {
    method: 'DELETE',
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/budgetcategories/${categoryId}`,
    requestOptions,
  );
}

export const budgetService = {
  supportedCurrencies,
  userBudgets,
  createBudget,
  deleteBudget,
  saveBudget,
  getBudget,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesBalance,
  getUnassigned,
  setDefault,
  getPeriodReport,
  getMonthlyReport,
};
