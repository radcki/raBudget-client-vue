<template>
<v-container grid-list-md :fill-height="$wait.is('budgets')">
    <v-layout row wrap v-if="$wait.is('budgets')" align-center justify-center>
      <v-progress-circular
      :size="70"
      :width="7"
      color="grey darken-1"
      indeterminate></v-progress-circular>
      <br/>
      <v-subheader class="headline">
        {{ $t("budgets.loading") }}
      </v-subheader>
      
    </v-layout>

    <v-layout row wrap v-else>
      <v-flex d-flex xs12 md8 lg5 >        
        <v-layout row wrap align-start align-content-start>        
          <v-flex xs12 v-if="$vuetify.breakpoint.smAndUp">      
            <v-subheader class="headline">
                {{$t('transactions.newtransaction')}}
            </v-subheader>  
            <v-tabs
              next-icon="keyboard_arrow_right"
              prev-icon="keyboard_arrow_left"
              show-arrows
              slot="extension"
              v-model="tab"
              :color="color[tab]"
              grow>
              <v-tabs-slider></v-tabs-slider>
              <v-tab class="subheading white--text" ripple>
                {{ $t('general.spending') }}
              </v-tab>
              <v-tab class="subheading white--text" ripple>
                {{ $t('general.income') }}
              </v-tab>
              <v-tab class="subheading white--text" ripple>
                {{ $t('general.saving') }}
              </v-tab>
              <v-tab class="subheading white--text" ripple>
                {{ $t('general.allocation') }}
              </v-tab>
            </v-tabs>

            <v-card>
              <v-card-text>
                <v-form ref="editorForm" v-model="valid" lazy-validation>            
                <v-container  grid-list-md>     
                  <v-layout row wrap align-center justify-center>                
                    <v-flex xs5>
                      <v-menu
                        ref="dateMenu"
                        :close-on-content-click="false"
                        v-model="dateMenu"
                        :nudge-right="40"
                        :return-value.sync="editor.date"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        min-width="290px"
                      >
                        <v-text-field
                          slot="activator"
                          v-model="editor.date"
                          :label="$t('transactions.date')"
                          :rules="requiredRule"
                          prepend-icon="event"
                          readonly
                        ></v-text-field>
                        <v-date-picker v-model="editor.date" @input="$refs.dateMenu.save(editor.date)"></v-date-picker>

                      </v-menu>
                    </v-flex>
                    <v-flex xs7 v-if="budget">
                        <v-category-select 
                            :items="budget[selectedType+'Categories']"                             
                            :label="$t('general.category')"
                            :rules="requiredRule"
                            v-model="editor.category"></v-category-select>                      
                    </v-flex>

                    <v-flex xs5>
                      <v-text-field
                        v-model="editor.description"
                        :rules="requiredRule"
                        :label="$t('general.description')"></v-text-field>
                    </v-flex>

                    <v-flex xs7 v-if="tab == 3">
                      <v-category-select 
                        :items="budget[selectedType+'Categories']" 
                        v-if="budget[selectedType+'Categories']"
                        :label="$t('categories.sourceCategory')"
                        v-model="editor.sourceCategory"></v-category-select>                       
                    </v-flex>

                    <v-flex xs7>
                      <v-text-field 
                        v-model="editor.amount"
                        :rules="requiredRule"
                        :label="$t('general.amount')" type="number" step="0.01"></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :color="color[tab]" dark v-if="tab!=3" @click="createTransaction">
                  {{ $t('general.add') }}
                </v-btn>
                <v-btn :color="color[tab]" dark v-if="tab==3" @click="createAllocation">
                  {{ $t('general.add') }}
                </v-btn>
              </v-card-actions>
            </v-card>  

             
          </v-flex>

          <v-flex xs12 v-if="$vuetify.breakpoint.smAndUp">
            <v-subheader class="headline">
                {{$t('budgets.savingsStatus')}}
            </v-subheader>  
            <v-mini-categories-summary 
              color="white--text"
              background-color="blue darken-1"
              :data-balance="savingBalance" 
              :data-budget="budget"></v-mini-categories-summary>
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex d-flex xs12 md12 lg7>        
        <v-layout row wrap align-content-start>
          <v-flex xs12 class="pb-0 mb-0" v-if="$vuetify.breakpoint.smAndUp">
            <v-subheader class="headline">
              {{$t('budgets.spendingBalance')}}
            </v-subheader>
          </v-flex>
          <v-flex xs12 md6 class="pt-0">
            <v-card class="text-sm-center" color='light-green darken-1' dark>
              <v-card-title>
                {{$t('budgets.availablefunds')}}
              </v-card-title>
              <v-card-text class="display-1">
                <v-progress-circular v-if="$wait.is('budgets.loading')" indeterminate color="white"></v-progress-circular>
                <span v-else>{{budget.balance | currency($currencies[budget.currency]) }}</span>                
              </v-card-text>              
            </v-card>
          </v-flex>

          <v-flex xs12 md6 class="pt-0">
            <v-card class="text-sm-center" color='blue-grey darken-1' dark>
              <v-card-title>
                {{$t('budgets.unassignedFunds')}}            
              </v-card-title>
              <v-card-text class="display-1">
                <v-progress-circular v-if="$wait.is('unassignedFunds')" indeterminate color="white"></v-progress-circular>
                <span v-else>
                  {{ budget.unassignedFunds | currency($currencies[budget.currency]) }}
                </span>
                
              </v-card-text>
            </v-card>
          </v-flex>

          <v-flex xs12>
            <v-large-categories-summary 
              :data-balance="categoriesBalance" 
              :data-budget="budget"></v-large-categories-summary>            
          </v-flex>

        </v-layout>
      </v-flex>

      <v-flex xs12 v-if="!$vuetify.breakpoint.smAndUp">
        <v-subheader class="headline">
            {{$t('budgets.savingsStatus')}}
        </v-subheader>  
        <v-mini-categories-summary 
          color="white--text"
          background-color="blue darken-1"
          :data-balance="savingBalance" 
          :data-budget="budget"></v-mini-categories-summary>
      </v-flex>

      <v-flex xs12>
         <v-subheader class="headline">
            {{$t('transactions.recentTransactions')}}
        </v-subheader>  
      </v-flex>

      <v-flex xs12 sm6 lg4  v-if="categories.spendings">
        <v-mini-transactions-list
          :items="transactions.spendings"
          color="amber darken-1"
          :title="$t('transactions.recentSpending')"
          :data-budget="budget"
          v-on:edit="editTransaction" v-on:delete="deleteTransaction"
          ></v-mini-transactions-list>        
      </v-flex>

      <v-flex xs12 sm6 lg4 v-if="categories.incomes">
        <v-mini-transactions-list
          :items="transactions.incomes"
          color="green darken-1"
          :title="$t('transactions.recentIncome')"
          :data-budget="budget"
          v-on:edit="editTransaction" v-on:delete="deleteTransaction"
          ></v-mini-transactions-list>  
        
      </v-flex>

      <v-flex xs12 sm6 lg4 v-if="categories.savings">
        <v-mini-transactions-list
          :items="transactions.savings"
          color="blue darken-1"
          :title="$t('transactions.recentSaving')"
          :data-budget="budget"
          v-on:edit="editTransaction" v-on:delete="deleteTransaction"
          ></v-mini-transactions-list>
      </v-flex>

    </v-layout>
    <v-dialog v-if="$vuetify.breakpoint.xs" lazy fullscreen v-model="editorDialog" hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar :color="color[tab]" fixed dark tabs>
          <v-btn icon dark @click="editorDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>
            {{$t('transactions.newtransaction')}}
          </v-toolbar-title>
          <v-spacer></v-spacer>

          <v-btn dark flat v-if="tab!=3" @click="createTransaction">
            {{ $t('general.add') }}
          </v-btn>
          <v-btn dark flat v-if="tab==3" @click="createAllocation">
            {{ $t('general.add') }}
          </v-btn>
          <v-tabs
            slot="extension"
            v-model="tab"
            :color="color[tab]"
            grow>
            <v-tabs-slider></v-tabs-slider>
            <v-tab class="white--text" ripple>
              Wydatki
            </v-tab>
            <v-tab class="white--text" ripple>
              Wpływy
            </v-tab>
            <v-tab class="white--text" ripple>
              Oszczędzności
            </v-tab>
            <v-tab class="white--text" ripple>
              Alokacje
            </v-tab>
          </v-tabs> 
        </v-toolbar>
        <v-form ref="editorForm" v-model="valid" lazy-validation>           
          <v-container >     
            <v-layout row wrap align-center justify-center>
              <v-flex xs12 class="mt-5"></v-flex>
              <v-flex xs12 class="mt-5">
                <v-menu                
                  ref="dateMenu"
                  :close-on-content-click="false"
                  v-model="dateMenu"
                  :nudge-right="40"
                  :return-value.sync="editor.date"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="editor.date"
                    :label="$t('transactions.date')"
                    :rules="requiredRule"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
                  <v-date-picker v-model="editor.date" @input="$refs.dateMenu.save(editor.date)"></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs12 v-if="budget">
                <v-category-select 
                  :items="budget[selectedType+'Categories']" 
                  v-if="budget[selectedType+'Categories']"
                  :label="$t('general.category')"
                  :rules="requiredRule"
                  v-model="editor.category"></v-category-select> 
              </v-flex>               

              <v-flex xs12 v-if="tab == 3 && budget">
                <v-category-select 
                  :items="budget[selectedType+'Categories']" 
                  v-if="budget[selectedType+'Categories']"
                  :label="$t('categories.sourceCategory')"
                  v-model="editor.sourceCategory"></v-category-select>                
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="editor.description"
                  :rules="requiredRule"
                  :label="$t('general.description')"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field 
                  v-model="editor.amount"
                  :rules="requiredRule"
                  :label="$t('general.amount')" type="number" step="0.01"></v-text-field>
              </v-flex>

            </v-layout>                
          </v-container>  
          </v-form>            
      </v-card>
    </v-dialog>
    
    <v-btn v-if="$vuetify.breakpoint.xs"
      fixed dark fab bottom right color="pink" @click="editorDialog = true">
      <v-icon>add</v-icon>
    </v-btn>
    <transaction-editor ref="transactionEditor"></transaction-editor>
</v-container>
</template>

<script>
import { budgetService } from "../_services/budget.service";
import { transactionsService } from "../_services/transactions.service";
import { allocationsService } from "../_services/allocations.service";
import { mapState, mapActions } from "vuex";


export default {
  components: {
    "transaction-editor": () => import("../components/TransactionEditor"),
    "v-category-select": () => import("../components/CategorySelect"),
    "v-mini-transactions-list": () => import("../components/MinitransactionsList"),
    "v-mini-categories-summary": () => import("../components/MiniCategoriesSummary"),
    "v-large-categories-summary": () => import("../components/LargeCategoriesSummary")
  },
  data() {
    return {
      editorDialog: false,
      valid: true,
      dateMenu: false,
      categories: {
        incomes: [],
        spendings: [],
        savings: []
      },
      transactions: {
        incomes: null,
        spendings: null,
        savings: null
      },
      categoriesBalance: null,
      savingBalance: null,
      editor: {
        category: null,
        sourceCategory: null,
        date: this.getDate(),
        description: null,
        amount: null
      },
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
    currencies: function() {
      return Object.keys(this.$currencies);
    },
    selectedType: function() {
      this.editor.category = null;
      return this.tab == 0 || this.tab == 3
        ? "spending"
        : this.tab == 1
          ? "income"
          : this.tab == 2
            ? "saving"
            : "allocation";
    },
    budget() {
      return this.budgets.filter(v=>v.id == this.$route.params.id)[0]
    }
  },
  mounted: function() {
    this.refresh(this.$route.params.id);
  },
  watch: {
    $route(to, from) {
      this.clear();
      this.refresh(to.params.id);
    },
    tab: function(value) {
      this.$refs.editorForm.resetValidation();
    },
    budget: function(budget){
      this.fetchUnassignedFunds(budget);
    }
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success",
      fetchUnassignedFunds: "budgets/fetchUnassignedFunds",
      fetchBudgets: "budgets/fetchBudgets"
    }),
    refresh(id) {
      this.fetchLeatestTransactions(id);
      this.fetchSpendingCategoriesBalance(id);
      this.fetchSavingCategoriesBalance(id); 
      //this.fetchUnassignedFunds(this.budget); 
      this.fetchBudgets();    
    },
    clear() {      
      this.transactions = {
        incomes: null,
        spendings: null,
        savings: null
      };
      this.categoriesBalance = null;
    },
    
    fetchLeatestTransactions(budgetId) {
      transactionsService
        .listTransactions(budgetId, 8, null, null)
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.transactions = data;
            });
          } else {
            reponse.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
    },
    fetchSpendingCategoriesBalance(budgetId) {
      budgetService.getSpendingCategoriesBalance(budgetId).then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.categoriesBalance = data;
          });
        } else {
          response.json().then(data => {
            this.dispatchError(data.message);
          });
        }
      });
    },
    fetchSavingCategoriesBalance(budgetId) {
      budgetService.getSavingCategoriesBalance(budgetId).then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.savingBalance = data;
          });
        } else {
          response.json().then(data => {
            this.dispatchError(data.message);
          });
        }
      });
    },
    createTransaction() {
      if (this.$refs.editorForm.validate()) {
        transactionsService.createTransaction(this.editor).then(response => {
          if (response.ok) {
            this.refresh(this.$route.params.id);
            this.editorDialog = false;
            this.editor = {
              category: null,
              date: this.getDate(),
              description: null,
              amount: null
            };
            this.$refs.editorForm.resetValidation();
          } else {
            response.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
      }
    },
    createAllocation() {
      if (this.$refs.editorForm.validate()) {
        allocationsService.createAllocation(this.editor).then(response => {
          if (response.ok) {
            this.refresh(this.$route.params.id);
            this.editorDialog = false;
            this.editor = {
              category: null,
              date: this.getDate(),
              description: null,
              amount: null
            };
            this.$refs.editorForm.resetValidation();
          } else {
            response.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
      }
    },
    editTransaction(id) {
      this.$refs.transactionEditor.open(id).then(response => {
        if (response && response.ok) {
          this.refresh(this.$route.params.id);
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
                this.refresh(this.$route.params.id);
              } else {
                response.json().then(data => {
                  this.dispatchError(data.message);
                });
              }
            });
          }
        });
    },
    getDate() {
      const toTwoDigits = num => (num < 10 ? "0" + num : num);
      let today = new Date();
      let year = today.getFullYear();
      let month = toTwoDigits(today.getMonth() + 1);
      let day = toTwoDigits(today.getDate());
      return `${year}-${month}-${day}`;
    }
  }
};
</script>
