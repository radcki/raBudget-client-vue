<template>
  <v-container v-if="budget" grid-list-md>
    <v-layout row wrap align-center justify-center>
      <v-flex xs12>
        <v-subheader class="headline">{{ $t('categories.budgetCategories') }}</v-subheader>
      </v-flex>

      <v-flex xs12>
        <v-card color="cardBackground">
          <v-card-text>
            <div>
              Plan wydatków: {{ spendingCategoriesSum | currency($currencyConfig(budget)) }}
            </div>
            <div>Plan dochodów: {{ incomeCategoriesSum | currency($currencyConfig(budget)) }}</div>
            <div>
              Plan oszczędności: {{ savingsCategoriesSum | currency($currencyConfig(budget)) }}
            </div>
            <v-divider class="my-2"></v-divider>
            <div>
              Bilans:
              <v-chip :color="categoriesBalance >= 0 ? 'green lighten-2' : 'red lighten-2'">
                {{ categoriesBalance | currency($currencyConfig(budget)) }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs12>
        <v-container grid-list-md class="pa-0">
          <v-layout row wrap>
            <v-flex v-if="categories.spending" xs12 md6 lg4>
              <categories-list
                color="amber darken-1"
                color-secondary="amber darken-3"
                :items="categories.spending"
                :data-budget="budget"
                :categories-type="eCategoryType.Spending"
                :title="$t('categories.spendingCategories')"
                @edit="editCategory"
                @create="createCategory"
                @transfer="transferTransactions"
                @delete="deleteCategory"
                @reorder="saveCategoriesOrder"
              ></categories-list>
            </v-flex>

            <v-flex xs12 md6 lg4>
              <categories-list
                color="light-green darken-3"
                color-secondary="light-green darken-4"
                :items="categories.income"
                :data-budget="budget"
                :categories-type="eCategoryType.Icome"
                :title="$t('categories.incomeCategories')"
                @edit="editCategory"
                @create="createCategory"
                @transfer="transferTransactions"
                @delete="deleteCategory"
                @reorder="saveCategoriesOrder"
              ></categories-list>
            </v-flex>

            <v-flex xs12 md6 lg4>
              <categories-list
                color="indigo"
                color-secondary="indigo darken-2"
                :items="categories.saving"
                :data-budget="budget"
                :categories-type="eCategoryType.Saving"
                :title="$t('categories.savingCategories')"
                @edit="editCategory"
                @create="createCategory"
                @transfer="transferTransactions"
                @delete="deleteCategory"
                @reorder="saveCategoriesOrder"
              ></categories-list>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { budgetService } from '@/_services/budget.service';
import { transactionsService } from '@/_services/transactions.service';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/Budget';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { startOfMonth } from 'date-fns';
import { SaveBudgetCategoriesCommand } from '../../typings/api/budget/SaveBudgetCategoriesOrder';

const alertModule = namespace('alert');
const budgetsModule = namespace('budgets');

@Component({
  components: {
    'categories-list': () => import('@/components/CategoriesList.vue'),
  },
})
export default class BudgetCategories extends Vue {
  requiredRule: any[] = [v => !!v || this.$t('forms.requiredField')];

  @budgetsModule.State('budgets') budgets?: Budget[];
  @alertModule.Action('error') dispatchError?: (message: string) => void;
  @alertModule.Action('success') dispatchSuccess?: (message: string) => void;
  @budgetsModule.Action('reloadInitialized') reloadInitialized?: () => void;
  @budgetsModule.Action('initializeBudgets') initializeBudgets?: () => void;
  @budgetsModule.Action('activeBudgetChange') activeBudgetChange?: (
    budgetId: number | string,
  ) => void;

  eCategoryType = eCategoryType;

  get budget(): Budget | undefined {
    return this.budgets
      ? this.budgets.find(v => v.budgetId == ((this.$route.params.id as unknown) as number))
      : undefined;
  }

  get categories(): {
    income: BudgetCategory[];
    spending: BudgetCategory[];
    saving: BudgetCategory[];
  } {
    const saving = this.budget
      ? this.budget.budgetCategories.filter(v => v.type == eCategoryType.Saving)
      : [];
    const income = this.budget
      ? this.budget.budgetCategories.filter(v => v.type == eCategoryType.Income)
      : [];
    const spending = this.budget
      ? this.budget.budgetCategories.filter(v => v.type == eCategoryType.Spending)
      : [];
    return {
      income: income,
      spending: spending,
      saving: saving,
    };
  }

  get incomeCategoriesSum() {
    if (this.categories.income.length == 0) {
      return 0;
    }
    return this.categories.income
      .map(v => this.readCurrentAmount(v))
      .reduce(function (a, b) {
        return 1 * (a || 0) + 1 * (b || 0);
      });
  }

  get spendingCategoriesSum() {
    if (this.categories.spending.length == 0) {
      return 0;
    }
    return this.categories.spending
      .map(v => this.readCurrentAmount(v))
      .reduce(function (a, b) {
        return 1 * (a || 0) + 1 * (b || 0);
      });
  }

  get savingsCategoriesSum() {
    if (this.categories.saving.length == 0) {
      return 0;
    }
    return this.categories.saving
      .map(v => this.readCurrentAmount(v))
      .reduce(function (a, b) {
        return 1 * (a || 0) + 1 * (b || 0);
      });
  }

  get categoriesBalance() {
    return (
      (this.incomeCategoriesSum || 0) -
      (this.spendingCategoriesSum || 0) -
      (this.savingsCategoriesSum || 0)
    );
  }

  mounted() {
    if (this.activeBudgetChange) {
      this.activeBudgetChange(this.$route.params.id);
    }
    if (this.initializeBudgets) {
      this.initializeBudgets();
    }
  }

  @Watch('$route')
  onRouteChange(to, from) {
    if (from.params.id != to.params.id && this.activeBudgetChange && this.reloadInitialized) {
      this.activeBudgetChange(to.params.id);
      this.reloadInitialized();
    }
  }

  createCategory(category: BudgetCategory) {
    if (!this.budget) {
      return;
    }
    budgetService.createCategory(this.budget.budgetId, category).then(response => {
      if (response.ok && this.reloadInitialized) {
        this.reloadInitialized();
      } else {
        response.json().then(data => {
          if (this.dispatchError) this.dispatchError(data.message);
          if (this.reloadInitialized) this.reloadInitialized();
        });
      }
    });
  }

  async editCategory(category: BudgetCategory) {
    if (!this.budget) {
      return;
    }
    this.$wait.start(`saving.category${category.budgetCategoryId}`);
    const response = await budgetService.updateCategory(this.budget.budgetId, category);
    if (response.ok && this.reloadInitialized) {
      this.reloadInitialized();
    } else {
      const errorData = await response.json();
      if (this.dispatchError) this.dispatchError(errorData.message);
      if (this.reloadInitialized) this.reloadInitialized();
    }
    this.$wait.end(`saving.category${category.budgetCategoryId}`);
  }

  async deleteCategory(category: BudgetCategory) {
    const confirm = await this.$confirm({
      title: 'general.remove',
      message: 'categories.deleteConfirm',
      options: {
        color: 'red',
        buttons: { yes: true, no: true, cancel: false, ok: false },
      },
    });

    if (!confirm) return;
    this.$wait.start(`saving.category${category.budgetCategoryId}`);

    const type = category.type == 0 ? 'spending' : category.type == 1 ? 'income' : 'saving';
    if (this.categories[type].length == 1 && this.dispatchError) {
      this.dispatchError('categories.oneRequired');
      return;
    }
    const response = await budgetService.deleteCategory(
      this.$route.params.id,
      category.budgetCategoryId,
    );
    if (response.ok && this.reloadInitialized) {
      this.reloadInitialized();
    } else {
      if (this.dispatchError) this.dispatchError((await response.json()).message);
    }
    this.$wait.end(`saving.category${category.budgetCategoryId}`);
  }

  transferTransactions(category: BudgetCategory) {
    const type = category.type == 0 ? 'spending' : category.type == 1 ? 'income' : 'savings';

    const categories = this.categories[type].map(function (value) {
      return { text: value['name'], value: value['categoryId'] };
    });

    this.$confirm({
      title: 'transactions.categoryTransfer',
      message: 'categories.selectCategory',
      options: {
        color: 'primary',
        selectList: categories,
        select: true,
        buttons: { yes: false, no: false, cancel: true, ok: true },
      },
    }).then(selection => {
      if (selection) {
        const type = category.type == 0 ? 'spending' : category.type == 1 ? 'income' : 'savings';
        if (this.categories[type].length == 1 && this.dispatchError) {
          this.dispatchError('categories.oneRequired');
          return;
        }
        transactionsService
          .transferTransactions(
            (this.$route.params.id as unknown) as number,
            category,
            selection.value as BudgetCategory,
          )
          .then(response => {
            if (response.ok && this.reloadInitialized) {
              this.reloadInitialized();
              if (this.dispatchSuccess) this.dispatchSuccess('general.changesSaved');
            } else {
              response.json().then(data => {
                if (this.dispatchError) this.dispatchError(data.message);
              });
            }
          });
      }
    });
  }

  readCurrentAmount(category: BudgetCategory) {
    const matching = category.amountConfigs.filter(v => {
      return (
        startOfMonth(new Date()) >= v.validFrom &&
        (!v.validTo || v.validTo >= startOfMonth(new Date()))
      );
    });
    return matching && matching.length > 0 ? matching[0].monthlyAmount : null;
  }

  async saveCategoriesOrder(categoriesOrder: { newOrder: number[]; movedCategoryId: number }) {
    if (!this.budget) {
      return;
    }
    this.$wait.start(`saving.category${categoriesOrder.movedCategoryId}`);
    const command: SaveBudgetCategoriesCommand = {
      budgetCategoryOrder: categoriesOrder.newOrder.map(v => {
        return { budgetCategoryId: v };
      }),
    };

    const response = await budgetService.saveBudgetCategoriesOrder(this.budget.budgetId, command);
    if (response.ok && this.reloadInitialized) {
      this.reloadInitialized();
      if (this.dispatchSuccess) this.dispatchSuccess('general.changesSaved');
    } else {
      if (this.dispatchError) this.dispatchError((await response.json()).message);
    }
    this.$wait.end(`saving.category${categoriesOrder.movedCategoryId}`);
  }
}
</script>
