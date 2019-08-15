<template>
  <v-list class="py-0 elevation-1" dense subheader>
    <v-list-item :class="color + 'py-1'">
      <v-list-item-title class="subheading white--text">{{ title }}</v-list-item-title>
    </v-list-item>
    <template v-for="(transactions, date) in itemsByDate">
      <v-list-item-title
        :key="date"
        class="my-1 px-3 text-xs-right grey--text caption"
      >{{ date | moment("dddd, D.MM.YYYY") }}</v-list-item-title>
      <v-divider :key="date + '_divider'" inset></v-divider>
      <v-list-item
        :key="'tr_' + transaction.transactionId"
        v-for="(transaction, i) in transactions"
        class="pb-1"
      >
        <v-list-item-avatar :size="24">
          <v-icon>{{ $categoryIcons[transaction.category.icon] }}</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="font-weight-medium">{{ transaction.description}}</v-list-item-title>
          <v-list-item-subtitle
            class="text--primary"
          >{{transaction.amount | currency($currencies[dataBudget.currency])}}</v-list-item-subtitle>
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
<script>
import { transactionsService } from "../_services/transactions.service";
import { mapActions } from "vuex";
import { mdiPencil, mdiTrashCan } from "@mdi/js"

export default {
  name: "VMiniTransactionsList",
  components: {
    "v-transaction-editor": () => import("../components/TransactionEditor")
  },
  props: {
    items: Array,
    dataBudget: {
      type: Object,
      default: () => {
        return { currency: "PLN" };
      }
    },
    title: {
      type: String
    },
    color: String
  },
  data: function() {
    return {
      budget: this.dataBudget,
      mdiPencil, mdiTrashCan
    };
  },
  computed: {    
    itemsByDate: function() {
      if (this.items) {
        return this.items.reduce((acc, transaction) => {
          (acc[transaction.date] = acc[transaction.date] || []).push(
            transaction
          );
          return acc;
        }, {});
      }
    }
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success",
      reloadInitialized: "budgets/reloadInitialized",
      fetchTransactions: "transactions/fetchTransactions"
    }),
    updateTransaction(transaction) {
      this.$wait.start("saving.transaction");
      transactionsService
        .updateTransaction(transaction)
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
                this.fetchTransactions();
                this.reloadInitialized();
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
