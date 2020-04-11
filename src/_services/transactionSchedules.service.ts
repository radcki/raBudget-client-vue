import { apiHandler } from './apiHandler';
import { TransactionSchedule } from '@/typings/TransactionSchedule';
import { UpdateTransactionScheduleCommand } from '@/typings/api/transactionSchedule/UpdateTransactionSchedule';
import { CreateTransactionScheduleCommand } from '@/typings/api/transactionSchedule/CreateTransactionSchedule';

function createTransactionSchedule(budgetId: number, command: CreateTransactionScheduleCommand) {
  command.amount = +command.amount;
  command.budgetCategoryId = +command.budgetCategoryId;
  command.periodStep = +command.periodStep;
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };

  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactionSchedules`,
    requestOptions,
  );
}

function updateTransactionSchedule(budgetId: number, command: UpdateTransactionScheduleCommand) {
  command.amount = +command.amount;
  command.budgetCategoryId = +command.budgetCategoryId;
  command.periodStep = +command.periodStep;
  command.transactionScheduleId = +command.transactionScheduleId;
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactionSchedules/${command.transactionScheduleId}`,
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

  return apiHandler.fetchAuthorized<any>(url.toString(), requestOptions);
}

export const transactionSchedulesService = {
  createTransactionSchedule,
  updateTransactionSchedule,
  deleteTransactionSchedule,
  getTransactionSchedule,
  listTransactionSchedules,
  listClosestOccurrences,
};
