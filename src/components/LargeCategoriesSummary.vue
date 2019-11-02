<template>
  <v-container class="elevation-1 white">
    <v-layout row wrap justify-center>
      <v-flex v-if="$vuetify.breakpoint.smAndUp" xs3 style="min-height: 18px">
        <v-progress-linear class="py-0 my-0" v-show="loading" indeterminate color="primary"></v-progress-linear>
      </v-flex>
      <v-flex
        v-if="$vuetify.breakpoint.smAndUp"
        class="text-xs-center"
        xs3
      >{{$t("categories.currentBalance")}}</v-flex>
      <v-flex
        v-if="$vuetify.breakpoint.smAndUp"
        class="text-xs-center"
        xs3
      >{{$t("categories.spendingThisMonth")}}</v-flex>
      <v-flex
        v-if="$vuetify.breakpoint.smAndUp"
        class="text-xs-center"
        xs3
      >{{$t("categories.yearBalance")}}</v-flex>

      <template v-for="(category, index) in dataBalance">
        <v-flex :key="index+'_divider'" v-if="$vuetify.breakpoint.xsOnly && index > 0" xs12>
          <v-divider></v-divider>
        </v-flex>

        <v-flex :key="index+'_cat'" class="text-xs-left" xs12 sm3>
          <v-avatar slot="activator" size="28px" color="amber">
            <v-icon
              color="white"
              small
            >{{$categoryIcons[findCategoryById(category.budgetCategoryId).icon]}}</v-icon>
          </v-avatar>
          <span class="px-2 caption">{{findCategoryById(category.budgetCategoryId).name}}</span>
        </v-flex>

        <v-flex
          :key="index+'_balanceCaption'"
          class="text-xs-center caption"
          xs6
          v-if="$vuetify.breakpoint.xsOnly"
        >{{$t("categories.currentBalance")}}</v-flex>
        <v-flex :key="index+'_balance'" sm3 xs6>
          <div class="text-xs-center caption" v-if="category.budgetSoFar != 0">
            <v-animated-number
              :value="category.overallBudgetBalance"
              :formatValue="formatAmount"
              :duration="300"
            />
            <span v-if="category.thisMonthYetScheduledSum > 0" class="grey--text font-italic">
              (
              <v-animated-number
                :value="category.overallBudgetBalance-category.thisMonthYetScheduledSum"
                :formatValue="formatAmount"
                :duration="300"
              />)
            </span>
          </div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-progress-linear
                class="ma-0"
                :height="category.thisMonthYetScheduledSum > 0 ? 9 : 15"
                v-if="category.budgetSoFar != 0"
                :value="100*category.overallBudgetBalance/category.thisMonthBudget"
                :color="conditionalColor(100*category.overallBudgetBalance/category.thisMonthBudget)"
              ></v-progress-linear>
            </template>
            <span>
              {{ category.overallBudgetBalance/category.thisMonthBudget | percentage }}
              <span
                v-if="category.thisYearYetScheduledSum > 0"
              >({{$t('transactionSchedules.inclScheduled')}}: {{ (category.overallBudgetBalance-category.thisMonthYetScheduledSum)/category.thisMonthBudget | percentage }})</span>
            </span>
          </v-tooltip>
          <v-progress-linear
            class="ma-0"
            :height="6"
            v-if="category.budgetSoFar != 0 && category.thisMonthYetScheduledSum > 0"
            :value="100*(category.overallBudgetBalance-category.thisMonthYetScheduledSum)/category.thisMonthBudget"
            :color="conditionalColor(100*(category.overallBudgetBalance-category.thisMonthYetScheduledSum)/category.thisMonthBudget)"
          ></v-progress-linear>
        </v-flex>

        <v-flex
          :key="index+'_monthCaption'"
          class="text-xs-center caption"
          xs6
          v-if="$vuetify.breakpoint.xsOnly"
        >{{$t("categories.spendingThisMonth")}}</v-flex>
        <v-flex :key="index+'_month'" sm3 xs6>
          <div class="text-xs-center caption">
            <v-animated-number
              :value="category.thisMonthTransactionsSum"
              :formatValue="formatAmount"
              :duration="300"
            />
            <span v-if="category.thisMonthYetScheduledSum > 0" class="grey--text font-italic">
              (
              <v-animated-number
                :value="category.thisMonthYetScheduledSum"
                :formatValue="formatAmount"
                :duration="300"
              />)
            </span>
          </div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-progress-linear
                class="ma-0"
                :height="category.thisMonthYetScheduledSum > 0 ? 9 : 15"
                v-if="category.thisMonthBudget != 0"
                :value="100*category.thisMonthTransactionsSum/category.thisMonthBudget"
                :color="conditionalColor(100*(1-category.thisMonthTransactionsSum/category.thisMonthBudget))"
              ></v-progress-linear>
            </template>
            <span>
              {{ category.thisMonthTransactionsSum/category.thisMonthBudget | percentage }}
              <span
                v-if="category.thisMonthYetScheduledSum > 0"
              >({{$t('transactionSchedules.inclScheduled')}}: {{ (category.thisMonthTransactionsSum+category.thisMonthYetScheduledSum)/category.thisMonthBudget | percentage }})</span>
            </span>
          </v-tooltip>
          <v-progress-linear
            class="ma-0"
            :height="6"
            v-if="category.budgetSoFar != 0 && category.thisMonthYetScheduledSum > 0"
            :value="100*(category.thisMonthTransactionsSum+category.thisMonthYetScheduledSum)/category.thisMonthBudget"
            :color="conditionalColor(100*(1-(category.thisMonthTransactionsSum+category.thisMonthYetScheduledSum)/category.thisMonthBudget))"
          ></v-progress-linear>
        </v-flex>

        <v-flex
          :key="index+'_yearCaption'"
          class="text-xs-center caption"
          xs6
          v-if="$vuetify.breakpoint.xsOnly"
        >{{$t("categories.yearBalance")}}</v-flex>
        <v-flex :key="index+'_year'" sm3 xs6>
          <div v-if="category.thisYearBudget != 0" class="text-xs-center caption">
            <v-animated-number
              :value="category.leftToEndOfYear"
              :formatValue="formatAmount"
              :duration="300"
            />
            <span v-if="category.thisYearYetScheduledSum > 0" class="grey--text font-italic">
              (
              <v-animated-number
                :value="category.leftToEndOfYear-category.thisYearYetScheduledSum"
                :formatValue="formatAmount"
                :duration="300"
              />)
            </span>
          </div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-progress-linear
                class="ma-0"
                v-if="category.thisYearBudget != 0"
                :height="category.thisYearYetScheduledSum > 0 ? 9 : 15"
                :value="100*category.leftToEndOfYear/category.thisYearBudget"
                :color="conditionalColor(100*category.leftToEndOfYear/category.thisYearBudget)"
              ></v-progress-linear>
            </template>
            <span>
              {{ category.leftToEndOfYear/category.thisYearBudget | percentage }}
              <span
                v-if="category.thisYearYetScheduledSum > 0"
              >({{$t('transactionSchedules.inclScheduled')}}: {{ (category.leftToEndOfYear-category.thisYearYetScheduledSum)/category.thisYearBudget | percentage }})</span>
            </span>
          </v-tooltip>

          <v-progress-linear
            class="ma-0"
            :height="6"
            v-if="category.budgetSoFar != 0 && category.thisYearYetScheduledSum > 0"
            :value="100*(category.leftToEndOfYear-category.thisYearYetScheduledSum)/category.thisYearBudget"
            :color="conditionalColor(100*(category.leftToEndOfYear-category.thisYearYetScheduledSum)/category.thisYearBudget)"
          ></v-progress-linear>
        </v-flex>
      </template>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { BudgetCategory } from "../typings/BudgetCategory";
import { BudgetCategoryBalance } from "../typings/BudgetCategoryBalance";
import { Budget } from "../typings/Budget";

@Component({
  components: {
    "v-animated-number": () => import("../components/AnimatedNumber.vue")
  }
})
export default class LargeCategoriesSummary extends Vue {
  @Prop(Boolean) readonly loading: boolean;
  @Prop(Array) readonly dataBalance: BudgetCategoryBalance[];
  @Prop(Object) readonly dataBudget: Budget;

  get budgetCategories() { return this.dataBudget.budgetCategories}

  conditionalColor(percentValue: number): string {
    if (percentValue > 90) {
      return "green darken-3";
    } else if (percentValue > 60) {
      return "light-green darken-1";
    } else if (percentValue > 30) {
      return "yellow darken-1";
    } else if (percentValue >= -1) {
      return "orange lighten-1";
    } else if (percentValue < -1) {
      return "deep-orange darken-4";
    }
  }

  formatAmount(value) {
    return this.$options.filters.currency(
      value,
      this.$currencyConfig(this.dataBudget)
    )
  }

  findCategoryById(budgetCategoryId: number) {
    return this.budgetCategories.find(
      v => v.budgetCategoryId == budgetCategoryId
    );
  }
}
</script>
