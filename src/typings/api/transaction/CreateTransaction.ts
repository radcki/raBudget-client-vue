export interface CreateTransactionCommand {
  budgetCategoryId: number;
  transactionScheduleId?: number | null;
  description: string;
  amount: number;
  transactionDate: Date;
}
