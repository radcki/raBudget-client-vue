<template>
  <v-dialog
    :fullscreen="mobile"
    v-model="dialog"
    persistent
    :max-width="800"
    @keydown.esc="cancel"
    :transition="mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <v-card>
      <v-toolbar color="primary" dark dense flat :fixed="mobile">
        <v-btn v-if="mobile" icon dark @click="cancel">
          <v-icon>{{mdiClose}}</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">{{ $t("allocations.editing") }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="!mobile" text icon @click="cancel">
          <v-icon light>{{mdiClose}}</v-icon>
        </v-btn>
        <v-btn
          v-if="mobile"
          text
          @click.native="save"
        >{{ $t('general.save') }}</v-btn>
      </v-toolbar>
      <v-card-text>
        <v-form ref="editorForm" v-model="valid" lazy-validation>
          <v-container grid-list-md>
            <v-layout row wrap align-center justify-center>
              <v-flex xs12 md6>
                <v-date-field
                  :rules="requiredRule"
                  v-model="editor.allocationDate"
                  :label="$t('allocations.date')"
                ></v-date-field>
              </v-flex>

              <v-flex xs12 md6>
                <v-category-select
                    :items="categories.filter(v=>v.type == categoryType)"
                    :label="$t('categories.sourceCategory')"
                    clearable
                    v-model="editor.sourceBudgetCategory"
                  ></v-category-select>

              </v-flex>

              <v-flex xs12 md5>
                <v-category-select
                    :items="categories.filter(v=>v.type == categoryType)"
                    :label="$t('general.category')"
                    :rules="requiredRule"
                    v-model="editor.targetBudgetCategory"
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
                <v-text-field
                  v-model="editor.modifyAmount"
                  type="number"
                  step="0.01"
                  :label="$t('transactions.addOrDelete')"
                ></v-text-field>
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="editor.amount"
                  type="number"
                  step="0.01"
                  :label="$t('transactions.baseAmount')"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
        <span class="subheading">{{ $t("transactions.finalAmount") }}:</span>
        <span class="headline">{{finalAmount | currency($currencyConfig(budget))}}</span>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>

        <v-btn
          v-if="!mobile"
          color="red"
          text
          @click.native="cancel"
        >{{ $t('general.cancel') }}</v-btn>
        <v-btn
          v-if="!mobile"
          color="primary darken-1"
          text
          @click.native="save"
        >{{ $t('general.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { mdiClose } from '@mdi/js'
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { Budget } from '@/typings/Budget';
import { Allocation } from '@/typings/Allocation';
import { BudgetCategory } from '@/typings/BudgetCategory';

@Component({
  components: {
    "v-category-select": () => import("../components/CategorySelect.vue"),
    "v-date-field": () => import("../components/DateField.vue")
  }
})
export default class TransactionEditor extends Vue {
  @Prop(Object) value!: Allocation;
  @Prop(Object) dataBudget!: Budget;

  requiredRule: any[] = [v => !!v];
  dialog: boolean = false;
  valid: boolean = true;
  eCategoryType = eCategoryType;

  editor: any = {
        ...{
          targetBudgetCategory: null,
          targetBudgetCategoryId: null,
          sourceBudgetCategory: null,
          sourceBudgetCategoryId: null,
          allocationDate: null,
          description: null,
          amount: null,
          modifyAmount: 0.0
        },
        ...Object.assign({},(this.value ? this.value : {}))
      };
  mdiClose = mdiClose;

  get mobile(): boolean {
    return !this.$vuetify.breakpoint.smAndUp;
  };
  get categoryType(): eCategoryType {
    return this.editor.targetBudgetCategory ? this.editor.targetBudgetCategory.type : null;
  };
  get categories(): BudgetCategory[] {
    return this.budget ? this.budget.budgetCategories : [];
  };
  get finalAmount(): number {
    return 1 * this.editor.modifyAmount + 1 * this.editor.amount;
  };
  get budget(): Budget {return this.dataBudget};

  mounted() {
    this.$root.$on('closeDialogs', () => {
      this.dialog = false
    })
    this.requiredRule = [v => !!v || this.$t('forms.requiredField')]
    this.editor.targetBudgetCategory = this.categories.find(v=>v.budgetCategoryId == this.value.targetBudgetCategoryId)
    if (this.value.sourceBudgetCategoryId) {
      this.editor.sourceBudgetCategory = this.categories.find(v=>v.budgetCategoryId == this.value.sourceBudgetCategoryId)
    }
  };

  beforeDestroy() {
    this.$wait.end('dialog')
  };

  @Watch("dialog")
  OnDialog(open) {
    if (open) {
      this.$wait.start("dialog");
    } else {
      this.$wait.end("dialog");
    }
  };

  @Watch('editor.targetBudgetCategory')
  OnTargetCategoryChange(newCategory: BudgetCategory){
    if (!newCategory){
      return;
    }
    this.editor.targetBudgetCategoryId = newCategory.budgetCategoryId
  };

  @Watch('editor.sourceBudgetCategory')
  OnSourceCategoryChange(newCategory: BudgetCategory){
    if (!newCategory){
      return;
    }
    this.editor.sourceBudgetCategoryId = newCategory ? newCategory.budgetCategoryId : null
  };

  save(): void {
    if (
      (this.$refs.editorForm as Vue & { validate: () => boolean }).validate()
    ) {
      this.dialog = false;
      this.editor.amount = this.finalAmount;
      this.editor.modifyAmount = 0;
      this.$emit("save", this.editor);
    }
  };

  cancel(): void {
    this.dialog = false;
  };

}
</script>
