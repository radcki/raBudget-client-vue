<template>
  <v-list class="py-0 elevation-1" dense subheader>
    <template v-if="$vuetify.breakpoint.mdAndUp">
      <v-list-item class="grey darken-2 py-1">
        <v-list-item-title class="subheading white--text">{{ title }}</v-list-item-title>
      </v-list-item>
      <div class="white" :style="maxHeight ? 'overflow-y: auto; max-height: '+maxHeight+'px' : ''">
        <v-list-item
          :key="'tr_' + transaction.transactionSchedule.transactionScheduleId  + transaction.date"
          v-for="(transaction, i) in items"
          class="pb-1"
        >
          <v-list-item-avatar size="30">
            <v-icon
              :color="typeColors[transaction.category.type]"
            >{{ $categoryIcons[transaction.category.icon] }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">{{ transaction.description}}</v-list-item-title>
            <v-list-item-subtitle
              class="text--primary"
            >{{transaction.date | moment}} - {{transaction.amount | currency($currencies[dataBudget.currency])}}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon color="primary" @click="$emit('create', transaction)">save_alt</v-icon>
              </template>
              <span>{{$t('transactions.saveTransaction')}}</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </div>
    </template>

    <v-list-group class="grey darken-2 white--icon" :value="expanded" v-else>
      <template v-slot:activator="{ on }">
        <v-list-item class="py-1">
          <v-list-item-title class="subheading white--text">{{ title }}</v-list-item-title>
        </v-list-item>
      </template>
      <div class="white" :style="maxHeight ? 'overflow-y: auto; max-height: '+maxHeight+'px' : ''">
        <v-list-item
          :key="'tr_' + transaction.transactionSchedule.transactionScheduleId  + transaction.date"
          v-for="(transaction) in items"
          class="pb-1"
        >
          <v-list-item-avatar size="24">
            <v-icon
              :color="typeColors[transaction.category.type]"
            >{{ $categoryIcons[transaction.category.icon] }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">{{ transaction.description}}</v-list-item-title>
            <v-list-item-subtitle
              class="text--primary"
            >{{transaction.date | moment}} - {{transaction.amount | currency($currencies[dataBudget.currency])}}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon color="primary" @click="$emit('create', transaction)">save_alt</v-icon>
              </template>
              <span>{{$t('transactions.saveTransaction')}}</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </div>
    </v-list-group>
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
    },
    maxHeight: { type: String }
  },
  data: function() {
    return {
      typeColors: {
        0: "amber darken-1",
        1: "green darken-1",
        2: "blue darken-1"
      },
      expanded: true
    };
  },
  mounted: function() {
    this.expanded = this.$vuetify.breakpoint.lgAndUp;
  },
  watch: {
    "$vuetify.breakpoint.lgAndUp": function(desktop) {
      this.expanded = desktop;
    }
  }
};
</script>
