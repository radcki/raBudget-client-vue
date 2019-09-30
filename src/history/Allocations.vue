<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-subheader class="headline">{{$t('allocations.recentAllocations')}}</v-subheader>
      </v-flex>

      <v-flex xs12>
        <v-card class="px-3">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 md6 v-if="budget">
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
            <v-btn color="primary" @click="fetchAllocations()">{{ $t('general.search') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex xs12 v-if="allocations || loading">
        <v-subheader class="headline">{{$t('general.foundData')}}</v-subheader>
      </v-flex>

      <v-flex xs12 v-if="loading" class="text-xs-center">
        <v-progress-circular :size="70" :width="7" color="amber darken-3" indeterminate></v-progress-circular>
      </v-flex>

      <v-flex xs12 v-if="error" class="text-xs-center">
        <v-icon color="red" size="80">{{mdiAlertCircleOutline}}</v-icon>
      </v-flex>

      <v-flex xs12 class="elevation-1 white" v-if="allocations">
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
          :items="allocations"
          :loading="loading"
          :search="search"
          must-sort
          sort-by
          footer-items-per-page-options="[15,25,50,{text: $t('general.all'), value: -1}]"
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.transactionId">
                <td>
                  <v-icon class="px-2">{{ $categoryIcons[item.destinationCategory.icon] }}</v-icon>
                  {{ item.destinationCategory.name }}
                </td>
                <td>{{ item.date | dateDormat("dddd, d.MM.yyyy") }}</td>
                <td>{{ item.description }}</td>
                <td>{{ item.amount | currency($currencyConfig(budget)) }}</td>
                <td>
                  <v-allocation-editor
                    v-on:save="updateAllocation"
                    :value="item"
                    :data-budget="budget"
                  >
                    <template v-slot:activator="{on}">
                      <v-icon v-on="on" color="primary">{{mdiPencil}}</v-icon>
                    </template>
                  </v-allocation-editor>
                  <v-icon
                    color="red darken-1"
                    @click="deleteAllocation(item.allocationId)"
                  >{{mdiTrashCan}}</v-icon>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>

        <v-list class="py-0" v-if="!$vuetify.breakpoint.smAndUp" dense subheader>
          <template v-for="(transaction, index) in allocations">
            <v-list-item :key="index" class="pb-1">
              <v-list-item-avatar>
                <v-icon>{{ $categoryIcons[transaction.destinationCategory.icon] }}</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ transaction.description}}
                  <span
                    class="grey--text text--lighten-1 caption"
                  >- {{ transaction.date | dateDormat("dddd, d.MM.yyyy") }}</span>
                </v-list-item-title>

                <v-list-item-subtitle
                  class="text--primary"
                >{{transaction.amount | currency($currencyConfig(budget))}}</v-list-item-subtitle>
              </v-list-item-content>

               <v-list-item-action>
                <v-allocation-editor
                  v-on:save="updateAllocations"
                  :value="transaction"
                  :data-budget="budget"
                >
                  <template v-slot:activator="{on}">
                    <v-icon v-on="on">{{mdiPencil}}</v-icon>
                  </template>
                </v-allocation-editor>
              </v-list-item-action>
              <v-list-item-action>
                <v-icon @click="deleteAllocation(transaction.allocationId)">{{mdiTrashCan}}</v-icon>
              </v-list-item-action>

            </v-list-item>
          </template>
        </v-list>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
import { allocationsService } from '../_services/allocations.service'
import { mapActions, mapGetters } from 'vuex'

import { mdiMagnify, mdiPencil, mdiTrashCan, mdiAlertCircleOutline } from '@mdi/js'

export default {
  components: {
    'v-allocation-editor': () => import('../components/AllocationEditor'),
    'v-category-select': () => import('../components/CategorySelect'),
    'v-date-range-slider': () => import('../components/DateRangeSlider')
  },
  data () {
    return {
      loading: false,
      error: false,
      search: null,

      categoryType: 'spendingCategories',
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

      allocations: null,
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
      mdiTrashCan,
      mdiAlertCircleOutline
    }
  },
  computed: {
    ...mapGetters({
      budget: 'budgets/budget'
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
        : this.$moment().subtract(1, 'month')
    }
  },
  created: function () {
    this.activeBudgetChange(this.$route.params.id)
    if (this.budget) {
      this.selectedCategories = this.budget[this.categoryType]
      this.selectedRange = [this.monthAgoOrStart, this.today]
      this.fetchAllocations()
    }
  },
  watch: {
    budget: function (budget) {
      this.selectedRange = [this.monthAgoOrStart, this.today]

      if (this.budget && this.budget[this.categoryType]) {
        this.selectedCategories = this.budget[this.categoryType]
      }
      this.fetchAllocations()
    },
    categoryType: function (value) {
      this.allocations = null
      if (this.budget && this.budget[value]) {
        this.selectedCategories = this.budget[value]
      }
      this.fetchAllocations()
    }
  },

  methods: {
    ...mapActions({
      dispatchError: 'alert/error',
      dispatchSuccess: 'alert/success',
      activeBudgetChange: 'budgets/activeBudgetChange',
      reloadInitialized: 'budgets/reloadInitialized'
    }),
    fetchAllocations () {
      this.loading = true
      allocationsService
        .listAllocations(
          this.$route.params.id,
          null,
          this.selectedRange[0],
          this.selectedRange[1],
          this.selectedCategories
        )
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.loading = false
              this.allocations = data
            })
          } else {
            this.loading = false
            this.error = true
            this.allocations = null
            response.json().then(data => {
              this.dispatchError(data.message)
            })
          }
        })
    },
    updateAllocation (allocation) {
      this.$wait.start('saving.allocation')
      allocationsService.updateAllocation(allocation)
        .then(response => {
          if (response.ok) {
            this.$wait.end('saving.allocation')
            this.reloadInitialized()
            this.fetchAllocations()
          } else {
            response.json().then(data => {
              this.$wait.end('saving.allocation')
              this.dispatchError(data.message)
            })
          }
        })
        .catch(error => {
          this.$wait.end('saving.allocation')
          error.json().then(data => {
            this.dispatchError(data.message)
          })
        })
    },
    deleteAllocation (id) {
      this.$root
        .$confirm('general.remove', 'allocations.deleteConfirm', {
          color: 'red',
          buttons: { yes: true, no: true, cancel: false, ok: false }
        })
        .then(confirm => {
          if (confirm) {
            allocationsService.deleteAllocation(id).then(response => {
              if (response.ok) {
                this.fetchAllocations()
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
