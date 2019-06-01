<template>
  <v-dialog
    :fullscreen="!$vuetify.breakpoint.smAndUp"
    v-model="dialog"
    v-if="transactionId"
    :max-width="800"
    @keydown.esc="cancel"
    :transition="!$vuetify.breakpoint.smAndUp ? 'dialog-bottom-transition' : 'dialog-transition'"
  >
    <v-spacer v-if="!$vuetify.breakpoint.smAndUp" class="py-3"></v-spacer>
    <v-card>
      <v-toolbar color="primary" dark dense flat :fixed="!$vuetify.breakpoint.smAndUp">
        <v-btn v-if="!$vuetify.breakpoint.smAndUp" icon dark @click="cancel">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">{{ $t("transactions.editing") }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="$vuetify.breakpoint.smAndUp" flat icon @click="cancel">
          <v-icon light>close</v-icon>
        </v-btn>
        <v-btn
          v-if="!$vuetify.breakpoint.smAndUp"
          flat="flat"
          @click.native="save"
        >{{ $t('general.save') }}</v-btn>
      </v-toolbar>
      <v-card-text>
        <v-form ref="editorForm" v-model="valid" lazy-validation>
          <v-container grid-list-md>
            <v-layout row wrap align-center justify-center>
              <v-flex xs12>
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

              <v-flex xs12 md5>
                <v-category-select
                  :items="categories[transactionType]"
                  :label="$t('general.category')"
                  :rules="requiredRule"
                  v-model="editor.category"
                >                  
                </v-category-select>
              </v-flex>

              <v-flex xs12 md7>
                <v-text-field
                  v-model="editor.description"
                  :rules="requiredRule"
                  :label="$t('general.description')"
                ></v-text-field>
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="editor.modifyAmount"
                  type="number"
                  step="0.01"
                  :label="$t('transactions.addOrDelete')"
                ></v-text-field>
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="editor.enteredAmount"
                  type="number"
                  step="0.01"
                  :label="$t('transactions.baseAmount')"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
        <span class="subheading">{{ $t("transactions.finalAmount") }}:</span>
        <span class="headline">{{amount | currency($currencies[budget.currency])}}</span>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>

        <v-btn
          v-if="$vuetify.breakpoint.smAndUp"
          color="red"
          flat="flat"
          @click.native="cancel"
        >{{ $t('general.cancel') }}</v-btn>
        <v-btn
          v-if="$vuetify.breakpoint.smAndUp"
          color="primary darken-1"
          flat="flat"
          @click.native="save"
        >{{ $t('general.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { transactionsService } from "../_services/transactions.service.js";
import { mapActions } from "vuex";

export default {
  components: {
    "v-category-select": () => import("../components/CategorySelect")
  },
  data: () => ({
    budget: { currency: "PLN" },
    dateMenu: false,
    requiredRule: [v => !!v],
    categories: {
      incomes: [],
      spendings: [],
      savings: []
    },
    dialog: false,
    valid: true,
    resolve: null,
    reject: null,
    transactionType: null,
    transactionId: null,
    editor: {
      category: null,
      date: null,
      description: null,
      enteredAmount: null,
      modifyAmount: 0.0
    }
  }),
  computed: {
    amount: function() {
      return 1 * this.editor.modifyAmount + 1 * this.editor.enteredAmount;
    }
  },
  watch: {
    dialog(open) {
      if (open) {
        this.$wait.start("dialog");
      } else {
        this.$wait.end("dialog");
      }
    }
  },
  mounted: function() {
    this.$root.$on("closeDialogs", () => {
      this.dialog = false;
    });
    this.requiredRule = [v => !!v || this.$t("forms.requiredField")];
  },
  beforeDestroy: function() {
    this.$wait.end("dialog");
  },
  methods: {
    ...mapActions({
      updateTransactionInStore: "transactions/updateTransactionInStore"
    }),
    open(transactionId) {
      this.transactionId = transactionId;
      this.editor.modifyAmount = 0.0;
      transactionsService.getTransaction(transactionId).then(response => {
        if (response.ok) {
          this.dialog = true;
          response.json().then(transaction => {
            this.editor.category = transaction.category;
            this.transactionType =
              transaction.category.type == 0
                ? "spendings"
                : transaction.category.type == 1
                ? "incomes"
                : "savings";
            this.categories = {
              spendings: transaction.budget.spendingCategories,
              savings: transaction.budget.savingCategories,
              incomes: transaction.budget.incomeCategories
            };
            this.editor.date = this.$moment(transaction.date).format(
              "YYYY-MM-DD"
            );
            this.editor.description = transaction.description;
            this.editor.enteredAmount = transaction.amount;
            this.budget = transaction.budget;
          });
        }
      });
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    save() {
      if (this.$refs.editorForm.validate()) {
        var transaction = {
          transactionId: this.transactionId,
          category: this.editor.category,
          date: this.editor.date,
          description: this.editor.description,
          amount: this.amount
        };
        transactionsService.updateTransaction(transaction).then(response => {  
          if (response.ok) {
            response.json(data => {
              this.updateTransactionInStore(data)
            })
          }        
          this.resolve(response);
        });
        this.dialog = false;
      }
    },
    cancel() {
      this.resolve(false);
      this.dialog = false;
    }
  }
};
</script>