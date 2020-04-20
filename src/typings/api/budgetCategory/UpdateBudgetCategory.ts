export interface UpdateBudgetCategoryCommand {
  budgetCategoryId: number;
  name: string;
  icon: string;
  amountConfigs: AmountConfigDto[];
}

export interface AmountConfigDto {
  monthlyAmount: number;
  validFrom: Date;
}
