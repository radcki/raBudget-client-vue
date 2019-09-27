import {
  apiHandler
} from './apiHandler'
import { BudgetCategory } from '@/typings/BudgetCategory'
import { Budget } from '@/typings/Budget'

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
  getSpendingCategoriesBalance,
  getIncomeCategoriesBalance,
  getSavingCategoriesBalance,
  getUnassigned,
  setDefault,
  getPeriodReport,
  getMonthlyReport
}

function supportedCurrencies () {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/supported-currencies`, requestOptions)
}

function userBudgets () {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets`, requestOptions)
}

function createBudget (budgetData: Budget) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: budgetData.name,
      currency: budgetData.currency,
      startingDate: budgetData.startingDate + '-01',
      budgetCategories: budgetData.budgetCategories
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets`, requestOptions)
}

function saveBudget (budgetId, budgetData) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: budgetData.name,
      startingDate: budgetData.startingDate + '-01',
      currency: budgetData.currency,
      default: budgetData.default
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}`, requestOptions)
}

function setDefault (budgetId) {
  const requestOptions = {
    method: 'POST'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/setDefault`, requestOptions)
}

function deleteBudget (budgetId) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}`, requestOptions)
}

function getBudget (id) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${id}`, requestOptions)
}

function getUnassigned (budgetId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/unassigned`, requestOptions)
}

function getSpendingCategoriesBalance (budgetId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/categoriesbalance/spending`, requestOptions)
}

function getIncomeCategoriesBalance (budgetId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/categoriesbalance/income`, requestOptions)
}

function getSavingCategoriesBalance (budgetId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/categoriesbalance/saving`, requestOptions)
}

function getPeriodReport (budgetId, startDate, endDate) {
  var url = new URL(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/report/period`, document.location.toString())
  var params = {
    startDate: startDate,
    endDate: endDate
  }
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  return apiHandler.fetchAuthorized(url, {
    method: 'GET'
  })
}

function getMonthlyReport (budgetId, startDate, endDate) {
  var url = new URL(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/report/monthly`, document.location.toString())
  var params = {
    startDate: startDate,
    endDate: endDate
  }
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  return apiHandler.fetchAuthorized(url, {
    method: 'GET'
  })
}

function createCategory (budgetId, category: BudgetCategory) {
  category.budgetCategoryId = 0
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(category)
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}`, requestOptions)
}

function updateCategory (budgetId: number, category: BudgetCategory) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(category)
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/categories/${category.budgetCategoryId}`, requestOptions)
}

function deleteCategory (budgetId, categoryId) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/categories/${categoryId}`, requestOptions)
}
