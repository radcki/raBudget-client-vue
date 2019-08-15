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
                  <v-date-field v-model="filters.startDate" :label="$t('general.fromDate')"></v-date-field>
                </v-flex>

                <v-flex xs12 md6>
                  <v-date-field v-model="filters.endDate" :label="$t('general.toDate')"></v-date-field>
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

      <v-flex xs12 class="text-xs-right mb-1">
        <v-spacer></v-spacer>
        <v-transaction-schedule-editor v-on:save="createSchedule" :data-budget="budget">
          <template v-slot:activator="{on}">
            <v-btn color="green darken-1" v-on="on" dark>
              <v-icon left>{{mdiPlusCircleOutline}}</v-icon>
              {{$t("general.create")}}
            </v-btn>
          </template>
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
          :items="transactionSchedules"
          :loading="$wait.is('loading.*')"
          :search="search"
          must-sort
          footer-props.items-per-page-options="[15,25,50,{text: $t('general.all'), value: -1}]"
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.transactionScheduleId">
                <td>
                  <v-icon
                    class="px-2"
                    :size="40"
                    :color="typeColors[item.budgetCategory.type]"
                  >{{ $categoryIcons[item.budgetCategory.icon] }}</v-icon>
                  {{ item.budgetCategory.name }}
                </td>
                <td>{{ item.startDate | moment("dddd, D.MM.YYYY") }}</td>
                <td>{{ item.endDate | moment("dddd, D.MM.YYYY") }}</td>
                <td>
                  <span v-if="item.frequency > 0">{{$t('general.every')}} {{ item.periodStep }}:</span>
                  {{ $t(occurrenceFrequencies.find(v=>v.value==item.frequency).text) }}
                </td>
                <td>{{ item.description }}</td>

                <td>{{ item.amount | currency($currencies[budget.currency]) }}</td>
                <td>
                  <v-transaction-schedule-editor
                    v-on:save="updateSchedule"
                    :value="item"
                    :data-budget="budget"
                  >
                    <template v-slot:activator="{on}">
                      <v-btn color="primary" v-on="on" dark icon text>
                        <v-icon>{{mdiPencil}}</v-icon>
                      </v-btn>
                    </template>
                  </v-transaction-schedule-editor>

                  <v-btn
                    color="red darken-1"
                    dark
                    icon
                    text
                    @click="deleteSchedule(item.transactionScheduleId)"
                  >
                    <v-icon>{{mdiTrashCan}}</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>

        <v-list v-if="!$vuetify.breakpoint.smAndUp" dense subheader>
          <template v-for="(transaction, index) in transactionSchedules">
            <v-list-item :key="transaction.transactionScheduleId + '.' + index" class="pb-1">
              <v-list-item-avatar>
                <v-icon
                  :color="typeColors[transaction.budgetCategory.type]"
                >{{ $categoryIcons[transaction.budgetCategory.icon] }}</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ transaction.description}} -
                  <span
                    class="grey--text text--darken-1 caption"
                  >{{$t('transactionSchedules.start')}}: {{transaction.startDate | moment("D.MM.YYYY")}}</span>
                </v-list-item-title>

                <v-list-item-subtitle class="text--primary">
                  {{transaction.amount | currency($currencies[budget.currency])}}
                  <span
                    class="grey--text text--lighten-1 caption"
                  >
                    -
                    <span
                      v-if="transaction.frequency > 0"
                    >{{$t('general.every')}} {{ transaction.periodStep }}:</span>
                    {{ $t(occurrenceFrequencies.find(v=>v.value==transaction.frequency).text) }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-transaction-schedule-editor
                  v-on:save="updateSchedule"
                  :value="transaction"
                  :data-budget="budget"
                >
                  <template v-slot:activator="{on}">
                    <v-icon color="primary" v-on="on">{{mdiPencil}}</v-icon>
                  </template>
                </v-transaction-schedule-editor>
              </v-list-item-action>
              <v-list-item-action>
                <v-icon
                  color="red darken-1"
                  @click="deleteSchedule(transaction.transactionScheduleId)"
                >{{mdiTrashCan}}</v-icon>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { transactionSchedulesService } from "../_services/transactionSchedules.service";
import { mapState, mapActions } from "vuex";
import {
  mdiPlusCircleOutline,
  mdiPencil,
  mdiTrashCan,
  mdiMagnify
} from "@mdi/js";

export default {
  name: "TransactionSchedules",
  components: {
    "v-transaction-schedule-editor": () =>
      import("./TransactionScheduleEditor.vue"),
    "v-date-field": () => import("../components/DateField.vue")
  },
  data() {
    return {
      requiredRule: [v => !!v || this.$t("forms.requiredField")],
      filters: {
        startDate: null,
        endDate: null
      },
      transactionSchedules: [],

      search: null,
      startDateMenu: false,
      endDateMenu: false,
      typeColors: {
        0: "amber darken-1",
        1: "green darken-1",
        2: "blue darken-1"
      },
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
      ],
      mdiPlusCircleOutline,
      mdiPencil,
      mdiTrashCan,
      mdiMagnify
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
            this.reloadInitialized();
          } else {
            response.json().then(data => {
              this.$wait.end("saving.transactionSchedules");
              this.dispatchError(data.message);
            });
          }
        })
        .catch(error => {
          this.$wait.end("saving.transactionSchedules");
          error.json().then(data => {
            this.dispatchError(data.message);
          });
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
            this.reloadInitialized();
          } else {
            response.json().then(data => {
              this.$wait.end("saving.transactionSchedules");
              this.dispatchError(data.message);
            });
          }
        })
        .catch(error => {
          this.$wait.end("saving.transactionSchedules");
          error.json().then(data => {
            this.dispatchError(data.message);
          });
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
                  this.reloadInitialized();
                } else {
                  response.json().then(data => {
                    this.dispatchError(data.message);
                  });
                }
              })
              .catch(error => {
                this.$wait.end("saving.transactionSchedules");
                error.json().then(data => {
                  this.dispatchError(data.message);
                });
              });
          }
        });
    }
  }
};
</script>