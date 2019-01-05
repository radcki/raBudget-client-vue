<template>
<v-container  grid-list-md v-if="budget">     
    <v-layout row wrap align-center justify-center>
      <v-flex xs12>
        <v-subheader class="headline">
            {{ $t('categories.budgetCategories') }}
        </v-subheader>
      </v-flex>

      <v-flex xs12 >
        <v-card>
          <v-card-text>
              <div>Plan wydatków: {{ spendingCategoriesSum | currency($currencies[budget.currency]) }}</div>
              <div>Plan dochodów: {{ incomeCategoriesSum | currency($currencies[budget.currency]) }}</div>
              <div>Plan oszczędności: {{ savingsCategoriesSum | currency($currencies[budget.currency]) }}</div>
              <v-divider></v-divider>
              <div>Bilans: <v-chip :color="categoriesBalance >= 0 ? 'green lighten-2' : 'red lighten-2' " >{{ categoriesBalance | currency($currencies[budget.currency]) }}</v-chip></div>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs12 >    
        <v-container grid-list-md class="pa-0">
          <v-layout row wrap>   
            
            <v-flex xs12 md6 lg4 v-if="categories.spending">
              <categories-list
                color="amber darken-1"
                color-secondary="amber darken-3"
                :items="categories.spending"
                :data-budget="budget"                
                categories-type="spending"
                v-on:edit="editCategory"
                v-on:transfer="transferTransactions"
                v-on:delete="deleteCategory"
                :title="$t('categories.spendingCategories')"
                >              
              </categories-list>
              
            </v-flex>
                       
            <v-flex xs12 md6 lg4>
              <categories-list
                color="light-green darken-3"
                color-secondary="light-green darken-4"
                :items="categories.income"
                :data-budget="budget"
                categories-type="income"
                v-on:edit="editCategory"
                v-on:transfer="transferTransactions"
                v-on:delete="deleteCategory"
                :title="$t('categories.incomeCategories')"
                >              
              </categories-list>

            </v-flex>

            <v-flex xs12 md6 lg4>
              <categories-list
                color="indigo"
                color-secondary="indigo darken-2"
                :items="categories.saving"
                :data-budget="budget"
                categories-type="saving"
                v-on:edit="editCategory"
                v-on:transfer="transferTransactions"
                v-on:delete="deleteCategory"
                :title="$t('categories.savingCategories')"
                >              
              </categories-list>

            </v-flex>
          </v-layout>                  
        </v-container>
      </v-flex>
    </v-layout>

    
</v-container>
</template>

<script>
import { budgetService } from "../_services/budget.service";
import { transactionsService } from "../_services/transactions.service";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    "categories-list": () => import("../components/CategoriesList"),    
  },
  data() {
    return {
      requiredRule: [v => !!v || this.$t("forms.requiredField")]
    };
  },
  computed: {
    ...mapState({
      budgets: state => state.budgets.budgets
    }),
    budget() {
      return this.budgets.filter(v=>v.id == this.$route.params.id)[0]
    },
    categories() {
      var saving = this.budget ? this.budget.savingCategories : [];
      var income = this.budget ? this.budget.incomeCategories : [];
      var spending = this.budget ? this.budget.spendingCategories : [];
      return {        
        income: income,
        spending: spending,
        saving: saving     
      }
    },
    incomeCategoriesSum: function() {
      if (this.categories.income.length == 0 ) {return 0}  
      return this.categories.income.map(v=>this.readCurrentAmount(v)).reduce(function(a,b){return 1*a+1*b})
    },
    spendingCategoriesSum: function() {
      if (this.categories.spending.length == 0 ) {return 0}
      return this.categories.spending.map(v=>this.readCurrentAmount(v)).reduce(function(a,b){return 1*a+1*b})
    },
    savingsCategoriesSum: function() {
      if (this.categories.saving.length == 0 ) {return 0}
      return this.categories.saving.map(v=>this.readCurrentAmount(v)).reduce(function(a,b){return 1*a+1*b})
    },
    categoriesBalance: function() {
      return (
        this.incomeCategoriesSum -
        this.spendingCategoriesSum -
        this.savingsCategoriesSum
      );
    },
    currencies: function() {
      return Object.keys(this.$currencies);
    }
  },

  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success",
      budgetsFetch: "budgets/fetchBudgets"
    }),

    editCategory(category) {
      budgetService.saveCategory(this.budget.id, category).then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.budgetsFetch();
            });
          } else {
            response.json().then(data => {
              this.dispatchError(data.message);
              this.budgetsFetch();
            });
          }
        });
    },
    
    deleteCategory(category) {
      this.$root
        .$confirm("general.remove", "categories.deleteConfirm", {
          color: "red",
          buttons: { yes: true, no: true, cancel: false, ok: false }
        })
        .then(confirm => {
          if (confirm) {
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
            budgetService
              .deleteCategory(this.$route.params.id, category.categoryId)
              .then(response => {
                if (response.ok) {
                  var type =
                    category.type == 0
                      ? "spending"
                      : category.type == 1
                        ? "income"
                        : "savings";

                  for (var i = 0; i < this.categories[type].length; i++)
                    if (this.categories[type][i].name === category.name) {
                      this.categories[type].splice(i, 1);
                      break;
                    }
                } else {
                  response.json().then(data => {
                    this.dispatchError(data.message);
                  });
                }
              });
          }
        });
    },
    transferTransactions(category) {
      var type =
        category.type == 0
          ? "spending"
          : category.type == 1
            ? "income"
            : "savings";

      var categories = this.categories[type].map(function(value, index) {
        return { text: value["name"], value: value["categoryId"] };
      });

      this.$root
        .$confirm(
          "transactions.categoryTransfer",
          "categories.selectCategory",
          {
            color: "primary",
            selectList: categories,
            select: true,
            buttons: { yes: false, no: false, cancel: true, ok: true }
          }
        )
        .then(selection => {
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
                this.$route.params.id,
                category.categoryId,
                selection.value
              )
              .then(response => {
                if (response.ok) {
                  this.dispatchSuccess("general.changesSaved");
                } else {
                  response.json().then(data => {
                    this.dispatchError(data.message);
                  });
                }
              });
          }
        });
    },
    readCurrentAmount(category) {
      var matching = category.amountConfigs.filter( v => {
        return this.$moment().startOf('month') >= this.$moment(v.validFrom, 'YYYY-MM') && (!v.validTo || this.$moment(v.validTo, 'YYYY-MM') >= this.$moment().startOf('month'))
      });
      return matching && matching.length > 0 ? matching[0].amount : null
    }
  }
};
</script>