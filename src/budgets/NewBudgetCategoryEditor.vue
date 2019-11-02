<template>
  <v-list two-line subheader>
    <v-form ref="formCategory" v-model="valid">
      <v-container grid-list-md>
        <v-layout row wrap>
          <v-flex xs3 md1 d-flex>
            <v-select v-model="newBudgetCategory.icon" :items="icons" :label="$t('general.icon')">
              >
              <template slot="selection" slot-scope="data">
                <v-icon>{{ $categoryIcons[data.item] }}</v-icon>
              </template>
              <template slot="item" slot-scope="data">
                <v-icon>{{ $categoryIcons[data.item] }}</v-icon>
              </template>
            </v-select>
          </v-flex>
          <v-flex xs9 md5>
            <v-text-field
              :rules="requiredRule"
              v-model="newBudgetCategory.name"
              :label="$t('categories.name')"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md4>
            <v-text-field
              :prepend-icon="mdiCash"
              type="number"
              step="0.01"
              :rules="requiredRule"
              min="0"
              v-model="newBudgetCategory.amountConfigs[0].amount"
              :label="$t('categories.monthlyAmount')"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md2>
            <v-btn color="primary" class="white--text" @click="addCategory">
              {{$t('general.add')}}
              <v-icon right dark>{{mdiPlus}}</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>

    <v-list-item v-for="(category, i) in categories" v-bind:data="category" v-bind:key="i">
      <v-list-item-avatar :color="color">
        <v-icon size="24" dark>{{ $categoryIcons[category.icon] }}</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>{{ category.name }}</v-list-item-title>

        <v-list-item-subtitle>{{ $t("categories.monthlyAmount") }}: {{ category.amountConfigs[0].amount | currency($currencyConfig(budget)) }}</v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-btn text icon ripple dark color="primary" @click="editCategory(i)">
          <v-icon>{{mdiPencil}}</v-icon>
        </v-btn>
      </v-list-item-action>
      <v-list-item-action>
        <v-btn text icon ripple dark color="red" @click="removeCategory(i)">
          <v-icon>{{mdiCancel}}</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>{{ $t("categories.totalAmount") }}: {{ categoriesSum | currency($currencyConfig(budget)) }}</v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Budget } from "../typings/Budget";
import { eCategoryType } from "../typings/enums/eCategoryType";
import { mdiCash, mdiPlus, mdiPencil, mdiCancel } from "@mdi/js";
import { BudgetCategory } from "../typings/BudgetCategory";
import { AmountConfig } from '@/typings/AmountConfig';

@Component
export default class NewBudgetCategoryEditor extends Vue {
  @Prop(Object) budget: Budget;
  @Prop(Number) categoryType: eCategoryType;
  @Prop(Array) value: BudgetCategory[];

  valid: boolean = true;
  newBudgetCategory: BudgetCategory = {
    type: this.categoryType,
    budgetId: this.budget.budgetId,
    name: "",
    icon: "",
    amountConfigs: [{ amount: 0, validFrom: this.budget.startingDate }]
  };
  categories: BudgetCategory[] = this.value || [];
  requiredRule: any[] = [];

  mdiCash = mdiCash;
  mdiPlus = mdiPlus;
  mdiPencil = mdiPencil;
  mdiCancel = mdiCancel;

  mounted() {
    this.categories = this.value;
    this.requiredRule = [v => !!v || this.$t("forms.requiredField")];
  }

  icons: string[] = Object.keys(this.$categoryIcons);
  @Watch('budget.startingDate')
  OnBudgetStartingDateChange(newDate){
    for(let amountConfig of this.newBudgetCategory.amountConfigs){
      amountConfig.validFrom = newDate;
    }
    for(let category of this.categories){
      for(let amountConfig of category.amountConfigs){
        amountConfig.validFrom = newDate;
      }
    }
  }

  get color() {
    switch (this.categoryType) {
      case eCategoryType.Income:
        return "income";
      case eCategoryType.Spending:
        return "spending";
      case eCategoryType.Saving:
        return "saving";
    }
  }

  get categoriesSum() {
    var sum = 0;
    if (!this.categories){
      return sum;
    }
    for (let category of this.categories) {
      for (let ammountconfig of category.amountConfigs) {
        sum += ammountconfig.amount;
      }
    }
    return sum;
  }

  @Watch("categories")
  OnCategoriesChange() {
    this.$emit("input", this.categories);
  }

  addCategory() {
    if ((this.$refs.formCategory as Vue & { validate: () => boolean }).validate()) {
      this.categories.push(Object.assign({}, this.newBudgetCategory));
      this.newBudgetCategory = {
        type: this.categoryType,
        budgetId: this.budget.budgetId,
        icon: "",
        name: "",
        amountConfigs: [{ amount: 0, validFrom: this.budget.startingDate }]
      };
      (this.$refs.formCategory as Vue & { reset: () => any }).reset();
    }
  }

  removeCategory(index) {
    this.categories.splice(index, 1);
  }

  editCategory(index) {
    this.newBudgetCategory = this.categories[index];
    this.categories.splice(index, 1);
  }
}
</script>
