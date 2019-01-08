<template>
  <v-container grid-list-md :fill-height="$wait.is('budgets')">
    <v-layout row wrap v-if="$wait.is('budgets')" align-center justify-center>
      <v-progress-circular :size="70" :width="7" color="grey darken-1" indeterminate></v-progress-circular>
      <br>
      <v-subheader class="headline">{{ $t("budgets.loading") }}</v-subheader>
    </v-layout>

    <v-layout row wrap v-else>
      <v-flex d-flex xs12 md8 lg5>
        <v-layout row wrap align-start align-content-start>
          <v-flex xs12 v-if="$vuetify.breakpoint.smAndUp">
            <v-subheader class="headline">{{$t('transactions.newtransaction')}}</v-subheader>
            <v-new-entry :data-budget="budget" v-on:saved="refresh($route.params.id)"></v-new-entry>
          </v-flex>

          <v-flex xs12 v-if="$vuetify.breakpoint.smAndUp">
            <v-subheader class="headline">{{$t('budgets.savingsStatus')}}</v-subheader>
            <v-mini-categories-summary
              color="white--text"
              background-color="blue darken-1"
              :data-balance="savingBalance"
              :data-budget="budget"
            ></v-mini-categories-summary>
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex d-flex xs12 md12 lg7>
        <v-layout row wrap align-content-start>
          <v-flex xs12 class="pb-0 mb-0" v-if="$vuetify.breakpoint.smAndUp">
            <v-subheader class="headline">{{$t('budgets.spendingBalance')}}</v-subheader>
          </v-flex>
          <v-flex xs12 md6 class="pt-0">
            <v-card class="text-sm-center" color="light-green darken-1" dark>
              <v-card-title>{{$t('budgets.availablefunds')}}</v-card-title>
              <v-card-text class="display-1">
                <v-progress-circular v-if="$wait.is('budgets.loading')" indeterminate color="white"></v-progress-circular>
                <span v-else>{{budget.balance | currency($currencies[budget.currency]) }}</span>
              </v-card-text>
            </v-card>
          </v-flex>

          <v-flex xs12 md6 class="pt-0">
            <v-card class="text-sm-center" color="blue-grey darken-1" dark>
              <v-card-title>{{$t('budgets.unassignedFunds')}}</v-card-title>
              <v-card-text class="display-1">
                <v-progress-circular v-if="$wait.is('unassignedFunds')" indeterminate color="white"></v-progress-circular>
                <span v-else>{{ budget.unassignedFunds | currency($currencies[budget.currency]) }}</span>
              </v-card-text>
            </v-card>
          </v-flex>

          <v-flex xs12>
            <v-large-categories-summary :data-balance="categoriesBalance" :data-budget="budget"></v-large-categories-summary>
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex xs12 v-if="!$vuetify.breakpoint.smAndUp">
        <v-subheader class="headline">{{$t('budgets.savingsStatus')}}</v-subheader>
        <v-mini-categories-summary
          color="white--text"
          background-color="blue darken-1"
          :data-balance="savingBalance"
          :data-budget="budget"
        ></v-mini-categories-summary>
      </v-flex>

      <v-flex xs12>
        <v-subheader class="headline">{{$t('transactions.recentTransactions')}}</v-subheader>
      </v-flex>

      <v-flex xs12 sm6 lg4 v-if="categories.spendings">
        <v-mini-transactions-list
          :items="transactions.spendings"
          color="amber darken-1"
          :title="$t('transactions.recentSpending')"
          :data-budget="budget"
          v-on:edit="editTransaction"
          v-on:delete="deleteTransaction"
        ></v-mini-transactions-list>
      </v-flex>

      <v-flex xs12 sm6 lg4 v-if="categories.incomes">
        <v-mini-transactions-list
          :items="transactions.incomes"
          color="green darken-1"
          :title="$t('transactions.recentIncome')"
          :data-budget="budget"
          v-on:edit="editTransaction"
          v-on:delete="deleteTransaction"
        ></v-mini-transactions-list>
      </v-flex>

      <v-flex xs12 sm6 lg4 v-if="categories.savings">
        <v-mini-transactions-list
          :items="transactions.savings"
          color="blue darken-1"
          :title="$t('transactions.recentSaving')"
          :data-budget="budget"
          v-on:edit="editTransaction"
          v-on:delete="deleteTransaction"
        ></v-mini-transactions-list>
      </v-flex>
    </v-layout>

    <v-new-entry
      v-if="$vuetify.breakpoint.xs"
      dialog
      :data-budget="budget"
      v-on:saved="refresh($route.params.id)"
    >
      <v-btn v-if="$vuetify.breakpoint.xs" fixed dark fab bottom right color="pink">
        <v-icon>add</v-icon>
      </v-btn>
    </v-new-entry>

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
    "v-mini-transactions-list": () => import("../components/MiniTransactionsList"),
    "v-mini-categories-summary": () => import("../components/MiniCategoriesSummary"),
    "v-large-categories-summary": () => import("../components/LargeCategoriesSummary"),
    "v-new-entry": () => import("./NewEntry")
  },
  data() {
    return {
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
      savingBalance: null
    };
  },
  computed: {
    ...mapState({
      budgets: state => state.budgets.budgets
    }),

    budget() {
      return this.budgets.filter(v => v.id == this.$route.params.id)[0];
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

    budget: function(budget) {
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
    }
  }
};
</script>
