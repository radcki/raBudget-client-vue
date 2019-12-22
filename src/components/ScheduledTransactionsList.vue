<template>
  <v-list class="py-0 elevation-1" dense color="cardBackground" subheader>
    <template v-if="$vuetify.breakpoint.mdAndUp">
      <v-list-item class="grey darken-2 py-1">
        <v-list-item-title class="subheading white--text">{{ title }}</v-list-item-title>
      </v-list-item>
      <div :style="maxHeight ? 'overflow-y: auto; max-height: ' + maxHeight + 'px' : ''">
        <v-list-item
          v-for="transaction in items"
          :key="'tr_' + transaction.transactionScheduleId + transaction.transactionDate"
          class="pb-1"
        >
          <v-list-item-avatar size="30">
            <v-icon :color="$categoryColor[getCategoryById(transaction.budgetCategoryId).type]">{{
              $categoryIcons[getCategoryById(transaction.budgetCategoryId).icon]
            }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">{{
              transaction.description
            }}</v-list-item-title>
            <v-list-item-subtitle class="text--primary">
              {{ transaction.transactionDate | dateFormat('yyyy-MM-dd', $dateLocales[$locale]) }} -
              {{ transaction.amount | currency($currencyConfig(dataBudget)) }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{}">
                <v-icon color="primary" @click="$emit('create', transaction)">{{
                  mdiLocationEnter
                }}</v-icon>
              </template>
              <span>{{ $t('transactions.saveTransaction') }}</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </div>
    </template>

    <v-list-group v-else class="grey darken-2 white--icon" :value="expanded">
      <template v-slot:activator>
        <v-list-item-title class="py-1 subheading white--text">{{ title }}</v-list-item-title>
      </template>
      <div
        class="cardBackground"
        :style="maxHeight ? 'overflow-y: auto; max-height: ' + maxHeight + 'px' : ''"
      >
        <v-list-item
          v-for="transaction in items"
          :key="'tr_' + transaction.transactionScheduleId + transaction.transactionDate"
          class="pb-1"
        >
          <v-list-item-avatar size="24">
            <v-icon :color="$categoryColor[getCategoryById(transaction.budgetCategoryId).type]">{{
              $categoryIcons[getCategoryById(transaction.budgetCategoryId).icon]
            }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">{{
              transaction.description
            }}</v-list-item-title>
            <v-list-item-subtitle class="text--primary">
              {{ transaction.date | dateFormat('yyyy-MM-dd', $dateLocales[$locale]) }} -
              {{ transaction.amount | currency($currencyConfig(dataBudget)) }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{}">
                <v-icon color="primary" @click="$emit('create', transaction)">{{
                  mdiLocationEnter
                }}</v-icon>
              </template>
              <span>{{ $t('transactions.saveTransaction') }}</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </div>
    </v-list-group>
  </v-list>
</template>

<script lang="ts">
import { mdiLocationEnter } from '@mdi/js';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { TransactionSchedule } from '@/typings/TransactionSchedule';
import { Budget } from '@/typings/Budget';
import { namespace } from 'vuex-class';
import { BudgetCategory } from '@/typings/BudgetCategory';

const budgetsModule = namespace('budgets');

@Component
export default class ScheduledTransactionsList extends Vue {
  @Prop(Array) items?: TransactionSchedule[];
  @Prop(Object) dataBudget?: Budget;
  @Prop(String) title?: string;
  @Prop(String) maxHeight?: string;

  expanded = true;
  mdiLocationEnter = mdiLocationEnter;

  @Watch('$vuetify.breakpoint.lgAndUp')
  OnResize(isDesktop) {
    this.expanded = isDesktop;
  }

  mounted() {
    this.expanded = this.$vuetify.breakpoint.lgAndUp;
  }

  @budgetsModule.Getter('budgetCategoryById')
  getCategoryById?: (budgetCategoryId: number) => BudgetCategory;
}
</script>
