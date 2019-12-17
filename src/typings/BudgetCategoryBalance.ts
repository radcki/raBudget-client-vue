export interface BudgetCategoryBalance {
  budgetCategoryId: number;
  overallBudgetBalance?: number;
  thisMonthBudgetBalance?: number;
  thisMonthTransactionsSum?: number;
  thisMonthYetScheduledSum?: number;
  leftToEndOfYear?: number;
  thisYearBudget?: number;
  thisYearYetScheduledSum?: number;
  thisMonthBudget?: number;
  budgetSoFar?: number;
  totalTransactionsSum?: number;
  totalAllocationsSum?: number;
}
