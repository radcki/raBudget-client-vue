<template>
  <v-card class="cardBackground">
    <v-card-title :class="`${color} py-1 mb-0`">
      <div style="width: 100%">
        <v-row no-gutters>
          <v-col class="pa-0 mt-0">
            <span class="subtitle-2 white--text text-sm-left">{{ title }}</span>
          </v-col>
        </v-row>
        <v-row no-gutters style="min-height: 5px">
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
      </div>
    </v-card-title>
    <v-card-text class="pa-0 ma-0">
      <v-list class="py-0 mt-0 cardBackground" dense subheader>
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
                  <v-btn
                    icon
                    small
                    :loading="$wait.is(`saving.transaction_${transaction.transactionId}`)"
                    v-on="on"
                  >
                    <v-icon v-on="on">{{ mdiPencil }}</v-icon>
                  </v-btn>
                </template>
              </v-transaction-editor>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn
                icon
                small
                :loading="$wait.is(`deleting.transaction_${transaction.transactionId}`)"
                @click="deleteTransaction(transaction.transactionId)"
              >
                <v-icon>{{ mdiTrashCan }}</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </template>
        <v-divider></v-divider>
        <v-list-item @click="$emit('load-more')">
          <v-list-item-content>
            <v-list-item-title class="text-right">{{
              $t('transactions.loadMore')
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
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
    this.$wait.start(`saving.transaction_${transaction.transactionId}`);
    try {
      const response = await transactionsService.updateTransaction(
        this.budget.budgetId,
        transaction,
      );
      if (response.ok) {
        this.$emit('updated');
      } else {
        const errorData = await response.json();
        this.dispatchError(errorData.message);
      }
    } catch (error) {
      const errorData = await error.json();
      this.dispatchError(errorData.message);
    } finally {
      this.$wait.end(`saving.transaction_${transaction.transactionId}`);
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
      this.$wait.start(`deleting.transaction_${transactionId}`);
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
      this.$wait.end(`deleting.transaction_${transactionId}`);
    }
  }
}
</script>
