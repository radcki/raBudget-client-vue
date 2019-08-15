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
            <v-subheader>
              <a :class="(newEntryVisible == 'manual' ? 'headline ' : '') + 'mr-3 grey--text text--darken-1'"
                @click="newEntryVisible = 'manual'"
              >{{$t('transactions.newtransaction')}}</a>
              <v-badge right color="purple">
                <template v-slot:badge>
                  <span>{{closestScheduledTransactions.length}}</span>
                </template>
                <a :class="(newEntryVisible == 'scheduled' ? 'headline ' : '') + 'mr-1 grey--text text--darken-1'"
                  @click="newEntryVisible = 'scheduled'"
                >{{$t('transactionSchedules.transactionSchedules')}}</a>
              </v-badge>
            </v-subheader>
            <v-new-entry
              :data-budget="budget"
              v-show="newEntryVisible == 'manual' "
              :input-data="newEntryInputData"
              v-on:saved="fetchClosestScheduledTransactions();"
            ></v-new-entry>

            <v-scheduled-transactions-list
              max-height="350"
              :items="closestScheduledTransactions"
              v-show="newEntryVisible == 'scheduled' "
              :data-budget="budget"
              :title="$t('transactionSchedules.transactionSchedules')"
              v-on:create="passScheduledToEditor"
            ></v-scheduled-transactions-list>
          </v-flex>

          <v-flex xs12 v-if="$vuetify.breakpoint.xsOnly" class="py-3">
            <v-scheduled-transactions-list
              max-height="150"
              :items="closestScheduledTransactions"
              :data-budget="budget"
              :title="$t('transactionSchedules.transactionSchedules')"
              v-on:create="passScheduledToEditor"
            ></v-scheduled-transactions-list>
          </v-flex>

          <v-flex xs12 sm6 md12 v-if="$vuetify.breakpoint.smAndUp">
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

          <v-flex xs12 sm6 class="pt-0">
            <v-card class="text-sm-center" color="light-green darken-1" dark>
              <v-card-title class="subtitle-2">{{$t('budgets.availablefunds')}}</v-card-title>
              <v-card-text class="display-1 pb-1">
                <v-animated-number
                  v-if="budget.balance"
                  :value="budget.balance"
                  :formatValue="formatAmount"
                  :duration="300"
                />
                <span v-else>-</span>
              </v-card-text>
              <v-card-actions style="min-height: 7px" class="pa-0 ma-0">
                <v-progress-linear
                  class="pa-0 ma-0"
                  v-show="$wait.is('loading.budget*')"
                  indeterminate
                  color="white"
                ></v-progress-linear>
              </v-card-actions>
            </v-card>
          </v-flex>

          <v-flex xs12 sm6 class="pt-0">
            <v-card class="text-sm-center" color="blue-grey darken-1" dark>
              <v-card-title class="subtitle-2">{{$t('budgets.unassignedFunds')}}</v-card-title>
              <v-card-text class="display-1 pb-1">
                <v-animated-number
                  v-if="budget.unassignedFunds"
                  :value="budget.unassignedFunds"
                  :formatValue="formatAmount"
                  :duration="300"
                />
                <span v-else>-</span>
              </v-card-text>
              <v-card-actions style="min-height: 7px" class="pa-0 ma-0">
                <v-progress-linear
                  class="pa-0 ma-0"
                  v-show="$wait.is('loading.unassignedFunds*')"
                  indeterminate
                  color="white"
                ></v-progress-linear>
              </v-card-actions>
            </v-card>
          </v-flex>

          <v-flex xs12>
            <v-large-categories-summary
              :loading="$wait.is('loading.spendingCategoriesBalance')"
              :data-balance="spendingCategoriesBalance"
              :data-budget="budget"
            ></v-large-categories-summary>
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
      ref="newEntryDialog"
      dialog
      :data-budget="budget"
      v-on:saved="reloadInitialized();fetchTransactions();"
      :input-data="newEntryInputData"
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
    "v-mini-transactions-list": () =>
      import("../components/MiniTransactionsList"),
    "v-scheduled-transactions-list": () =>
      import("../components/ScheduledTransactionsList"),
    "v-mini-categories-summary": () =>
      import("../components/MiniCategoriesSummary"),
    "v-large-categories-summary": () =>
      import("../components/LargeCategoriesSummary"),
    "v-new-entry": () => import("./NewEntry"),
    "v-animated-number": () => import("../components/AnimatedNumber")
  },
  data() {
    return {
      categories: {
        incomes: [],
        spendings: [],
        savings: []
      },
      newEntryVisible: 'manual',
      newEntryInputData: null
    };
  },
  computed: {
    ...mapState({
      spendingCategoriesBalance: state =>
        state.budgets.activeBudget.spendingCategoriesBalance,
      savingCategoriesBalance: state =>
        state.budgets.activeBudget.savingCategoriesBalance,
      budgets: state => state.budgets.budgets,
      closestScheduledTransactions: state =>
        state.transactions.closestScheduledTransactions
    }),
    ...mapGetters("budgets", [
      "budget",
      "spendingCategoriesBalance",
      "savingCategoriesBalance"
    ]),
    ...mapGetters({
      transactions: "transactions/getTransactions"
    }),

    budgetId() {
      return this.$route.params.id;
    }
  },
  mounted: function() {
    this.activeBudgetChange(this.$route.params.id);

    this.$store.dispatch("transactions/setFilters", {
      budgetId: this.$route.params.id,
      limitCount: 8,
      startDate: null,
      endDate: null,
      categories: null
    });
    
    setTimeout(() => {
      this.initializeCategoriesBalance();
      this.initializeUnassignedFunds();
    }, 300);

    this.fetchClosestScheduledTransactions();
    
  },
  watch: {
    $route(to, from) {
      if (from.params.id != to.params.id) {
        this.activeBudgetChange(to.params.id);
        this.reloadInitialized();
      }
    },
    budget: function(budget) {
      if (budget) {
        this.initializeCategoriesBalance();
        this.initializeUnassignedFunds();
        this.reloadInitialized();
        this.fetchTransactions();
        this.fetchClosestScheduledTransactions();
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
      fetchClosestScheduledTransactions:
        "transactions/fetchClosestScheduledTransactions",
      reloadInitialized: "budgets/reloadInitialized",
      activeBudgetChange: "budgets/activeBudgetChange",
      fetchTransactions: "transactions/fetchTransactions",
      unloadTransactionFromStore: "transactions/unloadTransactionFromStore"
    }),
    formatAmount(value) {
      return this.$options.filters.currency(
        value,
        this.$currencies[this.budget.currency]
      );
    },
    editTransaction(id) {
      this.$refs.transactionEditor.open(id).then(response => {
        if (response && response.ok) {
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
                this.unloadTransactionFromStore(id)
              } else {
                response.json().then(data => {
                  this.dispatchError(data.message);
                });
              }
            });
          }
        });
    },
    passScheduledToEditor(transaction){
      this.newEntryInputData = null
      this.$nextTick(function(){this.newEntryInputData = transaction})
      
      this.newEntryVisible = 'manual'
      if (this.$vuetify.breakpoint.xs){
          this.$refs.newEntryDialog.editorDialog = true;
      }
    }
  }
};
</script>
