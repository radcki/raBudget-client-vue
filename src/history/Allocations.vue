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
                  <v-flex xs12 md6 v-if="budget">                    
                    <v-category-select 
                      multiple
                      :items="budget[categoryType]" 
                      v-if="budget[categoryType]"
                      v-model="selectedCategories"
                      :rules="requiredRule"
                      persistent-hint
                      :hint="$t('general.category')"></v-category-select>
                  </v-flex>

                  <v-flex xs12 md6 v-if="budget">
                    <v-date-range-slider                      
                      :min="$moment(budget.startingDate).format('YYYY-MM-DD')"
                      :max="today"
                      v-model="selectedRange"
                      step="days"></v-date-range-slider>                    
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
    "allocation-editor": () => import("../components/AllocationEditor"),
    "v-category-select": () => import("../components/CategorySelect"),
    "v-date-range-slider": () => import("../components/DateRangeSlider"),
  },
  data() {
    return {
      loading: false,
      error: false,
      search: null,

      categoryType: "spendingCategories",
      selectedRange: [null, null],
      selectedCategories: null,

      headers: [
        {
          text: this.$t("general.category"),
          sortable: true,
          value: "category"
        },
        {
          text: this.$t("general.date"),
          sortable: true,
          value: "date"
        },
        {
          text: this.$t("general.description"),
          sortable: true,
          value: "description"
        },
        {
          text: this.$t("general.amount"),
          sortable: true,
          value: "amount"
        },
        {
          text: this.$t("general.actions"),
          sortable: false
        }
      ],

      allocations: null,
      tab: 0,
      color: [
        "amber darken-1",
        "green darken-1",
        "blue darken-1",
        "purple darken-1"
      ],
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
    currencies: function() {
      return Object.keys(this.$currencies);
    },
    today: function() {
      return this.$moment().format("YYYY-MM-DD");
    },
    monthAgoOrStart(){ 
      return this.$moment().subtract(1, 'month') < this.$moment(this.budget.startingDate) 
          ? this.$moment(this.budget.startingDate).format('YYYY-MM-DD')
          : this.$moment().subtract(1, 'month')
    }   
  },
  created: function(){           
    if (this.budget){
      this.selectedCategories = this.budget[this.categoryType];
      this.selectedRange = [this.monthAgoOrStart, this.today] 
      this.fetchAllocations();  
    }     
  },
  watch: {
    budget: function(budget) {
        this.selectedRange = [this.monthAgoOrStart, this.today]
        
        if (this.budget && this.budget[this.categoryType]){
          this.selectedCategories = this.budget[this.categoryType];
        }
        this.fetchAllocations();      
    },
    categoryType: function(value) {
      this.allocations = null;
      if (this.budget && this.budget[value]){
        this.selectedCategories = this.budget[value];
      }
      this.fetchAllocations();
    }
  },
  methods: {
    ...mapActions({
      dispatchError: "alert/error",
      dispatchSuccess: "alert/success"
    }),
    fetchAllocations() {
      this.loading = true;
      allocationsService
        .listAllocations(
          this.$route.params.id,
          null,
          this.selectedRange[0],
          this.selectedRange[1],
          this.selectedCategories
        )
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              this.loading = false;
              this.allocations = data;
            });
          } else {
            this.loading = false;
            this.error = true;
            this.allocations = null;
            response.json().then(data => {
              this.dispatchError(data.message);
            });
          }
        });
    },
    editAllocation(id) {
      this.$refs.allocationEditor.open(id).then(response => {
        if (response && response.ok) {
          this.fetchAllocations();
        } else if (response) {
          response.json().then(data => {
            this.dispatchError(data.message);
          });
        }
      });
    },
    deleteAllocation(id) {
      this.$root
        .$confirm("general.remove", "allocations.deleteConfirm", {
          color: "red",
          buttons: { yes: true, no: true, cancel: false, ok: false }
        })
        .then(confirm => {
          if (confirm) {
            allocationsService.deleteAllocation(id).then(response => {
              if (response.ok) {
                this.fetchAllocations();
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