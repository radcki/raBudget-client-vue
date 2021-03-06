<template>
  <v-card color="cardBackground">
    <v-card-text>
      <v-layout row wrap justify-center>
        <v-flex v-if="!isMobile" xs3 style="min-height: 18px">
          <v-progress-linear
            v-show="loading"
            class="py-0 my-0"
            indeterminate
            color="primary"
          ></v-progress-linear>
        </v-flex>
        <v-flex v-if="!isMobile" class="text-xs-center" xs3>{{
          $t('categories.currentBalance')
        }}</v-flex>
        <v-flex v-if="!isMobile" class="text-xs-center" xs3>{{
          $t('categories.spendingThisMonth')
        }}</v-flex>
        <v-flex v-if="!isMobile" class="text-xs-center" xs3>{{
          $t('categories.yearBalance')
        }}</v-flex>
        <v-flex v-if="isMobile" class="pt-0 mt-0" xs12>
          <v-row no-gutters>
            <v-col class="subtitle-2">{{ $t('categories.budgetCategories') }}</v-col>
            <v-col class="flex-grow-0">
              <v-btn icon small @click="collapsed = !collapsed">
                <v-icon v-if="!collapsed">{{ mdiChevronUp }}</v-icon>
                <v-icon v-else>{{ mdiChevronDown }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-flex>

        <v-expand-transition>
          <v-layout v-show="!collapsed" row wrap justify-center>
            <template v-for="(category, index) in dataBalance">
              <v-flex v-if="$vuetify.breakpoint.xsOnly && index > 0" :key="index + '_divider'" xs12>
                <v-divider></v-divider>
              </v-flex>

              <v-flex :key="index + '_cat'" class="text-xs-left" xs12 sm3>
                <v-avatar slot="activator" size="28px" color="spending">
                  <v-icon color="white" small>{{
                    $categoryIcons[findCategoryById(category.budgetCategoryId).icon]
                  }}</v-icon>
                </v-avatar>
                <span class="px-2 caption">{{
                  findCategoryById(category.budgetCategoryId).name
                }}</span>
              </v-flex>

              <v-flex
                v-if="$vuetify.breakpoint.xsOnly"
                :key="index + '_balanceCaption'"
                class="text-xs-center caption"
                xs6
                >{{ $t('categories.currentBalance') }}</v-flex
              >
              <v-flex :key="index + '_balance'" sm3 xs6>
                <value-bar
                  :value="category.overallBudgetBalance"
                  :sub-value="
                    category.thisMonthYetScheduledSum > 0
                      ? category.overallBudgetBalance - category.thisMonthYetScheduledSum
                      : null
                  "
                  :total="category.thisMonthBudget"
                  :budget="dataBudget"
                ></value-bar>
              </v-flex>

              <v-flex
                v-if="$vuetify.breakpoint.xsOnly"
                :key="index + '_monthCaption'"
                class="text-xs-center caption"
                xs6
                >{{ $t('categories.spendingThisMonth') }}</v-flex
              >
              <v-flex :key="index + '_month'" sm3 xs6>
                <value-bar
                  :value="category.thisMonthTransactionsSum"
                  :sub-value="
                    category.thisMonthYetScheduledSum > 0
                      ? category.thisMonthTransactionsSum - category.thisMonthYetScheduledSum
                      : null
                  "
                  inverse-color
                  :total="category.thisMonthBudget"
                  :budget="dataBudget"
                ></value-bar>
              </v-flex>

              <v-flex
                v-if="$vuetify.breakpoint.xsOnly"
                :key="index + '_yearCaption'"
                class="text-xs-center caption"
                xs6
                >{{ $t('categories.yearBalance') }}</v-flex
              >
              <v-flex :key="index + '_year'" sm3 xs6>
                <value-bar
                  :value="category.leftToEndOfYear"
                  :sub-value="
                    category.thisYearYetScheduledSum > 0
                      ? category.leftToEndOfYear - category.thisYearYetScheduledSum
                      : null
                  "
                  :total="category.thisYearBudget"
                  :budget="dataBudget"
                ></value-bar>
              </v-flex>
            </template>
          </v-layout>
        </v-expand-transition>
      </v-layout>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { BudgetCategoryBalance } from '@/typings/BudgetCategoryBalance';
import { Budget } from '@/typings/Budget';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';

@Component({
  components: {
    'v-animated-number': () => import('@/components/AnimatedNumber.vue'),
    'value-bar': () => import('./ValueBar.vue'),
  },
})
export default class LargeCategoriesSummary extends Vue {
  @Prop(Boolean) readonly loading?: boolean;
  @Prop(Array) readonly dataBalance?: BudgetCategoryBalance[];
  @Prop(Object) readonly dataBudget?: Budget;

  mdiChevronDown = mdiChevronDown;
  mdiChevronUp = mdiChevronUp;

  collapsed = false;

  get budgetCategories(): BudgetCategory[] {
    return this.dataBudget ? this.dataBudget.budgetCategories : [];
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  findCategoryById(budgetCategoryId: number) {
    return this.budgetCategories.find(v => v.budgetCategoryId == budgetCategoryId);
  }
}
</script>
