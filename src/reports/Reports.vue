<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-subheader class="headline">{{ $t('reports.reports') }}</v-subheader>
      </v-flex>

      <v-flex xs12>
        <v-card v-if="budget && budget.startingDate" class="px-3">
          <v-card-text>
            <v-date-range-slider
              v-model="selectedRange"
              :min="budget.startingDate"
              :max="thisMonth"
              chips
              step="month"
            ></v-date-range-slider>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="loadPeriodReport">{{ $t('general.refresh') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex xs12>
        <v-chip
          color="primary"
          :text-color="mode == eReportMode.Period ? 'white' : ''"
          :outlined="mode != eReportMode.Period"
          @click="mode = eReportMode.Period"
          >{{ $t('reports.periodSummary') }}</v-chip
        >
        <v-chip
          color="primary"
          :text-color="mode == eReportMode.Monthly ? 'white' : ''"
          :outlined="mode != eReportMode.Monthly"
          @click="mode = eReportMode.Monthly"
          >{{ $t('reports.monthByMonth') }}</v-chip
        >
      </v-flex>
      <v-flex xs12 d-flex style="min-height: 500px;">
        <v-card class="px-3">
          <div class="pt-3 progress-wrapper">
            <v-progress-linear
              v-if="loading"
              indeterminate
              class="pa-0 ma-0"
              height="5"
            ></v-progress-linear>
          </div>

          <v-card-text :class="$vuetify.breakpoint.smAndUp ? '' : 'pa-0'">
            <v-container fluid grid-list-sm class="pa-0">
              <v-layout row wrap class="pa-0">
                <v-flex xs12>
                  <v-select
                    v-model="categoryType"
                    :label="$t('categories.categoryType')"
                    :items="categoryTypes"
                  >
                    <template slot="selection" slot-scope="{ item }">{{ $t(item.text) }}</template>
                    <template slot="item" slot-scope="{ item }">{{ $t(item.text) }}</template>
                  </v-select>
                </v-flex>
                <v-slide-x-transition>
                  <v-flex v-if="mode == eReportMode.Period" xs12>
                    <v-data-table
                      v-if="periodReport && $vuetify.breakpoint.smAndUp"
                      class
                      :headers="headers"
                      hide-default-footer
                      disable-pagination
                      item-key="budgetCategoryId"
                      :items="periodReport"
                    >
                      <template v-slot:body="{ items }">
                        <tbody>
                          <tr v-for="item in items" :key="item.budgetCategoryId">
                            <td class="py-1">
                              <v-avatar
                                size="28px"
                                :color="
                                  categoryType == eCategoryType.Spending
                                    ? 'amber'
                                    : categoryType == eCategoryType.Income
                                    ? 'indigo'
                                    : ''
                                "
                              >
                                <v-icon color="white" small>
                                  {{ $categoryIcons[findCategoryById(item.budgetCategoryId).icon] }}
                                </v-icon>
                              </v-avatar>
                              <span class="px-2 caption">
                                {{ findCategoryById(item.budgetCategoryId).name }}
                              </span>
                            </td>
                            <td class="py-1">
                              {{ item.reportData.budgetAmount | currency($currencyConfig(budget)) }}
                              <v-tooltip bottom>
                                <template v-slot:activator="{}">
                                  <v-progress-linear
                                    v-if="item.reportData.budgetAmount != 0"
                                    class="ma-0"
                                    :height="10"
                                    :value="
                                      (100 * item.reportData.budgetAmount) /
                                        periodTotals.budgetAmount
                                    "
                                  ></v-progress-linear>
                                </template>
                                <span>
                                  {{
                                    (item.reportData.budgetAmount / periodTotals.budgetAmount)
                                      | percentage
                                  }}
                                </span>
                              </v-tooltip>
                            </td>
                            <td class="py-1">
                              {{
                                item.reportData.transactionsSum | currency($currencyConfig(budget))
                              }}
                              <v-tooltip bottom>
                                <template v-slot:activator="{}">
                                  <v-progress-linear
                                    v-if="item.reportData.transactionsSum != 0"
                                    class="ma-0"
                                    color="amber"
                                    :height="10"
                                    :value="
                                      (100 * item.reportData.transactionsSum) /
                                        periodTotals.transactionsSum
                                    "
                                  ></v-progress-linear>
                                </template>
                                <span>
                                  {{
                                    (item.reportData.transactionsSum /
                                      periodTotals.transactionsSum)
                                      | percentage
                                  }}
                                </span>
                              </v-tooltip>
                            </td>
                            <td v-if="categoryType == eCategoryType.Spending" class="py-1">
                              {{
                                item.reportData.allocationsSum | currency($currencyConfig(budget))
                              }}
                              <v-tooltip bottom>
                                <template v-slot:activator="{}">
                                  <v-progress-linear
                                    v-if="item.reportData.allocationsSum != 0"
                                    class="ma-0"
                                    color="purple"
                                    :height="10"
                                    :value="
                                      (100 * item.reportData.allocationsSum) /
                                        periodTotals.allocationsSum
                                    "
                                  ></v-progress-linear>
                                </template>
                                <span>
                                  {{
                                    (item.reportData.allocationsSum / periodTotals.allocationsSum)
                                      | percentage
                                  }}
                                </span>
                              </v-tooltip>
                            </td>
                            <td class="py-1">
                              {{
                                item.reportData.averagePerDay | currency($currencyConfig(budget))
                              }}
                              <v-tooltip bottom>
                                <template v-slot:activator="{}">
                                  <v-progress-linear
                                    v-if="item.reportData.averagePerDay != 0"
                                    class="ma-0"
                                    color="green"
                                    :height="10"
                                    :value="
                                      (100 * item.reportData.averagePerDay) /
                                        periodTotals.averagePerDay
                                    "
                                  ></v-progress-linear>
                                </template>
                                <span>
                                  {{
                                    (item.reportData.averagePerDay / periodTotals.averagePerDay)
                                      | percentage
                                  }}
                                </span>
                              </v-tooltip>
                            </td>
                            <td class="py-1">
                              {{
                                item.reportData.averagePerMonth | currency($currencyConfig(budget))
                              }}
                              <v-tooltip bottom>
                                <template v-slot:activator="{}">
                                  <v-progress-linear
                                    v-if="item.reportData.averagePerMonth != 0"
                                    class="ma-0"
                                    color="blue"
                                    :height="10"
                                    :value="
                                      (100 * item.reportData.averagePerMonth) /
                                        periodTotals.averagePerMonth
                                    "
                                  ></v-progress-linear>
                                </template>
                                <span>
                                  {{
                                    (item.reportData.averagePerMonth /
                                      periodTotals.averagePerMonth)
                                      | percentage
                                  }}
                                </span>
                              </v-tooltip>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td class="text-xs-right">
                              <strong>{{ $t('general.sum') }}</strong>
                            </td>
                            <td class="py-1">
                              {{ periodTotals.budgetAmount | currency($currencyConfig(budget)) }}
                            </td>
                            <td class="py-1">
                              {{ periodTotals.transactionsSum | currency($currencyConfig(budget)) }}
                            </td>
                            <td v-if="categoryType == eCategoryType.Spending" class="py-1">
                              {{ periodTotals.allocationsSum | currency($currencyConfig(budget)) }}
                            </td>
                            <td class="py-1">
                              {{ periodTotals.averagePerDay | currency($currencyConfig(budget)) }}
                            </td>
                            <td class="py-1">
                              {{ periodTotals.averagePerMonth | currency($currencyConfig(budget)) }}
                            </td>
                          </tr>
                        </tfoot>
                      </template>
                    </v-data-table>

                    <v-container v-if="periodReport && $vuetify.breakpoint.xsOnly">
                      <v-layout row wrap justify-center>
                        <template v-for="(data, index) in periodReport">
                          <v-flex v-if="index > 0" :key="index + '_divider'" xs12>
                            <v-divider></v-divider>
                          </v-flex>
                          <v-flex :key="index + '_cat'" class="text-xs-left" xs12 sm2>
                            <v-avatar
                              size="28px"
                              :color="
                                categoryType == 'spendingCategories'
                                  ? 'amber'
                                  : categoryType == 'incomeCategories'
                                  ? 'indigo'
                                  : ''
                              "
                            >
                              <v-icon color="white" small>
                                {{ $categoryIcons[data.category.icon] }}
                              </v-icon>
                            </v-avatar>
                            <span class="px-2 caption">{{ data.category.name }}</span>
                          </v-flex>

                          <v-flex
                            :key="index + '_budgetedCaption'"
                            class="text-xs-center body-2"
                            xs6
                            >{{ $t('reports.budgetSum') }}</v-flex
                          >
                          <v-flex :key="index + '_budgeted'" sm2 xs6>
                            <div class="text-xs-center caption">
                              {{ data.budgetAmount | currency($currencyConfig(budget)) }}
                            </div>
                          </v-flex>

                          <v-flex
                            :key="index + '_transactionsCaption'"
                            class="text-xs-center body-2"
                            xs6
                            >{{ $t('reports.transactionsSum') }}</v-flex
                          >
                          <v-flex :key="index + '_transactions'" sm2 xs6>
                            <div class="text-xs-center caption">
                              {{ data.transactionsSum | currency($currencyConfig(budget)) }}
                            </div>
                          </v-flex>

                          <v-flex
                            :key="index + '_allocationsCaption'"
                            class="text-xs-center body-2"
                            xs6
                            >{{ $t('reports.allocationsSum') }}</v-flex
                          >
                          <v-flex :key="index + '_allocations'" sm2 xs6>
                            <div class="text-xs-center caption">
                              {{ data.allocationsSum | currency($currencyConfig(budget)) }}
                            </div>
                          </v-flex>

                          <v-flex
                            :key="index + '_perDayCaption'"
                            class="text-xs-center body-2"
                            xs6
                            >{{ $t('reports.averagePerDay') }}</v-flex
                          >
                          <v-flex :key="index + '_perDay'" sm2 xs6>
                            <div class="text-xs-center caption">
                              {{ data.averagePerDay | currency($currencyConfig(budget)) }}
                            </div>
                          </v-flex>

                          <v-flex
                            :key="index + '_perMonthCaption'"
                            class="text-xs-center body-2"
                            xs6
                            >{{ $t('reports.averagePerMonth') }}</v-flex
                          >
                          <v-flex :key="index + '_perMonth'" sm2 xs6>
                            <div class="text-xs-center caption">
                              {{ data.averagePerMonth | currency($currencyConfig(budget)) }}
                            </div>
                          </v-flex>
                        </template>

                        <v-flex xs12>
                          <v-divider></v-divider>
                        </v-flex>
                        <v-flex class="text-xs-left" xs12 sm2>
                          <v-avatar slot="activator" size="28px" color="grey darken-1"></v-avatar>
                          <span class="px-2 caption">{{ $t('general.sum') }}</span>
                        </v-flex>

                        <v-flex class="text-xs-center body-2" xs6>
                          {{ $t('reports.budgetSum') }}
                        </v-flex>
                        <v-flex sm2 xs6>
                          <div class="text-xs-center caption">
                            {{ periodTotals.budgetAmount | currency($currencyConfig(budget)) }}
                          </div>
                        </v-flex>

                        <v-flex class="text-xs-center body-2" xs6>
                          {{ $t('reports.transactionsSum') }}
                        </v-flex>
                        <v-flex sm2 xs6>
                          <div class="text-xs-center caption">
                            {{ periodTotals.transactionsSum | currency($currencyConfig(budget)) }}
                          </div>
                        </v-flex>

                        <v-flex class="text-xs-center body-2" xs6>
                          {{ $t('reports.allocationsSum') }}
                        </v-flex>
                        <v-flex sm2 xs6>
                          <div class="text-xs-center caption">
                            {{ periodTotals.allocationsSum | currency($currencyConfig(budget)) }}
                          </div>
                        </v-flex>

                        <v-flex class="text-xs-center body-2" xs6>
                          {{ $t('reports.averagePerDay') }}
                        </v-flex>
                        <v-flex sm2 xs6>
                          <div class="text-xs-center caption">
                            {{ periodTotals.averagePerDay | currency($currencyConfig(budget)) }}
                          </div>
                        </v-flex>

                        <v-flex class="text-xs-center body-2" xs6>
                          {{ $t('reports.averagePerMonth') }}
                        </v-flex>
                        <v-flex sm2 xs6>
                          <div class="text-xs-center caption">
                            {{ periodTotals.averagePerMonth | currency($currencyConfig(budget)) }}
                          </div>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>
                </v-slide-x-transition>

                <v-slide-x-transition>
                  <v-flex v-if="mode == eReportMode.Monthly" xs12>
                    <v-container class="pa-0">
                      <v-layout row wrap justify-center class="pa-0">
                        <v-flex xs12 md3>
                          <v-list dense>
                            <v-subheader>Rodzaj danych</v-subheader>
                            <v-list-item
                              :class="
                                chartDataType == eChartType.transactionsSum ? 'primary--text' : ''
                              "
                              @click="chartDataType = eChartType.transactionsSum"
                            >
                              <v-list-item-title>
                                {{ $t('reports.transactionsSum') }}
                              </v-list-item-title>
                              <v-list-item-action>
                                <v-icon>{{ mdiChevronRight }}</v-icon>
                              </v-list-item-action>
                            </v-list-item>
                            <v-list-item
                              v-if="categoryType == eCategoryType.Spending"
                              :class="
                                chartDataType == eChartType.allocationsSum ? 'primary--text' : ''
                              "
                              @click="chartDataType = eChartType.allocationsSum"
                            >
                              <v-list-item-title>
                                {{ $t('reports.allocationsSum') }}
                              </v-list-item-title>
                              <v-list-item-action>
                                <v-icon>{{ mdiChevronRight }}</v-icon>
                              </v-list-item-action>
                            </v-list-item>
                            <v-list-item
                              :class="
                                chartDataType == eChartType.averagePerDay ? 'primary--text' : ''
                              "
                              @click="chartDataType = eChartType.averagePerDay"
                            >
                              <v-list-item-title>
                                {{ $t('reports.averagePerDay') }}
                              </v-list-item-title>
                              <v-list-item-action>
                                <v-icon>{{ mdiChevronRight }}</v-icon>
                              </v-list-item-action>
                            </v-list-item>
                          </v-list>
                        </v-flex>
                        <v-flex xs12 md9 class="py-3">
                          <v-category-select
                            v-if="budget"
                            v-model="selectedCategories"
                            multiple
                            :items="budget.budgetCategories.filter(v => v.type == categoryType)"
                            :label="$t('categories.budgetCategories')"
                          ></v-category-select>

                          <template v-if="selectedCategories.length > 0 && chartData">
                            <GChart
                              :settings="{ packages: ['line'] }"
                              :style="
                                $vuetify.breakpoint.xsOnly
                                  ? 'min-height: 200px'
                                  : 'min-height:400px'
                              "
                              :data="chartData"
                              :options="chartOptions"
                              :create-chart="(el, google) => new google.charts.Line(el)"
                            />
                          </template>
                          <span v-else class="subheading">{{ $t('reports.selectCategory') }}</span>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>
                </v-slide-x-transition>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<style scoped lang="css">
table.v-table tbody td,
table.v-table tbody th {
  height: 19px;
}
.progress-wrapper {
  min-height: 20px;
  height: 20px;
}
</style>
<script lang="ts">
import { budgetService } from '../_services/budget.service';
import { debounce } from 'debounce';
import { GChart } from 'vue-google-charts';
import { mdiChevronRight } from '@mdi/js';

import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { format, endOfMonth, startOfMonth } from 'date-fns';
import { eCategoryType } from '../typings/enums/eCategoryType';
import { BudgetCategory } from '../typings/BudgetCategory';
import { Budget } from '../typings/Budget';
import { ErrorMessage } from '../typings/TypedResponse';
import { BudgetCategoryMonthlyReport } from '../typings/MonthlyBudgetReport';
import { BudgetCategoryPeriodReport } from '../typings/PeriodBudgetReport';

const alertModule = namespace('alert');
const budgetsModule = namespace('budgets');

enum eChartType {
  averagePerDay,
  transactionsSum,
  allocationsSum,
}

enum eReportMode {
  Period,
  Monthly,
}

@Component({
  components: {
    GChart,
    'v-date-range-slider': () => import('../components/DateRangeSlider.vue'),
    'v-category-select': () => import('../components/CategorySelect.vue'),
  },
})
export default class Reports extends Vue {
  selectedCategories: BudgetCategory[] = [];
  selectedRange: (Date | null)[] = [null, null];

  periodData: {
    [eCategoryType.Spending]: BudgetCategoryPeriodReport[];
    [eCategoryType.Saving]: BudgetCategoryPeriodReport[];
    [eCategoryType.Income]: BudgetCategoryPeriodReport[];
  } = {
    [eCategoryType.Spending]: [],
    [eCategoryType.Saving]: [],
    [eCategoryType.Income]: [],
  };

  monthlyData: {
    [eCategoryType.Spending]: BudgetCategoryMonthlyReport[];
    [eCategoryType.Saving]: BudgetCategoryMonthlyReport[];
    [eCategoryType.Income]: BudgetCategoryMonthlyReport[];
  } = {
    [eCategoryType.Spending]: [],
    [eCategoryType.Saving]: [],
    [eCategoryType.Income]: [],
  };

  mode: eReportMode = eReportMode.Period;
  chartDataType: eChartType = eChartType.averagePerDay;
  chartOptions = {
    legend: { position: 'none' },
  };

  categoryTypes = [
    { text: 'general.spendings', value: eCategoryType.Spending },
    { text: 'general.incomes', value: eCategoryType.Income },
    { text: 'general.savings', value: eCategoryType.Saving },
  ];

  categoryType: eCategoryType = eCategoryType.Spending;
  eReportMode = eReportMode;
  eCategoryType = eCategoryType;
  eChartType = eChartType;

  mdiChevronRight = mdiChevronRight;
  format = format;
  debouncedLoadPeriodReport: (() => void) | null = null;
  debouncedLoadMonthlyReport: (() => void) | null = null;

  @budgetsModule.Getter('budget') budget?: Budget;
  @budgetsModule.Action('activeBudgetChange') activeBudgetChange;
  @alertModule.Action('error') dispatchError;
  @alertModule.Action('success') dispatchSuccess;

  get periodReport() {
    return this.periodData[this.categoryType];
  }

  get thisMonth() {
    return startOfMonth(new Date());
  }

  get monthlyReport() {
    const type = this.categoryType;
    return this.monthlyData[type];
  }

  get headers() {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars */
    const locale = this.$i18n.locale; /* reload binding */
    const categoryName = this.$t('categories.name');
    const budgetSum = this.$t('reports.budgetSum');
    const transactionsSum = this.$t('reports.transactionsSum');
    const allocationsSum = this.$t('reports.allocationsSum');
    const averagePerDay = this.$t('reports.averagePerDay');
    const averagePerMonth = this.$t('reports.averagePerMonth');
    let headers = [
      {
        text: categoryName,
        align: 'left',
        sortable: true,
        value: 'category.name',
      },
      {
        text: budgetSum,
        align: 'left',
        sortable: true,
        value: 'budgetAmount',
      },
      {
        text: transactionsSum,
        align: 'left',
        sortable: true,
        value: 'transactionsSum',
      },
      {
        text: allocationsSum,
        align: 'left',
        sortable: true,
        value: 'allocationsSum',
      },
      {
        text: averagePerDay,
        align: 'left',
        sortable: true,
        value: 'averagePerDay',
      },
      {
        text: averagePerMonth,
        align: 'left',
        sortable: true,
        value: 'averagePerMonth',
      },
    ];
    if (this.categoryType != eCategoryType.Spending) {
      headers = headers.filter(v => v.value != 'allocationsSum');
    }
    return headers;
  }

  get periodTotals() {
    const data = {
      budgetAmount: 0,
      transactionsSum: 0,
      allocationsSum: 0,
      averagePerDay: 0,
      averagePerMonth: 0,
    };
    for (let i = 0, n = this.periodData[this.categoryType].length; i < n; i++) {
      const cat = this.periodData[this.categoryType][i].reportData;
      data.budgetAmount += cat.budgetedSum;
      data.transactionsSum += cat.transactionsSum;
      data.allocationsSum += cat.allocationsSum;
      data.averagePerDay += cat.averagePerDay;
      data.averagePerMonth += cat.averagePerMonth;
    }
    return data;
  }
  get chartData() {
    if (!this.monthlyReport) {
      return null;
    }
    const categoryCount = this.monthlyReport.length;
    const monthCount = this.monthlyReport[0].monthlyReports.length;
    const header = [''];
    for (let i = 0; i < categoryCount; i++) {
      if (
        this.selectedCategories.filter(v => {
          return v.budgetCategoryId == this.monthlyReport[i].budgetCategoryId;
        }).length > 0 &&
        this.findCategoryById
      ) {
        header.push(this.findCategoryById(this.monthlyReport[i].budgetCategoryId).name);
      }
    }
    const data = [header];
    for (let i = 0; i < monthCount; i++) {
      const month =
        this.monthlyReport[0].monthlyReports[i].month.year +
        '-' +
        this.monthlyReport[0].monthlyReports[i].month.monthNumber;
      const row = [month];
      for (let n = 0; n < categoryCount; n++) {
        if (
          this.selectedCategories.filter(v => {
            return v.budgetCategoryId == this.monthlyReport[n].budgetCategoryId;
          }).length > 0
        ) {
          row.push(
            this.monthlyReport[n].monthlyReports[i].reportData[eChartType[this.chartDataType]],
          );
        }
      }
      data.push(row);
    }
    return data;
  }

  get loading() {
    return (
      this.$wait.is('loading.budget') ||
      this.$wait.is('loading.periodReport') ||
      this.$wait.is('loading.monthlyReport')
    );
  }

  created() {
    this.debouncedLoadPeriodReport = debounce(this.loadPeriodReport, 800);
    this.debouncedLoadMonthlyReport = debounce(this.loadMonthlyReport, 800);
    this.activeBudgetChange(this.$route.params.id);
    if (this.budget) {
      this.selectedRange = [startOfMonth(this.budget.startingDate), startOfMonth(new Date())];
    }
  }

  @budgetsModule.Getter('budgetCategoryById')
  findCategoryById?: (budgetCategoryId: number) => BudgetCategory;

  @Watch('selectedRange')
  OnSelectedRangeChange() {
    if (this.debouncedLoadPeriodReport) this.debouncedLoadPeriodReport();
    if (this.debouncedLoadMonthlyReport) this.debouncedLoadMonthlyReport();
  }

  @Watch('budget')
  OnBudgetChange(budget) {
    if (!budget) {
      return;
    }
    this.selectedRange = [startOfMonth(budget.startingDate), startOfMonth(new Date())];
    if (this.mode == eReportMode.Period) {
      this.loadPeriodReport();
    } else {
      this.loadMonthlyReport();
    }
  }

  @Watch('categoryType')
  OnCategoryTypeChange(type) {
    this.selectedCategories = [];

    if (this.chartDataType == eChartType.allocationsSum && type != eCategoryType.Spending) {
      this.chartDataType = eChartType.transactionsSum;
    }
  }

  loadPeriodReport() {
    this.$wait.start('loading.periodReport');
    const startingDate = this.selectedRange[0];
    const endDate = endOfMonth(new Date(this.selectedRange[1] || new Date()));
    if (!this.budget) return;
    budgetService
      .getPeriodReport(this.budget.budgetId, startingDate, format(endDate, 'yyyy-MM-dd'))
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.$wait.end('loading.periodReport');
            this.periodData[eCategoryType.Spending] = data.budgetCategoryReports.filter(v =>
              this.findCategoryById
                ? this.findCategoryById(v.budgetCategoryId).type
                : 0 == eCategoryType.Spending,
            );
            this.periodData[eCategoryType.Saving] = data.budgetCategoryReports.filter(v =>
              this.findCategoryById
                ? this.findCategoryById(v.budgetCategoryId).type
                : 0 == eCategoryType.Saving,
            );
            this.periodData[eCategoryType.Income] = data.budgetCategoryReports.filter(v =>
              this.findCategoryById
                ? this.findCategoryById(v.budgetCategoryId).type
                : 0 == eCategoryType.Income,
            );
          });
        } else {
          response.json<ErrorMessage>().then(data => {
            this.$wait.end('loading.periodReport');
            this.dispatchError(data.message);
          });
        }
      });
  }

  loadMonthlyReport() {
    this.$wait.start('loading.monthlyReport');
    const startingDate = this.selectedRange[0];
    const endDate = endOfMonth(new Date(this.selectedRange[1] || new Date()));
    if (!this.budget) {
      return;
    }
    budgetService
      .getMonthlyReport(this.budget.budgetId, startingDate, format(endDate, 'yyyy-MM-dd'))
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.$wait.end('loading.monthlyReport');
            this.monthlyData[eCategoryType.Spending] = data.budgetCategoryReports.filter(v =>
              this.findCategoryById
                ? this.findCategoryById(v.budgetCategoryId).type
                : 0 == eCategoryType.Spending,
            );
            this.monthlyData[eCategoryType.Saving] = data.budgetCategoryReports.filter(v =>
              this.findCategoryById
                ? this.findCategoryById(v.budgetCategoryId).type
                : 0 == eCategoryType.Saving,
            );
            this.monthlyData[eCategoryType.Income] = data.budgetCategoryReports.filter(v =>
              this.findCategoryById
                ? this.findCategoryById(v.budgetCategoryId).type
                : 0 == eCategoryType.Income,
            );
          });
        } else {
          response.json<ErrorMessage>().then(data => {
            this.$wait.end('loading.monthlyReport');
            this.dispatchError(data.message);
          });
        }
      });
  }
}
</script>
