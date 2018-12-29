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
        <v-container grid-list-md>
          <v-layout row wrap>   
            
            <v-flex xs12 md6 lg4 v-if="categories.spending">
              <categories-list
                color="amber darken-1"
                color-secondary="amber darken-3"
                :items="categories.spending"
                :data-budget="budget"
                v-on:new="openEditor('spending')"
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
                v-on:new="openEditor('income')"
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
                v-on:new="openEditor('saving')"
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

    <v-dialog width="500" v-model="editor">
      <v-card>
        <v-card-text>
          <v-form ref="editor">
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs3>
                  <v-select
                    v-model="categoryEditor.icon"
                    :items="icons"
                    :label="$t('general.icon')">
                  >
                    <template slot="selection" slot-scope="data">
                      <v-icon>{{ data.item }}</v-icon>
                    </template>
                    <template slot="item" slot-scope="data">
                      <v-icon>{{ data.item }}</v-icon>
                    </template>
                  </v-select>
                </v-flex>
                <v-flex xs9>
                  <v-text-field 
                    :rules="requiredRule"
                    v-model="categoryEditor.name"
                    :label="$t('categories.name')">
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field 
                    prepend-icon="payment"
                    type="number" 
                    step="0.01"
                    :rules="requiredRule"
                    min="0"
                    v-model="categoryEditor.amount"
                    :label="$t('categories.monthlyAmount')">
                  </v-text-field>
                </v-flex>  
                <v-flex xs12>
                  <div>Kwota dziennie: {{ (categoryEditor.amount / 30) | currency($currencies[budget.currency]) }}</div>
                  <div>Kwota rocznie: {{ (categoryEditor.amount * 12) | currency($currencies[budget.currency]) }}</div>
                </v-flex>                
              </v-layout>                  
            </v-container>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>          
          <v-btn
            color="red"
            flat
            @click="closeEditor"
          >
            {{$t('general.cancel')}}
          </v-btn>

          <v-btn
            color="primary"
            flat
            @click="saveCategory"
          >
            {{$t('general.save')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      categoryEditor: {
        categoryId: null,
        name: null,
        amount: null,
        icon: null,
        type: null
      },
      editor: false,
      icons: this.$categoryIcons,
      dateMenu: false,
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
      return this.categories.income.map(v=>v.amount).reduce(function(a,b){return 1*a+1*b})
    },
    spendingCategoriesSum: function() {
      if (this.categories.spending.length == 0 ) {return 0}
      return this.categories.spending.map(v=>v.amount).reduce(function(a,b){return 1*a+1*b})
    },
    savingsCategoriesSum: function() {
      if (this.categories.saving.length == 0 ) {return 0}
      return this.categories.saving.map(v=>v.amount).reduce(function(a,b){return 1*a+1*b})
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
  mounted: function() {

  },
  watch: {
    editor: function() {
      if (this.editor == false) {
        this.closeEditor();
      }
    },
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success"
    }),
    closeEditor() {
      this.categoryEditor.type = null;
      this.categoryEditor.categoryId = null;
      this.$refs.editor.reset();
      this.editor = false;
    },
    openEditor(type) {
      this.editor = true;
      this.categoryEditor.type = type;
    },
    editCategory(category, type) {
      this.categoryEditor.categoryId = category.categoryId;
      this.categoryEditor.icon = category.icon;
      this.categoryEditor.amount = category.amount;
      this.categoryEditor.name = category.name;
      this.categoryEditor.type = category.type;
      this.editor = true;
    },
    saveCategory() {
      var category = {};
      budgetService
        .saveCategory(this.$route.params.id, this.categoryEditor)
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              var type =
                data.type == 0
                  ? "spending"
                  : data.type == 1
                    ? "income"
                    : "saving";

              category = this.categories[type].find(function(element) {
                return element.categoryId == data.categoryId;
              });

              if (category) {
                category.name = this.categoryEditor.name;
                category.amount = this.categoryEditor.amount;
                category.icon = this.categoryEditor.icon;
              } else {
                this.categories[type].push(data);
              }
              this.closeEditor();
            });
          } else {
            response.json().then(data => {
              this.dispatchError(data.message);
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
    }
  }
};
</script>