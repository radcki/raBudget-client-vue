export interface Transaction {
  transactionId?: number;
  amount: number;
  description: string;
  budgetCategoryId: number;
  transactionDate: Date;
  registeredDate?: Date | undefined;
}
