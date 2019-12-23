import { ReportData } from './ReportData';
import { eCategoryType } from './enums/eCategoryType';

export interface PeriodBudgetReport {
  budgetCategoryReports: BudgetCategoryPeriodReport[];
  totalPeriodReport: ReportData;
}

export interface BudgetCategoryPeriodReport {
  budgetCategoryId: number;
  budgetCategoryType: eCategoryType;
  reportData: ReportData;
}
