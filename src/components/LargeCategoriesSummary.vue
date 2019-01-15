<template>
  <v-container class="elevation-1 white">
    <v-layout row wrap justify-center>
      <v-flex v-if="$vuetify.breakpoint.smAndUp" xs3></v-flex>
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
      
      <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>

      <template v-else v-for="(category, index) in dataBalance">
        <v-flex :key="index+'_divider'" v-if="$vuetify.breakpoint.xsOnly && index > 0" xs12>
          <v-divider></v-divider>
        </v-flex>

        <v-flex :key="index+'_cat'" class="text-xs-left" xs12 sm3>
          <v-avatar slot="activator" size="28px" color="amber">
            <v-icon color="white" small>{{category.budgetCategory.icon}}</v-icon>
          </v-avatar>
          <span class="px-2 caption">{{category.budgetCategory.name}}</span>
        </v-flex>

        <v-flex
          :key="index+'_balanceCaption'"
          class="text-xs-center caption"
          xs6
          v-if="$vuetify.breakpoint.xsOnly"
        >{{$t("categories.currentBalance")}}</v-flex>
        <v-flex :key="index+'_balance'" sm3 xs6>
          <div
            class="text-xs-center caption"
            v-if="category.budgetSoFar != 0"
          >{{category.overallBudgetBalance | currency($currencies[dataBudget.currency])}}</div>
          <v-tooltip bottom>
            <v-progress-linear
              class="ma-0"
              slot="activator"
              :height="15"
              v-if="category.budgetSoFar != 0"
              :value="100*category.overallBudgetBalance/category.thisMonthBudget"
              :color="conditionalColor(100*category.overallBudgetBalance/category.thisMonthBudget)"
            ></v-progress-linear>
            <span>{{ category.overallBudgetBalance/category.thisMonthBudget | percentage }}</span>
          </v-tooltip>
        </v-flex>

        <v-flex
          :key="index+'_monthCaption'"
          class="text-xs-center caption"
          xs6
          v-if="$vuetify.breakpoint.xsOnly"
        >{{$t("categories.spendingThisMonth")}}</v-flex>
        <v-flex :key="index+'_month'" sm3 xs6>
          <div
            class="text-xs-center caption"
          >{{category.thisMonthTransactionsSum | currency($currencies[dataBudget.currency])}}</div>
          <v-tooltip bottom>
            <v-progress-linear
              class="ma-0"
              slot="activator"
              :height="15"
              v-if="category.thisMonthBudget != 0"
              :value="100*category.thisMonthTransactionsSum/category.thisMonthBudget"
              :color="conditionalColor(100*(1-category.thisMonthTransactionsSum/category.thisMonthBudget))"
            ></v-progress-linear>
            <span>{{ category.thisMonthTransactionsSum/category.thisMonthBudget | percentage }}</span>
          </v-tooltip>
        </v-flex>

        <v-flex
          :key="index+'_yearCaption'"
          class="text-xs-center caption"
          xs6
          v-if="$vuetify.breakpoint.xsOnly"
        >{{$t("categories.yearBalance")}}</v-flex>
        <v-flex :key="index+'_year'" sm3 xs6>
          <div
            v-if="category.thisYearBudget != 0"
            class="text-xs-center caption"
          >{{category.leftToEndOfYear | currency($currencies[dataBudget.currency])}}</div>
          <v-tooltip bottom>
            <v-progress-linear
              class="ma-0"
              v-if="category.thisYearBudget != 0"
              slot="activator"
              :height="15"
              :value="100*category.leftToEndOfYear/category.thisYearBudget"
              :color="conditionalColor(100*category.leftToEndOfYear/category.thisYearBudget)"
            ></v-progress-linear>
            <span>{{ category.leftToEndOfYear/category.thisYearBudget | percentage }}</span>
          </v-tooltip>
        </v-flex>
      </template>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  name: "VLargeCategoriesSummary",
  props: {
    loading: Boolean,
    dataBalance: Array,
    dataBudget: {
      type: Object,
      default: () => {
        return { currency: "PLN" };
      }
    }
  },
  methods: {
    conditionalColor(percentValue) {
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
  }
};
</script>
