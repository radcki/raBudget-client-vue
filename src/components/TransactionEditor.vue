<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="mobile"
    max-width="800"
    persistent
    :transition="mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
    v-bind="$attrs"
    @keydown.esc="cancel"
    v-on="$listeners"
  >
    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <v-card v-if="budget">
      <v-toolbar color="primary" dark dense flat :fixed="mobile">
        <v-btn v-if="mobile" icon dark @click="cancel">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">{{ $t('transactions.editing') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="!mobile" text icon @click="cancel">
          <v-icon light>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-btn v-if="mobile" text @click.native="save">{{ $t('general.save') }}</v-btn>
      </v-toolbar>
      <v-card-text>
        <v-form ref="editorForm" v-model="valid" lazy-validation>
          <v-container grid-list-md>
            <v-layout row wrap align-center justify-center>
              <v-flex xs12>
                <v-date-field
                  v-model="editor.transactionDate"
                  :rules="requiredRule"
                  :label="$t('transactions.date')"
                ></v-date-field>
              </v-flex>

              <v-flex xs12 md5>
                <v-category-select
                  v-model="editor.budgetCategory"
                  :items="categories.filter(v => v.type == categoryType)"
                  :label="$t('general.category')"
                  :rules="requiredRule"
                ></v-category-select>
              </v-flex>

              <v-flex xs12 md7>
                <v-text-field
                  v-model="editor.description"
                  :rules="requiredRule"
                  :label="$t('general.description')"
                ></v-text-field>
              </v-flex>

              <v-flex xs12>
                <money-field
                  v-model="editor.modifyAmount"
                  :currency="dataBudget.currency"
                  :label="$t('transactions.addOrDelete')"
                />
              </v-flex>

              <v-flex xs12>
                <money-field
                  v-model="editor.amount"
                  :currency="dataBudget.currency"
                  :rules="requiredRule"
                  :label="$t('transactions.baseAmount')"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
        <span class="subheading">{{ $t('transactions.finalAmount') }}:</span>
        <span class="headline">{{ finalAmount | currency($currencyConfig(budget)) }}</span>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>

        <v-btn v-if="!mobile" color="red" text @click.native="cancel">{{
          $t('general.cancel')
        }}</v-btn>
        <v-btn v-if="!mobile" color="primary darken-1" text @click.native="save">{{
          $t('general.save')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { mdiClose } from '@mdi/js';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Transaction } from '@/typings/Transaction';
import { Budget } from '@/typings/Budget';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { eCategoryType } from '@/typings/enums/eCategoryType';

@Component({
  components: {
    'v-category-select': () => import('../components/CategorySelect.vue'),
    'v-date-field': () => import('../components/DateField.vue'),
  },
})
export default class TransactionEditor extends Vue {
  @Prop(Object) value!: Transaction;
  @Prop(Object) dataBudget!: Budget;

  requiredRule: any[] = [v => !!v];
  dialog = false;
  valid = true;
  eCategoryType = eCategoryType;

  /*
  categoryTypes: any[] = [
    { value: "spendingCategories", text: "general.spendings" },
    { value: "incomeCategories", text: "general.incomes" },
    { value: "savingCategories", text: "general.savings" }
  ];
*/

  editor: any = {
    ...{
      budgetCategoryId: null,
      type: null,
      budgetCategory: null,
      transactionDate: null,
      description: null,
      amount: null,
      modifyAmount: 0.0,
    },
    ...Object.assign({}, this.value ? this.value : {}),
  };
  mdiClose = mdiClose;

  get mobile(): boolean {
    return !this.$vuetify.breakpoint.smAndUp;
  }
  get categoryType(): eCategoryType {
    return this.editor.budgetCategory ? this.editor.budgetCategory.type : null;
  }
  get categories(): BudgetCategory[] {
    return this.budget ? this.budget.budgetCategories : [];
  }
  get finalAmount(): number {
    return 1 * this.editor.modifyAmount + 1 * this.editor.amount;
  }
  get budget(): Budget {
    return this.dataBudget;
  }

  @Watch('editor.budgetCategory')
  OnCategoryChange(newCategory: BudgetCategory) {
    if (!newCategory) {
      return;
    }
    this.editor.budgetCategoryId = newCategory.budgetCategoryId;
  }

  @Watch('dialog')
  OnDialog(open) {
    if (open) {
      this.$wait.start('dialog');
    } else {
      this.$wait.end('dialog');
    }
  }

  @Watch('budget')
  OnBudgetLoaded() {
    this.editor.budgetCategory = this.categories.find(
      v => v.budgetCategoryId == this.editor.budgetCategoryId,
    );
  }

  mounted() {
    this.$root.$on('closeDialogs', () => {
      this.dialog = false;
    });
    this.editor.budgetCategory = this.categories.find(
      v => v.budgetCategoryId == this.editor.budgetCategoryId,
    );
    this.requiredRule = [v => !!v || this.$t('forms.requiredField')];
  }
  beforeDestroy() {
    this.$wait.end('dialog');
  }

  save(): void {
    if ((this.$refs.editorForm as Vue & { validate: () => boolean }).validate()) {
      this.dialog = false;
      this.editor.amount = this.finalAmount;
      this.editor.modifyAmount = 0;
      this.$emit('save', this.editor);
    }
  }

  cancel(): void {
    this.dialog = false;
  }
}
</script>
