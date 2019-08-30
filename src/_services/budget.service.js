import {
  apiHandler
} from './apiHandler'

export const budgetService = {
  userBudgets,
  createBudget,
  deleteBudget,
  saveBudget,
  getBudget,
  saveCategory,
  deleteCategory,
  getSpendingCategoriesBalance,
  getIncomeCategoriesBalance,
  getSavingCategoriesBalance,
  getUnassigned,
  setDefault,
  getPeriodReport,
  getMonthlyReport
}

function userBudgets () {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets`, requestOptions)
}

function createBudget (budgetData, budgetCategories) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: budgetData.name,
      currency: budgetData.currency,
      startingDate: budgetData.startingDate,
      spendingCategories: budgetCategories.spending,
      incomeCategories: budgetCategories.income,
      savingCategories: budgetCategories.savings
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/create`, requestOptions)
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
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${budgetId}/update`, requestOptions)
}

function setDefault (budgetId) {
  const requestOptions = {
    method: 'POST'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${budgetId}/setDefault`, requestOptions)
}

function deleteBudget (budgetId) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${budgetId}/delete`, requestOptions)
}

function getBudget (id) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${id}`, requestOptions)
}

function getUnassigned (budgetId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${budgetId}/unassigned`, requestOptions)
}

function getSpendingCategoriesBalance (budgetId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${budgetId}/categoriesbalance/spending`, requestOptions)
}

function getIncomeCategoriesBalance (budgetId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${budgetId}/categoriesbalance/income`, requestOptions)
}

function getSavingCategoriesBalance (budgetId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${budgetId}/categoriesbalance/saving`, requestOptions)
}

function getPeriodReport (budgetId, startDate, endDate) {
  var url = new URL(`${process.env.apiUrl}/budgets/${budgetId}/report/period`, document.location)
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
  var url = new URL(`${process.env.apiUrl}/budgets/${budgetId}/report/monthly`, document.location)
  var params = {
    startDate: startDate,
    endDate: endDate
  }
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  return apiHandler.fetchAuthorized(url, {
    method: 'GET'
  })
}

function saveCategory (budgetId, category) {
  category.categoryId = category.categoryId || 0
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(category)
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${budgetId}/savecategory`, requestOptions)
}

function deleteCategory (budgetId, categoryId) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/budgets/${budgetId}/deletecategory/${categoryId}`, requestOptions)
}
