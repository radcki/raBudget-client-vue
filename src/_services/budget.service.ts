import {
  apiHandler
} from './apiHandler'
import { BudgetCategory } from '@/typings/BudgetCategory'
import { Budget } from '@/typings/Budget'
import { eAlertType } from '@/typings/enums/eAlertType'
import { eCategoryType } from '@/typings/enums/eCategoryType'
import { format } from 'date-fns'

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
      startingDate: format(budgetData.startingDate, 'yyyy-MM-dd'),
      budgetCategories: budgetData.budgetCategories
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets`, requestOptions)
}

function saveBudget (budgetId, budgetData: Budget) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: budgetData.name,
      startingDate: format(budgetData.startingDate, 'yyyy-MM-dd'),
      currency: budgetData.currency,
      ownedByUser: budgetData.ownedByUser
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}`, requestOptions)
}

function setDefault (budgetId) {
  const requestOptions = {
    method: 'PATCH'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/default`, requestOptions)
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
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/unassigned-funds`, requestOptions)
}

function getCategoriesBalance (budgetId: number, categoryType: eCategoryType) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/categories-balance/${categoryType}`, requestOptions)
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
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/budgetcategories/`, requestOptions)
}

function updateCategory (budgetId: number, category: BudgetCategory) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(category)
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/budgetcategories/${category.budgetCategoryId}`, requestOptions)
}

function deleteCategory (budgetId, categoryId) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/budgetcategories/${categoryId}`, requestOptions)
}
