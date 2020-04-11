import { apiHandler } from './apiHandler';
import { Transaction } from '@/typings/Transaction';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { CreateTransactionCommand } from '@/typings/api/transaction/CreateTransaction';
import { UpdateTransactionCommand } from '@/typings/api/transaction/UpdateTransaction';

function transferTransactions(
  budgetId: number,
  sourceCategory: BudgetCategory,
  targetCategory: BudgetCategory,
) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      budgetId,
      sourceCategory,
      targetCategory,
    }),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/transfer`,
    requestOptions,
  );
}

function createTransaction(budgetId: number, command: CreateTransactionCommand) {
  command.amount = +command.amount; //ensure number
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };
  return apiHandler.fetchAuthorized(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions`,
    requestOptions,
  );
}

function deleteTransaction(budgetId, id) {
  const requestOptions = {
    method: 'DELETE',
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/${id}`,
    requestOptions,
  );
}

function updateTransaction(budgetId, command: UpdateTransactionCommand) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  };
  return apiHandler.fetchAuthorized<any>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/${command.transactionId}`,
    requestOptions,
  );
}

function listTransactions(
  budgetId: number,
  limitCount: number | null | undefined,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  categories: BudgetCategory[] | null | undefined,
  categoryType: eCategoryType | null | undefined,
) {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const searchParams = new URLSearchParams();
  if (limitCount) searchParams.append('limitCategoryTypeResults', limitCount.toString());
  if (startDate) searchParams.append('transactionDateStart', startDate.toISOString());
  if (endDate) searchParams.append('transactionDateEnd', endDate.toISOString());
  if (categories && categories.length > 0) {
    for (const category of categories) {
      if (category.budgetCategoryId)
        searchParams.append('categoryId', category.budgetCategoryId.toString());
    }
  }
  if (categoryType) searchParams.append('categoryType', categoryType.toString());

  return apiHandler.fetchAuthorized<Transaction[]>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/?` + searchParams,
    requestOptions,
  );
}

function getTransaction(budgetId, transactionId) {
  const requestOptions = {
    method: 'GET',
  };
  return apiHandler.fetchAuthorized<Transaction>(
    `${process.env.VUE_APP_APIURL}/budgets/${budgetId}/transactions/${transactionId}`,
    requestOptions,
  );
}

export const transactionsService = {
  transferTransactions,
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
