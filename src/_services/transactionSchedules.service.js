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
      frequency: data.frequency,
      periodStep: data.periodStep,
      step: data.step
    })
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactionSchedules/create`, requestOptions)
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
      frequency: data.frequency,
      periodStep: data.periodStep,
      transactionScheduleId: data.transactionScheduleId,
      step: data.step
    })
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactionSchedules/${data.transactionScheduleId}/update`, requestOptions)
}

function deleteTransactionSchedule (id, deleteTransactions) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactionSchedules/${id}/delete/${(!!deleteTransactions)}`, requestOptions)
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
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactionSchedules/list`, requestOptions)
}

function getTransactionSchedule (transactionScheduleId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactionSchedules/` + transactionScheduleId, requestOptions)
}

function listClosestOccurrences (budgetId, endDate) {
  const requestOptions = {
    method: 'GET',
    params: { endDate: endDate, budgetId: budgetId }
  }
  return apiHandler.fetchAuthorized(`${config.apiUrl}/transactionSchedules/closest-transactions`, requestOptions)
}
