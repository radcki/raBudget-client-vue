<template>
<v-container  grid-list-md>     
    <v-layout row wrap align-center justify-center>
      <v-flex xs12>
        <v-subheader class="headline">
            {{ $t('categories.budgetCategories') }}
        </v-subheader>
      </v-flex>

      <v-flex xs12>
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

      <v-flex xs12>    
        <v-container grid-list-md>
          <v-layout row wrap>   
            
            <v-flex xs12 md6 lg4>
              <v-list subheader class="elevation-3">
                <v-subheader class="amber darken-1" dark>                          
                  {{ $t('categories.spendingCategories') }}
                  <v-spacer></v-spacer>
                  <v-btn icon v-on:click="openEditor('spending')">
                    <v-icon >add_circle_outline</v-icon>
                  </v-btn>
                  <v-chip color="amber darken-3" text-color="white">{{ spendingCategoriesSum | currency($currencies[budget.currency]) }}</v-chip>
                </v-subheader>

                <v-list-tile
                  avatar
                  v-for="(category, i) in categories.spending"
                  v-bind:data="category"
                  v-bind:key="i">
                  <v-list-tile-avatar color="amber darken-1">
                    <v-icon dark>{{ category.icon }}</v-icon>
                  </v-list-tile-avatar>

                  <v-list-tile-content>
                    <v-list-tile-title>{{ category.name }}</v-list-tile-title>
                    <v-list-tile-sub-title>
                      {{ category.amount | currency($currencies[budget.currency]) }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-btn icon @click="editCategory(category)">
                      <v-icon color="primary darken-1">edit</v-icon>
                    </v-btn>
                  </v-list-tile-action>

                  <v-list-tile-action v-if="$vuetify.breakpoint.mdAndUp">
                    <v-menu>
                      <v-btn slot="activator" icon>
                        <v-icon>more_vert</v-icon>
                      </v-btn>                      
                      <v-list light dense subheader>
                        <v-list-tile @click="transferTransactions(category)">
                          <v-list-tile-action>
                            <v-icon color="purple">reply_all</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-title>{{ $t("transactions.categoryTransfer") }}</v-list-tile-title>            
                        </v-list-tile>

                        <v-list-tile @click="deleteCategory(category)">
                          <v-list-tile-action>
                            <v-icon color="red">cancel</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-title>{{ $t("general.remove") }}</v-list-tile-title>            
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                  </v-list-tile-action>     

                  <v-list-tile-action v-if="$vuetify.breakpoint.smAndDown">                  
                    <v-btn icon @click="editCategory(category)">                      
                        <v-icon color="purple">reply_all</v-icon>                        
                    </v-btn>                    
                  </v-list-tile-action>                   

                  <v-list-tile-action v-if="$vuetify.breakpoint.smAndDown">
                    <v-btn icon @click="deleteCategory(category)"> 
                      <v-icon color="red">cancel</v-icon>
                    </v-btn>
                  </v-list-tile-action>

                </v-list-tile>
              </v-list>
            </v-flex>
                       
            <v-flex xs12 md6 lg4>
              <v-list subheader class="elevation-3">
                <v-subheader class="light-green darken-3" dark>
                  {{ $t('categories.incomeCategories') }}
                  <v-spacer></v-spacer>
                  <v-btn icon @click="openEditor('income')">
                    <v-icon >add_circle_outline</v-icon>
                  </v-btn>
                  <v-chip color="light-green darken-4" text-color="white">{{ incomeCategoriesSum | currency($currencies[budget.currency]) }}</v-chip>
                  
                </v-subheader>

                <v-list-tile
                  avatar
                  v-for="(category, i) in categories.income"
                  v-bind:data="category"
                  v-bind:key="i">
                  <v-list-tile-avatar color="light-green darken-3">
                    <v-icon dark>{{ category.icon }}</v-icon>
                  </v-list-tile-avatar>

                  <v-list-tile-content>
                    <v-list-tile-title>{{ category.name }}</v-list-tile-title>
                    <v-list-tile-sub-title>
                      {{ category.amount | currency($currencies[budget.currency]) }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-btn icon @click="editCategory(category)">
                      <v-icon color="primary darken-1">edit</v-icon>
                    </v-btn>
                  </v-list-tile-action>

                  <v-list-tile-action v-if="$vuetify.breakpoint.mdAndUp">
                    <v-menu>
                      <v-btn slot="activator" icon>
                        <v-icon>more_vert</v-icon>
                      </v-btn>                      
                      <v-list light dense subheader>
                        <v-list-tile @click="transferTransactions(category)">
                          <v-list-tile-action>
                            <v-icon color="purple">reply_all</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-title>{{ $t("transactions.categoryTransfer") }}</v-list-tile-title>            
                        </v-list-tile>

                        <v-list-tile @click="deleteCategory(category)">
                          <v-list-tile-action>
                            <v-icon color="red">cancel</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-title>{{ $t("general.remove") }}</v-list-tile-title>            
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                  </v-list-tile-action>     

                  <v-list-tile-action v-if="$vuetify.breakpoint.smAndDown">                  
                    <v-btn icon @click="editCategory(category)">                      
                        <v-icon color="purple">reply_all</v-icon>                        
                    </v-btn>                    
                  </v-list-tile-action>                   

                  <v-list-tile-action v-if="$vuetify.breakpoint.smAndDown">
                    <v-btn icon @click="deleteCategory(category)"> 
                      <v-icon color="red">cancel</v-icon>
                    </v-btn>
                  </v-list-tile-action>

                </v-list-tile>
              </v-list>
            </v-flex>

            <v-flex xs12 md6 lg4>
              <v-list subheader class="elevation-3">
                <v-subheader class="indigo" dark>
                  {{ $t('categories.savingCategories') }}
                  <v-spacer></v-spacer>
                  <v-btn icon @click="openEditor('saving')">
                    <v-icon >add_circle_outline</v-icon>
                  </v-btn>
                  <v-chip color="indigo darken-2" text-color="white">{{ savingsCategoriesSum | currency($currencies[budget.currency]) }}</v-chip>
                </v-subheader>

                <v-list-tile
                  avatar
                  v-for="(category, i) in categories.savings"
                  v-bind:data="category"
                  v-bind:key="i">
                  <v-list-tile-avatar color="indigo">
                    <v-icon dark>{{ category.icon }}</v-icon>
                  </v-list-tile-avatar>

                  <v-list-tile-content>
                    <v-list-tile-title>{{ category.name }}</v-list-tile-title>
                    <v-list-tile-sub-title>
                      {{ category.amount | currency($currencies[budget.currency]) }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-btn icon @click="editCategory(category)">
                      <v-icon color="primary darken-1">edit</v-icon>
                    </v-btn>
                  </v-list-tile-action>

                  <v-list-tile-action v-if="$vuetify.breakpoint.mdAndUp">
                    <v-menu>
                      <v-btn slot="activator" icon>
                        <v-icon>more_vert</v-icon>
                      </v-btn>                      
                      <v-list light dense subheader>
                        <v-list-tile @click="transferTransactions(category)">
                          <v-list-tile-action>
                            <v-icon color="purple">reply_all</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-title>{{ $t("transactions.categoryTransfer") }}</v-list-tile-title>            
                        </v-list-tile>

                        <v-list-tile @click="deleteCategory(category)">
                          <v-list-tile-action>
                            <v-icon color="red">cancel</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-title>{{ $t("general.remove") }}</v-list-tile-title>            
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                  </v-list-tile-action>     

                  <v-list-tile-action v-if="$vuetify.breakpoint.smAndDown">                  
                    <v-btn icon @click="editCategory(category)">                      
                        <v-icon color="purple">reply_all</v-icon>                        
                    </v-btn>                    
                  </v-list-tile-action>                   

                  <v-list-tile-action v-if="$vuetify.breakpoint.smAndDown">
                    <v-btn icon @click="deleteCategory(category)"> 
                      <v-icon color="red">cancel</v-icon>
                    </v-btn>
                  </v-list-tile-action>

                </v-list-tile>
              </v-list>
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
  data() {
    return {
      step: 1,
      budget: {
        name: null,
        startDate: null,
        currency: "pln"
      },
      categories: {
        income: [],
        spending: [],
        savings: []
      },
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
      validStep1: true,
      validStep2: true,
      validStep3: true,
      validStep4: true,
      requiredRule: [v => !!v || this.$t("forms.requiredField")]
    };
  },
  computed: {
    incomeCategoriesSum: function() {
      var sum = 0;
      for (var i = 0; i < this.categories.income.length; i++) {
        sum += this.categories.income[i].amount * 1;
      }
      return sum;
    },
    spendingCategoriesSum: function() {
      var sum = 0;
      for (var i = 0; i < this.categories.spending.length; i++) {
        sum += this.categories.spending[i].amount * 1;
      }
      return sum;
    },
    savingsCategoriesSum: function() {
      var sum = 0;
      for (var i = 0; i < this.categories.savings.length; i++) {
        sum += this.categories.savings[i].amount * 1;
      }
      return sum;
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
    this.loadBudget(this.$route.params.id);
  },
  watch: {
    editor: function() {
      if (this.editor == false) {
        this.closeEditor();
      }
    },
    $route(to, from) {
      this.loadBudget(to.params.id);
    }
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
                    : "savings";

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
    },
    loadBudget(id) {
      budgetService.getBudget(id).then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.budget.currency = data.currency;
            this.categories.spending = data.spendingCategories;
            this.categories.savings = data.savingCategories;
            this.categories.income = data.incomeCategories;
          });
        } else {
          reponse.json().then(data => {
            this.dispatchError(data.message);
          });
        }
      });
    }
  }
};
</script>