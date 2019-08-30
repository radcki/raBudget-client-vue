import {
  apiHandler
} from './apiHandler'

export const transactionSchedulesService = {
  createTransactionSchedule,
  updateTransactionSchedule,
  deleteTransactionSchedule,
  getTransactionSchedule,
  listTransactionSchedules,
  listClosestOccurrences
}

function createTransactionSchedule (data) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: data.description,
      amount: data.amount,
      startDate: data.startDate,
      endDate: data.endDate,
      budgetCategory: data.budgetCategory,
      frequency: data.frequency || 0,
      periodStep: data.periodStep || 1,
      step: data.step
    })
  }

  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/transactionSchedules/create`, requestOptions)
}

function updateTransactionSchedule (data) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: data.description,
      amount: data.amount,
      startDate: data.startDate,
      endDate: data.endDate,
      budgetCategory: data.budgetCategory,
      frequency: data.frequency || 0,
      periodStep: data.periodStep || 1,
      transactionScheduleId: data.transactionScheduleId,
      step: data.step
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/transactionSchedules/${data.transactionScheduleId}/update`, requestOptions)
}

function deleteTransactionSchedule (id, deleteTransactions) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/transactionSchedules/${id}/delete/${(!!deleteTransactions)}`, requestOptions)
}

function listTransactionSchedules (budgetId, startDate, endDate) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      budgetId: budgetId,
      startDate: startDate,
      endDate: endDate
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/transactionSchedules/list`, requestOptions)
}

function getTransactionSchedule (transactionScheduleId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.apiUrl}/transactionSchedules/` + transactionScheduleId, requestOptions)
}

function listClosestOccurrences (budgetId, endDate) {
  const requestOptions = {
    method: 'GET',
    params: { endDate: endDate, budgetId: budgetId }
  }
  var url = new URL(`${process.env.apiUrl}/transactionSchedules/closest-transactions`, document.location)
  var params = { endDate: endDate, budgetId: budgetId }

  url.search = new URLSearchParams(params)

  return apiHandler.fetchAuthorized(url, requestOptions)
}
