<template>
<v-container grid-list-md>     
    <v-layout row wrap>

      <v-flex xs12>
         <v-subheader class="headline">
            {{$t('reports.reports')}}
        </v-subheader>  
      </v-flex>

       <v-flex xs12>
        <v-card class="px-3">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
                <v-layout row wrap> 
                  <v-flex xs4 md2 class="text-xs-center">
                    <v-chip small :color="period == 'full'? 'primary' : 'grey'" @click="period = 'full'" text-color="white">{{ $t("reports.periodFull") }}</v-chip><br/>
                    <v-chip small :color="period == '6m'? 'primary' : 'grey'" @click="period = '6m'" text-color="white">{{ $t("reports.period6m") }}</v-chip><br/>
                    <v-chip small :color="period == '1m'? 'primary' : 'grey'" @click="period = '1m'" text-color="white">{{ $t("reports.period1m") }}</v-chip><br/>
                  </v-flex>
                  <v-flex xs12 md6>
                    <v-container fluid grid-list-sm class="pa-0">
                      <v-layout row wrap > 
                        
                        <v-flex xs6 style="width: 120px">
                          <v-menu
                            ref="dateMenuStart"
                            :close-on-content-click="false"
                            v-model="dateMenuStart"
                            :nudge-right="40"
                            :return-value.sync="filters.startDate"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            min-width="290px"
                          >
                            <v-text-field
                              slot="activator"
                              v-model="filters.startDate"
                              :label="$t('general.fromDate')"
                              hide-details
                              readonly
                            ></v-text-field>
                            <v-date-picker 
                              :min="budget.startDate"
                              :max="today"
                              type="month"
                              :locale="locale"
                              v-model="filters.startDate" 
                              @input="$refs.dateMenuStart.save(filters.startDate)"></v-date-picker>

                          </v-menu>
                        </v-flex>

                        <v-flex xs6 style="width: 120px" >
                          <v-menu
                            ref="dateMenuEnd"
                            :close-on-content-click="false"
                            v-model="dateMenuEnd"                      
                            :nudge-right="40"
                            :return-value.sync="filters.endDate"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            min-width="290px"
                          >
                            <v-text-field
                              slot="activator"
                              v-model="filters.endDate"
                              :label="$t('general.fromDate')"
                              hide-details
                              readonly
                            ></v-text-field>
                            <v-date-picker 
                              :min="budget.startDate"
                              :max="today" 
                              type="month"
                              :locale="locale"
                              v-model="filters.endDate" 
                              @input="$refs.dateMenuEnd.save(filters.endDate)"></v-date-picker>

                          </v-menu>
                        </v-flex>
                        <v-flex xs12>
                          <v-range-slider
                            v-model="sliderValue"
                            :max="sliderMax"
                            :min="0"
                            :step="1"
                          ></v-range-slider>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>
                  <v-flex xs12 md4 v-if="$vuetify.breakpoint.smAndUp" class="text-xs-right" align-self-end>
                    <v-btn color="primary" @click="loadPeriodReport">{{ $t('general.refresh') }}</v-btn>
                  </v-flex>
                </v-layout>
            </v-container>
          </v-card-text>  
          <v-card-actions v-if="$vuetify.breakpoint.xsOnly">
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
          
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
                <v-layout row wrap class="pa-0">
                    <v-flex xs12>
                      <v-select :label="$t('categories.categoryType')" :items="categoryTypes" v-model="categoryType">
                        <template slot="selection" slot-scope="{ item, index }">
                            {{ $t(item.text) }}
                        </template>
                        <template slot="item" slot-scope="{ item, index }">
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
                                :value="100*props.item.budgetAmount/spendingTotals.budgetAmount"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.budgetAmount/spendingTotals.budgetAmount | percentage }}</span>
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
                                :value="100*props.item.transactionsSum/spendingTotals.transactionsSum"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.transactionsSum/spendingTotals.transactionsSum | percentage }}</span>
                            </v-tooltip>
                          </td>
                          <td class="py-1">
                            {{props.item.allocationsSum | currency($currencies[budget.currency])}}
                            <v-tooltip bottom>
                              <v-progress-linear
                                class="ma-0"
                                color="purple"
                                slot="activator"
                                :height="10"
                                v-if="props.item.allocationsSum != 0"
                                :value="100*props.item.allocationsSum/spendingTotals.allocationsSum"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.allocationsSum/spendingTotals.allocationsSum | percentage }}</span>
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
                                :value="100*props.item.averagePerDay/spendingTotals.averagePerDay"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.averagePerDay/spendingTotals.averagePerDay | percentage }}</span>
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
                                :value="100*props.item.averagePerMonth/spendingTotals.averagePerMonth"
                              >                
                              </v-progress-linear>
                              <span>{{ props.item.averagePerMonth/spendingTotals.averagePerMonth | percentage }}</span>
                            </v-tooltip>
                          </td>
                        </template>

                        <template slot="footer">
                          <td class="text-xs-right"><strong>{{ $t("general.sum") }}</strong></td>
                          <td class="py-1">{{spendingTotals.budgetAmount | currency($currencies[budget.currency])}}</td>
                          <td class="py-1">{{spendingTotals.transactionsSum | currency($currencies[budget.currency])}}</td>
                          <td class="py-1">{{spendingTotals.allocationsSum | currency($currencies[budget.currency])}}</td>
                          <td class="py-1">{{spendingTotals.averagePerDay | currency($currencies[budget.currency])}}</td>
                          <td class="py-1">{{spendingTotals.averagePerMonth | currency($currencies[budget.currency])}}</td>
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
                              <v-list-tile @click="chartDataType = 'allocationsSum'" :class="chartDataType == 'allocationsSum' ? 'primary--text':''">
                                <v-list-tile-title>{{ $t("reports.allocationsSum") }}</v-list-tile-title>
                                <v-list-tile-action>
                                  <v-icon>keyboard_arrow_right</v-icon>
                                </v-list-tile-action>
                              </v-list-tile>
                              <v-list-tile @click="chartDataType = 'averagePerDay'" :class="chartDataType == 'averagePerDay' ? 'primary--text':''">
                                <v-list-tile-title>{{ $t("reports.averagePerMonth") }}</v-list-tile-title>
                                <v-list-tile-action>
                                  <v-icon>keyboard_arrow_right</v-icon>
                                </v-list-tile-action>
                              </v-list-tile>

                            </v-list>
                          </v-flex>
                          <v-flex xs12 md9 class="pa-3">
                            <v-select
                              v-model="selectedCategories"
                              :items="categories[categoryType]"
                              chips deletable-chips small-chips
                              return-object item-text="name"
                              :label="$t('categories.budgetCategories')"
                              multiple                  
                            ></v-select>               
                            <template v-if="selectedCategories.length > 0 && chartData">
                              <GChart                  
                                :settings="{packages: ['line']}"
                                style="min-height:400px;"
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
<style scoped>
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
    "transaction-editor": () => import("../components/TransactionEditor")
  },
  data() {
    return {
      budgetLoading: false,
      periodLoading: false,
      monthlyLoading: false,

      dateMenuStart: false,
      dateMenuEnd: false,

      budget: {
        name: null,
        startDate: null,
        currency: null,
        balance: null
      },
      filters: {
        startDate: null,
        endDate: null,
        categories: null
      },
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

      categories: {
        spendings: null,
        savings: null,
        incomes: null
      },
      selectedCategories: [],

      period: "full",
      sliderValue: [null, null],
      sliderMax: null,
      mode: "period",
      chartDataType: "averagePerDay",
      chartOptions: {
        legend: { position: "none" }
      },

      categoryTypes: [
        { text: "general.spendings", value: "spendingCategories" },
        { text: "general.incomes", value: "incomeCategories" }
      ],
      categoryType: "spendingCategories",

      headers: [
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
    };
  },
  computed: {
    loading: function() {
      return this.budgetLoading || this.periodLoading || this.monthlyLoading;
    },
    currencies: function() {
      return Object.keys(this.$currencies);
    },
    today: function() {
      return this.$moment().format("YYYY-MM-DD");
    },
    budgetId: function() {
      return this.$route.params.id;
    },
    locale: function() {
      return this.$i18n.locale;
    },
    periodReport: function() {
      var type = this.categoryType;
      return this.periodData[type];
    },
    monthlyReport: function() {
      var type = this.categoryType;
      return this.monthlyData[type];
    },
    spendingTotals: function() {
      var data = {
        budgetAmount: 0,
        transactionsSum: 0,
        allocationsSum: 0,
        averagePerDay: 0,
        averagePerMonth: 0
      };
      for (var i = 0, n = this.periodReport.length; i < n; i++) {
        var cat = this.periodReport[i];
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
  mounted: function() {
    this.debouncedLoadPeriodReport = debounce(this.loadPeriodReport, 800);
    this.debouncedLoadMonthlyReport = debounce(this.loadMonthlyReport, 800);
    this.loadBudget(this.$route.params.id);
  },
  watch: {
    $route(to, from) {
      this.loadBudget(this.$route.params.id);
    },
    categoryType: function(type) {
      this.selectedCategories = [];
    },
    "budget.startDate": function(date) {
      if (date != null) {
        this.sliderMax = this.$moment().diff(this.$moment(date), "months");
        var monthsSinceStart = this.monthsSinceStart(
          this.$moment().format("YYYY-MM")
        );
        this.sliderValue[1] = monthsSinceStart;
        this.sliderValue[0] = 0;
        this.refreshFields();
      }
    },
    "sliderValue.0": function(minDays) {
      this.refreshFields();
    },
    "sliderValue.1": function(maxDays) {
      this.refreshFields();
    },
    "filters.startDate": function(value) {
      this.checkPeriod();
      this.refreshSlider();
    },
    "filters.endDate": function(value) {
      this.checkPeriod();
      this.refreshSlider();
    },
    period: function(value) {
      if (value == "full") {
        this.filters.startDate = this.$moment(this.budget.startDate).format(
          "YYYY-MM"
        );
        this.filters.endDate = this.$moment().format("YYYY-MM");
      }
      if (value == "6m") {
        this.filters.startDate = this.$moment()
          .subtract(6, "month")
          .format("YYYY-MM");
        this.filters.endDate = this.$moment().format("YYYY-MM");
      }
      if (value == "1m") {
        this.filters.startDate = this.$moment()
          .subtract(1, "month")
          .format("YYYY-MM");
        this.filters.endDate = this.$moment().format("YYYY-MM");
      }
    }
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success"
    }),
    checkPeriod: function() {
      if (!this.$moment(this.filters.endDate).isSame(this.$moment(), "month")) {
        this.period = null;
        return;
      }
      if (
        this.$moment(this.filters.startDate).isSame(
          this.$moment(this.budget.startDate),
          "month"
        )
      ) {
        this.period = "full";
        return;
      }
      if (
        this.$moment(this.filters.startDate).isSame(
          this.$moment().subtract(6, "month"),
          "month"
        )
      ) {
        this.period = "6m";
        return;
      }
      if (
        this.$moment(this.filters.startDate).isSame(
          this.$moment().subtract(1, "month"),
          "month"
        )
      ) {
        this.period = "1m";
        return;
      }
      this.period = null;
    },
    monthsSinceStart(date) {
      return this.$moment(date).diff(
        this.$moment(this.budget.startDate),
        "months"
      );
    },
    refreshSlider() {
      this.sliderValue = [
        this.monthsSinceStart(this.filters.startDate),
        this.monthsSinceStart(this.filters.endDate)
      ];
    },
    refreshFields() {
      this.filters.startDate = this.$moment(this.budget.startDate)
        .add(this.sliderValue[0], "month")
        .format("YYYY-MM");
      this.filters.endDate = this.$moment(this.budget.startDate)
        .add(this.sliderValue[1], "month")
        .format("YYYY-MM");
      this.debouncedLoadPeriodReport();
      this.debouncedLoadMonthlyReport();
    },
    loadBudget(id) {
      this.budgetLoading = true;
      budgetService.getBudget(id).then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.budgetLoading = false;
            this.budget.startDate = data.startingDate;
            this.budget.currency = data.currency;
            this.categories = {
              spendingCategories: data.spendingCategories,
              savingCategories: data.savingCategories,
              incomeCategories: data.incomeCategories
            };
          });
        } else {
          reponse.json().then(data => {
            this.budgetLoading = false;
            this.dispatchError(data.message);
          });
        }
      });
    },
    loadPeriodReport: function() {
      this.periodLoading = true;
      var startDate = this.filters.startDate + "-01";
      var endDate = this.$moment(this.filters.endDate + "-01").endOf("month");
      budgetService
        .getPeriodReport(this.budgetId, startDate, endDate.format("YYYY-MM-DD"))
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
      var startDate = this.filters.startDate + "-01";
      var endDate = this.$moment(this.filters.endDate + "-01").endOf("month");
      budgetService
        .getMonthlyReport(
          this.budgetId,
          startDate,
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