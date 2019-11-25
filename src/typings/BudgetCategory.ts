import { eCategoryType } from './enums/eCategoryType';
import { Budget } from './Budget';
import { AmountConfig } from './AmountConfig';

export interface BudgetCategory {
  budgetCategoryId?: number;
  type: eCategoryType;
  name: string;
  budget?: Budget;
  budgetId: number;
  icon: string;
  amountConfigs: AmountConfig[];
}
