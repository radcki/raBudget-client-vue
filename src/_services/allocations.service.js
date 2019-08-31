import {
  apiHandler
} from './apiHandler'

export const allocationsService = {
  createAllocation,
  listAllocations,
  getAllocation,
  updateAllocation,
  deleteAllocation
}

function createAllocation (allocationData) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: allocationData.description,
      amount: allocationData.amount,
      date: allocationData.date,
      destinationCategory: allocationData.category,
      sourceCategory: allocationData.sourceCategory
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/allocations`, requestOptions)
}

function deleteAllocation (id) {
  const requestOptions = {
    method: 'DELETE'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/allocations/${id}`, requestOptions)
}

function updateAllocation (allocationData) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: allocationData.description,
      amount: allocationData.amount,
      date: allocationData.date,
      destinationCategory: allocationData.destinationCategory
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/allocations/${allocationData.allocationId}`, requestOptions)
}

function listAllocations (budgetId, limitCount, startDate, endDate, categories) {
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
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/allocations/list`, requestOptions)
}

function getAllocation (allocationId) {
  const requestOptions = {
    method: 'GET'
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/allocations/` + allocationId, requestOptions)
}
