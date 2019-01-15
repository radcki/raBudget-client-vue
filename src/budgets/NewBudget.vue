<template>
<v-container >     
    <v-layout wrap align-center justify-center>
      <v-flex xs12>
        <v-subheader class="headline">
            {{ $t('budgets.new') }}
        </v-subheader>
      </v-flex>
      <v-flex xs12>
        <v-stepper v-model="step">
          <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">{{ $t('budgets.budget') }}</v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="step > 2" step="2">{{ $t('categories.incomeCategories') }}</v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="step > 3" step="3">{{ $t('categories.spendingCategories') }}</v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="step > 4" step="4">{{ $t('categories.savingCategories') }}</v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="5">{{ $t('general.summary') }}</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-subheader class="headline">
                  {{ $t('budgets.basicData') }}
                </v-subheader>
              <v-form ref="form" v-model="validStep1" >
                <v-container grid-list-md>
                    <v-layout row wrap>
                      <v-flex xs8 sm6>
                        <v-text-field
                          prepend-icon="title"
                          v-model="budget.name"
                          :rules="requiredRule"
                          :label="$t('general.name')"
                          required
                          ></v-text-field>
                      </v-flex>

                      <v-flex xs4 sm2>                        
                          <v-select
                            v-model="budget.currency"
                            :items="currencies"
                            :label="$t('budgets.currency')"
                          ></v-select>
                      </v-flex>

                      <v-flex xs8 sm4>
                        <v-menu
                          ref="dateMenu"
                          :close-on-content-click="false"
                          v-model="dateMenu"
                          :nudge-right="40"
                          :return-value.sync="budget.startingDate"
                          lazy
                          transition="scale-transition"
                          offset-y
                          full-width
                          min-width="290px"
                        >
                          <v-text-field
                            slot="activator"
                            v-model="budget.startingDate"
                            :label="$t('budgets.startDate')"
                            :rules="requiredRule"
                            prepend-icon="event"
                            readonly
                          ></v-text-field>
                          <v-date-picker v-model="budget.startingDate" @input="$refs.dateMenu.save(budget.startingDate)"></v-date-picker>

                        </v-menu>
                      </v-flex>
                    </v-layout>
                </v-container>
              </v-form>

              <v-btn :disabled="!validStep1" color="primary" @click="step = 2">
                {{ $t("general.stepForward") }}
              </v-btn>

            </v-stepper-content>

            <v-stepper-content step="2">
              <v-list two-line subheader>
                <v-subheader class="headline">
                  {{ $t('categories.incomeCategories') }}
                </v-subheader>
                <v-form ref="formIncomeCategory" v-model="validStep2" >
                  <v-container grid-list-md>
                    <v-layout row wrap>
                      <v-flex xs3 md1 d-flex>
                        <v-select
                          v-model="newIncomeCategory.icon"
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
                      <v-flex xs9 md5>
                        <v-text-field 
                          :rules="requiredRule"
                          v-model="newIncomeCategory.name"
                          :label="$t('categories.name')">
                        </v-text-field>
                      </v-flex>
                      <v-flex xs12 md4>
                        <v-text-field 
                          prepend-icon="payment"
                          type="number" 
                          step="0.01"
                          :rules="requiredRule"
                          min="0"
                          v-model="newIncomeCategory.amount"
                          :label="$t('categories.monthlyAmount')">
                        </v-text-field>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-btn
                          color="primary"
                          class="white--text"
                          @click="addIncome">
                          {{$t('general.add')}}
                          <v-icon right dark>add_circle_outline</v-icon>
                        </v-btn>
                      </v-flex>                    
                    </v-layout>                  
                  </v-container>
                </v-form>

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
                      {{ $t("categories.monthlyAmount") }}: {{ category.amount | currency($currencies[budget.currency]) }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-btn flat icon ripple dark color="primary" @click="editIncome(i)">
                      <v-icon >edit</v-icon>
                    </v-btn>
                  </v-list-tile-action> 
                  <v-list-tile-action>
                    <v-btn flat icon ripple dark color="red" @click="removeIncome(i)">
                      <v-icon >close</v-icon>
                    </v-btn>
                  </v-list-tile-action> 
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-content>
                    {{ $t("categories.totalAmount") }}: {{ incomeCategoriesSum | currency($currencies[budget.currency]) }}
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>

              <v-btn :disabled="!(categories.income.length>0)" color="primary" @click="step = 3">
                {{ $t("general.stepForward") }}
              </v-btn>

              <v-btn flat @click="step = 1">
                {{ $t("general.stepBack") }}
              </v-btn>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-list two-line subheader>
                <v-subheader class="headline">
                  {{ $t('categories.spendingCategories') }}
                </v-subheader>
                <v-form ref="formSpendingCategory" v-model="validStep3" >
                  <v-container grid-list-md>
                    <v-layout row wrap>
                      <v-flex xs3 md1 d-flex>
                        <v-select
                          v-model="newSpendingCategory.icon"
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
                      <v-flex xs9 md5>
                        <v-text-field 
                          :rules="requiredRule"
                          v-model="newSpendingCategory.name"
                          :label="$t('categories.name')">
                        </v-text-field>
                      </v-flex>
                      <v-flex xs12 md4>
                        <v-text-field 
                          prepend-icon="payment"
                          type="number" 
                          step="0.01"
                          :rules="requiredRule"
                          min="0"
                          v-model="newSpendingCategory.amount"
                          :label="$t('categories.monthlyAmount')">
                        </v-text-field>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-btn
                          color="primary"
                          class="white--text"
                          @click="addSpending">
                          {{$t('general.add')}}
                          <v-icon right dark>add_circle_outline</v-icon>
                        </v-btn>
                      </v-flex>                    
                    </v-layout>                  
                  </v-container>
                </v-form>

                <v-list-tile
                  avatar
                  v-for="(category, i) in categories.spending"
                  v-bind:data="category"
                  v-bind:key="i">
                  <v-list-tile-avatar color="amber">
                    <v-icon dark>{{ category.icon }}</v-icon>
                  </v-list-tile-avatar>

                  <v-list-tile-content>
                    <v-list-tile-title>{{ category.name }}</v-list-tile-title>

                    <v-list-tile-sub-title>
                      {{ $t("categories.monthlyAmount") }}: {{ category.amount | currency($currencies[budget.currency]) }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-btn flat icon ripple dark color="primary" @click="editSpending(i)">
                      <v-icon >edit</v-icon>
                    </v-btn>
                  </v-list-tile-action> 
                  <v-list-tile-action>
                    <v-btn flat icon ripple dark color="red" @click="removeSpending(i)">
                      <v-icon >close</v-icon>
                    </v-btn>
                  </v-list-tile-action> 
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-content>
                    {{ $t("categories.totalAmount") }}: {{ spendingCategoriesSum | currency($currencies[budget.currency]) }}
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>

              <v-btn :disabled="!(categories.spending.length>0)" color="primary" @click="step = 4">
                {{ $t("general.stepForward") }}
              </v-btn>

              <v-btn flat @click="step = 2">
                {{ $t("general.stepBack") }}
              </v-btn>
            </v-stepper-content>

            <v-stepper-content step="4">
              <v-list two-line subheader>
                <v-subheader class="headline">
                  {{ $t('categories.savingCategories') }}
                </v-subheader>
                <v-form ref="formSavingCategory" v-model="validStep4" >
                  <v-container grid-list-md>
                    <v-layout row wrap>
                      <v-flex xs3 md1 d-flex>
                        <v-select
                          v-model="newSavingCategory.icon"
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
                      <v-flex xs9 md5>
                        <v-text-field 
                          :rules="requiredRule"
                          v-model="newSavingCategory.name"
                          :label="$t('categories.name')">
                        </v-text-field>
                      </v-flex>
                      <v-flex xs12 md4>
                        <v-text-field 
                          prepend-icon="payment"
                          type="number" 
                          step="0.01"
                          :rules="requiredRule"
                          min="0"
                          v-model="newSavingCategory.amount"
                          :label="$t('categories.monthlyAmount')">
                        </v-text-field>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-btn
                          color="primary"
                          class="white--text"
                          @click="addSaving">
                          {{$t('general.add')}}
                          <v-icon right dark>add_circle_outline</v-icon>
                        </v-btn>
                      </v-flex>                    
                    </v-layout>                  
                  </v-container>
                </v-form>

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
                      {{ $t("categories.monthlyAmount") }}: {{ category.amount | currency($currencies[budget.currency]) }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-btn flat icon ripple dark color="primary" @click="editSaving(i)">
                      <v-icon >edit</v-icon>
                    </v-btn>
                  </v-list-tile-action> 
                  <v-list-tile-action>
                    <v-btn flat icon ripple dark color="red" @click="removeSaving(i)">
                      <v-icon >close</v-icon>
                    </v-btn>
                  </v-list-tile-action> 
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-content>
                    {{ $t("categories.totalAmount") }}: {{ savingsCategoriesSum | currency($currencies[budget.currency]) }}
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>

              <v-btn :disabled="!(categories.savings.length>0)" color="primary" @click="step = 5">
                {{ $t("general.stepForward") }}
              </v-btn>

              <v-btn flat @click="step = 3">
                {{ $t("general.stepBack") }}
              </v-btn>
            </v-stepper-content>

            
            <v-stepper-content step="5">
              
                <v-subheader class="headline">
                  {{ $t('general.summary') }}
                </v-subheader>
                <v-list-tile>
                  <v-list-tile-content>
                     
                     <v-list-tile-title>
                       {{ $t('budgets.budgetName') }}: {{ budget.name }}
                     </v-list-tile-title>

                    <v-list-tile-sub-title>
                      {{ $t('budgets.startDate') }}: {{ budget.startingDate }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
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
                        >              
                      </categories-list>
                      
                    </v-flex>
                              
                    <v-flex xs12 md6 lg4>
                      <categories-list
                        color="light-green darken-3"
                        color-secondary="light-green darken-4"
                        :items="categories.income"
                        :data-budget="budget"
                        hide-actions
                        :title="$t('categories.incomeCategories')"
                        >              
                      </categories-list>

                    </v-flex>

                    <v-flex xs12 md6 lg4>
                      <categories-list
                        color="indigo"
                        color-secondary="indigo darken-2"
                        :items="categories.savings"
                        :data-budget="budget"
                        hide-actions
                        :title="$t('categories.savingCategories')"
                        >              
                      </categories-list>

                    </v-flex>
                  </v-layout>                  
                </v-container>             

              <v-btn color="primary" @click="createBudget">
                {{ $t("general.save") }}
              </v-btn>

              <v-btn flat @click="step = 4">{{ $t("general.stepBack") }}</v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import { budgetService } from "../_services/budget.service";
import { mapActions } from "vuex";

export default {
  components: {
    "categories-list": () => import("../components/CategoriesList"),
  },
  data() {
    return {
      step: 1,
      budget: {
        name: null,
        startingDate: null,
        currency: "pln"
      },
      categories: {
        income: [],
        spending: [],
        savings: []
      },
      newIncomeCategory: {
        name: null,
        amount: null,
        icon: null
      },
      newSpendingCategory: {
        name: null,
        amount: null,
        icon: null
      },
      newSavingCategory: {
        name: null,
        amount: null,
        icon: null
      },
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
    currencies: function() {
      return Object.keys(this.$currencies);
    }
  },
  methods: {
    ...mapActions({
      budgetsFetch: "budgets/fetchBudgets"
    }),
    addIncome() {
      if (this.$refs.formIncomeCategory.validate()) {
        // unbind
        const data = JSON.parse(JSON.stringify(this.newIncomeCategory));
        this.categories.income.push(data);
        this.$refs.formIncomeCategory.reset();
      }
    },
    removeIncome(index) {
      this.categories.income.splice(index, 1);
    },
    editIncome(index) {
      this.newIncomeCategory = this.categories.income[index];
      this.categories.income.splice(index, 1);
    },

    addSpending() {
      if (this.$refs.formSpendingCategory.validate()) {
        // unbind
        var data = JSON.parse(JSON.stringify(this.newSpendingCategory));
        this.categories.spending.push(data);
        this.$refs.formSpendingCategory.reset();
      }
    },
    removeSpending(index) {
      this.categories.spending.splice(index, 1);
    },
    editSpending(index) {
      this.newSpendingCategory = this.categories.spending[index];
      this.categories.spending.splice(index, 1);
    },

    addSaving() {
      if (this.$refs.formSavingCategory.validate()) {
        // unbind
        const data = JSON.parse(JSON.stringify(this.newSavingCategory));
        this.categories.savings.push(data);
        this.$refs.formSavingCategory.reset();
      }
    },
    removeSaving(index) {
      this.categories.savings.splice(index, 1);
    },
    editSaving(index) {
      this.newSavingCategory = this.categories.savings[index];
      this.categories.savings.splice(index, 1);
    },
    createBudget() {
      budgetService
        .createBudget(this.budget, this.categories)
        .then(response => {
          if (response.ok) {
            response.json().then(data => {              
              this.budgetsFetch().then(()=>{
                this.$router.push("/");
              })
            });
          } else {
            response.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
    }
  }
};
</script>