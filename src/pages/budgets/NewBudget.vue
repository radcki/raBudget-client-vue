<template>
  <v-container>
    <v-layout wrap align-center justify-center>
      <v-flex xs12>
        <v-subheader class="headline">{{ $t('budgets.new') }}</v-subheader>
      </v-flex>
      <v-flex xs12>
        <v-stepper v-model="step" class="cardBackground">
          <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">
              {{ $t('budgets.budget') }}
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="step > 2" step="2">
              {{ $t('categories.incomeCategories') }}
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="step > 3" step="3">
              {{ $t('categories.spendingCategories') }}
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="step > 4" step="4">
              {{ $t('categories.savingCategories') }}
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="5">{{ $t('general.summary') }}</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-subheader class="headline">{{ $t('budgets.basicData') }}</v-subheader>
              <v-form ref="form" v-model="validStep1">
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <v-flex xs8 sm6>
                      <v-text-field
                        v-model="budget.name"
                        :prepend-icon="mdiFormatTitle"
                        :rules="requiredRule"
                        :label="$t('general.name')"
                        required
                      ></v-text-field>
                    </v-flex>

                    <v-flex xs4 sm2>
                      <v-autocomplete
                        v-model="budget.currency"
                        :items="currencies"
                        return-object
                        item-text="code"
                        :label="$t('budgets.currency')"
                      ></v-autocomplete>
                    </v-flex>

                    <v-date-field
                      v-model="budget.startingDate"
                      :rules="requiredRule"
                      type="month"
                      :label="$t('budgets.startDate')"
                    ></v-date-field>
                  </v-layout>
                </v-container>
              </v-form>

              <v-btn :disabled="!validStep1" color="primary" @click="step = 2">
                {{ $t('general.stepForward') }}
              </v-btn>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-subheader class="headline">{{ $t('categories.incomeCategories') }}</v-subheader>

              <v-new-budget-category-editor
                v-model="categories.income"
                :budget="budget"
                :category-type="eCategoryType.Income"
              ></v-new-budget-category-editor>

              <v-btn
                :disabled="!(categories.income.length > 0)"
                color="primary"
                @click="step = 3"
                >{{ $t('general.stepForward') }}</v-btn
              >

              <v-btn text @click="step = 1">{{ $t('general.stepBack') }}</v-btn>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-subheader class="headline">{{ $t('categories.spendingCategories') }}</v-subheader>
              <v-new-budget-category-editor
                v-model="categories.spending"
                :budget="budget"
                :category-type="eCategoryType.Spending"
              ></v-new-budget-category-editor>

              <v-btn
                :disabled="!(categories.spending.length > 0)"
                color="primary"
                @click="step = 4"
                >{{ $t('general.stepForward') }}</v-btn
              >

              <v-btn text @click="step = 2">{{ $t('general.stepBack') }}</v-btn>
            </v-stepper-content>

            <v-stepper-content step="4">
              <v-subheader class="headline">{{ $t('categories.savingCategories') }}</v-subheader>
              <v-new-budget-category-editor
                v-model="categories.saving"
                :budget="budget"
                :category-type="eCategoryType.Saving"
              ></v-new-budget-category-editor>

              <v-btn
                :disabled="!(categories.saving.length > 0)"
                color="primary"
                @click="step = 5"
                >{{ $t('general.stepForward') }}</v-btn
              >

              <v-btn text @click="step = 3">{{ $t('general.stepBack') }}</v-btn>
            </v-stepper-content>

            <v-stepper-content step="5">
              <v-subheader class="headline">{{ $t('general.summary') }}</v-subheader>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title
                    >{{ $t('budgets.budgetName') }}: {{ budget.name }}</v-list-item-title
                  >

                  <v-list-item-subtitle>
                    {{ $t('budgets.startDate') }}:
                    {{ budget.startingDate | dateFormat('LLLL yyyy', $dateLocales[$locale]) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-container grid-list-md>
                <v-layout row wrap>
                  <v-flex xs12 md6 lg4>
                    <categories-list
                      color="amber darken-1"
                      color-secondary="amber darken-3"
                      :items="categories.spending"
                      :data-budget="budget"
                      hide-actions
                      :title="$t('categories.spendingCategories')"
                    ></categories-list>
                  </v-flex>

                  <v-flex xs12 md6 lg4>
                    <categories-list
                      color="light-green darken-3"
                      color-secondary="light-green darken-4"
                      :items="categories.income"
                      :data-budget="budget"
                      hide-actions
                      :title="$t('categories.incomeCategories')"
                    ></categories-list>
                  </v-flex>

                  <v-flex xs12 md6 lg4>
                    <categories-list
                      color="indigo"
                      color-secondary="indigo darken-2"
                      :items="categories.saving"
                      :data-budget="budget"
                      hide-actions
                      :title="$t('categories.savingCategories')"
                    ></categories-list>
                  </v-flex>
                </v-layout>
              </v-container>

              <v-btn color="primary" @click="createBudget">{{ $t('general.save') }}</v-btn>

              <v-btn text @click="step = 4">{{ $t('general.stepBack') }}</v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { budgetService } from '@/_services/budget.service';
import { mdiFormatTitle, mdiCash, mdiPlus, mdiPencil, mdiCancel } from '@mdi/js';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { Vue, Component } from 'vue-property-decorator';
import { Currency } from '@/typings/Currency';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { namespace } from 'vuex-class';
import { CreateBudgetCommand } from '@/typings/Budget';

interface BudgetEditor {
  name: string;
  startingDate: Date;
  currency: Currency | null;
  budgetCategories?: BudgetCategory[];
}

const budgetsModule = namespace('budgets');
const alertModule = namespace('alert');

@Component({
  components: {
    'categories-list': () => import('@/components/CategoriesList.vue'),
    'v-date-field': () => import('@/components/DateField.vue'),
    'v-new-budget-category-editor': () => import('./NewBudgetCategoryEditor.vue'),
  },
})
export default class NewBudget extends Vue {
  step = 1;
  budget: BudgetEditor = {
    name: '',
    startingDate: new Date(),
    currency: null,
  };

  categories: { income: BudgetCategory[]; spending: BudgetCategory[]; saving: BudgetCategory[] } = {
    income: [],
    spending: [],
    saving: [],
  };

  currencies: Currency[] = [];
  validStep1 = true;

  mdiFormatTitle = mdiFormatTitle;
  mdiCash = mdiCash;
  mdiPlus = mdiPlus;
  mdiPencil = mdiPencil;
  mdiCancel = mdiCancel;
  eCategoryType = eCategoryType;

  requiredRule: ((v) => boolean | string)[] = [];

  @alertModule.Action('error') dispatchError?: (message) => void;
  @budgetsModule.Action('fetchBudgets') budgetsFetch?: () => Promise<void>;

  mounted() {
    this.requiredRule.push(v => !!v || this.$t('forms.requiredField').toString());
  }

  createBudget() {
    this.budget.budgetCategories = [
      ...this.categories.spending.map(v => {
        v.type = eCategoryType.Spending;
        return v;
      }),
      ...this.categories.income.map(v => {
        v.type = eCategoryType.Income;
        return v;
      }),
      ...this.categories.saving.map(v => {
        v.type = eCategoryType.Saving;
        return v;
      }),
    ];
    budgetService.createBudget(this.budget as CreateBudgetCommand).then(response => {
      if (response.ok && this.budgetsFetch) {
        this.budgetsFetch().then(() => {
          this.$router.push('/');
        });
      } else {
        response.json().then(data => {
          if (this.dispatchError) {
            this.dispatchError(data.message);
          }
        });
      }
    });
  }

  async getCurrencies() {
    const response = await budgetService.supportedCurrencies();
    if (response.ok) {
      this.currencies = await response.json();
    }
  }
}
</script>
