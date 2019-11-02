<template>
  <v-dialog
    width="600"
    v-model="dialog"
    :fullscreen="mobile"
    :transition="mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <v-card>
      <v-toolbar color="primary" dark dense :fixed="mobile">
        <v-btn v-if="mobile" icon text dark @click="dialog = false">
          <v-icon>{{mdiClose}}</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">{{ $t("transactionSchedules.editing") }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="!mobile" text icon @click="dialog = false">
          <v-icon light>{{mdiClose}}</v-icon>
        </v-btn>
        <v-btn v-if="mobile" text @click.native="save">{{ $t('general.save') }}</v-btn>
      </v-toolbar>

      <v-card-text>
        <v-form ref="editor">
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex :xs2="!mobile" :xs4="mobile"></v-flex>
              <v-flex xs12>
                <v-select
                  :disabled="!!editor.transactionScheduleId"
                  v-model="categoryType"
                  :items="categoryTypes"
                  :label="$t('categories.categoryType')"
                >
                  <template slot="item" slot-scope="data">{{$t(data.item.text)}}</template>

                  <template slot="selection" slot-scope="{ item }">{{$t(item.text)}}</template>
                </v-select>
              </v-flex>
              <v-flex xs12 md5>
                <v-category-select
                  :disabled="!!editor.transactionScheduleId"
                  :items="categories.filter(v=>v.type == categoryType)"
                  :label="$t('general.category')"
                  :rules="requiredRule"
                  v-model="editor.budgetCategory"
                ></v-category-select>
              </v-flex>

              <v-flex xs12 md7>
                <v-text-field
                  v-model="editor.description"
                  :rules="requiredRule"
                  :label="$t('general.description')"
                ></v-text-field>
              </v-flex>
              <v-flex xs6>
                <v-date-field
                  :rules="requiredRule"
                  v-model="editor.startDate"
                  :label="$t('transactionSchedules.startDate')"
                ></v-date-field>
              </v-flex>
              <v-flex xs6>
                <v-date-field v-model="editor.endDate" :label="$t('transactionSchedules.endDate')"></v-date-field>
              </v-flex>
              <v-flex xs6>
                <v-radio-group v-model="frequencyCombo" hide-details>
                  <v-radio :label="$t('transactionSchedules.once')" :value="eFrequencyCombo.Once"></v-radio>
                  <v-radio :label="$t('transactionSchedules.periodic')" :value="eFrequencyCombo.Periodic"></v-radio>
                </v-radio-group>
              </v-flex>
              <v-flex xs12 md6 align-self-end>
                <v-layout row align-end>
                  <v-flex xs>{{$t("general.every")}}</v-flex>
                  <v-flex xs>
                    <v-text-field
                      hide-details
                      :disabled="frequencyCombo == 'once'"
                      type="number"
                      :rules="frequencyCombo != 'once' ? requiredRule : []"
                      min="1"
                      step="1"
                      v-model="editor.periodStep"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs>
                    <v-select
                      hide-details
                      :disabled="frequencyCombo == 'once'"
                      :rules="frequencyCombo != 'once' ? requiredRule : []"
                      v-model="editor.frequency"
                      :items="occurrenceFrequencies"
                    >
                      <template slot="selection" slot-scope="{item}">{{ $t(item.text) }}</template>
                      <template slot="item" slot-scope="data">{{ $t(data.item.text) }}</template>
                    </v-select>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="editor.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  :label="$t('transactions.baseAmount')"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
        <span class="subheading">{{ $t("transactionSchedules.totalAmount") }}:</span>
        <span class="headline">{{totalAmount | currency($currencyConfig(budget))}}</span>
        <span
          v-if="editor.amount > 0 && editor.frequency > 0 && !editor.endDate"
          class="subheading"
        >({{$t("transactionSchedules.anually")}})</span>
      </v-card-text>

      <v-card-actions v-if="!mobile">
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="dialog = false">{{$t('general.cancel')}}</v-btn>
        <v-btn color="primary" text @click="save">{{$t('general.save')}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { mdiClose } from "@mdi/js";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Action, namespace } from "vuex-class";
import { Transaction } from "@/typings/Transaction";
import { Budget } from "@/typings/Budget";
import { BudgetCategory } from "@/typings/BudgetCategory";
import { eCategoryType } from "@/typings/enums/eCategoryType";
import { eFrequency } from "@/typings/enums/eFrequency";
import { TransactionSchedule } from "../typings/TransactionSchedule";
import { differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

enum eFrequencyCombo {
  Once,
  Periodic
}

interface EntryEditor {
  budgetCategory: BudgetCategory,
  budgetCategoryId: number,
  description: string | null,
  amount: number | null,
  startDate: Date,
  endDate?: Date | null,
  frequency: eFrequency,
  periodStep: number,
  transactionScheduleId?: number | null,
}

@Component({
  components: {
    "v-category-select": () => import("../components/CategorySelect.vue"),
    "v-date-field": () => import("../components/DateField.vue")
  }
})
export default class TransactionScheduleEditor extends Vue {
  @Prop(Object) value: TransactionSchedule;
  @Prop(Object) dataBudget: Budget;

  startDateMenu: boolean = false;
  endDateMenu: boolean = false;

  requiredRule: any[] = [v => !!v];
  dialog: boolean = false;

  occurrenceFrequencies = [
    { value: eFrequency.Once, text: "transactionSchedules.once" },
    { value: eFrequency.Daily, text: "transactionSchedules.day" },
    { value: eFrequency.Weekly, text: "transactionSchedules.week" },
    { value: eFrequency.Monthly, text: "transactionSchedules.month" }
  ];

  categoryTypes = [
    { value: eCategoryType.Spending, text: "general.spendings" },
    { value: eCategoryType.Income, text: "general.incomes" },
    { value: eCategoryType.Saving, text: "general.savings" }
  ];
  categoryType: eCategoryType = eCategoryType.Spending;

  frequencyCombo: eFrequencyCombo = eFrequencyCombo.Once;

  eFrequency = eFrequency;
  eFrequencyCombo = eFrequencyCombo;
  eCategoryType = eCategoryType;

  editor: EntryEditor = {
    ...{
      transactionScheduleId: null,
      description: null,
      budgetCategory: null,
      budgetCategoryId: null,
      amount: null,
      startDate: new Date(),
      endDate: null,
      frequency: 0,
      periodStep: null
    },
    ...Object.assign({},(this.value ? this.value : {}))
  };

  budget = this.dataBudget;

  mdiClose = mdiClose;

  get mobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }
  get categories() {
    return this.budget.budgetCategories;
  }
  get totalAmount() {
    var amount = this.editor.amount * 1;
    if (amount == 0 || this.editor.frequency == 0) {
      return amount;
    }
    if (!this.editor.endDate) {
      if (this.editor.frequency == 1) {
        return Math.ceil(365 / this.editor.periodStep) * amount;
      }
      if (this.editor.frequency == 2) {
        return Math.ceil(52 / this.editor.periodStep) * amount;
      }
      if (this.editor.frequency == 3) {
        return Math.ceil(12 / this.editor.periodStep) * amount;
      }
    } else {
      if (this.editor.frequency == 1) {
        return (
          Math.ceil(
            Math.max(
              differenceInDays(this.editor.endDate, this.editor.startDate) + 1,
              1
            ) / this.editor.periodStep
          ) * amount
        );
      }
      if (this.editor.frequency == 2) {
        return (
          Math.ceil(
            Math.max(
              differenceInWeeks(this.editor.endDate, this.editor.startDate) + 1,
              1
            ) / this.editor.periodStep
          ) * amount
        );
      }
      if (this.editor.frequency == 3) {
        return (
          Math.ceil(
            Math.max(
              differenceInMonths(this.editor.endDate, this.editor.startDate) + 1,
              1
            ) / this.editor.periodStep
          ) * amount
        );
      }
    }
    return null;
  }


  @Watch("dialog")
  OnDialogOpen(open) {
    if (open) {
      this.$wait.start("dialog");
      this.editor = {
        ...{
          transactionScheduleId: null,
          description: null,
          budgetCategory: null,
          budgetCategoryId: null,
          amount: null,
          startDate: new Date(),
          endDate: null,
          frequency: 0,
          periodStep: null
        },
        ...Object.assign({}, this.value ? this.value : {})
      };
      this.editor.budgetCategory = this.getCategoryById(this.editor.budgetCategoryId)
      if (this.$refs.editor) {
        (this.$refs.editor as Vue & { resetValidation: () => void }).resetValidation();
      }
    } else {
      this.$wait.end("dialog");
    }
  }

  @Watch("categoryType")
  OnCategoryTypeChange() {
    this.editor.budgetCategory = null;
    (this.$refs.editor as Vue & { resetValidation: () => void }).resetValidation();
  }

  @Watch("frequencyCombo")
  OnFrequencyComboChange(frequencyCombo) {
    if (frequencyCombo == "once") {
      this.editor.frequency = 0;
      this.editor.periodStep = null;
    } else {
      this.editor.frequency = this.editor.frequency || 3;
      this.editor.periodStep = this.editor.periodStep || 1;
    }
  }

  mounted() {
    this.$root.$on("closeDialogs", () => {
      this.dialog = false;
    });
    this.editor.budgetCategory = this.getCategoryById(this.editor.budgetCategoryId)

    this.requiredRule = [v => !!v || this.$t("forms.requiredField")];
    if (this.value && this.value.frequency > 0) {
      this.frequencyCombo = eFrequencyCombo.Periodic;
      this.editor.frequency = this.value.frequency;
      this.editor.periodStep = this.value.periodStep;
    }
  }

  beforeDestroy() {
    this.$wait.end("dialog");
  }

  getCategoryById(budgetCategoryId: number): BudgetCategory {
    return this.budget.budgetCategories.find(v=>v.budgetCategoryId == budgetCategoryId);
  }

  save() {
    if ((this.$refs.editor as Vue & { validate: () => boolean }).validate()) {
      this.dialog = false;
      this.$emit("save", this.editor);
    }
  }

  cancel() {
    this.dialog = false;
  }
}
</script>
