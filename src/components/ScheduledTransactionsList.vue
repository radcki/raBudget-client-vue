<template>
  <v-list class="py-0 elevation-1" dense subheader>
    <template v-if="$vuetify.breakpoint.mdAndUp">
      <v-list-item class="grey darken-2 py-1">
        <v-list-item-title class="subheading white--text">{{ title }}</v-list-item-title>
      </v-list-item>
      <div class="white" :style="maxHeight ? 'overflow-y: auto; max-height: '+maxHeight+'px' : ''">
        <v-list-item
          :key="'tr_' + transaction.transactionScheduleId  + transaction.transactionDate"
          v-for="(transaction) in items"
          class="pb-1"
        >
          <v-list-item-avatar size="30">
            <v-icon
              :color="$categoryColor[getCategoryById(transaction.budgetCategoryId).type]"
            >{{ $categoryIcons[getCategoryById(transaction.budgetCategoryId).icon] }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">{{ transaction.description}}</v-list-item-title>
            <v-list-item-subtitle
              class="text--primary"
            >{{transaction.transactionDate | dateFormat('yyyy-MM-dd', $dateLocales[$locale])}} - {{transaction.amount | currency($currencyConfig(dataBudget))}}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon color="primary" @click="$emit('create', transaction)">{{mdiLocationEnter}}</v-icon>
              </template>
              <span>{{$t('transactions.saveTransaction')}}</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </div>
    </template>

    <v-list-group class="grey darken-2 white--icon" :value="expanded" v-else>
      <template v-slot:activator>
          <v-list-item-title class="py-1 subheading white--text">{{ title }}</v-list-item-title>
      </template>
      <div class="white" :style="maxHeight ? 'overflow-y: auto; max-height: '+maxHeight+'px' : ''">
        <v-list-item
          :key="'tr_' + transaction.transactionScheduleId  + transaction.transactionDate"
          v-for="(transaction) in items"
          class="pb-1"
        >
          <v-list-item-avatar size="24">
            <v-icon
              :color="$categoryColor[getCategoryById(transaction.budgetCategoryId).type]"
            >{{ $categoryIcons[getCategoryById(transaction.budgetCategoryId).icon] }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">{{ transaction.description}}</v-list-item-title>
            <v-list-item-subtitle
              class="text--primary"
            >{{transaction.date | dateFormat('yyyy-MM-dd', $dateLocales[$locale])}} - {{transaction.amount | currency($currencyConfig(dataBudget))}}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon color="primary" @click="$emit('create', transaction)">{{mdiLocationEnter}}</v-icon>
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
import { mdiLocationEnter } from '@mdi/js'
export default {
  name: 'VScheduledTransactionsList',
  props: {
    items: Array,
    dataBudget: {
      type: Object,
      default: () => {
        return { currency: 'PLN' }
      }
    },
    title: {
      type: String
    },
    maxHeight: { type: String }
  },
  data: function () {
    return {
      typeColors: {
        0: 'amber darken-1',
        1: 'green darken-1',
        2: 'blue darken-1'
      },
      expanded: true,
      mdiLocationEnter
    }
  },
  mounted: function () {
    this.expanded = this.$vuetify.breakpoint.lgAndUp
  },
  watch: {
    '$vuetify.breakpoint.lgAndUp': function (desktop) {
      this.expanded = desktop
    }
  },
  methods: {
    getCategoryById(budgetCategoryId) {
      return this.dataBudget.budgetCategories.find(v=>v.budgetCategoryId == budgetCategoryId);
    }
  }
}
</script>
