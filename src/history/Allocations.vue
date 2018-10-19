<template>
<v-container grid-list-md>     
    <v-layout row wrap>

      <v-flex xs12>
         <v-subheader class="headline">
            {{$t('allocations.recentAllocations')}}
        </v-subheader>  
      </v-flex>

      <v-flex xs12>
        <v-card class="px-3">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
                <v-layout row wrap> 
                  <v-flex xs12 md6>                    
                    <v-select
                      :items="categories['spendings']"
                      v-model="filters.categories"
                      v-if="filters.categories"
                      multiple                            
                      item-text="name"
                      return-object
                      single-line
                      class="caption"
                      :rules="requiredRule"
                      persistent-hint
                      :hint="$t('general.category')">

                      <template slot="item" slot-scope="data">
                        <v-list-tile-action v-if="data.item">
                          <v-icon>{{ data.item.icon }}</v-icon>
                        </v-list-tile-action>                      
                        <span>{{ data.item.name }}</span>
                      </template>
                    </v-select>
                  </v-flex>

                  <v-flex xs12 md6>
                    <v-container fluid grid-list-sm class="pa-0">
                      <v-layout row wrap > 
                        
                        <v-flex xs6 style="width: 120px">
                          <v-menu
                            ref="dateMenuStart"
                            :close-on-content-click="false"
                            v-model="dateMenuStart"
                            :nudge-right="40"
                            :return-value.sync="filters.startDate"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            min-width="290px"
                          >
                            <v-text-field
                              slot="activator"
                              v-model="filters.startDate"
                              :label="$t('general.fromDate')"
                              :rules="requiredRule"
                              readonly
                            ></v-text-field>
                            <v-date-picker 
                              :min="budget.startDate"
                              :max="today"
                              v-model="filters.startDate" 
                              @input="$refs.dateMenuStart.save(filters.startDate)"></v-date-picker>

                          </v-menu>
                        </v-flex>

                        <v-flex xs6 style="width: 120px" >
                          <v-menu
                            ref="dateMenuEnd"
                            :close-on-content-click="false"
                            v-model="dateMenuEnd"                      
                            :nudge-right="40"
                            :return-value.sync="filters.endDate"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            min-width="290px"
                          >
                            <v-text-field
                              slot="activator"
                              v-model="filters.endDate"
                              :label="$t('general.fromDate')"
                              :rules="requiredRule"
                              readonly
                            ></v-text-field>
                            <v-date-picker 
                              :min="budget.startDate"
                              :max="today" 
                              v-model="filters.endDate" 
                              @input="$refs.dateMenuEnd.save(filters.endDate)"></v-date-picker>

                          </v-menu>
                        </v-flex>
                        <v-flex xs12>
                          <v-range-slider
                            v-model="sliderValue"
                            :max="sliderMax"
                            :min="0"
                            :step="1"
                          ></v-range-slider>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-flex>

                </v-layout>
            </v-container>
          </v-card-text>  
          <v-card-actions>
            <v-spacer>              
            </v-spacer>
            <v-btn color="primary" @click="fetchAllocations()">{{ $t('general.search') }}</v-btn>
          </v-card-actions>
        </v-card> 
      </v-flex>

       <v-flex xs12 v-if="allocations || loading">
         <v-subheader class="headline">
            {{$t('general.foundData')}}
        </v-subheader>
      </v-flex>

      <v-flex xs12 v-if="loading" class="text-xs-center">
        <v-progress-circular
          :size="70"
          :width="7"
          color="amber darken-3"
          indeterminate
        ></v-progress-circular>
      </v-flex>

      <v-flex xs12 v-if="error" class="text-xs-center">
        <v-icon color="red" size="80">error</v-icon>
      </v-flex>


      <v-flex xs12 class="elevation-1 white" v-if="allocations">
        <v-layout row justify-end>
          <v-flex xs4>
            <v-text-field
              v-if="$vuetify.breakpoint.smAndUp"
              v-model="search"
              append-icon="search"               
              :label="$t('general.search')"
              single-line 
              hide-details></v-text-field>
          </v-flex>
        </v-layout>
        
        <v-data-table
          v-if="$vuetify.breakpoint.smAndUp"
          :headers="headers"
          :items="allocations"
          :loading="loading"
          :search="search"
          must-sort
          
          disable-initial-sort
          :rows-per-page-items="[15,25,50,{text: $t('general.all'), value: -1}]"
        >
          <template slot="items" slot-scope="props">
            <td>
              <v-icon class="px-2">{{ props.item.destinationCategory.icon }}</v-icon>
              {{ props.item.destinationCategory.name }}
            </td>
            <td>{{ props.item.date | moment("dddd, D.MM.YYYY") }}</td>
            <td>{{ props.item.description }}</td>
            <td>{{ props.item.amount | currency($currencies[budget.currency]) }}</td>
            <td>            
              <v-icon color="primary" @click="editAllocation(props.item.allocationId)">edit</v-icon>
              <v-icon color="red darken-1" @click="deleteAllocation(props.item.allocationId)">delete</v-icon>            
            </td>
          </template>
        </v-data-table>

        <v-list class="py-0 elevation-1" v-if="!$vuetify.breakpoint.smAndUp" dense subheader>     
        <template  v-for="(transaction, index) in allocations[categoryType]">
          <v-list-tile :key="index" avatar class="pb-1">
            <v-list-tile-avatar>
              <v-icon>{{ transaction.destinationCategory.icon }}</v-icon>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title class="font-weight-medium">
                {{ transaction.description}} 
                <span class="grey--text text--lighten-1 caption">
                  - {{ transaction.date | moment("dddd, D.MM.YYYY") }}
                </span>
              </v-list-tile-title>

              <v-list-tile-sub-title class="text--primary">
                {{transaction.amount | currency($currencies[budget.currency])}}
              </v-list-tile-sub-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon @click="editAllocation(transaction.allocationId)">edit</v-icon>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-icon @click="deleteAllocation(transaction.allocationId)">delete</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </template>
        </v-list>
      </v-flex>
 
    </v-layout>
    
    <allocation-editor ref="allocationEditor"></allocation-editor>
</v-container>
</template>

<script>
import { allocationsService } from "../_services/allocations.service";
import { budgetService } from "../_services/budget.service";
import { mapState, mapActions } from "vuex";

  export default {
    components: {
      "allocation-editor": () => import('../components/AllocationEditor')
    },
    data () {
      return {
        loading: false,
        error: false,
        search: null,
        dateMenuStart: false,
        dateMenuEnd: false,
        categoryType: "spendings",
        budget: {
          name: null,
          startDate: null,
          currency: null,
          balance: null,
        },
        filters: {
          startDate: null,
          endDate: null,
          categories: null
        },
        categories: {
          incomes: null,
          spendings: null,
          savings: null
        },
        headers: [
          {
            text: this.$t("general.category"),
            sortable: true,
            value: 'category'
          },
          {
            text: this.$t("general.date"),
            sortable: true,
            value: 'date'
          },
          {
            text: this.$t("general.description"),
            sortable: true,
            value: 'description'
          },          
          {
            text: this.$t("general.amount"),
            sortable: true,
            value: 'amount'
          },          
          {
            text: this.$t("general.actions"),
            sortable: false
          }
        ],
        sliderValue: [null,null],
        sliderMax: null,
        allocations: null,
        tab: 0,
        color: ['amber darken-1', 'green darken-1', 'blue darken-1', 'purple darken-1'],
        requiredRule: [v => !!v || this.$t('forms.requiredField'),],
      }
    },
    computed: {
      currencies: function() { return Object.keys(this.$currencies); },
      today: function() {return this.$moment().format("YYYY-MM-DD")}
    },
    mounted: function() {
      this.loadBudget(this.$route.params.id);
    },
    watch : {
      $route(to, from) {
        this.loadBudget(this.$route.params.id);
        this.refreshFields();
        this.fetchAllocations();
      },
      'budget.startDate': function(date) {
        if(date!= null){
          this.sliderMax = this.$moment().diff(this.$moment(date), 'days');
          var daysSinceStart = this.daysSinceStart(this.$moment().format("YYYY-MM-DD"));
          this.sliderValue[1] = daysSinceStart;
          this.sliderValue[0] = this.budget.startDate;          
          this.refreshFields()
          this.fetchAllocations();
        }        
      },
      'sliderValue.0': function(minDays) {
        this.refreshFields()
      },
      'sliderValue.1': function(maxDays) {
        this.refreshFields()
      },
      'filters.startDate' : function(){
        this.refreshSlider();
      },
      'filters.endDate' : function(){
        this.refreshSlider();
      },
      categoryType: function(value){ 
        this.allocations = null;        
        this.filters.categories = this.categories[value] 
        this.fetchAllocations();
        },
    },
    methods: {
      ...mapActions({
        dispatchError: "alert/error",
        dispatchSuccess: "alert/success"
      }),
      daysSinceStart(date){
        return this.$moment(date).diff(this.$moment(this.budget.startDate), 'days')
      },
      refreshSlider(){
        this.sliderValue = [this.daysSinceStart(this.filters.startDate), this.daysSinceStart(this.filters.endDate)];
      },
      refreshFields(){
        this.filters.startDate  = this.$moment(this.budget.startDate).add(this.sliderValue[0], 'days').format("YYYY-MM-DD");
        this.filters.endDate  = this.$moment(this.budget.startDate).add(this.sliderValue[1], 'days').format("YYYY-MM-DD");
      },
      loadBudget(id) {
        budgetService.getBudget(id).then(
          response => {
            if (response.ok) {
              response.json().then(data=>{
                this.budget.balance = data.balance;
                this.budget.currency = data.currency;
                this.budget.startDate = data.startingDate;
                this.categories = {
                  spendings: data.spendingCategories,
                  savings: data.savingCategories,
                  incomes: data.incomeCategories
                };
                this.filters.categories = data.spendingCategories;

              });
            } else {
              reponse.json().then( data=> {
                this.dispatchError(data.message);
              });
            }
          });
      },
      fetchAllocations() {
        this.loading = true;
        allocationsService.listAllocations(this.$route.params.id, null, this.filters.startDate, this.filters.endDate, this.filters.categories)
          .then(
            response => {            
            if (response.ok) {
              response.json().then(data=>{
                this.loading = false;
                this.allocations = data;
              });
            } else {
              this.loading = false;
              this.error = true;
              this.allocations = null
              response.json().then( data=> {
                this.dispatchError(data.message);
              });
            }
            }
          );
      },
      editAllocation(id) {
        this.$refs.allocationEditor.open(id).then(response => {
          if (response && response.ok){
            this.fetchAllocations();
          } else if (response){
            response.json().then( data=> {
                this.dispatchError(data.message);
              });
          }
        });
      },
      deleteAllocation(id) {
        this.$root.$confirm('general.remove', 'allocations.deleteConfirm', { color: 'red', buttons: { yes: true, no: true, cancel: false,ok: false }})
            .then( (confirm) => {
              if (confirm){
                allocationsService.deleteAllocation(id)
                    .then( response => {
                      if (response.ok) {
                        this.fetchAllocations();
                      } else {
                        response.json()
                          .then( data => {
                            this.dispatchError(data.message);
                          });
                      }
                    });
                }              
            });
      }
    }
  }
</script>