<template>
  <v-container :class="'elevation-1 '+ color + ' ' + backgroundColor">
    <v-layout row wrap v-if="loading">
      <v-flex xs12>
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-else>
      <v-flex xs4 align-center></v-flex>
      <v-flex xs4 align-center class="subtitle-2">{{ $t('categories.totalAmount') }}</v-flex>
      <v-flex xs4 align-center class="subtitle-2">{{ $t('categories.monthPlanLeft') }}</v-flex>
        <template v-for="(category, index) in dataBalance" >
          <v-flex :key="index + '_name'" xs4 align-center class="subtitle-2">
            {{category.budgetCategory.name}}
          </v-flex>
          <v-flex :key="index + '_savingsum'" xs4>
            <v-chip class="amber darken-3 elevation-3 white--text" small>
              <v-animated-number
                    :value="category.totalTransactionsSum"
                    :formatValue="formatAmount"
                    :duration="300"/>
            </v-chip>
          </v-flex>
          <v-flex :key="index + '_savingplan'" xs4>
            <v-chip class="amber darken-3 elevation-3 white--text" small>
              <v-animated-number
                    :value="category.thisMonthBudgetBalance"
                    :formatValue="formatAmount"
                    :duration="300"/>
            </v-chip>
          </v-flex>
        </template>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  name: 'VMiniCategoriesSummary',
  props: {
    loading: Boolean,
    dataBalance: Array,
    dataBudget: {
      type: Object,
      default: () => { return { currency: 'PLN' } }
    },
    backgroundColor: String,
    color: String
  },
  components: {
    'v-animated-number': () => import('../components/AnimatedNumber')
  },
  methods: {
    formatAmount (value) {
      return this.$options.filters.currency(value, this.$currencies[this.dataBudget.currency])
    }
  }
}
</script>
