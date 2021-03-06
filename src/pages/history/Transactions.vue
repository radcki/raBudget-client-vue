<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-subheader class="headline">{{ $t('transactions.recentTransactions') }}</v-subheader>
      </v-flex>

      <v-flex xs12>
        <v-card class="px-3" color="cardBackground">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 md6>
                  <v-container fluid grid-list-sm class="pa-0">
                    <v-layout row wrap>
                      <v-flex xs6>
                        <v-radio-group v-model="categoryType" :mandatory="true" column>
                          <v-radio
                            color="primary"
                            :label="$t('general.spendings')"
                            :value="eCategoryType.Spending"
                          ></v-radio>
                          <v-radio
                            color="primary"
                            :label="$t('general.incomes')"
                            :value="eCategoryType.Income"
                          ></v-radio>
                          <v-radio
                            color="primary"
                            :label="$t('general.savings')"
                            :value="eCategoryType.Saving"
                          ></v-radio>
                        </v-radio-group>
                      </v-flex>
                      <v-flex v-if="budget" xs6>
                        <v-category-select
                          v-if="budget.budgetCategories"
                          v-model="selectedCategories"
                          multiple
                          :items="budget.budgetCategories.filter(v => v.type == categoryType)"
                          :rules="requiredRule"
                          persistent-hint
                          :hint="$t('general.category')"
                        ></v-category-select>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-flex>

                <v-flex v-if="budget" xs12 md6>
                  <v-date-range-slider
                    v-model="selectedRange"
                    :min="budget.startingDate"
                    :max="today"
                    step="days"
                  ></v-date-range-slider>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="
                setFilters();
                fetchTransactions();
              "
              >{{ $t('general.search') }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex v-if="transactions || $wait.is('loading.*')" xs12>
        <v-subheader class="headline">{{ $t('general.foundData') }}</v-subheader>
      </v-flex>

      <v-flex
        v-if="$wait.is('loading.*') && !$vuetify.breakpoint.smAndUp"
        xs12
        class="text-xs-center"
      >
        <v-progress-circular
          :size="70"
          :width="7"
          color="amber darken-3"
          indeterminate
        ></v-progress-circular>
      </v-flex>

      <v-card v-if="transactions" style="width: 100%" class="elevation-1 cardBackground">
        <v-card-text>
          <v-layout row justify-end>
            <v-flex xs4>
              <v-text-field
                v-if="$vuetify.breakpoint.smAndUp"
                v-model="search"
                :append-icon="mdiMagnify"
                :label="$t('general.search')"
                single-line
                hide-details
              ></v-text-field>
            </v-flex>
          </v-layout>

          <v-data-table
            v-if="$vuetify.breakpoint.smAndUp"
            :headers="headers"
            :items="transactions"
            :loading="$wait.is('loading.*')"
            :search="search"
            item-key="transactionId"
            class="cardBackground"
            must-sort
            sort-by
            footer-props.items-per-page-options="[15,25,50,{text: $t('general.all'), value: -1}]"
          >
            <template v-slot:body="{ items }">
              <tbody>
                <tr v-for="item in items" :key="item.transactionId">
                  <td>
                    <v-icon class="px-2" size="40">{{
                      $categoryIcons[getCategoryById(item.budgetCategoryId).icon]
                    }}</v-icon>
                    {{ getCategoryById(item.budgetCategoryId).name }}
                  </td>
                  <td>
                    {{
                      new Date(item.transactionDate)
                        | dateFormat('EEEE, d.MM.yyyy', $dateLocales[$locale])
                    }}
                  </td>
                  <td>{{ item.description }}</td>
                  <td>{{ item.amount | currency($currencyConfig(budget)) }}</td>
                  <td>
                    <v-transaction-editor
                      :value="item"
                      :data-budget="budget"
                      @save="updateTransaction"
                    >
                      <template v-slot:activator="{ on }">
                        <v-btn color="primary" dark icon text v-on="on">
                          <v-icon>{{ mdiPencil }}</v-icon>
                        </v-btn>
                      </template>
                    </v-transaction-editor>
                    <v-btn color="red darken-1" dark icon text>
                      <v-icon @click="deleteTransaction(item.transactionId)">{{
                        mdiTrashCan
                      }}</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-data-table>

          <v-list v-if="!$vuetify.breakpoint.smAndUp" dense subheader class="cardBackground">
            <template v-for="(transaction, index) in transactions">
              <v-list-item :key="`i_${transaction.transactionId}_${index}`" class="pb-1">
                <v-list-item-avatar>
                  <v-icon>{{
                    $categoryIcons[getCategoryById(transaction.budgetCategoryId).icon]
                  }}</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">
                    {{ transaction.description }}
                    <span class="grey--text text--lighten-1 caption">
                      -
                      {{
                        transaction.transactionDate
                          | dateFormat('EEEE, d.MM.yyyy', $dateLocales[$locale])
                      }}
                    </span>
                  </v-list-item-title>

                  <v-list-item-subtitle class="text--primary">{{
                    transaction.amount | currency($currencyConfig(budget))
                  }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action :key="`a1_${transaction.transactionId}_${index}`">
                  <v-transaction-editor
                    :value="transaction"
                    :data-budget="budget"
                    @save="updateTransaction"
                  >
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on">{{ mdiPencil }}</v-icon>
                    </template>
                  </v-transaction-editor>
                </v-list-item-action>
                <v-list-item-action :key="`a2_${transaction.transactionId}_${index}`">
                  <v-icon @click="deleteTransaction(transaction.transactionId)">{{
                    mdiTrashCan
                  }}</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { transactionsService } from '@/_services/transactions.service';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { subMonths, format } from 'date-fns';

import { mdiMagnify, mdiPencil, mdiTrashCan } from '@mdi/js';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { Budget } from '@/typings/Budget';
import { ErrorMessage } from '@/typings/TypedResponse';
import { Transaction } from '@/typings/Transaction';
import { TranscationFilters } from '../../_store/transactions.module';

const alertModule = namespace('alert');
const budgetsModule = namespace('budgets');
const transactionsModule = namespace('transactions');

@Component({
  components: {
    'v-transaction-editor': () => import('@/components/TransactionEditor.vue'),
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'v-date-range-slider': () => import('@/components/DateRangeSlider.vue'),
  },
})
export default class Transactions extends Vue {
  search: string | null = null;
  categoryType: eCategoryType = eCategoryType.Spending;
  selectedRange: any[] = [null, null];
  selectedCategories: BudgetCategory[] | null = null;
  headers: any[] = [];

  tab = 0;
  color: string[] = ['amber darken-1', 'green darken-1', 'blue darken-1', 'purple darken-1'];
  requiredRule: any[] = [];

  mdiMagnify = mdiMagnify;
  mdiPencil = mdiPencil;
  mdiTrashCan = mdiTrashCan;
  format = format;
  eCategoryType = eCategoryType;

  @budgetsModule.Getter('budget') budget!: Budget;
  @transactionsModule.Getter('getTransactions') getTransactions!: {
    spendings: Transaction[];
    savings: Transaction[];
    incomes: Transaction[];
  };
  @alertModule.Action('error') dispatchError!: (message: string) => void;
  @alertModule.Action('success') dispatchSuccess!: (message: string) => void;
  @budgetsModule.Action('activeBudgetChange') activeBudgetChange!: (
    budgetId: number | string,
  ) => void;
  @budgetsModule.Action('reloadInitialized') reloadInitialized!: () => void;
  @transactionsModule.Action('fetchTransactions') fetchTransactions!: () => void;
  @transactionsModule.Action('setFilters') setFiltersAction!: (filters: TranscationFilters) => void;

  get today() {
    return new Date();
  }

  get monthAgoOrStart() {
    return subMonths(new Date(), 1) < this.budget.startingDate
      ? this.budget.startingDate
      : subMonths(new Date(), 1);
  }

  get transactions(): Transaction[] {
    if (!this.getTransactions) {
      return [];
    }
    switch (this.categoryType) {
      case eCategoryType.Spending:
        return this.getTransactions.spendings;
      case eCategoryType.Income:
        return this.getTransactions.incomes;
      case eCategoryType.Saving:
        return this.getTransactions.savings;
    }
    return [];
  }

  getCategoryById(budgetCategoryId: number): BudgetCategory | null {
    return this.budget.budgetCategories.find(v => v.budgetCategoryId == budgetCategoryId) || null;
  }

  @Watch('$route')
  OnRouteChange(to, from) {
    if (from.params.id != to.params.id) {
      this.activeBudgetChange(to.params.id);
      this.reloadInitialized();
      this.fetchTransactions();
    }
    if (this.budget) {
      this.selectedRange = [this.monthAgoOrStart, this.today];
    }
  }

  @Watch('budget')
  OnBudgetChange() {
    if (this.budget) {
      this.selectedRange = [this.monthAgoOrStart, this.today];
      this.selectedCategories = this.budget.budgetCategories.filter(
        v => v.type == this.categoryType,
      );
    }
    this.setFilters();
    this.fetchTransactions();
  }

  @Watch('categoryType')
  OnCategoryTypeChange() {
    if (this.budget && this.budget.budgetCategories) {
      this.selectedCategories = this.budget.budgetCategories.filter(
        v => v.type == this.categoryType,
      );
    }
    this.setFilters();
    this.fetchTransactions();
  }

  created() {
    this.requiredRule = [v => !!v || this.$t('forms.requiredField')];
    this.headers = [
      {
        text: this.$t('general.category'),
        sortable: true,
        value: 'category',
      },
      {
        text: this.$t('general.date'),
        sortable: true,
        value: 'date',
      },
      {
        text: this.$t('general.description'),
        sortable: true,
        value: 'description',
      },
      {
        text: this.$t('general.amount'),
        sortable: true,
        value: 'amount',
      },
      {
        text: this.$t('general.actions'),
        sortable: false,
      },
    ];
    this.activeBudgetChange(this.$route.params.id);
  }

  mounted() {
    if (this.budget) {
      this.selectedCategories = this.budget.budgetCategories.filter(
        v => v.type == this.categoryType,
      );
      this.selectedRange = [this.monthAgoOrStart, this.today];
      this.setFilters();
      this.fetchTransactions();
    }
  }

  setFilters() {
    if (this.setFiltersAction) {
      this.setFiltersAction({
        budgetId: this.budget.budgetId,
        limitCount: {
          incomes: null,
          savings: null,
          spendings: null,
        },
        startDate: this.selectedRange[0],
        endDate: this.selectedRange[1],
        categories: this.selectedCategories || [],
        categoryType: this.categoryType,
      });
    }
  }

  updateTransaction(transaction) {
    this.$wait.start('saving.transaction');
    transactionsService
      .updateTransaction(this.budget.budgetId, transaction)
      .then(response => {
        if (response.ok) {
          this.$wait.end('saving.transaction');
          this.reloadInitialized();
          this.fetchTransactions();
        } else {
          response.json<ErrorMessage>().then(data => {
            this.$wait.end('saving.transaction');
            this.dispatchError(data.message);
          });
        }
      })
      .catch(error => {
        this.$wait.end('saving.transaction');
        error.json().then(data => {
          this.dispatchError(data.message);
        });
      });
  }

  async deleteTransaction(transactionId) {
    const confirm = await this.$confirm({
      title: 'general.remove',
      message: 'transactions.deleteConfirm',
      options: {
        color: 'red',
        buttons: { yes: true, no: true, cancel: false, ok: false },
      },
    });

    if (confirm) {
      const response = await transactionsService.deleteTransaction(
        this.budget.budgetId,
        transactionId,
      );
      if (response.ok) {
        this.reloadInitialized();
        this.fetchTransactions();
      } else {
        const error = await response.json<ErrorMessage>();
        this.dispatchError(error.message);
      }
    }
  }
}
</script>
