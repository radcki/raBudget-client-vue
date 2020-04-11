import { Currency } from '@/typings/Currency';

export interface UpdateBudgetCommand {
  budgetId: number;
  name: string;
  currency: Currency;
  startingDate: Date;
  ownedByUserId: string;
}
