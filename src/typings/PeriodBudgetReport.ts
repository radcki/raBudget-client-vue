import { ReportData } from './ReportData';

export interface PeriodBudgetReport {
  budgetCategoryReports: BudgetCategoryPeriodReport[];
  totalPeriodReport: ReportData;
}

export interface BudgetCategoryPeriodReport {
  budgetCategoryId: number;
  reportData: ReportData;
}
