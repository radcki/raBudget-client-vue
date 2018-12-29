<template>
  <v-list class="py-0 elevation-1" dense subheader>
    <v-list-tile :class="color + 'py-1'">
      <v-list-tile-title class="subheading white--text">{{ title }}</v-list-tile-title>
    </v-list-tile>
    <template v-for="(transactions, date) in itemsByDate">
      <v-list-tile-title
        :key="date"
        class="my-1 px-3 text-xs-right grey--text caption"
      >{{ date | moment("dddd, D.MM.YYYY") }}</v-list-tile-title>
      <v-divider :key="date + '_divider'" inset></v-divider>
      <v-list-tile
        :key="date + '_' + i"
        v-for="(transaction, i) in transactions"
        avatar
        class="pb-1"
      >
        <v-list-tile-avatar>
          <v-icon>{{ transaction.category.icon }}</v-icon>
        </v-list-tile-avatar>

        <v-list-tile-content>
          <v-list-tile-title class="font-weight-medium">{{ transaction.description}}</v-list-tile-title>
          <v-list-tile-sub-title
            class="text--primary"
          >{{transaction.amount | currency($currencies[dataBudget.currency])}}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-menu>
          <v-btn slot="activator" icon>
            <v-icon>more_vert</v-icon>
          </v-btn>
          <v-list single-line light subheader>
            <v-list-tile>
              <v-list-tile-title>
                <v-icon @click="$emit('edit', transaction.transactionId)">edit</v-icon>
              </v-list-tile-title>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-title>
                <v-icon @click="$emit('delete', transaction.transactionId)">delete</v-icon>
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-list-tile>
    </template>
  </v-list>
</template>
<script>
export default {
  name: "VMiniTransactionsList",
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
    color: String,
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
  }
};
</script>
