import { Month } from './Month';
import { ReportData } from './ReportData';
import { eCategoryType } from './enums/eCategoryType';

export interface MonthlyBudgetReport {
  budgetCategoryReports: BudgetCategoryMonthlyReport[];
  totalMonthlyReports: MonthReport[];
}

export interface MonthReport {
  month: Month;
  reportData: ReportData;
}

export interface BudgetCategoryMonthlyReport {
  budgetCategoryId: number;
  budgetCategoryType: eCategoryType;
  monthlyReports: MonthReport[];
}
