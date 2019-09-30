import {
  apiHandler
} from './apiHandler'
import { Transaction } from '@/typings/Transaction'
import { BudgetCategory } from '@/typings/BudgetCategory'

export const transactionsService = {
  transferTransactions,
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
}

function transferTransactions(budgetId: number, sourceCategory: BudgetCategory, targetCategory: BudgetCategory) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      budgetId,
      sourceCategory,
      targetCategory
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/transfer`, requestOptions)
}

function createTransaction(budgetId: number, transactionData: Transaction) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transactionData)
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions`, requestOptions)
}

function deleteTransaction(budgetId, id) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/${id}`, requestOptions)
}

function updateTransaction(budgetId, transactionData) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: transactionData.description,
      amount: transactionData.amount,
      date: transactionData.date,
      category: transactionData.category
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/${transactionData.transactionId}`, requestOptions)
}

function listTransactions(budgetId: number, limitCount: number, startDate: Date, endDate: Date, categories: BudgetCategory[]) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      limitResults: limitCount,
      transactionDateStartFilter: startDate,
      transactionDateEndFilter: endDate,
      transactionIdFilter: categories ? categories.map(v=>v.budgetCategoryId) : null
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/filter`, requestOptions)
}

function getTransaction(budgetId, transactionId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/${transactionId}`, requestOptions)
}
