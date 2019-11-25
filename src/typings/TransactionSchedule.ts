import { eFrequency } from './enums/eFrequency';

export interface TransactionSchedule {
  transactionScheduleId?: number;
  amount: number;
  description: string;
  budgetCategoryId: number;
  frequency: eFrequency;
  periodStep: number;
  startDate: Date;
  endDate?: Date | null;
}
