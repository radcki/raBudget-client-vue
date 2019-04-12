<template>
  <div>
    <template v-if="!dialog">
      <v-tabs
        next-icon="keyboard_arrow_right"
        prev-icon="keyboard_arrow_left"
        show-arrows
        slot="extension"
        v-model="tab"
        :color="color[tab]"
        grow
      >
        <v-tabs-slider></v-tabs-slider>
        <v-tab class="subheading white--text" ripple>{{ $t('general.spending') }}</v-tab>
        <v-tab class="subheading white--text" ripple>{{ $t('general.income') }}</v-tab>
        <v-tab class="subheading white--text" ripple>{{ $t('general.saving') }}</v-tab>
        <v-tab class="subheading white--text" ripple>{{ $t('general.allocation') }}</v-tab>
      </v-tabs>

      <v-card>
        <v-card-text>
          <v-form ref="editorForm" v-model="valid" lazy-validation>
            <v-container grid-list-md>
              <v-layout row wrap align-center justify-center>
                <v-flex xs5>
                  <v-menu
                    ref="dateMenu"
                    :close-on-content-click="false"
                    v-model="dateMenu"
                    :nudge-right="40"
                    :return-value.sync="editor.date"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                  >
                    <v-text-field
                      slot="activator"
                      v-model="editor.date"
                      :label="$t('transactions.date')"
                      :rules="requiredRule"
                      prepend-icon="event"
                      readonly
                    ></v-text-field>
                    <v-date-picker v-model="editor.date" @input="$refs.dateMenu.save(editor.date)"></v-date-picker>
                  </v-menu>
                </v-flex>
                <v-flex xs7 v-if="dataBudget">
                  <v-category-select
                    :items="dataBudget[selectedType+'Categories']"
                    :label="$t('general.category')"
                    :rules="requiredRule"
                    v-model="editor.category"
                  ></v-category-select>
                </v-flex>

                <v-flex xs5>
                  <v-text-field
                    v-model="editor.description"
                    :rules="requiredRule"
                    :label="$t('general.description')"
                  ></v-text-field>
                </v-flex>

                <v-flex xs7 v-if="tab == 3">
                  <v-category-select
                    :items="dataBudget[selectedType+'Categories']"
                    v-if="dataBudget[selectedType+'Categories']"
                    :label="$t('categories.sourceCategory')"
                    v-model="editor.sourceCategory"
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
                <v-flex xs12 v-if="tab!=3">
                  <v-checkbox
                    hide-details
                    :disabled="addScheduleDisabled"
                    v-model="createSchedule"
                    :label="$t('transactionSchedules.create')"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 align-self-end v-if="createSchedule == true && tab!=3">
                  <v-layout row align-end>
                    <v-flex>{{$t("general.every")}}</v-flex>
                    <v-flex>
                      <v-text-field
                        hide-details
                        type="number"
                        :rules="createSchedule == true ? requiredRule : []"
                        min="1"
                        step="1"
                        v-model="editor.periodStep"
                      ></v-text-field>
                    </v-flex>
                    <v-flex>
                      <v-select
                        hide-details
                        :rules="createSchedule == true ? requiredRule : []"
                        v-model="editor.frequency"
                        :items="occurrenceFrequencies"
                      >
                        <template slot="selection" slot-scope="{item}">{{ $t(item.text) }}</template>
                        <template slot="item" slot-scope="data">{{ $t(data.item.text) }}</template>
                      </v-select>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex xs12 v-if="createSchedule == true && tab!=3">
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
          <v-btn :color="color[tab]" flat dark @click="resetForm">{{ $t('general.reset') }}</v-btn>
          <v-btn
            :color="color[tab]"
            dark
            v-if="tab!=3"
            @click="createTransaction"
          >{{ $t('general.add') }}</v-btn>
          <v-btn
            :color="color[tab]"
            dark
            v-if="tab==3"
            @click="createAllocation"
          >{{ $t('general.add') }}</v-btn>
        </v-card-actions>
      </v-card>
    </template>

    <v-dialog
      v-if="dialog"
      lazy
      fullscreen
      v-model="editorDialog"
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <template slot="activator">
        <slot></slot>
      </template>

      <v-card>
        <v-toolbar :color="color[tab]" fixed dark tabs>
          <v-btn icon dark @click="editorDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{$t('transactions.newtransaction')}}</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-btn dark flat v-if="tab!=3" @click="createTransaction">{{ $t('general.add') }}</v-btn>
          <v-btn dark flat v-if="tab==3" @click="createAllocation">{{ $t('general.add') }}</v-btn>
          <v-tabs slot="extension" v-model="tab" :color="color[tab]" grow>
            <v-tabs-slider></v-tabs-slider>
            <v-tab class="white--text" ripple>Wydatki</v-tab>
            <v-tab class="white--text" ripple>Wpływy</v-tab>
            <v-tab class="white--text" ripple>Oszczędzności</v-tab>
            <v-tab class="white--text" ripple>Alokacje</v-tab>
          </v-tabs>
        </v-toolbar>
        <v-form ref="editorForm" v-model="valid" lazy-validation>
          <v-container>
            <v-layout row wrap align-center justify-center>
              <v-flex xs12 class="mt-5"></v-flex>
              <v-flex xs12 class="mt-5">
                <v-menu
                  ref="dateMenu"
                  :close-on-content-click="false"
                  v-model="dateMenu"
                  :nudge-right="40"
                  :return-value.sync="editor.date"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="editor.date"
                    :label="$t('transactions.date')"
                    :rules="requiredRule"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
                  <v-date-picker v-model="editor.date" @input="$refs.dateMenu.save(editor.date)"></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs12 v-if="dataBudget">
                <v-category-select
                  :items="dataBudget[selectedType+'Categories']"
                  v-if="dataBudget[selectedType+'Categories']"
                  :label="$t('general.category')"
                  :rules="requiredRule"
                  v-model="editor.category"
                ></v-category-select>
              </v-flex>

              <v-flex xs12 v-if="tab == 3 && dataBudget">
                <v-category-select
                  :items="dataBudget[selectedType+'Categories']"
                  v-if="dataBudget[selectedType+'Categories']"
                  :label="$t('categories.sourceCategory')"
                  v-model="editor.sourceCategory"
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
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { transactionsService } from "../_services/transactions.service";
import { allocationsService } from "../_services/allocations.service";
import { transactionSchedulesService } from "../_services/transactionSchedules.service"; 

export default {
  components: {
    "v-category-select": () => import("../components/CategorySelect"),
    "v-date-field": () => import("../components/DateField")
  },
  props: {
    dialog: Boolean,
    dataBudget: {
      type: Object,
      default: () => {
        return { currency: "PLN" };
      }
    },
    inputData: {
      type: Object
    }
  },
  data() {
    return {
      editorDialog: false,
      valid: true,
      dateMenu: false,

      editor: {
        category: null,
        sourceCategory: null,
        date: this.getDate(),
        description: null,
        amount: null,
        endDate: null,
        frequency: 3,
        periodStep: 1
      },
      createSchedule: false,
      addScheduleDisabled: false,
      tab: 0,
      color: [
        "amber darken-1",
        "green darken-1",
        "blue darken-1",
        "purple darken-1"
      ],
      occurrenceFrequencies: [
        { value: 1, text: "transactionSchedules.day" },
        { value: 2, text: "transactionSchedules.week" },
        { value: 3, text: "transactionSchedules.month" }
      ],
      requiredRule: [v => !!v || this.$t("forms.requiredField")]
    };
  },
  computed: {
    selectedType: function() {
      if (this.editor.category && this.editor.category.type != this.tab) {
        this.editor.category = null;
      }
      return this.tab == 0 || this.tab == 3
        ? "spending"
        : this.tab == 1
        ? "income"
        : this.tab == 2
        ? "saving"
        : "allocation";
    }
  },
  watch: {
    tab: function(value) {
      this.$refs.editorForm.resetValidation();
    },
    editorDialog(open) {
      if (open) {
        this.$wait.start("dialog");
      } else {
        this.$wait.end("dialog");
      }
    },
    inputData: function(data) {    
      if (!data) {
        return;
      }
      this.tab = data.category.type;
      this.editor = JSON.parse(JSON.stringify(data));
      this.editor.date = this.$moment(this.editor.date).format("YYYY-MM-DD");
      this.editor.category = data.category;
      this.createSchedule = false;
      this.addScheduleDisabled = true;
    }
  },
  beforeDestroy: function() {
    this.$wait.end("dialog");
  },
  mounted: function() {
    this.$root.$on("closeDialogs", () => {
      this.editorDialog = false;
    });
  },
  methods: {
    getDate() {
      return this.$moment().format("YYYY-MM-DD");
    },
    createTransaction() {
      if (this.$refs.editorForm.validate()) {

        if (this.createSchedule && !this.editor.transactionSchedule) {
          this.createTransactionSchedule(this.editor)
        }
        transactionsService.createTransaction(this.editor).then(response => {
          if (response.ok) {
            this.$emit("saved");
            this.editorDialog = false;
            this.resetForm();
          } else {
            response.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
      }
    },
    createTransactionSchedule: function(scheduleData) {
      this.$wait.start("saving.transactionSchedules");

      scheduleData.budgetCategory = scheduleData.category
      scheduleData.startDate = scheduleData.date
      transactionSchedulesService
        .createTransactionSchedule(scheduleData)
        .then(response => {
          if (response.ok) {
            this.$wait.end("saving.transactionSchedules");
          } else {
            response.json().then(data => {
              this.$wait.end("saving.transactionSchedules");
              this.dispatchError(data.message);
            });
          }
        });
    },
    createAllocation() {
      if (this.$refs.editorForm.validate()) {
        allocationsService.createAllocation(this.editor).then(response => {
          if (response.ok) {
            this.$emit("saved");
            this.editorDialog = false;
            this.resetForm();
          } else {
            response.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
      }
    },
    resetForm() {
      this.editor = {
        category: null,
        sourceCategory: null,
        date: this.getDate(),
        description: null,
        amount: null,
        endDate: null,
        frequency: 3,
        periodStep: 1
      };
      this.createSchedule = false;
      this.addScheduleDisabled = false;
      this.$refs.editorForm.resetValidation();
    }
  }
};
</script>
