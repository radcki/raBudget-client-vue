<template>
  <v-list class="py-0 elevation-1" dense subheader>
    <v-list-item :class="color + 'py-1'">
      <v-list-item-title class="subheading white--text">{{ title }}</v-list-item-title>
    </v-list-item>
    <template v-for="(transactions, date) in itemsByDate">
      <v-list-item-title
        :key="date"
        class="my-1 px-3 text-xs-right grey--text caption"
      >{{ new Date(date) | dateDormat("EEEE, d.MM.yyyy") }}</v-list-item-title>
      <v-divider :key="date + '_divider'" inset></v-divider>
      <v-list-item
        :key="'tr_' + transaction.transactionId"
        v-for="transaction in transactions"
        class="pb-1"
      >
        <v-list-item-avatar :size="24">
          <v-icon>{{ categoryIcon(transaction.budgetCategoryId) ? $categoryIcons[categoryIcon(transaction.budgetCategoryId)] : null }}</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="font-weight-medium">{{ transaction.description}}</v-list-item-title>
          <v-list-item-subtitle
            class="text--primary"
          >{{transaction.amount | currency($currencyConfig(dataBudget))}}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-transaction-editor
            v-on:save="updateTransaction"
            :value="transaction"
            :data-budget="budget"
          >
            <template v-slot:activator="{on}">
              <v-icon v-on="on">{{mdiPencil}}</v-icon>
            </template>
          </v-transaction-editor>
        </v-list-item-action>
        <v-list-item-action>
          <v-icon @click="deleteTransaction(transaction.transactionId)">{{mdiTrashCan}}</v-icon>
        </v-list-item-action>
      </v-list-item>
    </template>
  </v-list>
</template>
<script lang="ts">
import { transactionsService } from "../_services/transactions.service";
import { mdiPencil, mdiTrashCan } from "@mdi/js";
import { Transaction } from "@/typings/Transaction";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Action, namespace } from "vuex-class";
import { Budget } from "../typings/Budget";

const alertStore = namespace("alert");
const transactionsStore = namespace("transactions");
const budgetsStore = namespace("budgets");

@Component({
  name: "VMiniTransactionsList",
  components: {
    "v-transaction-editor": () => import("../components/TransactionEditor.vue")
  }
})
export default class MiniTransactionsList extends Vue {
  @Prop(Array) items!: Transaction[];
  @Prop(Object) dataBudget!: Budget;
  @Prop(String) title!: string;
  @Prop(String) color!: string;

  public budget: Budget = this.dataBudget;
  mdiPencil = mdiPencil;
  mdiTrashCan = mdiTrashCan;

  get itemsByDate() {
    if (this.items) {
      return this.items.reduce((acc: any, transaction: Transaction) => {
        (acc[transaction.transactionDate.toString()] =
          acc[transaction.transactionDate.toString()] || []).push(transaction);
        return acc;
      }, {});
    }
    return null;
  }

  @alertStore.Action("error") dispatchError;
  @alertStore.Action("success") dispatcSuccess;
  @transactionsStore.Action("fetchTransactions") fetchTransactions;
  @budgetsStore.Action("reloadInitialized") reloadInitialized;

  categoryIcon(budgetCategoryId: number): string | null {
    var category = this.budget.budgetCategories.find(v=>v.budgetCategoryId == budgetCategoryId);
    return category? category.icon : null
  }

  updateTransaction(transaction: Transaction) {
    this.$wait.start("saving.transaction");
    transactionsService
      .updateTransaction(this.budget.budgetId, transaction)
      .then(response => {
        if (response.ok) {
          this.$wait.end("saving.transaction");
          this.reloadInitialized();
          this.fetchTransactions();
        } else {
          response.json().then(data => {
            this.$wait.end("saving.transaction");
            this.dispatchError(data.message);
          });
        }
      })
      .catch(error => {
        this.$wait.end("saving.transaction");
        error.json().then(data => {
          this.dispatchError(data.message);
        });
      });
  }

  async deleteTransaction(transactionId: number) {
    let confirmation = await this.$confirm({
      title: "general.remove",
      message: "transactions.deleteConfirm",
      options: {
        color: "red",
        buttons: { yes: true, no: true, cancel: false, ok: false }
      }
    });

    if (confirmation) {
      let response = await transactionsService.deleteTransaction(
        this.budget.budgetId,
        transactionId
      );

      if (response.ok) {
        this.fetchTransactions();
        this.reloadInitialized();
      } else {
        response.json().then(data => {
          this.dispatchError(data.message);
        });
      }
    }
  }
}
</script>
