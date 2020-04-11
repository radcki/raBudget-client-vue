import { eCategoryType } from '@/typings/enums/eCategoryType';

export interface CreateBudgetCategoryCommand {
  name: string;
  icon: string;
  amountConfigs: AmountConfigDto[];
  type: eCategoryType;
  budgetId: number;
}

export interface AmountConfigDto {
  monthlyAmount: number;
  validFrom: Date;
}
