export interface UpdateAllocationCommand {
  allocationId: number;
  targetBudgetCategoryId: number;
  sourceBudgetCategoryId: number | null;
  description: string;
  amount: number;
  allocationDate: Date;
}
