import { eFrequency } from '@/typings/enums/eFrequency';

export interface CreateTransactionScheduleCommand {
  description: string;
  amount: number;
  budgetCategoryId: number;
  frequency: eFrequency;
  periodStep: number;
  startDate: Date;
  endDate: Date | null;
}
