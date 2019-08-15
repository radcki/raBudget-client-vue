<template>

<v-container  grid-list-md v-if="budget">     
    <v-layout row wrap align-center justify-center >
      <v-flex xs12>
        
      </v-flex>

      <v-flex xs12>
        <v-card max-width="800" v-if="!$wait.is('budgets.load')">
          <v-card-title>
            <v-subheader class="headline">
            {{ $t('budgets.budget') }}
            </v-subheader>
          </v-card-title>
            <v-card-text>
              <v-container  grid-list-md>     
                <v-layout row wrap align-center justify-center >
                  <v-flex xs8 sm6>
                    <v-text-field
                      :prepend-icon="mdiFormatTitle"
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
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="290px"
                    >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="budget.startingDate"
                        :label="$t('budgets.startDate')"
                        :rules="requiredRule"
                        :prepend-icon="mdiCalendar"
                        readonly
                      ></v-text-field>
                    </template>
                      <v-date-picker v-model="budget.startingDate" type="month" @input="$refs.dateMenu.save(budget.startingDate)"></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs12>
                    <v-btn :disabled="budget.default" color="green" class="white--text" @click="setDefault" >
                      <v-icon left>{{budget.default ? mdiStar : mdiStarOutline}}</v-icon>
                      {{$t('budgets.setDefault')}}
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="red" dark @click="deleteBudget">
                <v-icon left>{{mdiTrashCan}}</v-icon>
                {{ $t("general.delete") }}
              </v-btn>

              <v-btn text color="primary" @click="saveBudget">
                <v-icon left>{{mdiContentSave}}</v-icon>
                {{ $t("general.save") }}
              </v-btn>
              
            </v-card-actions>
        </v-card>
      </v-flex>

    </v-layout>
</v-container>
</template>

<script>
import { budgetService } from "../_services/budget.service";
import { mapState, mapActions } from "vuex";

import { mdiFormatTitle, mdiTrashCan, mdiStarOutline, mdiStar, mdiCalendar, mdiContentSave } from "@mdi/js"


export default {
  data() {
    return {
      step: 1,

      dateMenu: false,
      valid: true,
      requiredRule: [v => !!v || this.$t("forms.requiredField")],
      mdiFormatTitle, mdiTrashCan, mdiStarOutline, mdiStar, mdiCalendar, mdiContentSave
    };
  },
  computed: {
    ...mapState({
      budgets: state => state.budgets.budgets
    }),

    currencies: function() {
      return Object.keys(this.$currencies);
    },
    budget() {return this.budgets.filter(v=>v.id==this.$route.params.id)[0]}
  },  
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success",
      budgetsFetch: "budgets/fetchBudgets"
    }),
    saveBudget() {
      var category = {};
      
      budgetService
        .saveBudget(this.$route.params.id, this.budget)
        .then(response => {
          if (response.ok) {
            this.budgetsFetch();
            this.dispatchSuccess("general.changesSaved");
          } else {
            response.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
    },
    setDefault() {
      budgetService
        .setDefault(this.$route.params.id, this.budget)
        .then(response => {
          if (response.ok) {
            this.dispatchSuccess("general.changesSaved");
            this.budgetsFetch();
          } else {
            response.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
    },
    deleteBudget() {
      this.$root
        .$confirm("general.remove", "budgets.deleteConfirm", {
          color: "red",
          buttons: { yes: true, no: true, cancel: false, ok: false }
        })
        .then(confirm => {
          if (confirm) {
            budgetService.deleteBudget(this.$route.params.id).then(response => {
              if (response.ok) {
                this.$router.push("/");
                this.budgetsFetch();
              } else {
                response.json().then(data => {
                  this.dispatchError(data.message);
                });
              }
            });
          }
        }
      );      
    },
    
  }
};
</script>