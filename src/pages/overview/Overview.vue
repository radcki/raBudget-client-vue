<template>
  <v-container grid-list-md :fill-height="$wait.is('budgets')">
    <v-layout v-if="$wait.is('loading.budgets')" row wrap align-center justify-center>
      <v-progress-circular
        :size="70"
        :width="7"
        color="grey darken-1"
        indeterminate
      ></v-progress-circular>
      <br />
      <v-subheader class="headline">{{ $t('budgets.loading') }}</v-subheader>
    </v-layout>

    <v-layout v-if="budget" row wrap>
      <v-flex d-flex xs12 md8 lg5>
        <v-layout row wrap align-start align-content-start>
          <v-flex v-if="$vuetify.breakpoint.smAndUp" xs12>
            <v-subheader>
              <a
                :class="
                  (newEntryVisible == 'manual' ? 'headline ' : '') +
                    'mr-3 grey--text text--darken-1'
                "
                @click="newEntryVisible = 'manual'"
                >{{ $t('transactions.newtransaction') }}</a
              >
              <v-badge right color="purple">
                <template v-slot:badge>
                  <span>{{ closestScheduledTransactions.length }}</span>
                </template>
                <a
                  :class="
                    (newEntryVisible == 'scheduled' ? 'headline ' : '') +
                      'mr-1 grey--text text--darken-1'
                  "
                  @click="newEntryVisible = 'scheduled'"
                  >{{ $t('transactionSchedules.transactionSchedules') }}</a
                >
              </v-badge>
            </v-subheader>
            <new-entry
              v-show="newEntryVisible == 'manual'"
              :data-budget="budget"
              :input-data="newEntryInputData"
              @saved="fetch()"
            ></new-entry>

            <scheduled-transactions-list
              v-if="budget"
              v-show="newEntryVisible == 'scheduled'"
              max-height="350"
              :items="closestScheduledTransactions"
              :data-budget="budget"
              :title="$t('transactionSchedules.transactionSchedules')"
              @create="passScheduledToEditor"
            ></scheduled-transactions-list>
          </v-flex>

          <v-flex v-if="$vuetify.breakpoint.xsOnly" xs12 class="py-3">
            <scheduled-transactions-list
              v-if="budget"
              max-height="150"
              :items="closestScheduledTransactions"
              :data-budget="budget"
              :title="$t('transactionSchedules.transactionSchedules')"
              @create="passScheduledToEditor"
            ></scheduled-transactions-list>
          </v-flex>

          <v-flex v-if="$vuetify.breakpoint.smAndUp" xs12 sm6 md12>
            <v-subheader class="headline">{{ $t('budgets.savingsStatus') }}</v-subheader>
            <mini-categories-summary
              color="white--text"
              :loading="$wait.is('loading.savingCategoriesBalance')"
              background-color="blue darken-1"
              :data-balance="savingCategoriesBalance"
              :data-budget="budget"
            ></mini-categories-summary>
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex d-flex xs12 md12 lg7>
        <v-layout row wrap align-content-start>
          <v-flex v-if="$vuetify.breakpoint.smAndUp" xs12 class="pb-0 mb-0">
            <v-subheader class="headline">{{ $t('budgets.spendingBalance') }}</v-subheader>
          </v-flex>

          <v-flex xs12 sm6 class="pt-0">
            <value-card
              :value="budget.currentFunds"
              :budget="budget"
              :label="$t('budgets.availablefunds')"
              color="light-green darken-1"
              :loading="$wait.is('loading.availablefunds*')"
            ></value-card>
          </v-flex>

          <v-flex xs12 sm6 class="pt-0">
            <value-card
              :value="budget.unassignedFunds"
              :budget="budget"
              :label="$t('budgets.unassignedFunds')"
              color="blue-grey darken-1"
              :loading="$wait.is('loading.unassignedFunds*')"
            ></value-card>
          </v-flex>

          <v-flex xs12>
            <large-categories-summary
              :loading="$wait.is('loading.spendingCategoriesBalance')"
              :data-balance="spendingCategoriesBalance"
              :data-budget="budget"
            ></large-categories-summary>
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex v-if="!$vuetify.breakpoint.smAndUp" xs12>
        <v-subheader class="headline">{{ $t('budgets.savingsStatus') }}</v-subheader>
        <mini-categories-summary
          color="white--text"
          :loading="$wait.is('loading.savingCategoriesBalance')"
          background-color="blue darken-1"
          :data-balance="savingCategoriesBalance"
          :data-budget="budget"
        ></mini-categories-summary>
      </v-flex>

      <v-flex xs12>
        <v-subheader class="headline">{{ $t('transactions.recentTransactions') }}</v-subheader>
      </v-flex>

      <v-flex v-if="budget && transactions && transactions.spendings" xs12 sm6 lg4>
        <mini-transactions-list
          :items="transactions.spendings"
          color="amber darken-1"
          :title="$t('transactions.recentSpending')"
          :data-budget="budget"
          :loading="$wait.is('*.transactions')"
          @updated="fetch()"
          @deleted="fetch()"
        ></mini-transactions-list>
      </v-flex>

      <v-flex v-if="budget && transactions && transactions.incomes" xs12 sm6 lg4>
        <mini-transactions-list
          :items="transactions.incomes"
          color="green darken-1"
          :title="$t('transactions.recentIncome')"
          :data-budget="budget"
          :loading="$wait.is('*.transactions')"
          @updated="fetch()"
          @deleted="fetch()"
        ></mini-transactions-list>
      </v-flex>

      <v-flex v-if="budget && transactions && transactions.savings" xs12 sm6 lg4>
        <mini-transactions-list
          :items="transactions.savings"
          color="blue darken-1"
          :title="$t('transactions.recentSaving')"
          :data-budget="budget"
          :loading="$wait.is('*.transactions')"
          @updated="fetch()"
          @deleted="fetch()"
        ></mini-transactions-list>
      </v-flex>
    </v-layout>

    <new-entry
      v-if="$vuetify.breakpoint.xs"
      ref="newEntryDialog"
      dialog
      :data-budget="budget"
      :input-data="newEntryInputData"
      @saved="fetch()"
    >
      <template v-slot:activator="{ on }">
        <v-btn v-if="$vuetify.breakpoint.xs" fixed dark fab bottom right color="pink" v-on="on">
          <v-icon>{{ mdiPlus }}</v-icon>
        </v-btn>
      </template>
    </new-entry>

    <transaction-editor ref="transactionEditor"></transaction-editor>
  </v-container>
</template>

<script lang="ts">
import { mdiPlus } from '@mdi/js';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/Budget';
import { Transaction } from '@/typings/Transaction';
import NewEntry from './NewEntry.vue';

const budgetsModule = namespace('budgets');
const transactionsModule = namespace('transactions');
const alertModule = namespace('alert');

@Component({
  components: {
    'transaction-editor': () => import('@/components/TransactionEditor.vue'),
    'mini-transactions-list': () => import('@/components/MiniTransactionsList.vue'),
    'scheduled-transactions-list': () => import('@/components/ScheduledTransactionsList.vue'),
    'mini-categories-summary': () => import('@/components/MiniCategoriesSummary.vue'),
    'large-categories-summary': () => import('./components/LargeCategoriesSummary.vue'),
    'new-entry': () => import('./NewEntry.vue'),
    'value-card': () => import('./components/ValueCard.vue'),
  },
})
export default class Overview extends Vue {
  mdiPlus = mdiPlus;
  newEntryVisible = 'manual';
  newEntryInputData: Transaction | null = null;

  @budgetsModule.State('budgets') budgets?: Budget[];
  @budgetsModule.Getter('budget') budget?: Budget;
  @transactionsModule.State('closestScheduledTransactions') closestScheduledTransactions?: any[];

  @alertModule.Action('error') dispatchError?: (message) => void;
  @alertModule.Action('success') dispatchSuccess?: (message) => void;
  @budgetsModule.Action('initializeCategoriesBalance') initializeCategoriesBalance?: () => void;
  @budgetsModule.Action('initializeUnassignedFunds') initializeUnassignedFunds?: () => void;
  @budgetsModule.Action('fetchCategoriesBalance') fetchCategoriesBalance?: () => void;
  @transactionsModule.Action('fetchClosestScheduledTransactions')
  fetchClosestScheduledTransactions?: () => void;
  @budgetsModule.Action('reloadInitialized') reloadInitialized?: () => void;
  @budgetsModule.Action('activeBudgetChange') activeBudgetChange?: (
    budgetId: number | string,
  ) => void;
  @transactionsModule.Action('fetchTransactions') fetchTransactions?: () => void;
  @transactionsModule.Action('unloadTransactionFromStore') unloadTransactionFromStore?: () => void;
  @transactionsModule.Action('setFilters') setFilters?: (filters) => void;

  get spendingCategoriesBalance() {
    return this.budget ? this.budget.spendingCategoriesBalance : null;
  }

  get savingCategoriesBalance() {
    return this.budget ? this.budget.savingCategoriesBalance : null;
  }

  @transactionsModule.Getter('getTransactions') transactions?: Transaction[];

  get budgetId() {
    return this.$route.params.id;
  }

  fetch() {
    if (this.reloadInitialized) this.reloadInitialized();
    if (this.fetchTransactions) this.fetchTransactions();
  }

  @Watch('$route')
  OnRouteChange(to, from) {
    if (from.params.id != to.params.id && this.activeBudgetChange && this.reloadInitialized) {
      this.activeBudgetChange(to.params.id);
      this.reloadInitialized();
    }
  }

  @Watch('budget')
  OnBudgetChange(budget) {
    if (budget) {
      if (this.initializeCategoriesBalance) this.initializeCategoriesBalance();
      if (this.initializeUnassignedFunds) this.initializeUnassignedFunds();
      if (this.reloadInitialized) this.reloadInitialized();
      if (this.fetchTransactions) this.fetchTransactions();
      if (this.fetchClosestScheduledTransactions) this.fetchClosestScheduledTransactions();
    }
  }

  mounted() {
    if (this.activeBudgetChange) this.activeBudgetChange(this.$route.params.id);

    if (this.setFilters) {
      this.setFilters({
        budgetId: this.$route.params.id,
        limitCount: 8,
        startDate: null,
        endDate: null,
        categories: null,
      });
    }

    setTimeout(() => {
      if (this.initializeCategoriesBalance) this.initializeCategoriesBalance();
      if (this.initializeUnassignedFunds) this.initializeUnassignedFunds();
    }, 300);
  }

  passScheduledToEditor(transaction: Transaction) {
    this.newEntryInputData = null;
    this.$nextTick(function() {
      this.newEntryInputData = transaction;
    });

    this.newEntryVisible = 'manual';
    if (this.$vuetify.breakpoint.xs) {
      (this.$refs.newEntryDialog as NewEntry).editorDialog = true;
    }
  }
}
</script>