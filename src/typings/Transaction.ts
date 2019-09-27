import { BudgetCategory } from './BudgetCategory';
import { eCategoryType } from './enums/eCategoryType';

export interface Transaction {
  transactionId: number;
  amount: number;
  description: string;
  budgetCategoryId: number,
  type?: eCategoryType,
  transactionDate: Date
  registeredDate?: Date | undefined
}
