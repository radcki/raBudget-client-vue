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
                            <v-radio color="primary" off-icon="radio_button_unchecked" on-icon="radio_button_checked" :label="$t('general.spendings')" value="spendingCategories"></v-radio>
                            <v-radio color="primary" off-icon="radio_button_unchecked" on-icon="radio_button_checked" :label="$t('general.incomes')" value="incomeCategories"></v-radio>
                            <v-radio color="primary" off-icon="radio_button_unchecked" on-icon="radio_button_checked" :label="$t('general.savings')" value="savingCategories"></v-radio>
                          </v-radio-group>
                        </v-flex>
                        <v-flex xs6 v-if="budget">
                          <v-category-select 
                            multiple
                            :items="budget[categoryType]" 
                            v-if="budget[categoryType]"                            
                            v-model="selectedCategories"
                            :rules="requiredRule"
                            persistent-hint
                            :hint="$t('general.category')"></v-category-select>                            
                        </v-flex>
                        
                      </v-layout>
                    </v-container>
                  </v-flex>

                  <v-flex xs12 md6 v-if="budget">
                    <v-date-range-slider                      
                      :min="$moment(budget.startingDate).format('YYYY-MM-DD')"
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

      categoryType: "spendingCategories",
      selectedRange: [null, null],
      selectedCategories: null,

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
    ...mapState({
      budgets: state => state.budgets.budgets
    }),
    budget() {
      return this.budgets.filter(v=>v.id == this.$route.params.id)[0]
    },
    currencies: function() {
      return Object.keys(this.$currencies);
    },
    today: function() {
      return this.$moment().format("YYYY-MM-DD");
    },
    monthAgoOrStart(){ 
      return this.$moment().subtract(1, 'month') < this.$moment(this.budget.startingDate) 
          ? this.$moment(this.budget.startingDate).format('YYYY-MM-DD')
          : this.$moment().subtract(1, 'month').format('YYYY-MM-DD')
    }    
  },
  created: function(){           
    if (this.budget){
      this.selectedCategories = this.budget[this.categoryType];
      this.selectedRange = [this.monthAgoOrStart, this.today] 
      this.fetchTransactions();  
    }     
  },
  watch: {    
    budget: function(budget) {
        this.selectedRange = [this.monthAgoOrStart, this.today]
        
        if (this.budget && this.budget[this.categoryType]){
          this.selectedCategories = this.budget[this.categoryType];
        }
        this.fetchTransactions();      
    },
    categoryType: function(value) {
      this.transactions = null;
      if (this.budget && this.budget[value]){
        this.selectedCategories = this.budget[value];
      }
      
      this.fetchTransactions();
    }
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success"
    }),
    fetchTransactions() {
      this.loading = true;
      transactionsService
        .listTransactions(
          this.$route.params.id,
          null,
          this.selectedRange[0],
          this.selectedRange[1],
          this.selectedCategories
        )
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.loading = false;
              this.transactions = {
                spendingCategories: data.spendings,
                savingCategories: data.savings,
                incomeCategories: data.incomes,
              };
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