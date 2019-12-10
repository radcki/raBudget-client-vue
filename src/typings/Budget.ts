import { Currency } from './Currency';
import { User } from './User';
import { BudgetCategory } from './BudgetCategory';

export interface Budget {
  budgetId: number;
  name: string;
  currency: Currency;
  budgetCategories: BudgetCategory[];
  startingDate: Date;
  ownedByUser: User;
  default: boolean;

  currentFunds?: number;
  unassignedFunds?: number;
  spendingCategoriesBalance?: any[];
  savingCategoriesBalance?: any[];
  incomeCategoriesBalance?: any[];
}

export interface CreateBudgetCommand {
  name: string;
  currency: Currency;
  budgetCategories: BudgetCategory[];
  startingDate: Date;
}
