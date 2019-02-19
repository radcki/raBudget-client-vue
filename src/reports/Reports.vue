<template>
<v-container grid-list-md>     
    <v-layout row wrap>

      <v-flex xs12>
         <v-subheader class="headline">
            {{$t('reports.reports')}}
        </v-subheader>  
      </v-flex>

       <v-flex xs12>
        <v-card class="px-3" v-if="budget && budget.startingDate">
          <v-card-text>
            <v-date-range-slider                      
                :min="$moment(budget.startingDate).format('YYYY-MM')"
                :max="thisMonth"
                chips
                v-model="selectedRange"
                step="months"></v-date-range-slider>
          </v-card-text>  
          <v-card-actions >
            <v-spacer>              
            </v-spacer>
            <v-btn color="primary" @click="loadPeriodReport">{{ $t('general.refresh') }}</v-btn>
          </v-card-actions>
        </v-card> 
      </v-flex>

      <v-flex xs12>
        <v-chip color="primary" :text-color="mode == 'period' ? 'white':''" :outline="mode != 'period'" @click="mode = 'period'">
          {{ $t("reports.periodSummary") }}
        </v-chip>
        <v-chip color="primary" :text-color="mode == 'monthly' ? 'white':''" :outline="mode != 'monthly'" @click="mode = 'monthly'">
          {{ $t("reports.monthByMonth") }}
        </v-chip>
        
      </v-flex>   
      <v-flex xs12 d-flex style="min-height: 500px;">
        
        <v-card class="px-3">
          <div class="pt-3 progress-wrapper">
            <v-progress-linear indeterminate v-if="loading" class="pa-0 ma-0" height="5"></v-progress-linear>
          </div>
          
          <v-card-text :class="$vuetify.breakpoint.smAndUp ? '' : 'pa-0'">
            <v-container fluid grid-list-sm class="pa-0">
                <v-layout row wrap class="pa-0">
                    <v-flex xs12>
                      <v-select :label="$t('categories.categoryType')" :items="categoryTypes" v-model="categoryType">
                        <template slot="selection" slot-scope="{ item  }">
                            {{ $t(item.text) }}
                        </template>
                        <template slot="item" slot-scope="{ item }">
                            {{ $t(item.text) }}
                        </template>
                      </v-select>
                    </v-flex>
                  <v-slide-x-transition>        
                    
                    <v-flex xs12 v-if="mode == 'period'">
                      <v-data-table
                        v-if="periodReport && $vuetify.breakpoint.smAndUp"
                        class=""
                        :headers="headers"
                        hide-actions
                        :items="periodReport"
                      >
                        <template slot="headerCell" slot-scope="props">
                          {{$t(props.header.text)}}
                        </template>
                              
                        <template slot="items" slot-scope="props">
                          <td class="py-1">
                            <v-avatar size="28px" :color="categoryType == 'spendingCategories' ? 'amber' : categoryType == 'incomeCategories' ? 'indigo' : ''">              
                              <v-icon color="white" small>{{props.item.category.icon}}</v-icon>
                            </v-avatar>
                            <span class="px-2 caption">{{props.item.category.name}}</span>
                          </td>
                          <td class="py-1">
                            {{props.item.budgetAmount | currency($currencies[budget.currency])}}
                            <v-tooltip bottom>
                              <v-progress-linear
                              class="ma-0"
                                slot="activator"
                                :height="10"
                                v-if="props.item.budgetAmount != 0"
                                :value="100*props.item.budgetAmount/periodTotals.budgetAmount"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.budgetAmount/periodTotals.budgetAmount | percentage }}</span>
                            </v-tooltip>
                          </td>
                          <td class="py-1">
                            {{props.item.transactionsSum | currency($currencies[budget.currency])}}
                            <v-tooltip bottom>
                              <v-progress-linear
                                class="ma-0"
                                color="amber"
                                slot="activator"
                                :height="10"
                                v-if="props.item.transactionsSum != 0"
                                :value="100*props.item.transactionsSum/periodTotals.transactionsSum"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.transactionsSum/periodTotals.transactionsSum | percentage }}</span>
                            </v-tooltip>
                          </td>
                          <td class="py-1" v-if="categoryType=='spendingCategories'">
                            {{props.item.allocationsSum | currency($currencies[budget.currency])}}
                            <v-tooltip bottom>
                              <v-progress-linear
                                class="ma-0"
                                color="purple"
                                slot="activator"
                                :height="10"
                                v-if="props.item.allocationsSum != 0"
                                :value="100*props.item.allocationsSum/periodTotals.allocationsSum"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.allocationsSum/periodTotals.allocationsSum | percentage }}</span>
                            </v-tooltip>
                          </td>
                          <td class="py-1">
                            {{props.item.averagePerDay | currency($currencies[budget.currency])}}
                            <v-tooltip bottom>
                              <v-progress-linear
                                class="ma-0"
                                color="green"
                                slot="activator"
                                :height="10"
                                v-if="props.item.averagePerDay != 0"
                                :value="100*props.item.averagePerDay/periodTotals.averagePerDay"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.averagePerDay/periodTotals.averagePerDay | percentage }}</span>
                            </v-tooltip>
                          </td>
                          <td class="py-1">
                            {{props.item.averagePerMonth | currency($currencies[budget.currency])}}
                            <v-tooltip bottom>
                              <v-progress-linear
                                class="ma-0"
                                color="blue"
                                slot="activator"
                                :height="10"
                                v-if="props.item.averagePerMonth != 0"
                                :value="100*props.item.averagePerMonth/periodTotals.averagePerMonth"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.averagePerMonth/periodTotals.averagePerMonth | percentage }}</span>
                            </v-tooltip>
                          </td>
                        </template>

                        <template slot="footer">
                          <td class="text-xs-right"><strong>{{ $t("general.sum") }}</strong></td>
                          <td class="py-1">{{periodTotals.budgetAmount | currency($currencies[budget.currency])}}</td>
                          <td class="py-1">{{periodTotals.transactionsSum | currency($currencies[budget.currency])}}</td>
                          <td class="py-1" v-if="categoryType=='spendingCategories'">{{periodTotals.allocationsSum | currency($currencies[budget.currency])}}</td>
                          <td class="py-1">{{periodTotals.averagePerDay | currency($currencies[budget.currency])}}</td>
                          <td class="py-1">{{periodTotals.averagePerMonth | currency($currencies[budget.currency])}}</td>
                      </template>
                      </v-data-table>


                      <v-container v-if="periodReport && $vuetify.breakpoint.xsOnly">     
                        <v-layout row wrap justify-center>           

                          <template v-for="(data, index) in periodReport">             
                            <v-flex :key="index+'_divider'" v-if="index > 0" xs12>
                              <v-divider></v-divider>
                            </v-flex>
                            <v-flex :key="index+'_cat'" class='text-xs-left' xs12 sm2>
                              <v-avatar slot="activator" size="28px" :color="categoryType == 'spendingCategories' ? 'amber' : categoryType == 'incomeCategories' ? 'indigo' : ''">              
                                <v-icon color="white" small>{{data.category.icon}}</v-icon>
                              </v-avatar>
                              <span class="px-2 caption">{{data.category.name}}</span>
                            </v-flex>

                            <v-flex :key="index+'_budgetedCaption'" class='text-xs-center body-2' xs6>
                              {{ $t("reports.budgetSum") }}
                            </v-flex>
                            <v-flex :key="index+'_budgeted'" sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{data.budgetAmount | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>

                            <v-flex :key="index+'_transactionsCaption'" class='text-xs-center body-2' xs6>
                              {{ $t("reports.transactionsSum") }}
                            </v-flex>
                            <v-flex :key="index+'_transactions'" sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{data.transactionsSum | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>

                            <v-flex :key="index+'_allocationsCaption'" class='text-xs-center body-2' xs6>
                              {{ $t("reports.allocationsSum") }}
                            </v-flex>
                            <v-flex :key="index+'_allocations'" sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{data.allocationsSum | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>

                            <v-flex :key="index+'_perDayCaption'" class='text-xs-center body-2' xs6>
                              {{ $t("reports.averagePerDay") }}
                            </v-flex>
                            <v-flex :key="index+'_perDay'" sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{data.averagePerDay | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>

                            <v-flex :key="index+'_perMonthCaption'" class='text-xs-center body-2' xs6>
                              {{ $t("reports.averagePerMonth") }}
                            </v-flex>
                            <v-flex :key="index+'_perMonth'" sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{data.averagePerMonth | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>
                          </template>
                    
                          
                          <v-flex xs12>
                              <v-divider></v-divider>
                            </v-flex>
                            <v-flex  class='text-xs-left' xs12 sm2>
                              <v-avatar slot="activator" size="28px" color="grey darken-1">   
                              </v-avatar>
                              <span class="px-2 caption">{{$t("general.sum")}}</span>
                            </v-flex>

                            <v-flex class='text-xs-center body-2' xs6>
                              {{ $t("reports.budgetSum") }}
                            </v-flex>
                            <v-flex sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{periodTotals.budgetAmount | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>

                            <v-flex class='text-xs-center body-2' xs6>
                              {{ $t("reports.transactionsSum") }}
                            </v-flex>
                            <v-flex sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{periodTotals.transactionsSum | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>

                            <v-flex class='text-xs-center body-2' xs6>
                              {{ $t("reports.allocationsSum") }}
                            </v-flex>
                            <v-flex sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{periodTotals.allocationsSum | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>

                            <v-flex class='text-xs-center body-2' xs6>
                              {{ $t("reports.averagePerDay") }}
                            </v-flex>
                            <v-flex sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{periodTotals.averagePerDay | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>

                            <v-flex class='text-xs-center body-2' xs6>
                              {{ $t("reports.averagePerMonth") }}
                            </v-flex>
                            <v-flex sm2 xs6 >
                                <div class="text-xs-center caption">
                                  {{periodTotals.averagePerMonth | currency($currencies[budget.currency])}}
                                </div>
                            </v-flex>

                        </v-layout>
                      </v-container>
                    </v-flex>
                  </v-slide-x-transition>

                  <v-slide-x-transition>
                    <v-flex xs12 v-if="mode == 'monthly'">
                      <v-container class="pa-0">     
                        <v-layout row wrap justify-center class="pa-0">    
                          <v-flex xs12 md3>
                            <v-list dense>
                              <v-subheader>Rodzaj danych</v-subheader>
                              <v-list-tile @click="chartDataType = 'transactionsSum'" :class="chartDataType == 'transactionsSum' ? 'primary--text':''">
                                <v-list-tile-title>{{ $t("reports.transactionsSum") }}</v-list-tile-title>
                                <v-list-tile-action>
                                  <v-icon>keyboard_arrow_right</v-icon>
                                </v-list-tile-action>
                              </v-list-tile>
                              <v-list-tile v-if="categoryType=='spendingCategories'" @click="chartDataType = 'allocationsSum'" :class="chartDataType == 'allocationsSum' ? 'primary--text':''">
                                <v-list-tile-title>{{ $t("reports.allocationsSum") }}</v-list-tile-title>
                                <v-list-tile-action>
                                  <v-icon>keyboard_arrow_right</v-icon>
                                </v-list-tile-action>
                              </v-list-tile>
                              <v-list-tile @click="chartDataType = 'averagePerDay'" :class="chartDataType == 'averagePerDay' ? 'primary--text':''">
                                <v-list-tile-title>{{ $t("reports.averagePerDay") }}</v-list-tile-title>
                                <v-list-tile-action>
                                  <v-icon>keyboard_arrow_right</v-icon>
                                </v-list-tile-action>
                              </v-list-tile>

                            </v-list>
                          </v-flex>
                          <v-flex xs12 md9 class="py-3">
                            <v-category-select 
                              multiple
                              :items="budget[categoryType]" 
                              v-if="budget"                            
                              v-model="selectedCategories"
                              :label="$t('categories.budgetCategories')"></v-category-select>  
            
                            <template v-if="selectedCategories.length > 0 && chartData">
                              <GChart                  
                                :settings="{packages: ['line']}"
                                :style="$vuetify.breakpoint.xsOnly ? 'min-height: 200px': 'min-height:400px'"
                                :data="chartData"
                                :options="chartOptions"
                                :createChart="(el, google) => new google.charts.Line(el)"
                              />
                            </template>
                            <span v-else class="subheading">{{ $t("reports.selectCategory") }}</span>
                            
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
<script>
import { transactionsService } from "../_services/transactions.service";
import { budgetService } from "../_services/budget.service";
import { mapState, mapActions } from "vuex";
import { debounce } from "debounce";
import { GChart } from "vue-google-charts";

export default {
  components: {
    GChart,
    "transaction-editor": () => import("../components/TransactionEditor"),
    "v-date-range-slider": () => import("../components/DateRangeSlider"),
    "v-category-select": () => import("../components/CategorySelect"),
  },
  data() {
    return {
      budgetLoading: false,
      periodLoading: false,
      monthlyLoading: false,

      periodData: {
        spendingCategories: null,
        savingCategories: null,
        incomeCategories: null
      },

      monthlyData: {
        spendingCategories: null,
        savingCategories: null,
        incomeCategories: null
      },

      selectedCategories: [],
      selectedRange: [null, null],

      mode: "period",
      chartDataType: "averagePerDay",
      chartOptions: {
        legend: { position: "none" }
      },

      categoryTypes: [
        { text: "general.spendings", value: "spendingCategories" },
        { text: "general.incomes", value: "incomeCategories" },
        { text: "general.savings", value: "savingCategories" }
      ],
      categoryType: "spendingCategories",      
    };
  },
  computed: {
    ...mapState({
      budgets: state => state.budgets.budgets
    }),
    budget() {
      return this.budgets.filter(v=>v.id == this.$route.params.id)[0]
    },
    loading: function() {
      return this.budgetLoading || this.periodLoading || this.monthlyLoading;
    },
    currencies: function() {
      return Object.keys(this.$currencies);
    },
    thisMonth: function() {
      return this.$moment().format("YYYY-MM");
    },
    locale: function() {
      return this.$i18n.locale;
    },
    periodReport: function() { return this.periodData[this.categoryType] },
    monthlyReport: function() {
      var type = this.categoryType;
      return this.monthlyData[type];
    },
    headers: function() {
      var headers = [
        {
          text: "categories.name",
          align: "left",
          sortable: true,
          value: "category.name"
        },
        {
          text: "reports.budgetSum",
          align: "left",
          sortable: true,
          value: "budgetAmount"
        },
        {
          text: "reports.transactionsSum",
          align: "left",
          sortable: true,
          value: "transactionsSum"
        },
        {
          text: "reports.allocationsSum",
          align: "left",
          sortable: true,
          value: "allocationsSum"
        },
        {
          text: "reports.averagePerDay",
          align: "left",
          sortable: true,
          value: "averagePerDay"
        },
        {
          text: "reports.averagePerMonth",
          align: "left",
          sortable: true,
          value: "averagePerMonth"
        }
      ]
      if (this.categoryType !="spendingCategories") {
        headers = headers.filter(v=>v.value != 'allocationsSum')
      }
      return headers
    },
    periodTotals: function() {
      var data = {
        budgetAmount: 0,
        transactionsSum: 0,
        allocationsSum: 0,
        averagePerDay: 0,
        averagePerMonth: 0
      };
      for (var i = 0, n = this.periodData[this.categoryType].length; i < n; i++) {
        var cat = this.periodData[this.categoryType][i];
        data.budgetAmount += cat.budgetAmount;
        data.transactionsSum += cat.transactionsSum;
        data.allocationsSum += cat.allocationsSum;
        data.averagePerDay += cat.averagePerDay;
        data.averagePerMonth += cat.averagePerMonth;
      }
      return data;
    },
    chartData: function() {
      if (!this.monthlyReport) {
        return null;
      }
      var categoryCount = this.monthlyReport.length;
      var monthCount = this.monthlyReport[0].data.length;
      var header = [""];
      for (var i = 0; i < categoryCount; i++) {
        if (
          this.selectedCategories.filter(function(v) {
            return v.categoryId == this.monthlyReport[i].category.categoryId;
          }, this).length > 0
        ) {
          header.push(this.monthlyReport[i].category.name);
        }
      }
      var data = [header];
      for (var i = 0; i < monthCount; i++) {
        var month =
          this.monthlyReport[0].data[i].year +
          "-" +
          this.monthlyReport[0].data[i].month;
        var row = [month];
        for (var n = 0; n < categoryCount; n++) {
          if (
            this.selectedCategories.filter(function(v) {
              return v.categoryId == this.monthlyReport[n].category.categoryId;
            }, this).length > 0
          ) {
            row.push(this.monthlyReport[n].data[i][this.chartDataType]);
          }
        }
        data.push(row);
      }
      return data;
    }
  },
  created: function() {
    this.debouncedLoadPeriodReport = debounce(this.loadPeriodReport, 800);
    this.debouncedLoadMonthlyReport = debounce(this.loadMonthlyReport, 800);
    if (this.budget){
      this.selectedRange = [this.$moment(this.budget.startingDate).format("YYYY-MM"), this.$moment().format("YYYY-MM")]
    }
  },
  watch: {
    categoryType: function(type) {
      this.selectedCategories = [];

      if (this.chartDataType == "allocationsSum" && type != "spendingCategories"){
        this.chartDataType = "transactionsSum"
      }
    },
    budget: function(budget) {
      if (!budget){
        return;
      }
      this.selectedRange = [this.$moment(budget.startingDate).format("YYYY-MM"), this.$moment().format("YYYY-MM")]
      if (this.mode = 'period'){
        this.loadPeriodReport();
      } else {
        this.loadMonthlyReport();
      }
    },
    selectedRange(){
      this.debouncedLoadPeriodReport();
      this.debouncedLoadMonthlyReport()
    }
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success"
    }),
    loadPeriodReport: function() {
      this.periodLoading = true;
      var startingDate = this.selectedRange[0] + "-01";
      var endDate = this.$moment(this.selectedRange[1] + "-01").endOf("month");
      budgetService
        .getPeriodReport(this.budget.id, startingDate, endDate.format("YYYY-MM-DD"))
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.periodLoading = false;
              this.periodData.spendingCategories = data.spending;
              this.periodData.savingCategories = data.saving;
              this.periodData.incomeCategories = data.income;
            });
          } else {
            response.json().then(data => {
              this.periodLoading = false;
              this.dispatchError(data.message);
            });
          }
        });
    },
    loadMonthlyReport: function() {
      this.monthlyLoading = true;
      var startingDate = this.selectedRange[0] + "-01";
      var endDate = this.$moment(this.selectedRange[1] + "-01").endOf("month");
      budgetService
        .getMonthlyReport(
          this.budget.id,
          startingDate,
          endDate.format("YYYY-MM-DD")
        )
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.monthlyLoading = false;
              this.monthlyData.spendingCategories = data.spending;
              this.monthlyData.savingCategories = data.saving;
              this.monthlyData.incomeCategories = data.income;
            });
          } else {
            response.json().then(data => {
              this.monthlyLoading = false;
              this.dispatchError(data.message);
            });
          }
        });
    }
  }
};
</script>