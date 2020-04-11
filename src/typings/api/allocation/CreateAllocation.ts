export interface CreateAllocationCommand {
  targetBudgetCategoryId: number;
  sourceBudgetCategoryId: number | null;
  description: string;
  amount: number;
  allocationDate: Date;
}
