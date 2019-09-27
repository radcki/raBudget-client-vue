import { Currency } from './Currency';
import { User } from './User';
import { BudgetCategory } from './BudgetCategory';

export interface Budget {
  id: number | null;
  budgetId: number;
  name: string;
  currency: Currency;
  budgetCategories: BudgetCategory[];
  startingDate: Date;
  ownedByUser: User;
  isDefault: boolean;

  unassignedFunds: any;
  spendingCategoriesBalance: any;
  savingCategoriesBalance: any;
  incomeCategoriesBalance: any;
}
