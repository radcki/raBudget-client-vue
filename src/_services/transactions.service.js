import config from 'config'
import {
  apiHandler
} from './apiHandler'

export const transactionsService = {
  transferTransactions,
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
}

function transferTransactions (budgetId, sourceCategory, targetCategory) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      budgetId: budgetId,
      sourceCategory: sourceCategory,
      targetCategory: targetCategory
    })
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactions/transfer`, requestOptions)
}

function createTransaction (transactionData) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: transactionData.description,
      amount: transactionData.amount,
      date: transactionData.date,
      category: {
        categoryId: transactionData.category
      }
    })
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactions/create`, requestOptions)
}

function deleteTransaction (id) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactions/${id}/delete`, requestOptions)
}

function updateTransaction (transactionData) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: transactionData.description,
      amount: transactionData.amount,
      date: transactionData.date,
      category: {
        categoryId: transactionData.category
      }
    })
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactions/${transactionData.transactionId}/update`, requestOptions)
}

function listTransactions (budgetId, limitCount, startDate, endDate, categories) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      budgetId: budgetId,
      groupCount: limitCount,
      startDate: startDate,
      endDate: endDate,
      categories: categories
    })
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactions/list`, requestOptions)
}

function getTransaction (transactionId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactions/` + transactionId, requestOptions)
}
