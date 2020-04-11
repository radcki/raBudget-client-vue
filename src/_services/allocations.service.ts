import { apiHandler } from './apiHandler';
import { Allocation } from '@/typings/Allocation';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { CreateAllocationCommand } from '@/typings/api/allocation/CreateAllocation';
import { UpdateAllocationCommand } from '@/typings/api/allocation/UpdateAllocation';

function createAllocation(budgetId: number, command: CreateAllocationCommand) {
  command.amount = +command.amount; //ensure number
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };
  return apiHandler.fetchAuthorized(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/allocations`,
    requestOptions,
  );
}

function deleteAllocation(budgetId, id) {
  const requestOptions: RequestInit = {
    method: 'DELETE',
  };
  return apiHandler.fetchAuthorized(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/allocations/${id}`,
    requestOptions,
  );
}

function updateAllocation(budgetId, command: UpdateAllocationCommand) {
  const requestOptions: RequestInit = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };
  return apiHandler.fetchAuthorized(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/allocations/${command.allocationId}`,
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
  const requestOptions: RequestInit = {
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
  const requestOptions: RequestInit = {
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
