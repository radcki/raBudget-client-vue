<template>
  <v-dialog
    width="600"
    v-model="dialog"
    :fullscreen="mobile"
    :transition="mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
  >
    <template slot="activator">
      <slot></slot>
    </template>
    <v-spacer v-if="mobile" class="py-3"></v-spacer>
    <v-card>
      <v-toolbar color="primary" dark dense flat :fixed="mobile">
        <v-btn v-if="mobile" icon dark @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">{{ $t("transactionSchedules.editing") }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="!mobile" flat icon @click="dialog = false">
          <v-icon light>close</v-icon>
        </v-btn>
        <v-btn v-if="mobile" flat="flat" @click.native="save">{{ $t('general.save') }}</v-btn>
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
                  :items="categories[categoryType]"
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
                <v-date-field
                  v-model="editor.endDate"
                  :label="$t('transactionSchedules.endDate')"
                ></v-date-field>
              </v-flex>
              <v-flex xs6>
                <v-radio-group v-model="frequencyCombo" hide-details>
                  <v-radio :label="$t('transactionSchedules.once')" value="once"></v-radio>
                  <v-radio :label="$t('transactionSchedules.periodic')" value="periodic"></v-radio>
                </v-radio-group>
              </v-flex>
              <v-flex xs6 align-self-end>
                <v-layout row align-end>
                  <v-flex>Co</v-flex>
                  <v-flex>
                    <v-text-field
                      hide-details
                      :disabled="frequencyCombo == 'once'"
                      type="number"
                      :rules="requiredRule"
                      min="0"
                      step="1"
                      v-model="editor.periodStep"
                    ></v-text-field>
                  </v-flex>
                  <v-flex>
                    <v-select
                      hide-details
                      :disabled="frequencyCombo == 'once'"
                      :rules="requiredRule"
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
        <span class="headline">{{totalAmount | currency($currencies[budget.currency])}}</span>
        <span
          v-if="editor.amount > 0 && editor.frequency > 0 && !editor.endDate"
          class="subheading"
        >({{$t("transactionSchedules.anually")}})</span>
      </v-card-text>

      <v-card-actions v-if="!mobile">
        <v-spacer></v-spacer>
        <v-btn color="red" flat @click="dialog = false">{{$t('general.cancel')}}</v-btn>
        <v-btn color="primary" flat @click="save">{{$t('general.save')}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "TransactionScheduleEditor",
  components: {
    "v-category-select": () => import("../components/CategorySelect"),
    "v-date-field": () => import("../components/DateField.vue")
  },
  props: {
    value: Object,
    dataBudget: {
      type: Object,
      default: () => {
        return { currency: "PLN" };
      }
    }
  },
  data: function() {
    return {
      startDateMenu: false,
      endDateMenu: false,

      requiredRule: [v => !!v],
      dialog: false,

      occurrenceFrequencies: [
        { value: 1, text: "transactionSchedules.day" },
        { value: 2, text: "transactionSchedules.week" },
        { value: 3, text: "transactionSchedules.month" }
      ],
      categoryTypes: [
        { value: "spendingCategories", text: "general.spendings" },
        { value: "incomeCategories", text: "general.incomes" },
        { value: "savingCategories", text: "general.savings" }
      ],
      categoryType: "spendingCategories",
      frequencyCombo: "once",
      editor: {
        ...{
          transactionScheduleId: null,
          description: null,
          budgetCategory: null,
          amount: null,
          startDate: this.$moment().format("YYYY-MM-DD"),
          endDate: null,
          frequency: 0,
          periodStep: null
        },
        ...JSON.parse(JSON.stringify(this.value ? this.value : {}))
      },
      budget: this.dataBudget
    };
  },
  computed: {
    mobile() {
      return !this.$vuetify.breakpoint.smAndUp;
    },
    categories() {
      return this.budget;
    },
    totalAmount() {
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
                this.$moment(this.editor.endDate).diff(
                  this.editor.startDate,
                  "days"
                ) + 1,
                1
              ) / this.editor.periodStep
            ) * amount
          );
        }
        if (this.editor.frequency == 2) {
          return (
            Math.ceil(
              Math.max(
                this.$moment(this.editor.endDate).diff(
                  this.editor.startDate,
                  "weeks"
                ) + 1,
                1
              ) / this.editor.periodStep
            ) * amount
          );
        }
        if (this.editor.frequency == 3) {
          return (
            Math.ceil(
              Math.max(
                this.$moment(this.editor.endDate).diff(
                  this.editor.startDate,
                  "months"
                ) + 1,
                1
              ) / this.editor.periodStep
            ) * amount
          );
        }
      }
    }
  },
  watch: {
    dialog(open) {
      if (open) {
        this.$wait.start("dialog");
      } else {
        this.$wait.end("dialog");
      }
    },
    categoryType: function() {
      this.editor.budgetCategory = null;
    },
    frequencyCombo: function(frequencyCombo) {
      if (frequencyCombo == "once") {
        this.editor.frequency = 0;
        this.editor.periodStep = null;
      } else {
        this.editor.frequency = this.editor.frequency || 3;
        this.editor.periodStep = this.editor.periodStep || 1;
      }
    }
  },
  mounted: function() {
    this.$root.$on("closeDialogs", () => {
      this.dialog = false;
    });
    this.requiredRule = [v => !!v || this.$t("forms.requiredField")];
    if (this.value && this.value.frequency>0){
      this.frequencyCombo = "periodic"
      this.editor.frequency = this.value.frequency
      this.editor.periodStep = this.value.periodStep
    }
  },
  beforeDestroy: function() {
    this.$wait.end("dialog");
  },
  methods: {
    save() {
      if (this.$refs.editor.validate()) {
        this.dialog = false;
        this.$emit("save", this.editor);
      }
    },
    cancel() {
      this.dialog = false;
    }
  }
};
</script>