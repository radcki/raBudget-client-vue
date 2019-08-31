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

  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/transactionSchedules`, requestOptions)
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
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/transactionSchedules/${data.transactionScheduleId}`, requestOptions)
}

function deleteTransactionSchedule (id, deleteTransactions) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/transactionSchedules/${id}/${(!!deleteTransactions)}`, requestOptions)
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
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/transactionSchedules/list`, requestOptions)
}

function getTransactionSchedule (transactionScheduleId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/transactionSchedules/` + transactionScheduleId, requestOptions)
}

function listClosestOccurrences (budgetId, endDate) {
  const requestOptions = {
    method: 'GET',
    params: { endDate: endDate, budgetId: budgetId }
  }
  var url = new URL(`${process.env.VUE_APP_APIURL}/transactionSchedules/closest-transactions`, document.location)
  var params = { endDate: endDate, budgetId: budgetId }

  url.search = new URLSearchParams(params)

  return apiHandler.fetchAuthorized(url, requestOptions)
}
