<template>
  <v-container grid-list-md v-if="budget">
    <v-layout row wrap align-center justify-center>
      <v-flex xs12>
        <v-subheader class="headline">{{ $t('categories.budgetCategories') }}</v-subheader>
      </v-flex>

      <v-flex xs12>
        <v-card>
          <v-card-text>
            <div>Plan wydatków: {{ spendingCategoriesSum | currency($currencyConfig(budget)) }}</div>
            <div>Plan dochodów: {{ incomeCategoriesSum | currency($currencyConfig(budget)) }}</div>
            <div>Plan oszczędności: {{ savingsCategoriesSum | currency($currencyConfig(budget)) }}</div>
            <v-divider></v-divider>
            <div>
              Bilans:
              <v-chip
                :color="categoriesBalance >= 0 ? 'green lighten-2' : 'red lighten-2' "
              >{{ categoriesBalance | currency($currencyConfig(budget)) }}</v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs12>
        <v-container grid-list-md class="pa-0">
          <v-layout row wrap>
            <v-flex xs12 md6 lg4 v-if="categories.spending">
              <categories-list
                color="amber darken-1"
                color-secondary="amber darken-3"
                :items="categories.spending"
                :data-budget="budget"
                categories-type="0"
                v-on:edit="editCategory"
                v-on:create="createCategory"
                v-on:transfer="transferTransactions"
                v-on:delete="deleteCategory"
                :title="$t('categories.spendingCategories')"
              ></categories-list>
            </v-flex>

            <v-flex xs12 md6 lg4>
              <categories-list
                color="light-green darken-3"
                color-secondary="light-green darken-4"
                :items="categories.income"
                :data-budget="budget"
                categories-type="1"
                v-on:edit="editCategory"
                v-on:create="createCategory"
                v-on:transfer="transferTransactions"
                v-on:delete="deleteCategory"
                :title="$t('categories.incomeCategories')"
              ></categories-list>
            </v-flex>

            <v-flex xs12 md6 lg4>
              <categories-list
                color="indigo"
                color-secondary="indigo darken-2"
                :items="categories.saving"
                :data-budget="budget"
                categories-type="2"
                v-on:edit="editCategory"
                v-on:create="createCategory"
                v-on:transfer="transferTransactions"
                v-on:delete="deleteCategory"
                :title="$t('categories.savingCategories')"
              ></categories-list>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { budgetService } from "../_services/budget.service";
import { transactionsService } from "../_services/transactions.service";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Action, State, namespace } from "vuex-class";
import { Budget } from "@/typings/Budget";
import { BudgetCategory } from "@/typings/BudgetCategory";
import { eCategoryType } from "../typings/enums/eCategoryType";
import { startOfMonth } from "date-fns";

const alertModule = namespace("alert");
const budgetsModule = namespace("budgets");

@Component({
  components: {
    "categories-list": () => import("../components/CategoriesList.vue")
  }
})
export default class BudgetCategories extends Vue {
  requiredRule: any[] = [v => !!v || this.$t("forms.requiredField")];

  @budgetsModule.State("budgets") budgets: Budget[];
  @alertModule.Action("error") dispatchError;
  @alertModule.Action("success") dispatchSuccess;
  @budgetsModule.Action("reloadInitialized") reloadInitialized;
  @budgetsModule.Action("initializeBudgets") initializeBudgets;
  @budgetsModule.Action("activeBudgetChange") activeBudgetChange;

  get budget(): Budget {
    return this.budgets.find(v => v.budgetId == this.$route.params.id as unknown as number);
  }

  get categories(): {
    income: BudgetCategory[];
    spending: BudgetCategory[];
    saving: BudgetCategory[];
  } {
    var saving = this.budget
      ? this.budget.budgetCategories.filter(v => v.type == eCategoryType.Saving)
      : [];
    var income = this.budget
      ? this.budget.budgetCategories.filter(v => v.type == eCategoryType.Income)
      : [];
    var spending = this.budget
      ? this.budget.budgetCategories.filter(
          v => v.type == eCategoryType.Spending
        )
      : [];
    return {
      income: income,
      spending: spending,
      saving: saving
    };
  }

  get incomeCategoriesSum() {
    if (this.categories.income.length == 0) {
      return 0;
    }
    return this.categories.income
      .map(v => this.readCurrentAmount(v))
      .reduce(function(a, b) {
        return 1 * a + 1 * b;
      });
  }

  get spendingCategoriesSum() {
    if (this.categories.spending.length == 0) {
      return 0;
    }
    return this.categories.spending
      .map(v => this.readCurrentAmount(v))
      .reduce(function(a, b) {
        return 1 * a + 1 * b;
      });
  }

  get savingsCategoriesSum() {
    if (this.categories.saving.length == 0) {
      return 0;
    }
    return this.categories.saving
      .map(v => this.readCurrentAmount(v))
      .reduce(function(a, b) {
        return 1 * a + 1 * b;
      });
  }

  get categoriesBalance() {
    return (
      this.incomeCategoriesSum -
      this.spendingCategoriesSum -
      this.savingsCategoriesSum
    );
  }

  mounted() {
    this.activeBudgetChange(this.$route.params.id);
    setTimeout(() => {
      this.initializeBudgets();
    }, 300);
    this.initializeBudgets();
  }

  @Watch("$route")
  RouteChange(to, from) {
    if (from.params.id != to.params.id) {
      this.activeBudgetChange(to.params.id);
      this.reloadInitialized();
    }
  }

  createCategory(category: BudgetCategory) {
    budgetService.createCategory(this.budget.budgetId, category).then(response => {
      if (response.ok) {
        this.reloadInitialized();
      } else {
        response.json().then(data => {
          this.dispatchError(data.message);
          this.reloadInitialized();
        });
      }
    });
  }

  editCategory(category: BudgetCategory) {
    budgetService.updateCategory(this.budget.budgetId, category).then(response => {
      if (response.ok) {
        this.reloadInitialized();
      } else {
        response.json().then(data => {
          this.dispatchError(data.message);
          this.reloadInitialized();
        });
      }
    });
  }

  deleteCategory(category: BudgetCategory) {
    this.$confirm({
      title: "general.remove",
      message: "categories.deleteConfirm",
      options: {
        color: "red",
        buttons: { yes: true, no: true, cancel: false, ok: false }
      }
    }).then(confirm => {
      if (confirm) {
        var type =
          category.type == 0
            ? "spending"
            : category.type == 1
            ? "income"
            : "saving";
        if (this.categories[type].length == 1) {
          this.dispatchError("categories.oneRequired");
          return;
        }
        budgetService
          .deleteCategory(this.$route.params.id, category.budgetCategoryId)
          .then(response => {
            if (response.ok) {
              this.reloadInitialized();
            } else {
              response.json().then(data => {
                this.dispatchError(data.message);
              });
            }
          });
      }
    });
  }

  transferTransactions(category: BudgetCategory) {
    var type =
      category.type == 0
        ? "spending"
        : category.type == 1
        ? "income"
        : "savings";

    var categories = this.categories[type].map(function(value, index) {
      return { text: value["name"], value: value["categoryId"] };
    });

    this.$confirm({
      title: "transactions.categoryTransfer",
      message: "categories.selectCategory",
      options: {
        color: "primary",
        selectList: categories,
        select: true,
        buttons: { yes: false, no: false, cancel: true, ok: true }
      }
    }).then(selection => {
      if (selection) {
        var type =
          category.type == 0
            ? "spending"
            : category.type == 1
            ? "income"
            : "savings";
        if (this.categories[type].length == 1) {
          this.dispatchError("categories.oneRequired");
          return;
        }
        transactionsService
          .transferTransactions(
            (this.$route.params.id as unknown) as number,
            category,
            selection.value as BudgetCategory
          )
          .then(response => {
            if (response.ok) {
              this.reloadInitialized();
              this.dispatchSuccess("general.changesSaved");
            } else {
              response.json().then(data => {
                this.dispatchError(data.message);
              });
            }
          });
      }
    });
  }

  readCurrentAmount(category: BudgetCategory) {
    var matching = category.amountConfigs.filter(v => {
      return (
        startOfMonth(new Date()) >= v.validFrom &&
        (!v.validTo || v.validTo >= startOfMonth(new Date()))
      );
    });
    return matching && matching.length > 0 ? matching[0].amount : null;
  }
}
</script>
