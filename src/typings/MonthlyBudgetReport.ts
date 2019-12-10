import { Month } from './Month';
import { ReportData } from './ReportData';

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
  monthlyReports: MonthReport[];
}
