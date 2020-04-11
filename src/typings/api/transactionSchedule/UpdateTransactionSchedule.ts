import { eFrequency } from '@/typings/enums/eFrequency';

export interface UpdateTransactionScheduleCommand {
  transactionScheduleId: number;
  description: string;
  amount: number;
  budgetCategoryId: number;
  frequency: eFrequency;
  periodStep: number;
  startDate: Date;
  endDate: Date | null;
}
