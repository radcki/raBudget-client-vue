<template>
<v-container grid-list-md>     
    <v-layout row wrap>

      <v-flex xs12>
         <v-subheader class="headline">
            {{$t('transactions.recentTransactions')}}
        </v-subheader>  
      </v-flex>

      <v-flex xs12>
        <v-card class="px-3">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
                <v-layout row wrap> 
                  <v-flex xs12 md6>
                    <v-container fluid grid-list-sm class="pa-0">
                      <v-layout row wrap> 
                        <v-flex xs6>
                          <v-radio-group light v-model="categoryType" :mandatory="true" column>
                            <v-radio color="primary" off-icon="radio_button_unchecked" on-icon="radio_button_checked" :label="$t('general.spendings')" value="spendings"></v-radio>
                            <v-radio color="primary" off-icon="radio_button_unchecked" on-icon="radio_button_checked" :label="$t('general.incomes')" value="incomes"></v-radio>
                            <v-radio color="primary" off-icon="radio_button_unchecked" on-icon="radio_button_checked" :label="$t('general.savings')" value="savings"></v-radio>
                          </v-radio-group>
                        </v-flex>
                        <v-flex xs6>
                          <v-category-select 
                            multiple
                            :items="categories[categoryType]" 
                            v-if="categories[categoryType]"                            
                            v-model="filters.categories"
                            :rules="requiredRule"
                            persistent-hint
                            :hint="$t('general.category')"></v-category-select>                            
                        </v-flex>
                        
                      </v-layout>
                    </v-container>
                  </v-flex>

                  <v-flex xs12 md6 v-if="budget.startDate">
                    <v-date-range-slider                      
                      :min="$moment(budget.startDate).format('YYYY-MM-DD')"
                      :max="today"
                      v-model="selectedRange"
                      step="days"></v-date-range-slider>                    
                  </v-flex>

                </v-layout>
            </v-container>
          </v-card-text>  
          <v-card-actions>
            <v-spacer>              
            </v-spacer>
            <v-btn color="primary" @click="fetchTransactions()">{{ $t('general.search') }}</v-btn>
          </v-card-actions>
        </v-card> 
      </v-flex>

       <v-flex xs12 v-if="transactions || loading">
         <v-subheader class="headline">
            {{$t('general.foundData')}}
        </v-subheader>
      </v-flex>

      <v-flex xs12 v-if="loading" class="text-xs-center">
        <v-progress-circular
          :size="70"
          :width="7"
          color="amber darken-3"
          indeterminate
        ></v-progress-circular>
      </v-flex>

      <v-flex xs12 v-if="error" class="text-xs-center">
        <v-icon color="red" size="80">error</v-icon>
      </v-flex>


      <v-flex xs12 class="elevation-1 white" v-if="transactions">
        <v-layout row justify-end>
          <v-flex xs4>
            <v-text-field
              v-if="$vuetify.breakpoint.smAndUp"
              v-model="search"
              append-icon="search"               
              :label="$t('general.search')"
              single-line 
              hide-details></v-text-field>
          </v-flex>
        </v-layout>
        
        <v-data-table
          v-if="$vuetify.breakpoint.smAndUp"
          :headers="headers"
          :items="transactions[categoryType]"
          :loading="loading"
          :search="search"
          must-sort
          
          disable-initial-sort
          :rows-per-page-items="[15,25,50,{text: $t('general.all'), value: -1}]"
        >
          <template slot="items" slot-scope="props">
            <td>
              <v-icon class="px-2">{{ props.item.category.icon }}</v-icon>
              {{ props.item.category.name }}
            </td>
            <td>{{ props.item.date | moment("dddd, D.MM.YYYY") }}</td>
            <td>{{ props.item.description }}</td>
            <td>{{ props.item.amount | currency($currencies[budget.currency]) }}</td>
            <td>            
              <v-icon color="primary" @click="editTransaction(props.item.transactionId)">edit</v-icon>
              <v-icon color="red darken-1" @click="deleteTransaction(props.item.transactionId)">delete</v-icon>            
            </td>
          </template>
        </v-data-table>

        <v-list  v-if="!$vuetify.breakpoint.smAndUp" dense subheader>     
        <template  v-for="(transaction, index) in transactions[categoryType]">
          <v-list-tile :key="index" avatar class="pb-1">
            <v-list-tile-avatar>
              <v-icon>{{ transaction.category.icon }}</v-icon>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title class="font-weight-medium">
                {{ transaction.description}} 
                <span class="grey--text text--lighten-1 caption">
                  - {{ transaction.date | moment("dddd, D.MM.YYYY") }}
                </span>
              </v-list-tile-title>

              <v-list-tile-sub-title class="text--primary">
                {{transaction.amount | currency($currencies[budget.currency])}}
              </v-list-tile-sub-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon @click="editTransaction(transaction.transactionId)">edit</v-icon>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-icon @click="deleteTransaction(transaction.transactionId)">delete</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </template>
        </v-list>
      </v-flex>
 
    </v-layout>
    
    <transaction-editor ref="transactionEditor"></transaction-editor>
</v-container>
</template>

<script>
import { transactionsService } from "../_services/transactions.service";
import { budgetService } from "../_services/budget.service";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    "transaction-editor": () => import("../components/TransactionEditor"),
    "v-category-select": () => import("../components/CategorySelect"),
    "v-date-range-slider": () => import("../components/DateRangeSlider"),
  },
  data() {
    return {
      loading: false,
      error: false,
      search: null,

      categoryType: "spendings",
      selectedRange: [null, null],

      budget: {
        name: null,
        startDate: null,
        currency: null,
        balance: null
      },
      filters: {
        categories: null
      },
      categories: {
        incomes: null,
        spendings: null,
        savings: null
      },
      headers: [
        {
          text: this.$t("general.category"),
          sortable: true,
          value: "category"
        },
        {
          text: this.$t("general.date"),
          sortable: true,
          value: "date"
        },
        {
          text: this.$t("general.description"),
          sortable: true,
          value: "description"
        },
        {
          text: this.$t("general.amount"),
          sortable: true,
          value: "amount"
        },
        {
          text: this.$t("general.actions"),
          sortable: false
        }
      ],

      transactions: null,
      tab: 0,
      color: [
        "amber darken-1",
        "green darken-1",
        "blue darken-1",
        "purple darken-1"
      ],
      requiredRule: [v => !!v || this.$t("forms.requiredField")]
    };
  },
  computed: {
    currencies: function() {
      return Object.keys(this.$currencies);
    },
    today: function() {
      return this.$moment().format("YYYY-MM-DD");
    },
    monthAgoOrStart(){ 
      return this.$moment().subtract(1, 'month') < this.$moment(this.budget.startDate) 
          ? this.$moment(this.budget.startDate).format('YYYY-MM-DD')
          : this.$moment().subtract(1, 'month')
    }    
  },
  mounted: function() {
    this.loadBudget(this.$route.params.id);
  },
  watch: {
    $route(to, from) {
      this.loadBudget(this.$route.params.id);
      this.fetchTransactions();
    },
    "budget.startDate": function(date) {
        this.selectedRange = [this.monthAgoOrStart, this.today]
        this.fetchTransactions();      
    },
    categoryType: function(value) {
      this.transactions = null;
      this.filters.categories = this.categories[value];
      this.fetchTransactions();
    }
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success"
    }),
    loadBudget(id) {
      budgetService.getBudget(id).then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.budget.balance = data.balance;
            this.budget.currency = data.currency;
            this.budget.startDate = data.startingDate;
            this.categories = {
              spendings: data.spendingCategories,
              savings: data.savingCategories,
              incomes: data.incomeCategories
            };
            this.filters.categories = data.spendingCategories;
          });
        } else {
          reponse.json().then(data => {
            this.dispatchError(data.message);
          });
        }
      });
    },
    fetchTransactions() {
      this.loading = true;
      transactionsService
        .listTransactions(
          this.$route.params.id,
          null,
          this.selectedRange[0],
          this.selectedRange[1],
          this.filters.categories
        )
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.loading = false;
              this.transactions = data;
            });
          } else {
            this.loading = false;
            this.error = true;
            this.transactions = null;
            response.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
    },
    editTransaction(id) {
      this.$refs.transactionEditor.open(id).then(response => {
        if (response && response.ok) {
          this.fetchTransactions();
        } else if (response) {
          response.json().then(data => {
            this.dispatchError(data.message);
          });
        }
      });
    },
    deleteTransaction(id) {
      this.$root
        .$confirm("general.remove", "transactions.deleteConfirm", {
          color: "red",
          buttons: { yes: true, no: true, cancel: false, ok: false }
        })
        .then(confirm => {
          if (confirm) {
            transactionsService.deleteTransaction(id).then(response => {
              if (response.ok) {
                this.fetchTransactions();
              } else {
                response.json().then(data => {
                  this.dispatchError(data.message);
                });
              }
            });
          }
        });
    }
  }
};
</script>