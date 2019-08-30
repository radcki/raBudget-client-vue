<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-subheader class="headline">{{$t('transactions.recentTransactions')}}</v-subheader>
      </v-flex>

      <v-flex xs12>
        <v-card class="px-3">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 md6>
                  <v-container fluid grid-list-sm class="pa-0">
                    <v-layout row wrap>
                      <v-flex xs6>
                        <v-radio-group light v-model="categoryType" :mandatory="true" column>
                          <v-radio
                            color="primary"
                            :label="$t('general.spendings')"
                            value="spendingCategories"
                          ></v-radio>
                          <v-radio
                            color="primary"
                            :label="$t('general.incomes')"
                            value="incomeCategories"
                          ></v-radio>
                          <v-radio
                            color="primary"
                            :label="$t('general.savings')"
                            value="savingCategories"
                          ></v-radio>
                        </v-radio-group>
                      </v-flex>
                      <v-flex xs6 v-if="budget">
                        <v-category-select
                          multiple
                          :items="budget[categoryType]"
                          v-if="budget[categoryType]"
                          v-model="selectedCategories"
                          :rules="requiredRule"
                          persistent-hint
                          :hint="$t('general.category')"
                        ></v-category-select>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-flex>

                <v-flex xs12 md6 v-if="budget">
                  <v-date-range-slider
                    :min="$moment(budget.startingDate).format('YYYY-MM-DD')"
                    :max="today"
                    v-model="selectedRange"
                    step="days"
                  ></v-date-range-slider>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="setFilters();fetchTransactions()"
            >{{ $t('general.search') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex xs12 v-if="transactions || $wait.is('loading.*')">
        <v-subheader class="headline">{{$t('general.foundData')}}</v-subheader>
      </v-flex>

      <v-flex
        xs12
        v-if="$wait.is('loading.*') && !$vuetify.breakpoint.smAndUp"
        class="text-xs-center"
      >
        <v-progress-circular :size="70" :width="7" color="amber darken-3" indeterminate></v-progress-circular>
      </v-flex>

      <v-flex xs12 class="elevation-1 white" v-if="transactions">
        <v-layout row justify-end>
          <v-flex xs4>
            <v-text-field
              v-if="$vuetify.breakpoint.smAndUp"
              v-model="search"
              :append-icon="mdiMagnify"
              :label="$t('general.search')"
              single-line
              hide-details
            ></v-text-field>
          </v-flex>
        </v-layout>

        <v-data-table
          v-if="$vuetify.breakpoint.smAndUp"
          :headers="headers"
          :items="transactions[transactionTypes[categoryType]]"
          :loading="$wait.is('loading.*')"
          :search="search"
          must-sort
          sort-by
          footer-props.items-per-page-options="[15,25,50,{text: $t('general.all'), value: -1}]"
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.transactionId">
                <td>
                  <v-icon class="px-2" size="40">{{ $categoryIcons[item.category.icon] }}</v-icon>
                  {{ item.category.name }}
                </td>
                <td>{{ item.date | moment("dddd, D.MM.YYYY") }}</td>
                <td>{{ item.description }}</td>
                <td>{{ item.amount | currency($currencies[budget.currency]) }}</td>
                <td>
                  <v-transaction-editor
                    v-on:save="updateTransaction"
                    :value="item"
                    :data-budget="budget"
                  >
                    <template v-slot:activator="{on}">
                      <v-btn color="primary" v-on="on" dark icon text>
                        <v-icon>{{mdiPencil}}</v-icon>
                      </v-btn>
                    </template>
                  </v-transaction-editor>
                  <v-btn color="red darken-1" dark icon text>
                    <v-icon @click="deleteTransaction(item.transactionId)">{{mdiTrashCan}}</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>

        <v-list v-if="!$vuetify.breakpoint.smAndUp" dense subheader>
          <template v-for="(transaction, index) in transactions[transactionTypes[categoryType]]">
            <v-list-item :key="index" class="pb-1">
              <v-list-item-avatar>
                <v-icon>{{ $categoryIcons[transaction.category.icon] }}</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ transaction.description}}
                  <span
                    class="grey--text text--lighten-1 caption"
                  >- {{ transaction.date | moment("dddd, D.MM.YYYY") }}</span>
                </v-list-item-title>

                <v-list-item-subtitle
                  class="text--primary"
                >{{transaction.amount | currency($currencies[budget.currency])}}</v-list-item-subtitle>
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
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { transactionsService } from '../_services/transactions.service'
import { mapActions, mapGetters } from 'vuex'

import { mdiMagnify, mdiPencil, mdiTrashCan } from '@mdi/js'

export default {
  components: {
    'v-transaction-editor': () => import('../components/TransactionEditor'),
    'v-category-select': () => import('../components/CategorySelect'),
    'v-date-range-slider': () => import('../components/DateRangeSlider')
  },
  data () {
    return {
      search: null,

      categoryType: 'spendingCategories',
      transactionTypes: {
        spendingCategories: 'spendings',
        incomeCategories: 'incomes',
        savingCategories: 'savings'
      },
      selectedRange: [null, null],
      selectedCategories: null,

      headers: [
        {
          text: this.$t('general.category'),
          sortable: true,
          value: 'category'
        },
        {
          text: this.$t('general.date'),
          sortable: true,
          value: 'date'
        },
        {
          text: this.$t('general.description'),
          sortable: true,
          value: 'description'
        },
        {
          text: this.$t('general.amount'),
          sortable: true,
          value: 'amount'
        },
        {
          text: this.$t('general.actions'),
          sortable: false
        }
      ],

      tab: 0,
      color: [
        'amber darken-1',
        'green darken-1',
        'blue darken-1',
        'purple darken-1'
      ],
      requiredRule: [v => !!v || this.$t('forms.requiredField')],

      mdiMagnify,
      mdiPencil,
      mdiTrashCan
    }
  },
  computed: {
    ...mapGetters({
      budget: 'budgets/budget',
      transactions: 'transactions/getTransactions'
    }),
    currencies: function () {
      return Object.keys(this.$currencies)
    },
    today: function () {
      return this.$moment().format('YYYY-MM-DD')
    },
    monthAgoOrStart () {
      return this.$moment().subtract(1, 'month') <
        this.$moment(this.budget.startingDate)
        ? this.$moment(this.budget.startingDate).format('YYYY-MM-DD')
        : this.$moment()
          .subtract(1, 'month')
          .format('YYYY-MM-DD')
    }
  },
  created: function () {
    this.activeBudgetChange(this.$route.params.id)
    if (this.budget) {
      this.selectedCategories = this.budget[this.categoryType]
      this.selectedRange = [this.monthAgoOrStart, this.today]
      this.setFilters()
    }
  },
  watch: {
    $route (to, from) {
      if (from.params.id != to.params.id) {
        this.activeBudgetChange(to.params.id)
        this.reloadInitialized()
        this.fetchTransactions()
      }
      if (this.budget) {
        this.selectedRange = [this.monthAgoOrStart, this.today]
      }
    },
    budget: function (budget) {
      if (this.budget && this.budget[this.categoryType]) {
        this.selectedRange = [this.monthAgoOrStart, this.today]
        this.selectedCategories = this.budget[this.categoryType]
      }
      this.setFilters()
    },
    categoryType: function (value) {
      if (this.budget && this.budget[value]) {
        this.selectedCategories = this.budget[value]
      }
      this.setFilters()
    }
  },
  methods: {
    ...mapActions({
      dispatchError: 'alert/error',
      dispatchSuccess: 'alert/success',
      activeBudgetChange: 'budgets/activeBudgetChange',
      reloadInitialized: 'budgets/reloadInitialized',
      fetchTransactions: 'transactions/fetchTransactions'
    }),
    setFilters () {
      this.$store.dispatch('transactions/setFilters', {
        budgetId: this.$route.params.id,
        limitCount: null,
        startDate: this.selectedRange[0],
        endDate: this.selectedRange[1],
        categories: this.selectedCategories
      })
    },
    updateTransaction (transaction) {
      this.$wait.start('saving.transaction')
      transactionsService
        .updateTransaction(transaction)
        .then(response => {
          if (response.ok) {
            this.$wait.end('saving.transaction')
            this.reloadInitialized()
          } else {
            response.json().then(data => {
              this.$wait.end('saving.transaction')
              this.dispatchError(data.message)
            })
          }
        })
        .catch(error => {
          this.$wait.end('saving.transaction')
          error.json().then(data => {
            this.dispatchError(data.message)
          })
        })
    },
    deleteTransaction (id) {
      this.$root
        .$confirm('general.remove', 'transactions.deleteConfirm', {
          color: 'red',
          buttons: { yes: true, no: true, cancel: false, ok: false }
        })
        .then(confirm => {
          if (confirm) {
            transactionsService.deleteTransaction(id).then(response => {
              if (response.ok) {
                this.reloadInitialized()
                this.fetchTransactions()
              } else {
                response.json().then(data => {
                  this.dispatchError(data.message)
                })
              }
            })
          }
        })
    }
  }
}
</script>
