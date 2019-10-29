<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-subheader class="headline">{{$t('allocations.recentAllocations')}}</v-subheader>
      </v-flex>

      <v-flex xs12>
        <v-card class="px-3">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 md6 v-if="budget">
                  <v-category-select
                    multiple
                    :items="budget.budgetCategories.filter(v=>v.type == categoryType)"
                    v-if="budget"
                    v-model="selectedCategories"
                    :rules="requiredRule"
                    persistent-hint
                    :hint="$t('general.category')"
                  ></v-category-select>
                </v-flex>

                <v-flex xs12 md6 v-if="budget">
                  <v-date-range-slider
                    :min="format(budget.startingDate, 'yyyy-MM-dd')"
                    :max="format(today, 'yyyy-MM-dd')"
                    v-model="selectedRange"
                    step="days"
                  ></v-date-range-slider>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="fetchAllocations()">{{ $t('general.search') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex xs12 v-if="allocations || $wait.is('loading.allocations')">
        <v-subheader class="headline">{{$t('general.foundData')}}</v-subheader>
      </v-flex>

      <v-flex xs12 v-if="$wait.is('loading.allocations')" class="text-xs-center">
        <v-progress-circular :size="70" :width="7" color="amber darken-3" indeterminate></v-progress-circular>
      </v-flex>
<!--
      <v-flex xs12 v-if="error" class="text-xs-center">
        <v-icon color="red" size="80">{{mdiAlertCircleOutline}}</v-icon>
      </v-flex>
-->
      <v-flex xs12 class="elevation-1 white" v-if="allocations">
        <v-layout row justify-end>
          <v-flex xs4>
            <v-text-field
              v-if="$vuetify.breakpoint.smAndUp"
              v-model="search"
              :append-icon="mdiMagnify"
              :label="$t('general.search')"
              single-line
              hide-details
            ></v-text-field>
          </v-flex>
        </v-layout>

        <v-data-table
          v-if="$vuetify.breakpoint.smAndUp"
          :headers="headers"
          :items="allocations"
          :loading="$wait.is('loading.allocations')"
          :search="search"
          must-sort
          sort-by
          footer-items-per-page-options="[15,25,50,{text: $t('general.all'), value: -1}]"
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.transactionId">
                <td>
                  <v-icon class="px-2" size="40">{{ $categoryIcons[getCategoryById(item.targetBudgetCategoryId).icon] }}</v-icon>
                  {{ getCategoryById(item.targetBudgetCategoryId).name }}
                </td>
                <td>
                  <template v-if="item.sourceBudgetCategoryId">
                    <v-icon class="px-2" size="40">{{ $categoryIcons[getCategoryById(item.sourceBudgetCategoryId).icon] }}</v-icon>
                    {{ getCategoryById(item.sourceBudgetCategoryId).name }}
                  </template>
                  <template v-else>-</template>

                </td>
                <td>{{ new Date(item.allocationDate) | dateFormat("EEEE, d.MM.yyyy", $dateLocales[$locale]) }}</td>
                <td>{{ item.description }}</td>
                <td>{{ item.amount | currency($currencyConfig(budget)) }}</td>
                <td>
                  <v-allocation-editor
                    v-on:save="updateAllocation"
                    :value="item"
                    :data-budget="budget"
                  >
                    <template v-slot:activator="{on}">
                      <v-icon v-on="on" color="primary">{{mdiPencil}}</v-icon>
                    </template>
                  </v-allocation-editor>
                  <v-icon
                    color="red darken-1"
                    @click="deleteAllocation(item.allocationId)"
                  >{{mdiTrashCan}}</v-icon>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>

        <v-list class="py-0" v-if="!$vuetify.breakpoint.smAndUp" dense subheader>
          <template v-for="(allocation, index) in allocations">
            <v-list-item :key="index" class="pb-1">
              <v-list-item-avatar>
                <v-icon>{{ $categoryIcons[getCategoryById(allocation.targetBudgetCategoryId).icon] }}</v-icon>
              </v-list-item-avatar>

              <v-list-item-avatar v-if="allocation.sourceBudgetCategoryId">
                <v-icon>{{ $categoryIcons[getCategoryById(allocation.sourceBudgetCategoryId).icon] }}</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ allocation.description}}
                  <span
                    class="grey--text text--lighten-1 caption"
                  >- {{ new Date(allocation.allocationDate) | dateFormat("dddd, d.MM.yyyy", $dateLocales[$locale]) }}</span>
                </v-list-item-title>

                <v-list-item-subtitle
                  class="text--primary"
                >{{allocation.amount | currency($currencyConfig(budget))}}</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-allocation-editor
                  v-on:save="updateAllocations"
                  :value="transaction"
                  :data-budget="budget"
                >
                  <template v-slot:activator="{on}">
                    <v-icon v-on="on">{{mdiPencil}}</v-icon>
                  </template>
                </v-allocation-editor>
              </v-list-item-action>
              <v-list-item-action>
                <v-icon @click="deleteAllocation(allocation.allocationId)">{{mdiTrashCan}}</v-icon>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { allocationsService } from "../_services/allocations.service";
import { transactionsService } from "../_services/transactions.service";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Action, State, namespace } from "vuex-class";
import { subMonths, format } from "date-fns";

import {
  mdiMagnify,
  mdiPencil,
  mdiTrashCan,
  mdiAlertCircleOutline
} from "@mdi/js";
import { eCategoryType } from "../typings/enums/eCategoryType";
import { BudgetCategory } from "../typings/BudgetCategory";
import { Budget } from "../typings/Budget";
import { Allocation } from "@/typings/Allocation";
import { ErrorMessage } from '@/typings/TypedResponse';

const alertModule = namespace("alert");
const budgetsModule = namespace("budgets");
const transactionsModule = namespace("transactions");

@Component({
  components: {
    "v-allocation-editor": () => import("../components/AllocationEditor.vue"),
    "v-category-select": () => import("../components/CategorySelect.vue"),
    "v-date-range-slider": () => import("../components/DateRangeSlider.vue")
  }
})
export default class Allocations extends Vue {
  allocations: Allocation[] = [];
  categoryType: eCategoryType = eCategoryType.Spending;
  selectedRange: any[] = [null, null];
  selectedCategories: BudgetCategory[] | null = null;
  headers: any[] = [];
  requiredRule: any[] = [];

  mdiMagnify = mdiMagnify;
  mdiPencil = mdiPencil;
  mdiTrashCan = mdiTrashCan;
  format = format;
  eCategoryType = eCategoryType;
  search: string | null = null;

  @budgetsModule.Getter("budget") budget: Budget;
  @alertModule.Action("error") dispatchError;
  @alertModule.Action("success") dispatchSuccess;
  @budgetsModule.Action("activeBudgetChange") activeBudgetChange;
  @budgetsModule.Action("reloadInitialized") reloadInitialized;

  get today() {
    return new Date();
  }

  get monthAgoOrStart() {
    return subMonths(new Date(), 1) < this.budget.startingDate
      ? this.budget.startingDate
      : subMonths(new Date(), 1);
  }

  getCategoryById(budgetCategoryId: number): BudgetCategory {
    return this.budget.budgetCategories.find(
      v => v.budgetCategoryId == budgetCategoryId
    );
  }

  created() {
    this.requiredRule = [v => !!v || this.$t("forms.requiredField")];
    this.headers = [
      {
        text: this.$t("categories.destinationCategory"),
        sortable: true,
        value: "targetCategory"
      },
      {
        text: this.$t("categories.sourceCategory"),
        sortable: true,
        value: "sourceCategory"
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
    ];
    this.activeBudgetChange(this.$route.params.id);
    if (this.budget) {
      this.selectedCategories = this.budget.budgetCategories.filter(v=>v.type == this.categoryType);
      this.selectedRange = [format(this.monthAgoOrStart, 'yyyy-MM-dd'), format(this.today, 'yyyy-MM-dd')];
    }
  }

  @Watch("$route")
  OnRouteChange(to, from) {
    if (from.params.id != to.params.id) {
      this.activeBudgetChange(to.params.id);
      this.reloadInitialized();
      this.fetchAllocations();
    }
    if (this.budget) {
      this.selectedRange = [
        format(this.monthAgoOrStart, "yyyy-MM-dd"),
        format(this.today, "yyyy-MM-dd")
      ];
    }
  }

  @Watch("budget")
  OnBudgetChange(budget) {
    if (this.budget) {
      this.selectedRange = [
        format(this.monthAgoOrStart, "yyyy-MM-dd"),
        format(this.today, "yyyy-MM-dd")
      ];
      this.selectedCategories = this.budget.budgetCategories.filter(
        v => v.type == this.categoryType
      );
    }
  }

  @Watch("categoryType")
  OnCategoryTypeChange(value) {
    if (this.budget && this.budget.budgetCategories) {
      this.selectedCategories = this.budget.budgetCategories.filter(
        v => v.type == this.categoryType
      );
    }
  }

  async fetchAllocations() {
    this.$wait.start("loading.allocations");
    try {
      let response = await allocationsService.listAllocations(
        (this.$route.params.id as unknown) as number,
        null,
        this.selectedRange[0],
        this.selectedRange[1],
        this.selectedCategories
      );

      if (response.ok) {
        let data = await response.json();
        this.$wait.end("loading.allocations");
        this.allocations = data;
      } else {
        this.$wait.end("loading.allocations");
        this.allocations = null;
        let errorData = await response.json<ErrorMessage>();
        this.dispatchError(errorData.message);
      }
    } catch (error) {
      this.$wait.end("saving.allocation");
      let errorDate = await error.json();
      this.dispatchError(errorDate.message);
    }
  }

  async updateAllocation(allocation) {
    this.$wait.start("saving.allocation");
    try {
      let response = await allocationsService.updateAllocation(
        this.budget.budgetId,
        allocation
      );
      if (response.ok) {
        this.$wait.end("saving.allocation");
        this.reloadInitialized();
        this.fetchAllocations();
      } else {
        let errorData = await response.json<ErrorMessage>();
        this.$wait.end("saving.allocation");
        this.dispatchError(errorData.message);
      }
    } catch (error) {
      this.$wait.end("saving.allocation");
      let errorData = await error.json();
      this.dispatchError(errorData.message);
    }
  }

  async deleteAllocation(id) {
    let confirm = await this.$confirm({
      title: "general.remove",
      message: "allocations.deleteConfirm",
      options: {
        color: "red",
        buttons: { yes: true, no: true, cancel: false, ok: false }
      }
    });

    if (confirm) {
      try {
        let response = await allocationsService.deleteAllocation(
          this.budget.budgetId,
          id
        );
        if (response.ok) {
          this.fetchAllocations();
        } else {
          let errorData = await response.json<ErrorMessage>();
          this.dispatchError(errorData.message);
        }
      } catch (error) {
        this.$wait.end("saving.allocation");
        let errorData = await error.json();
        this.dispatchError(errorData.message);
      }
    }
  }
}
</script>
