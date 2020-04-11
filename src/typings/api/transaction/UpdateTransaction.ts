export interface UpdateTransactionCommand {
  transactionId: number;
  budgetCategoryId: number;
  transactionScheduleId?: number | null;
  description: string;
  amount: number;
  transactionDate: Date;
}
