import { apiHandler } from './apiHandler';
import { TransactionSchedule } from '@/typings/TransactionSchedule';

function createTransactionSchedule(budgetId: number, data: TransactionSchedule) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: data.description,
      amount: data.amount,
      startDate: data.startDate,
      endDate: data.endDate,
      budgetCategoryId: data.budgetCategoryId,
      frequency: data.frequency || 0,
      periodStep: data.periodStep || 1,
    }),
  };

  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactionSchedules`,
    requestOptions,
  );
}

function updateTransactionSchedule(budgetId: number, data: TransactionSchedule) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: data.description,
      amount: data.amount,
      startDate: data.startDate,
      endDate: data.endDate,
      budgetCategoryId: data.budgetCategoryId,
      frequency: data.frequency || 0,
      periodStep: data.periodStep || 1,
      transactionScheduleId: data.transactionScheduleId,
    }),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactionSchedules/${data.transactionScheduleId}`,
    requestOptions,
  );
}

function deleteTransactionSchedule(budgetId: number, id: number) {
  const requestOptions = {
    method: 'DELETE',
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactionSchedules/${id}`,
    requestOptions,
  );
}

function listTransactionSchedules(budgetId, startDate, endDate) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDateStartFilter: startDate,
      startDateEndFilter: endDate,
    }),
  };
  return apiHandler.fetchAuthorized<TransactionSchedule[]>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactionSchedules/filter`,
    requestOptions,
  );
}

function getTransactionSchedule(budgetId, transactionScheduleId) {
  const requestOptions = {
    method: 'GET',
  };
  return apiHandler.fetchAuthorized<TransactionSchedule>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactionSchedules/` +
      transactionScheduleId,
    requestOptions,
  );
}

function listClosestOccurrences(budgetId, endDate) {
  const requestOptions = {
    method: 'GET',
    params: { endDate: endDate, budgetId: budgetId },
  };
  const url = new URL(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactionSchedules/closest-transactions`,
    document.location.toString(),
  );
  const params = { endDate: endDate, budgetId: budgetId };

  url.search = new URLSearchParams(params).toString();

  return apiHandler.fetchAuthorized<any>(url, requestOptions);
}

export const transactionSchedulesService = {
  createTransactionSchedule,
  updateTransactionSchedule,
  deleteTransactionSchedule,
  getTransactionSchedule,
  listTransactionSchedules,
  listClosestOccurrences,
};
