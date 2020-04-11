<template>
  <v-list two-line subheader class="cardBackground">
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
              v-model="newBudgetCategory.name"
              :rules="requiredRule"
              :label="$t('categories.name')"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 md4>
            <money-field
              v-model="newBudgetCategory.amountConfigs[0].monthlyAmount"
              :prepend-icon="mdiCash"
              :currency="budget.currency"
              :rules="requiredRule"
              :label="$t('categories.monthlyAmount')"
            />
          </v-flex>
          <v-flex xs12 md2>
            <v-btn color="primary" class="white--text" @click="addCategory">
              {{ $t('general.add') }}
              <v-icon right dark>{{ mdiPlus }}</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>

    <v-list-item v-for="(category, i) in categories" :key="i" :data="category">
      <v-list-item-avatar :color="color">
        <v-icon size="24" dark>{{ $categoryIcons[category.icon] }}</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>{{ category.name }}</v-list-item-title>

        <v-list-item-subtitle>
          {{ $t('categories.monthlyAmount') }}:
          {{ category.amountConfigs[0].monthlyAmount | currency($currencyConfig(budget)) }}
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-btn text icon ripple dark color="primary" @click="editCategory(i)">
          <v-icon>{{ mdiPencil }}</v-icon>
        </v-btn>
      </v-list-item-action>
      <v-list-item-action>
        <v-btn text icon ripple dark color="red" @click="removeCategory(i)">
          <v-icon>{{ mdiCancel }}</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        {{ $t('categories.totalAmount') }}:
        {{ categoriesSum | currency($currencyConfig(budget)) }}
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Budget } from '@/typings/Budget';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { mdiCash, mdiPlus, mdiPencil, mdiCancel } from '@mdi/js';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { CreateBudgetCategoryCommand } from '../../typings/api/budgetCategory/CreateBudgetCategory';

@Component
export default class NewBudgetCategoryEditor extends Vue {
  @Prop(Object) budget?: Budget;
  @Prop(Number) categoryType?: eCategoryType;
  @Prop(Array) value?: BudgetCategory[];

  valid = true;
  newBudgetCategory: CreateBudgetCategoryCommand = {
    type: this.categoryType ? this.categoryType : 0,
    budgetId: this.budget ? this.budget.budgetId : -1,
    name: '',
    icon: '',
    amountConfigs: [
      { monthlyAmount: 0, validFrom: this.budget ? this.budget.startingDate : new Date() },
    ],
  };
  categories: CreateBudgetCategoryCommand[] = this.value || [];
  requiredRule: ((v: string) => boolean | string)[] = [];

  mdiCash = mdiCash;
  mdiPlus = mdiPlus;
  mdiPencil = mdiPencil;
  mdiCancel = mdiCancel;

  mounted() {
    this.requiredRule = [v => !!v || this.$t('forms.requiredField').toString()];
  }

  icons: string[] = Object.keys(this.$categoryIcons);
  @Watch('budget.startingDate')
  OnBudgetStartingDateChange(newDate) {
    for (const amountConfig of this.newBudgetCategory.amountConfigs) {
      amountConfig.validFrom = newDate;
    }
    for (const category of this.categories) {
      for (const amountConfig of category.amountConfigs) {
        amountConfig.validFrom = newDate;
      }
    }
  }

  get color(): string {
    switch (this.categoryType) {
      case eCategoryType.Income:
        return 'income';
      case eCategoryType.Spending:
        return 'spending';
      case eCategoryType.Saving:
        return 'saving';
    }
    return '';
  }

  get categoriesSum(): number {
    let sum = 0;
    if (!this.categories) {
      return sum;
    }
    for (const category of this.categories) {
      for (const ammountconfig of category.amountConfigs) {
        sum += ammountconfig.monthlyAmount;
      }
    }
    return sum;
  }

  @Watch('categories')
  OnCategoriesChange() {
    this.$emit('input', this.categories);
  }

  addCategory() {
    if ((this.$refs.formCategory as Vue & { validate: () => boolean }).validate()) {
      this.categories.push(Object.assign({}, this.newBudgetCategory));
      this.newBudgetCategory = {
        type: this.categoryType ? this.categoryType : 0,
        budgetId: this.budget ? this.budget.budgetId : -1,
        icon: '',
        name: '',
        amountConfigs: [
          { monthlyAmount: 0, validFrom: this.budget ? this.budget.startingDate : new Date() },
        ],
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
