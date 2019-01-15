<template>
  <v-container grid-list-md :fill-height="$wait.is('budgets')">
    <v-layout row wrap v-if="$wait.is('loading.budgets')" align-center justify-center>
      <v-progress-circular :size="70" :width="7" color="grey darken-1" indeterminate></v-progress-circular>
      <br>
      <v-subheader class="headline">{{ $t("budgets.loading") }}</v-subheader>
    </v-layout>

    <v-layout row wrap v-if="budget">
      <v-flex d-flex xs12 md8 lg5>
        <v-layout row wrap align-start align-content-start>
          <v-flex xs12 v-if="$vuetify.breakpoint.smAndUp">
            <v-subheader class="headline">{{$t('transactions.newtransaction')}}</v-subheader>
            <v-new-entry :data-budget="budget" v-on:saved="reloadInitialized();fetchTransactions();"></v-new-entry>
          </v-flex>

          <v-flex xs12 v-if="$vuetify.breakpoint.smAndUp">
            <v-subheader class="headline">{{$t('budgets.savingsStatus')}}</v-subheader>
            <v-mini-categories-summary
              color="white--text"
              :loading="$wait.is('loading.savingCategoriesBalance')"
              background-color="blue darken-1"
              :data-balance="savingCategoriesBalance"
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
                <v-progress-circular v-if="$wait.is('loading.budget*')" indeterminate color="white"></v-progress-circular>
                <span v-else>{{budget.balance | currency($currencies[budget.currency]) }}</span>
              </v-card-text>
            </v-card>
          </v-flex>

          <v-flex xs12 md6 class="pt-0">
            <v-card class="text-sm-center" color="blue-grey darken-1" dark>
              <v-card-title>{{$t('budgets.unassignedFunds')}}</v-card-title>
              <v-card-text class="display-1">
                <v-progress-circular v-if="$wait.is('loading.unassignedFunds')" indeterminate color="white"></v-progress-circular>
                <span v-else>{{ budget.unassignedFunds | currency($currencies[budget.currency]) }}</span>
              </v-card-text>
            </v-card>
          </v-flex>

          <v-flex xs12>
            <v-large-categories-summary 
              :loading="$wait.is('loading.spendingCategoriesBalance)')" 
              :data-balance="spendingCategoriesBalance" 
              :data-budget="budget"></v-large-categories-summary>
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex xs12 v-if="!$vuetify.breakpoint.smAndUp">
        <v-subheader class="headline">{{$t('budgets.savingsStatus')}}</v-subheader>
        <v-mini-categories-summary
          color="white--text"
          :loading="$wait.is('loading.savingCategoriesBalance')"
          background-color="blue darken-1"
          :data-balance="savingCategoriesBalance"
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
      v-on:saved="reloadInitialized();fetchTransactions();"
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
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  name: "Overview",
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

    };
  },
  computed: {
    ...mapState({
      spendingCategoriesBalance: state=>state.budgets.activeBudget.spendingCategoriesBalance,
      savingCategoriesBalance: state=>state.budgets.activeBudget.savingCategoriesBalance,
      budgets: state => state.budgets.budgets,
      
    }),
    ...mapGetters("budgets", [
        "budget",
        "spendingCategoriesBalance",
        "savingCategoriesBalance"
    ]),
    ...mapGetters({
      transactions: "transactions/getTransactions"
    }),

    budgetId(){return this.$route.params.id}
  },
  mounted: function() {
    this.activeBudgetChange(this.$route.params.id)
    this.initializeCategoriesBalance()
    this.initializeUnassignedFunds();

    this.$store.dispatch("transactions/setFilters", {
      budgetId: this.$route.params.id,
      limitCount: 8,
      startDate: null,
      endDate: null,
      categories: null
    })
  },
  watch: {
    $route(to, from) {
      if (from.params.id != to.params.id){
        this.activeBudgetChange(to.params.id)
        this.reloadInitialized();
      }      
    },
    budget: function(budget){
      if (budget){
        this.reloadInitialized();
        this.fetchTransactions();
      }
    }

  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success",
      initializeCategoriesBalance: "budgets/initializeCategoriesBalance",
      initializeUnassignedFunds: "budgets/initializeUnassignedFunds",
      fetchCategoriesBalance: "budgets/fetchCategoriesBalance",
      reloadInitialized: "budgets/reloadInitialized",
      activeBudgetChange: "budgets/activeBudgetChange",
      fetchTransactions: "transactions/fetchTransactions"
    }),

    editTransaction(id) {
      this.$refs.transactionEditor.open(id).then(response => {
        if (response && response.ok) {
          this.reloadInitialized();
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
                this.reloadInitialized();
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
