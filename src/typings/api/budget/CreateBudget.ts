import { Currency } from '@/typings/Currency';
import { BudgetCategory } from '@/typings/BudgetCategory';

export interface CreateBudgetCommand {
  name: string;
  currency: Currency;
  budgetCategories: BudgetCategory[];
  startingDate: Date;
}
