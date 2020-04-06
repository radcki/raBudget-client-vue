<template>
  <div>
    <template v-if="!dialog">
      <v-card color="cardBackground">
        <v-card-title :class="`pa-1 pb-0 ${color[tab]}`">
          <v-tabs slot="extension" v-model="tab" show-arrows :background-color="color[tab]" grow>
            <v-tabs-slider></v-tabs-slider>
            <v-tab class="subheading white--text" ripple>{{ $t('general.spending') }}</v-tab>
            <v-tab class="subheading white--text" ripple>{{ $t('general.income') }}</v-tab>
            <v-tab class="subheading white--text" ripple>{{ $t('general.saving') }}</v-tab>
            <v-tab class="subheading white--text" ripple>{{ $t('general.allocation') }}</v-tab>
          </v-tabs>
        </v-card-title>
        <v-card-text>
          <v-form ref="editorForm" v-model="valid" lazy-validation>
            <v-container grid-list-md>
              <v-layout row wrap align-center justify-center>
                <v-flex xs5>
                  <v-date-field
                    v-model="editor.date"
                    :rules="requiredRule"
                    :label="$t('transactions.date')"
                  ></v-date-field>
                </v-flex>
                <v-flex v-if="dataBudget" xs7>
                  <v-category-select
                    v-model="editor.category"
                    :items="dataBudget.budgetCategories.filter(v => v.type == selectedType)"
                    :label="$t('general.category')"
                    :rules="requiredRule"
                  ></v-category-select>
                </v-flex>

                <v-flex xs5>
                  <v-text-field
                    v-model="editor.description"
                    :rules="requiredRule"
                    :label="$t('general.description')"
                  ></v-text-field>
                </v-flex>

                <v-flex v-if="tab == 3" xs7>
                  <v-category-select
                    v-model="editor.sourceCategory"
                    :items="dataBudget.budgetCategories.filter(v => v.type == selectedType)"
                    :label="$t('categories.sourceCategory')"
                  ></v-category-select>
                </v-flex>

                <v-flex xs7>
                  <v-text-field
                    v-model="editor.amount"
                    :rules="requiredRule"
                    :label="$t('general.amount')"
                    type="number"
                    step="0.01"
                  ></v-text-field>
                </v-flex>
                <v-flex v-if="tab != 3" xs12>
                  <v-checkbox
                    v-model="createSchedule"
                    hide-details
                    :disabled="addScheduleDisabled"
                    :label="$t('transactionSchedules.create')"
                  ></v-checkbox>
                </v-flex>
                <v-flex v-if="createSchedule == true && tab != 3" xs12 align-self-end>
                  <v-layout row align-end>
                    <v-flex>{{ $t('general.every') }}</v-flex>
                    <v-flex>
                      <v-text-field
                        v-model="editor.periodStep"
                        hide-details
                        type="number"
                        :rules="createSchedule == true ? requiredRule : []"
                        min="1"
                        step="1"
                      ></v-text-field>
                    </v-flex>
                    <v-flex>
                      <v-select
                        v-model="editor.frequency"
                        hide-details
                        :rules="createSchedule == true ? requiredRule : []"
                        :items="occurrenceFrequencies"
                      >
                        <template v-slot:selection="{ item }">{{ $t(item.text) }}</template>
                        <template v-slot:item="{ item }">{{ $t(item.text) }}</template>
                      </v-select>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex v-if="createSchedule == true && tab != 3" xs12>
                  <v-date-field
                    v-model="editor.endDate"
                    :label="$t('transactionSchedules.endDate')"
                    hide-details
                    clearable
                  ></v-date-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="color[tab]" text dark @click="resetForm">{{ $t('general.reset') }}</v-btn>
          <v-btn v-if="tab != 3" :color="color[tab]" dark @click="createTransaction">{{
            $t('general.add')
          }}</v-btn>
          <v-btn v-if="tab == 3" :color="color[tab]" dark @click="createAllocation">{{
            $t('general.add')
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </template>

    <v-dialog
      v-if="dialog"
      v-model="editorDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>

      <v-card>
        <v-toolbar :color="color[tab]" fixed dark tabs>
          <v-btn icon dark @click="editorDialog = false">
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
          <v-toolbar-title>{{ $t('transactions.newtransaction') }}</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-btn v-if="tab != 3" dark text @click="createTransaction">{{
            $t('general.add')
          }}</v-btn>
          <v-btn v-if="tab == 3" dark text @click="createAllocation">{{ $t('general.add') }}</v-btn>
          <v-tabs slot="extension" v-model="tab" :background-color="color[tab]" grow>
            <v-tabs-slider></v-tabs-slider>
            <v-tab class="white--text" ripple>Wydatki</v-tab>
            <v-tab class="white--text" ripple>Wpływy</v-tab>
            <v-tab class="white--text" ripple>Oszczędzności</v-tab>
            <v-tab class="white--text" ripple>Alokacje</v-tab>
          </v-tabs>
        </v-toolbar>
        <v-form ref="editorForm" v-model="valid" class="px-2" lazy-validation>
          <v-container>
            <v-layout row wrap align-center justify-center>
              <v-flex xs12 class="mt-5"></v-flex>
              <v-flex xs12 class="mt-5">
                <v-date-field v-model="editor.date" :label="$t('transactions.date')"></v-date-field>
              </v-flex>
              <v-flex v-if="dataBudget" xs12>
                <v-category-select
                  v-model="editor.category"
                  :items="dataBudget.budgetCategories.filter(v => v.type == selectedType)"
                  :label="$t('general.category')"
                  :rules="requiredRule"
                ></v-category-select>
              </v-flex>

              <v-flex v-if="tab == 3 && dataBudget" xs12>
                <v-category-select
                  v-model="editor.sourceCategory"
                  :items="dataBudget.budgetCategories.filter(v => v.type == selectedType)"
                  :label="$t('general.category')"
                  clearable
                ></v-category-select>
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="editor.description"
                  :rules="requiredRule"
                  :label="$t('general.description')"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="editor.amount"
                  :rules="requiredRule"
                  :label="$t('general.amount')"
                  type="number"
                  step="0.01"
                ></v-text-field>
              </v-flex>
              <v-flex v-if="tab != 3" xs12>
                <v-checkbox
                  v-model="createSchedule"
                  hide-details
                  :disabled="addScheduleDisabled"
                  :label="$t('transactionSchedules.create')"
                ></v-checkbox>
              </v-flex>
              <v-flex v-if="createSchedule == true && tab != 3" xs12 align-self-end>
                <v-layout row align-end>
                  <v-flex>{{ $t('general.every') }}</v-flex>
                  <v-flex>
                    <v-text-field
                      v-model="editor.periodStep"
                      hide-details
                      type="number"
                      :rules="createSchedule == true ? requiredRule : []"
                      min="1"
                      step="1"
                    ></v-text-field>
                  </v-flex>
                  <v-flex>
                    <v-select
                      v-model="editor.frequency"
                      hide-details
                      :rules="createSchedule == true ? requiredRule : []"
                      :items="occurrenceFrequencies"
                    >
                      <template slot="selection" slot-scope="{ item }">{{
                        $t(item.text)
                      }}</template>
                      <template slot="item" slot-scope="data">{{ $t(data.item.text) }}</template>
                    </v-select>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex v-if="createSchedule == true && tab != 3" xs12>
                <v-date-field
                  v-model="editor.endDate"
                  :label="$t('transactionSchedules.endDate')"
                  hide-details
                  clearable
                ></v-date-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { transactionsService } from '@/_services/transactions.service';
import { allocationsService } from '@/_services/allocations.service';
import { transactionSchedulesService } from '@/_services/transactionSchedules.service';

import { eCategoryType } from '@/typings/enums/eCategoryType';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Transaction } from '@/typings/Transaction';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { TransactionSchedule } from '@/typings/TransactionSchedule';
import { eFrequency } from '@/typings/enums/eFrequency';
import { Allocation } from '@/typings/Allocation';
import { ErrorMessage } from '@/typings/TypedResponse';
import { mdiClose } from '@mdi/js';
import { Budget } from '@/typings/Budget';

interface EntryEditor {
  category: BudgetCategory | null;
  sourceCategory?: BudgetCategory | null;
  date: Date;
  description: string;
  amount: number | null;
  endDate: Date | null;
  frequency: eFrequency;
  periodStep: number;
  transactionScheduleId?: number | null;
}

const transactionsModule = namespace('transactions');
const alertModule = namespace('alert');
@Component({
  components: {
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'v-date-field': () => import('@/components/DateField.vue'),
  },
})
export default class NewEntry extends Vue {
  @Prop(Boolean) readonly dialog!: boolean;
  @Prop(Object) readonly dataBudget!: Budget;
  @Prop(Object) readonly inputData!: any;

  editorDialog = false;
  valid = false;
  createSchedule = false;
  addScheduleDisabled = false;
  tab = 0;
  color: string[] = ['spending', 'income', 'saving', 'allocation'];

  occurrenceFrequencies: any[] = [
    { value: 1, text: 'transactionSchedules.day' },
    { value: 2, text: 'transactionSchedules.week' },
    { value: 3, text: 'transactionSchedules.month' },
  ];

  requiredRule: ((v) => boolean | string)[] = [];

  mdiClose = mdiClose;

  editor: EntryEditor = {
    category: null,
    sourceCategory: null,
    date: this.getDate(),
    description: '',
    amount: null,
    endDate: null,
    frequency: 3,
    periodStep: 1,
  };

  get selectedType() {
    return this.tab == 0 || this.tab == 3
      ? eCategoryType.Spending
      : this.tab == 1
      ? eCategoryType.Income
      : eCategoryType.Saving;
  }

  @Watch('tab')
  OnTabChange() {
    (this.$refs.editorForm as Vue & { resetValidation: () => any }).resetValidation();
  }

  @Watch('selectedType')
  OnSelectedTypeChange() {
    if (
      this.editor.category &&
      this.editor.category.type != this.tab &&
      this.tab == 3 &&
      this.editor.category.type != 0
    ) {
      this.editor.category = null;
    }
  }

  @Watch('editorDialog')
  OnEditorDialog(open) {
    if (open) {
      this.$wait.start('dialog');
      this.resetForm();
    } else {
      this.$wait.end('dialog');
    }
  }

  @Watch('inputData')
  OnInputDataChange(data) {
    if (!data) {
      return;
    }
    this.editor = { ...Object.assign({}, data) };
    this.editor.date = new Date(this.editor.date || data.transactionDate);
    if (data.budgetCategoryId) {
      this.editor.category =
        this.dataBudget.budgetCategories.find(v => v.budgetCategoryId == data.budgetCategoryId) ||
        null;
    } else {
      this.editor.category = data.category;
    }
    this.tab = this.editor.category ? this.editor.category.type - 1 : this.tab;
    this.createSchedule = false;
    this.addScheduleDisabled = true;
  }

  beforeDestroy() {
    this.$wait.end('dialog');
  }

  mounted() {
    this.$root.$on('closeDialogs', () => {
      this.editorDialog = false;
    });
    this.requiredRule.push(v => !!v || this.$t('forms.requiredField').toString());
  }

  @transactionsModule.Action('loadTransactionToStore') loadTransactionToStore;
  @alertModule.Action('error') dispatchError;

  get editorForm() {
    return this.$refs.editorForm as Vue & { validate: () => boolean };
  }

  getDate() {
    return new Date();
  }

  async createTransaction() {
    if (
      this.editorForm.validate() &&
      this.editor.category &&
      this.editor.category.budgetCategoryId
    ) {
      const transaction: Transaction = {
        transactionId: undefined,
        amount: this.editor.amount || 0,
        description: this.editor.description,
        budgetCategoryId: this.editor.category.budgetCategoryId,
        transactionDate: this.editor.date,
      };

      if (this.createSchedule && !this.editor.transactionScheduleId) {
        this.createTransactionSchedule(this.editor);
      }
      const response = await transactionsService.createTransaction(
        this.dataBudget.budgetId,
        transaction,
      );

      if (response.ok) {
        this.$emit('saved');
        this.editorDialog = false;
        this.loadTransactionToStore(transaction);
        this.resetForm();
      } else {
        const error = await response.json<ErrorMessage>();
        this.dispatchError(error.message);
      }
    }
  }

  createTransactionSchedule(data: EntryEditor) {
    this.$wait.start('saving.transactionSchedules');
    if (this.editorForm.validate() && data.category && data.category.budgetCategoryId) {
      const schedule: TransactionSchedule = {
        amount: data.amount || 0,
        description: data.description,
        budgetCategoryId: data.category.budgetCategoryId,
        frequency: data.frequency,
        startDate: data.date,
        periodStep: data.periodStep,
      };
      transactionSchedulesService
        .createTransactionSchedule(this.dataBudget.budgetId, schedule)
        .then(response => {
          if (response.ok) {
            this.$wait.end('saving.transactionSchedules');
          } else {
            response.json().then(data => {
              this.$wait.end('saving.transactionSchedules');
              this.dispatchError(data.message);
            });
          }
        });
    }
  }

  async createAllocation() {
    if (
      this.editorForm.validate() &&
      this.editor.category &&
      this.editor.category.budgetCategoryId
    ) {
      const allocation: Allocation = {
        amount: this.editor.amount || 0,
        description: this.editor.description,
        targetBudgetCategoryId: this.editor.category.budgetCategoryId,
        sourceBudgetCategoryId: this.editor.sourceCategory
          ? this.editor.sourceCategory.budgetCategoryId
          : null,
        allocationDate: this.editor.date,
      };
      const response = await allocationsService.createAllocation(
        this.dataBudget.budgetId,
        allocation,
      );
      if (response.ok) {
        this.$emit('saved');
        this.editorDialog = false;
        this.resetForm();
      } else {
        response.json<ErrorMessage>().then(data => {
          this.dispatchError(data.message);
        });
      }
    }
  }

  resetForm() {
    this.editor = {
      category: null,
      sourceCategory: null,
      date: this.getDate(),
      description: '',
      amount: null,
      endDate: null,
      frequency: 3,
      periodStep: 1,
    };
    this.createSchedule = false;
    this.addScheduleDisabled = false;
    if (this.$refs.editorForm) {
      (this.$refs.editorForm as Vue & { resetValidation: () => any }).resetValidation();
    }
  }
}
</script>
