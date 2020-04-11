<template>
  <v-container v-if="budget" grid-list-md>
    <v-layout row wrap align-center justify-center>
      <v-flex xs12>
        <v-subheader class="headline">
          {{ $t('transactionSchedules.transactionSchedules') }}
        </v-subheader>
      </v-flex>

      <v-flex xs12 class="mb-4">
        <v-card class="px-3" color="cardBackground">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 md6>
                  <v-date-field
                    v-model="filters.startDate"
                    :label="$t('general.fromDate')"
                  ></v-date-field>
                </v-flex>

                <v-flex xs12 md6>
                  <v-date-field
                    v-model="filters.endDate"
                    :label="$t('general.toDate')"
                  ></v-date-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="fetchTransactionSchedules()">
              {{ $t('general.search') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex v-if="transactionSchedules || $wait.is('loading.*')" xs12>
        <v-subheader class="headline">{{ $t('general.foundData') }}</v-subheader>
      </v-flex>

      <v-flex xs12 class="text-xs-right mb-1">
        <v-spacer></v-spacer>
        <v-transaction-schedule-editor :data-budget="budget" @save="createSchedule">
          <template v-slot:activator="{ on }">
            <v-btn color="green darken-1" dark v-on="on">
              <v-icon left>{{ mdiPlusCircleOutline }}</v-icon>
              {{ $t('general.create') }}
            </v-btn>
          </template>
        </v-transaction-schedule-editor>
      </v-flex>

      <v-flex
        v-if="$wait.is('loading.*') && !$vuetify.breakpoint.smAndUp"
        xs12
        class="text-xs-center"
      >
        <v-progress-circular
          :size="70"
          :width="7"
          color="amber darken-3"
          indeterminate
        ></v-progress-circular>
      </v-flex>

      <v-flex v-if="transactionSchedules" xs12 class="elevation-1 cardBackground">
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
          class="cardBackground"
          footer-props.items-per-page-options="[15,25,50,{text: $t('general.all'), value: -1}]"
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.transactionScheduleId">
                <td>
                  <v-icon
                    class="px-2"
                    :size="40"
                    :color="$categoryColor[getCategoryById(item.budgetCategoryId).type]"
                    >{{ $categoryIcons[getCategoryById(item.budgetCategoryId).icon] }}</v-icon
                  >
                  {{ getCategoryById(item.budgetCategoryId).name }}
                </td>
                <td>{{ item.startDate | dateFormat('EEEE, d.MM.yyyy', $dateLocales[$locale]) }}</td>
                <td>{{ item.endDate | dateFormat('EEEE, d.MM.yyyy', $dateLocales[$locale]) }}</td>
                <td>
                  <span v-if="item.frequency > 0"
                    >{{ $t('general.every') }} {{ item.periodStep }}:</span
                  >
                  {{ $t(occurrenceFrequencies.find(v => v.value == item.frequency).text) }}
                </td>
                <td>{{ item.description }}</td>

                <td>{{ item.amount | currency($currencyConfig(budget)) }}</td>
                <td>
                  <v-transaction-schedule-editor
                    :value="item"
                    :data-budget="budget"
                    @save="updateSchedule"
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" dark icon text v-on="on">
                        <v-icon>{{ mdiPencil }}</v-icon>
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
                    <v-icon>{{ mdiTrashCan }}</v-icon>
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
                <v-icon :color="typeColors[transaction.budgetCategory.type]">
                  {{ $categoryIcons[transaction.budgetCategory.icon] }}
                </v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ transaction.description }} -
                  <span class="grey--text text--darken-1 caption">
                    {{ $t('transactionSchedules.start') }}:
                    {{
                      new Date(transaction.startDate)
                        | dateFormat('EEEE, d.MM.yyyy', $dateLocales[$locale])
                    }}
                  </span>
                </v-list-item-title>

                <v-list-item-subtitle class="text--primary">
                  {{ transaction.amount | currency($currencyConfig(budget)) }}
                  <span class="grey--text text--lighten-1 caption">
                    -
                    <span v-if="transaction.frequency > 0"
                      >{{ $t('general.every') }} {{ transaction.periodStep }}:</span
                    >
                    {{ $t(occurrenceFrequencies.find(v => v.value == transaction.frequency).text) }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-transaction-schedule-editor
                  :value="transaction"
                  :data-budget="budget"
                  @save="updateSchedule"
                >
                  <template v-slot:activator="{ on }">
                    <v-icon color="primary" v-on="on">{{ mdiPencil }}</v-icon>
                  </template>
                </v-transaction-schedule-editor>
              </v-list-item-action>
              <v-list-item-action>
                <v-icon
                  color="red darken-1"
                  @click="deleteSchedule(transaction.transactionScheduleId)"
                  >{{ mdiTrashCan }}</v-icon
                >
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { transactionSchedulesService } from '@/_services/transactionSchedules.service';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { mdiPlusCircleOutline, mdiPencil, mdiTrashCan, mdiMagnify } from '@mdi/js';
import { Budget } from '@/typings/Budget';
import { TransactionSchedule } from '@/typings/TransactionSchedule';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { ErrorMessage } from '@/typings/TypedResponse';
import { CreateTransactionScheduleCommand } from '../../typings/api/transactionSchedule/CreateTransactionSchedule';
import { UpdateTransactionScheduleCommand } from '../../typings/api/transactionSchedule/UpdateTransactionSchedule';

interface Filters {
  startDate: Date | null;
  endDate: Date | null;
}

const budgetsModule = namespace('budgets');
const alertModule = namespace('alert');
@Component({
  components: {
    'v-transaction-schedule-editor': () => import('./TransactionScheduleEditor.vue'),
    'v-date-field': () => import('@/components/DateField.vue'),
  },
})
export default class TransactionSchedules extends Vue {
  requiredRule: ((v: string) => boolean | string)[] = [];
  filters: Filters = {
    startDate: null,
    endDate: null,
  };

  transactionSchedules: TransactionSchedule[] = [];

  search = null;
  startDateMenu = false;
  endDateMenu = false;
  typeColors = {
    0: 'amber darken-1',
    1: 'green darken-1',
    2: 'blue darken-1',
  };
  occurrenceFrequencies = [
    { value: 0, text: 'transactionSchedules.once' },
    { value: 1, text: 'transactionSchedules.day' },
    { value: 2, text: 'transactionSchedules.week' },
    { value: 3, text: 'transactionSchedules.month' },
  ];
  headers: { text: string; value?: string; sortable: boolean }[] = [];

  mdiPlusCircleOutline = mdiPlusCircleOutline;
  mdiPencil = mdiPencil;
  mdiTrashCan = mdiTrashCan;
  mdiMagnify = mdiMagnify;

  @Watch('$route')
  OnRouteChange(to, from) {
    if (from.params.id != to.params.id) {
      this.activeBudgetChange(to.params.id);
      this.reloadInitialized();
    }
  }

  @Watch('budget')
  OnBudgetChange() {
    this.fetchTransactionSchedules();
  }

  @budgetsModule.Action('reloadInitialized') reloadInitialized;
  @alertModule.Action('error') dispatchError;
  @alertModule.Action('success') dispatchSuccess;
  @budgetsModule.Action('activeBudgetChange') activeBudgetChange;
  @budgetsModule.Action('initializeBudgets') initializeBudgets;
  @budgetsModule.Getter('budget') budget?: Budget;

  mounted() {
    this.requiredRule = [v => !!v || this.$t('forms.requiredField').toString()];
    this.headers = [
      {
        text: this.$t('general.category').toString(),
        sortable: true,
        value: 'category',
      },
      {
        text: this.$t('general.fromDate').toString(),
        sortable: true,
        value: 'startDate',
      },
      {
        text: this.$t('general.toDate').toString(),
        sortable: true,
        value: 'endDate',
      },
      {
        text: this.$t('transactionSchedules.frequency').toString(),
        sortable: true,
        value: 'frequency',
      },
      {
        text: this.$t('general.description').toString(),
        sortable: true,
        value: 'description',
      },
      {
        text: this.$t('general.amount').toString(),
        sortable: true,
        value: 'amount',
      },
      {
        text: this.$t('general.actions').toString(),
        sortable: false,
      },
    ];
    this.activeBudgetChange(this.$route.params.id);
    setTimeout(() => {
      this.initializeBudgets();
    }, 300);
    this.initializeBudgets();
    if (this.budget) {
      this.fetchTransactionSchedules();
    }
  }

  async fetchTransactionSchedules() {
    if (!this.budget) {
      return;
    }
    const startDate = this.filters.startDate || this.budget.startingDate;

    this.$wait.start('loading.transactionSchedules');
    const response = await transactionSchedulesService.listTransactionSchedules(
      this.budget.budgetId,
      startDate,
      this.filters.endDate,
    );

    if (response.ok) {
      const data = (await response.json()) as TransactionSchedule[];
      this.$wait.end('loading.transactionSchedules');
      this.transactionSchedules = data.map(v => {
        v.startDate = new Date(v.startDate);
        v.endDate = v.endDate ? new Date(v.endDate) : v.endDate;
        return v;
      });
    } else {
      response.json<ErrorMessage>().then(data => {
        this.$wait.end('loading.transactionSchedules');
        this.dispatchError(data.message);
      });
    }
  }

  createSchedule(scheduleData: CreateTransactionScheduleCommand) {
    if (!this.budget) {
      return;
    }
    this.$wait.start('saving.transactionSchedules');
    transactionSchedulesService
      .createTransactionSchedule(this.budget.budgetId, scheduleData)
      .then(response => {
        if (response.ok) {
          this.$wait.end('saving.transactionSchedules');
          this.fetchTransactionSchedules();
          this.reloadInitialized();
        } else {
          response.json().then(data => {
            this.$wait.end('saving.transactionSchedules');
            this.dispatchError(data.message);
          });
        }
      })
      .catch(error => {
        this.$wait.end('saving.transactionSchedules');
        error.json().then(data => {
          this.dispatchError(data.message);
        });
      });
  }

  updateSchedule(scheduleData: UpdateTransactionScheduleCommand) {
    if (!this.budget) {
      return;
    }
    this.$wait.start('saving.transactionSchedules');
    transactionSchedulesService
      .updateTransactionSchedule(this.budget.budgetId, scheduleData)
      .then(response => {
        if (response.ok) {
          this.$wait.end('saving.transactionSchedules');
          this.fetchTransactionSchedules();
          this.reloadInitialized();
        } else {
          response.json().then(data => {
            this.$wait.end('saving.transactionSchedules');
            this.dispatchError(data.message);
          });
        }
      })
      .catch(error => {
        this.$wait.end('saving.transactionSchedules');
        error.json().then(data => {
          this.dispatchError(data.message);
        });
      });
  }

  getCategoryById(budgetCategoryId: number): BudgetCategory | null {
    return this.budget
      ? this.budget.budgetCategories.find(v => v.budgetCategoryId == budgetCategoryId) || null
      : null;
  }

  deleteSchedule(scheduleId) {
    if (!this.budget) {
      return;
    }
    this.$confirm({
      title: 'general.remove',
      message: 'transactionSchedules.deleteConfirm',
      options: {
        color: 'red',
        buttons: { yes: true, no: true, cancel: false, ok: false },
      },
    }).then(confirm => {
      if (!this.budget) {
        return;
      }
      if (confirm) {
        transactionSchedulesService
          .deleteTransactionSchedule(this.budget.budgetId, scheduleId)
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
            this.$wait.end('saving.transactionSchedules');
            error.json().then(data => {
              this.dispatchError(data.message);
            });
          });
      }
    });
  }
}
</script>
