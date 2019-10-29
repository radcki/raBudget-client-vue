import { eCategoryType } from './enums/eCategoryType';

export interface Allocation {
  allocationId?: number;
  amount: number;
  description: string;
  targetBudgetCategoryId: number,
  sourceBudgetCategoryId?: number | null,
  type?: eCategoryType,
  allocationDate: Date
  registeredDate?: Date | undefined
}
