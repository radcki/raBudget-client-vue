<template>
  <v-list class="py-0 elevation-1 cardBackground" dense subheader>
    <v-list-item :class="color + ' py-1'">
      <v-list-item-title>
        <v-row no-gutters>
          <v-col class="pa-0 mt-2">
            <span class="subheading white--text text-sm-left">{{ title }}</span>
          </v-col>
        </v-row>
        <v-row no-gutters style="min-height: 5px;">
          <v-progress-linear
            v-show="loading"
            top
            class="pa-0 ma-0"
            color="white"
            height="5"
            buffer-value="0"
            query
            stream
          >
          </v-progress-linear>
        </v-row>
      </v-list-item-title>
    </v-list-item>
    <template v-for="(transactions, date) in itemsByDate">
      <v-list-item-title :key="date" class="my-1 px-3 text-xs-right grey--text caption">{{
        new Date(date) | dateFormat('EEEE, d.MM.yyyy', $dateLocales[$locale])
      }}</v-list-item-title>
      <v-divider :key="date + '_divider'" inset></v-divider>
      <v-list-item
        v-for="transaction in transactions"
        :key="'tr_' + transaction.transactionId"
        class="pb-1"
      >
        <v-list-item-avatar :size="24">
          <v-icon>
            {{
              categoryIcon(transaction.budgetCategoryId)
                ? $categoryIcons[categoryIcon(transaction.budgetCategoryId)]
                : null
            }}
          </v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="font-weight-medium">{{
            transaction.description
          }}</v-list-item-title>
          <v-list-item-subtitle class="text--primary">{{
            transaction.amount | currency($currencyConfig(dataBudget))
          }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
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
        <v-list-item-action>
          <v-icon @click="deleteTransaction(transaction.transactionId)">{{ mdiTrashCan }}</v-icon>
        </v-list-item-action>
      </v-list-item>
    </template>
    <v-divider></v-divider>
    <v-list-item @click="$emit('load-more')">
      <v-list-item-content>
        <v-list-item-title class="text-right">{{ $t('transactions.loadMore') }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>
<script lang="ts">
import { transactionsService } from '../_services/transactions.service';
import { mdiPencil, mdiTrashCan } from '@mdi/js';
import { Transaction } from '@/typings/Transaction';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '../typings/Budget';
import { format } from 'date-fns';

const alertStore = namespace('alert');

@Component({
  name: 'VMiniTransactionsList',
  components: {
    'v-transaction-editor': () => import('../components/TransactionEditor.vue'),
  },
})
export default class MiniTransactionsList extends Vue {
  @Prop(Array) items!: Transaction[];
  @Prop(Object) dataBudget!: Budget;
  @Prop(String) title!: string;
  @Prop(String) color!: string;
  @Prop(Boolean) loading!: boolean;

  public budget: Budget = this.dataBudget;
  mdiPencil = mdiPencil;
  mdiTrashCan = mdiTrashCan;

  get itemsByDate() {
    if (this.items) {
      return this.items.reduce((acc: any, transaction: Transaction) => {
        (acc[format(transaction.transactionDate, 'yyyy-MM-dd')] =
          acc[format(transaction.transactionDate, 'yyyy-MM-dd')] || []).push(transaction);
        return acc;
      }, {});
    }
    return null;
  }

  @alertStore.Action('error') dispatchError;
  @alertStore.Action('success') dispatcSuccess;

  categoryIcon(budgetCategoryId: number): string | null {
    const category = this.budget.budgetCategories.find(v => v.budgetCategoryId == budgetCategoryId);
    return category ? category.icon : null;
  }

  async updateTransaction(transaction: Transaction) {
    this.$wait.start('saving.transaction');
    try {
      const response = await transactionsService.updateTransaction(
        this.budget.budgetId,
        transaction,
      );
      if (response.ok) {
        this.$wait.end('saving.transaction');
        this.$emit('updated');
      } else {
        this.$wait.end('saving.transaction');
        const errorData = await response.json();
        this.dispatchError(errorData.message);
      }
    } catch (error) {
      this.$wait.end('saving.transaction');
      const errorData = await error.json();
      this.dispatchError(errorData.message);
    }
  }

  async deleteTransaction(transactionId: number) {
    const confirmation = await this.$confirm({
      title: 'general.remove',
      message: 'transactions.deleteConfirm',
      options: {
        color: 'red',
        buttons: { yes: true, no: true, cancel: false, ok: false },
      },
    });

    if (confirmation) {
      const response = await transactionsService.deleteTransaction(
        this.budget.budgetId,
        transactionId,
      );

      if (response.ok) {
        this.$emit('deleted');
      } else {
        response.json().then(data => {
          this.dispatchError(data.message);
        });
      }
    }
  }
}
</script>
