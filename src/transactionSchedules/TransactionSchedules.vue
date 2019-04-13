<template>
  <v-container grid-list-md v-if="budget">
    <v-layout row wrap align-center justify-center>
      <v-flex xs12>
        <v-subheader class="headline">{{ $t('transactionSchedules.transactionSchedules') }}</v-subheader>
      </v-flex>

      <v-flex xs12 class="mb-4">
        <v-card class="px-3">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 md6>
                  <v-menu
                    ref="startDateMenu"
                    :close-on-content-click="false"
                    v-model="startDateMenu"
                    :nudge-right="40"
                    :return-value.sync="filters.startDate"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                  >
                    <v-text-field
                      slot="activator"
                      v-model="filters.startDate"
                      :label="$t('general.fromDate')"
                      clearable
                      prepend-icon="event"
                      readonly
                    ></v-text-field>
                    <v-date-picker
                      v-model="filters.startDate"
                      @input="$refs.startDateMenu.save(filters.startDate)"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>

                <v-flex xs12 md6>
                  <v-menu
                    ref="endDateMenu"
                    :close-on-content-click="false"
                    v-model="endDateMenu"
                    :nudge-right="40"
                    :return-value.sync="filters.startDate"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                  >
                    <v-text-field
                      slot="activator"
                      v-model="filters.endDate"
                      :label="$t('general.toDate')"
                      clearable
                      prepend-icon="event"
                      readonly
                    ></v-text-field>
                    <v-date-picker
                      v-model="filters.endDate"
                      @input="$refs.endDateMenu.save(filters.endDate)"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="fetchTransactionSchedules()">{{ $t('general.search') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex xs12 v-if="transactionSchedules || $wait.is('loading.*')">
        <v-subheader class="headline">{{$t('general.foundData')}}</v-subheader>
      </v-flex>

      <v-flex xs12 class="text-xs-right">
        <v-spacer></v-spacer>
        <v-transaction-schedule-editor v-on:save="createSchedule" :data-budget="budget">
          <v-btn color="green darken-1" dark>
            <v-icon left>add_circle_outline</v-icon>
            {{$t("general.create")}}
          </v-btn>
        </v-transaction-schedule-editor>
      </v-flex>

      <v-flex
        xs12
        v-if="$wait.is('loading.*') && !$vuetify.breakpoint.smAndUp"
        class="text-xs-center"
      >
        <v-progress-circular :size="70" :width="7" color="amber darken-3" indeterminate></v-progress-circular>
      </v-flex>

      <v-flex xs12 class="elevation-1 white" v-if="transactionSchedules">
        <v-layout row justify-end>
          <v-flex xs4>
            <v-text-field
              v-if="$vuetify.breakpoint.smAndUp"
              v-model="search"
              append-icon="search"
              :label="$t('general.search')"
              single-line
              hide-details
            ></v-text-field>
          </v-flex>
        </v-layout>

        <v-data-table
          v-if="$vuetify.breakpoint.smAndUp"
          :headers="headers"
          :items="transactionSchedules"
          :loading="$wait.is('loading.*')"
          :search="search"
          must-sort
          disable-initial-sort
          :rows-per-page-items="[15,25,50,{text: $t('general.all'), value: -1}]"
        >
          <template slot="items" slot-scope="props">
            <td>
              <v-icon class="px-2">{{ props.item.budgetCategory.icon }}</v-icon>
              {{ props.item.budgetCategory.name }}
            </td>
            <td>{{ props.item.startDate | moment("dddd, D.MM.YYYY") }}</td>
            <td>{{ props.item.endDate | moment("dddd, D.MM.YYYY") }}</td>
            <td>
              <span
                v-if="props.item.frequency > 0"
              >{{$t('general.every')}} {{ props.item.periodStep }}:</span>
              {{ $t(occurrenceFrequencies.find(v=>v.value==props.item.frequency).text) }}
            </td>
            <td>{{ props.item.description }}</td>

            <td>{{ props.item.amount | currency($currencies[budget.currency]) }}</td>
            <td>
              <v-transaction-schedule-editor
                v-on:save="updateSchedule"
                :value="props.item"
                :data-budget="budget"
              >
                <v-btn color="primary" dark icon flat>
                  <v-icon>edit</v-icon>
                </v-btn>
              </v-transaction-schedule-editor>

              <v-btn
                color="red darken-1"
                dark
                icon
                flat
                @click="deleteSchedule(props.item.transactionScheduleId)"
              >
                <v-icon>delete</v-icon>
              </v-btn>
            </td>
          </template>
        </v-data-table>

        <v-list v-if="!$vuetify.breakpoint.smAndUp" dense subheader>
          <template v-for="(transaction, index) in transactionSchedules">
            <v-list-tile :key="index" avatar class="pb-1">
              <v-list-tile-avatar>
                <v-icon>{{ transaction.budgetCategory.icon }}</v-icon>
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title class="font-weight-medium">
                  {{ transaction.description}} - <span class="grey--text text--darken-1 caption">{{$t('transactionSchedules.start')}}: {{transaction.startDate | moment("D.MM.YYYY")}}</span>
                </v-list-tile-title>

                <v-list-tile-sub-title
                  class="text--primary"
                >{{transaction.amount | currency($currencies[budget.currency])}}
                <span class="grey--text text--lighten-1 caption">
                    -
                    <span v-if="transaction.frequency > 0">
                      {{$t('general.every')}} {{ transaction.periodStep }}:
                      </span>
                    {{ $t(occurrenceFrequencies.find(v=>v.value==transaction.frequency).text) }}
                  </span>
                </v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-menu>
                  <v-btn slot="activator" icon>
                    <v-icon>more_vert</v-icon>
                  </v-btn>
                  <v-list single-line dense light>
                    <v-list-tile>
                      <v-list-tile-avatar>
                        <v-transaction-schedule-editor
                          v-on:save="updateSchedule"
                          :value="transaction"
                          :data-budget="budget"
                        >
                          <v-btn color="primary" dark icon flat>
                            <v-icon small>edit</v-icon>
                          </v-btn>
                        </v-transaction-schedule-editor>
                      </v-list-tile-avatar>
                    </v-list-tile>
                    <v-list-tile>
                      <v-list-tile-avatar>
                        <v-btn
                          color="red darken-1"
                          dark
                          icon
                          flat
                          @click="deleteSchedule(props.item.transactionScheduleId)"
                        >
                          <v-icon>delete</v-icon>
                        </v-btn>
                      </v-list-tile-avatar>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-list-tile-action>
            </v-list-tile>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { transactionSchedulesService } from "../_services/transactionSchedules.service";
import { mapState, mapActions } from "vuex";

export default {
  name: "TransactionSchedules",
  components: {
    "v-transaction-schedule-editor": () =>
      import("./TransactionScheduleEditor.vue")
  },
  data() {
    return {
      requiredRule: [v => !!v || this.$t("forms.requiredField")],
      filters: {
        startDate: null,
        endDate: null
      },
      transactionSchedules: null,

      search: null,
      startDateMenu: false,
      endDateMenu: false,
      occurrenceFrequencies: [
        { value: 0, text: "transactionSchedules.once" },
        { value: 1, text: "transactionSchedules.day" },
        { value: 2, text: "transactionSchedules.week" },
        { value: 3, text: "transactionSchedules.month" }
      ],
      headers: [
        {
          text: this.$t("general.category"),
          sortable: true,
          value: "category"
        },
        {
          text: this.$t("general.fromDate"),
          sortable: true,
          value: "startDate"
        },
        {
          text: this.$t("general.toDate"),
          sortable: true,
          value: "endDate"
        },
        {
          text: this.$t("transactionSchedules.frequency"),
          sortable: true,
          value: "frequency"
        },
        {
          text: this.$t("general.description"),
          sortable: true,
          value: "description"
        },
        {
          text: this.$t("general.amount"),
          sortable: true,
          value: "amount"
        },
        {
          text: this.$t("general.actions"),
          sortable: false
        }
      ]
    };
  },
  computed: {
    ...mapState({
      budgets: state => state.budgets.budgets
    }),
    budget() {
      return this.budgets.find(v => v.id == this.$route.params.id);
    }
  },
  mounted: function() {
    this.activeBudgetChange(this.$route.params.id);
    setTimeout(() => {
      this.initializeBudgets();
    }, 300);
    this.initializeBudgets();
    if (this.budget) {
      this.fetchTransactionSchedules();
    }
  },
  watch: {
    $route(to, from) {
      if (from.params.id != to.params.id) {
        this.activeBudgetChange(to.params.id);
        this.reloadInitialized();
      }
    },
    budget: function(budget) {
      this.fetchTransactionSchedules();
    }
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success",
      reloadInitialized: "budgets/reloadInitialized",
      initializeBudgets: "budgets/initializeBudgets",
      activeBudgetChange: "budgets/activeBudgetChange"
    }),

    fetchTransactionSchedules() {
      var startDate =
        this.filters.startDate || this.budget.startingDate + "-01";

      this.$wait.start("loading.transactionSchedules");
      transactionSchedulesService
        .listTransactionSchedules(
          this.budget.id,
          startDate,
          this.filters.endDate
        )
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.$wait.end("loading.transactionSchedules");
              this.transactionSchedules = data;
            });
          } else {
            response.json().then(data => {
              this.$wait.end("loading.transactionSchedules");
              this.dispatchError(data.message);
            });
          }
        });
    },
    createSchedule: function(scheduleData) {
      this.$wait.start("saving.transactionSchedules");
      transactionSchedulesService
        .createTransactionSchedule(scheduleData)
        .then(response => {
          if (response.ok) {
            this.$wait.end("saving.transactionSchedules");
            this.fetchTransactionSchedules();
          } else {
            response.json().then(data => {
              this.$wait.end("saving.transactionSchedules");
              this.dispatchError(data.message);
            });
          }
        });
    },
    updateSchedule: function(scheduleData) {
      this.$wait.start("saving.transactionSchedules");
      transactionSchedulesService
        .updateTransactionSchedule(scheduleData)
        .then(response => {
          if (response.ok) {
            this.$wait.end("saving.transactionSchedules");
            this.fetchTransactionSchedules();
          } else {
            response.json().then(data => {
              this.$wait.end("saving.transactionSchedules");
              this.dispatchError(data.message);
            });
          }
        });
    },
    deleteSchedule: function(scheduleId) {
      this.$root
        .$confirm("general.remove", "transactionSchedules.deleteConfirm", {
          color: "red",
          buttons: { yes: true, no: true, cancel: false, ok: false }
        })
        .then(confirm => {
          if (confirm) {
            transactionSchedulesService
              .deleteTransactionSchedule(scheduleId, false)
              .then(response => {
                if (response.ok) {
                  this.fetchTransactionSchedules();
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