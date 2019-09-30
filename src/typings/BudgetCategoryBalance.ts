export interface BudgetCategoryBalance {
  budgetCategoryId: number;
  OverallBudgetBalance?: number;
  ThisMonthBudgetBalance?: number;
  ThisMonthTransactionsSum?: number;
  ThisMonthYetScheduledSum?: number;
  LeftToEndOfYear?: number;
  ThisYearBudget?: number;
  ThisYearYetScheduledSum?: number;
  ThisMonthBudget?: number;
  BudgetSoFar?: number;
  TotalTransactionsSum?: number;
  TotalAllocationsSum?: number;
}
