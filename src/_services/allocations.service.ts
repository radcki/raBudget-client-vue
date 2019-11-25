import { apiHandler } from './apiHandler';
import { Allocation } from '@/typings/Allocation';
import { BudgetCategory } from '@/typings/BudgetCategory';

function createAllocation(budgetId: number, allocationData: Allocation) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(allocationData),
  };
  return apiHandler.fetchAuthorized(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/allocations`,
    requestOptions,
  );
}

function deleteAllocation(budgetId, id) {
  const requestOptions = {
    method: 'DELETE',
  };
  return apiHandler.fetchAuthorized(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/allocations/${id}`,
    requestOptions,
  );
}

function updateAllocation(budgetId, allocationData: Allocation) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: allocationData.description,
      amount: allocationData.amount,
      allocationDate: allocationData.allocationDate,
      targetBudgetCategoryId: allocationData.targetBudgetCategoryId,
      sourceBudgetCategoryId: allocationData.sourceBudgetCategoryId,
    } as Allocation),
  };
  return apiHandler.fetchAuthorized(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/allocations/${allocationData.allocationId}`,
    requestOptions,
  );
}

function listAllocations(
  budgetId: number,
  limitCount: number | null,
  startDate: Date,
  endDate: Date,
  categories: BudgetCategory[],
) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      limitResults: limitCount,
      allocationDateStartFilter: startDate,
      allocationDateEndFilter: endDate,
      categoryIdFilter: categories ? categories.map(v => v.budgetCategoryId) : null,
    }),
  };
  return apiHandler.fetchAuthorized<Allocation[]>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/allocations/filter`,
    requestOptions,
  );
}

function getAllocation(budgetId, allocationId) {
  const requestOptions = {
    method: 'GET',
  };
  return apiHandler.fetchAuthorized<Allocation>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/allocations/${allocationId}`,
    requestOptions,
  );
}

export const allocationsService = {
  createAllocation,
  listAllocations,
  getAllocation,
  updateAllocation,
  deleteAllocation,
};
