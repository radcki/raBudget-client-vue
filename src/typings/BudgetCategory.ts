import { eCategoryType } from './enums/eCategoryType';
import { Budget } from './Budget';
import { AmountConfig } from './AmountConfig';

export interface BudgetCategory {
  budgetCategoryId: number;
  type: eCategoryType;
  budget: Budget | undefined;
  budgetId: number;
  icon: string;
  amountConfigs: AmountConfig[]
}
