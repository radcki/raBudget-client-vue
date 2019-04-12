<template>
  <v-list class="py-0 elevation-1" dense subheader>
    <v-list-tile class="grey darken-2 py-1">
      <v-list-tile-title class="subheading white--text">{{ title }}</v-list-tile-title>
    </v-list-tile>

      <v-list-tile
        :key="'tr_' + transaction.transactionSchedule.transactionScheduleId  + transaction.date"
        v-for="(transaction, i) in items"
        avatar
        class="pb-1"
      >
        <v-list-tile-avatar>
          <v-icon :color="typeColors[transaction.category.type]">{{ transaction.category.icon }}</v-icon>
        </v-list-tile-avatar>

        <v-list-tile-content>
          <v-list-tile-title class="font-weight-medium">{{ transaction.description}}</v-list-tile-title>
          <v-list-tile-sub-title
            class="text--primary"
          >{{transaction.date | moment}} - {{transaction.amount | currency($currencies[dataBudget.currency])}}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-tooltip top>
          <v-icon slot="activator" color="primary" @click="$emit('create', transaction)">save_alt</v-icon>
          <span>{{$t('transactions.saveTransaction')}}</span>
          </v-tooltip>
        </v-list-tile-action>
      </v-list-tile>
  </v-list>
</template>
<script>
export default {
  name: "VScheduledTransactionsList",
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
    }
  },
  data: function() {
    return {
      typeColors: {
        0: "amber darken-1",
        1: "green darken-1",
        2: "blue darken-1"
      },

    };
  },
};
</script>
