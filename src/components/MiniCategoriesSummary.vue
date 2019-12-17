<template>
  <v-card :class="backgroundColor">
    <v-card-text :class="color">
      <v-layout v-if="loading" row wrap>
        <v-flex xs12>
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-flex>
      </v-layout>
      <v-layout v-else row wrap>
        <v-flex xs4 align-center></v-flex>
        <v-flex xs4 align-center class="subtitle-2">{{ $t('categories.totalAmount') }}</v-flex>
        <v-flex xs4 align-center class="subtitle-2">{{ $t('categories.monthPlanLeft') }}</v-flex>
        <template v-for="(category, index) in dataBalance">
          <v-flex :key="index + '_name'" xs4 align-center class="subtitle-2">
            {{ findCategoryById(category.budgetCategoryId).name }}
          </v-flex>
          <v-flex :key="index + '_savingsum'" xs4>
            <v-chip class="amber darken-3 elevation-3 white--text" small>
              <v-animated-number
                :value="category.totalTransactionsSum"
                :format-value="formatAmount"
                :duration="300"
              />
            </v-chip>
          </v-flex>
          <v-flex :key="index + '_savingplan'" xs4>
            <v-chip class="amber darken-3 elevation-3 white--text" small>
              <v-animated-number
                :value="category.thisMonthBudgetBalance"
                :format-value="formatAmount"
                :duration="300"
              />
            </v-chip>
          </v-flex>
        </template>
      </v-layout>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { BudgetCategoryBalance } from '@/typings/BudgetCategoryBalance';
import { Budget } from '@/typings/Budget';
import { BudgetCategory } from '@/typings/BudgetCategory';

@Component({
  components: {
    'v-animated-number': () => import('@/components/AnimatedNumber.vue'),
  },
})
export default class MiniCategoriesSummary extends Vue {
  @Prop(Boolean) readonly loading?: boolean;
  @Prop(Array) readonly dataBalance?: BudgetCategoryBalance[];
  @Prop(Object) readonly dataBudget?: Budget;
  @Prop(String) readonly backgroundColor?: string;
  @Prop(String) readonly color?: string;

  get budgetCategories(): BudgetCategory[] {
    return this.dataBudget ? this.dataBudget.budgetCategories : [];
  }

  formatAmount(value) {
    return this.$options.filters
      ? this.$options.filters.currency(value, this.$currencyConfig(this.dataBudget))
      : value;
  }

  findCategoryById(budgetCategoryId: number) {
    return this.budgetCategories.find(v => v.budgetCategoryId == budgetCategoryId);
  }
}
</script>
