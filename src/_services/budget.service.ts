import { apiHandler } from './apiHandler';
import { Budget } from '@/typings/Budget';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { format } from 'date-fns';
import { PeriodBudgetReport } from '@/typings/PeriodBudgetReport';
import { MonthlyBudgetReport } from '@/typings/MonthlyBudgetReport';
import { Currency } from '@/typings/Currency';
import { BudgetCategoryBalance } from '@/typings/BudgetCategoryBalance';
import { CreateBudgetCommand } from '@/typings/api/budget/CreateBudget';
import { UpdateBudgetCommand } from '@/typings/api/budget/UpdateBudget';
import { CreateBudgetCategoryCommand } from '@/typings/api/budgetCategory/CreateBudgetCategory';
import { UpdateBudgetCategoryCommand } from '@/typings/api/budgetCategory/UpdateBudgetCategory';
import { SaveBudgetCategoriesCommand } from '@/typings/api/budget/SaveBudgetCategoriesOrder';

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

function createBudget(command: CreateBudgetCommand) {
  command.budgetCategories.map(category => {
    category.type = +category.type;
    category.amountConfigs = category.amountConfigs.map(v => {
      v.monthlyAmount = +v.monthlyAmount;
      return v;
    });
    return category;
  });
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: command.name,
      currency: command.currency,
      startingDate: format(command.startingDate, 'yyyy-MM-dd'),
      budgetCategories: command.budgetCategories,
    }),
  };
  return apiHandler.fetchAuthorized<any>(`${process.env.VUE_APP_APIURL}/budgets`, requestOptions);
}

function saveBudget(command: UpdateBudgetCommand) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${command.budgetId}`,
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

function getPeriodReport(budgetId: number, startDate: Date, endDate: Date) {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const searchParams = new URLSearchParams();
  if (startDate) searchParams.append('dateStart', startDate.toISOString());
  if (endDate) searchParams.append('dateEnd', endDate.toISOString());

  return apiHandler.fetchAuthorized<PeriodBudgetReport>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/period-report/?${searchParams.toString()}`,
    requestOptions,
  );
}

function getMonthlyReport(budgetId: number, startDate, endDate) {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const searchParams = new URLSearchParams();
  if (startDate) searchParams.append('dateStart', startDate.toISOString());
  if (endDate) searchParams.append('dateEnd', endDate.toISOString());

  return apiHandler.fetchAuthorized<MonthlyBudgetReport>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/monthly-report/?${searchParams.toString()}`,
    requestOptions,
  );
}

function createCategory(budgetId: number, command: CreateBudgetCategoryCommand) {
  //command.type = +command.type;
  command.amountConfigs.map(v => {
    v.monthlyAmount = +v.monthlyAmount;
    return v;
  });
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/budgetcategories/`,
    requestOptions,
  );
}

function updateCategory(budgetId: number, command: UpdateBudgetCategoryCommand) {
  command.amountConfigs.map(v => {
    v.monthlyAmount = +v.monthlyAmount;
    return v;
  });
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/budgetcategories/${command.budgetCategoryId}`,
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

function saveBudgetCategoriesOrder(budgetId: number, command: SaveBudgetCategoriesCommand) {
  command.budgetCategoryOrder.map(v => {
    v.budgetCategoryId = +v.budgetCategoryId;
    return v;
  });
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/save-categories-order`,
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
  saveBudgetCategoriesOrder,
};
