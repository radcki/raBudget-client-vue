<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-subheader class="headline">{{ $t('allocations.recentAllocations') }}</v-subheader>
      </v-flex>

      <v-flex xs12>
        <v-card class="px-3">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
              <v-layout row wrap>
                <v-flex v-if="budget" xs12 md6>
                  <v-category-select
                    v-if="budget"
                    v-model="selectedCategories"
                    multiple
                    :items="budget.budgetCategories.filter(v => v.type == categoryType)"
                    :rules="requiredRule"
                    persistent-hint
                    :hint="$t('general.category')"
                  ></v-category-select>
                </v-flex>

                <v-flex v-if="budget" xs12 md6>
                  <v-date-range-slider
                    v-model="selectedRange"
                    :min="budget.startingDate"
                    :max="new Date()"
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

      <v-flex v-if="allocations || $wait.is('loading.allocations')" xs12>
        <v-subheader class="headline">{{ $t('general.foundData') }}</v-subheader>
      </v-flex>

      <v-flex v-if="$wait.is('loading.allocations')" xs12 class="text-xs-center">
        <v-progress-circular
          :size="70"
          :width="7"
          color="amber darken-3"
          indeterminate
        ></v-progress-circular>
      </v-flex>
      <!--
      <v-flex xs12 v-if="error" class="text-xs-center">
        <v-icon color="red" size="80">{{mdiAlertCircleOutline}}</v-icon>
      </v-flex>
      -->
      <v-flex v-if="allocations" xs12 class="elevation-1 white">
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
                  <v-icon class="px-2" size="40">{{
                    $categoryIcons[getCategoryById(item.targetBudgetCategoryId).icon]
                  }}</v-icon>
                  {{ getCategoryById(item.targetBudgetCategoryId).name }}
                </td>
                <td>
                  <template v-if="item.sourceBudgetCategoryId">
                    <v-icon class="px-2" size="40">{{
                      $categoryIcons[getCategoryById(item.sourceBudgetCategoryId).icon]
                    }}</v-icon>
                    {{ getCategoryById(item.sourceBudgetCategoryId).name }}
                  </template>
                  <template v-else>-</template>
                </td>
                <td>
                  {{
                    new Date(item.allocationDate)
                      | dateFormat('EEEE, d.MM.yyyy', $dateLocales[$locale])
                  }}
                </td>
                <td>{{ item.description }}</td>
                <td>{{ item.amount | currency($currencyConfig(budget)) }}</td>
                <td>
                  <v-allocation-editor :value="item" :data-budget="budget" @save="updateAllocation">
                    <template v-slot:activator="{ on }">
                      <v-icon color="primary" v-on="on">{{ mdiPencil }}</v-icon>
                    </template>
                  </v-allocation-editor>
                  <v-icon color="red darken-1" @click="deleteAllocation(item.allocationId)">{{
                    mdiTrashCan
                  }}</v-icon>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>

        <v-list v-if="!$vuetify.breakpoint.smAndUp" class="py-0" dense subheader>
          <template v-for="(allocation, index) in allocations">
            <v-list-item :key="index" class="pb-1">
              <v-list-item-avatar>
                <v-icon>{{
                  $categoryIcons[getCategoryById(allocation.targetBudgetCategoryId).icon]
                }}</v-icon>
              </v-list-item-avatar>

              <v-list-item-avatar v-if="allocation.sourceBudgetCategoryId">
                <v-icon>{{
                  $categoryIcons[getCategoryById(allocation.sourceBudgetCategoryId).icon]
                }}</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ allocation.description }}
                  <span class="grey--text text--lighten-1 caption">
                    -
                    {{
                      new Date(allocation.allocationDate)
                        | dateFormat('dddd, d.MM.yyyy', $dateLocales[$locale])
                    }}
                  </span>
                </v-list-item-title>

                <v-list-item-subtitle class="text--primary">{{
                  allocation.amount | currency($currencyConfig(budget))
                }}</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-allocation-editor
                  :value="allocation"
                  :data-budget="budget"
                  @save="updateAllocation"
                >
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on">{{ mdiPencil }}</v-icon>
                  </template>
                </v-allocation-editor>
              </v-list-item-action>
              <v-list-item-action>
                <v-icon @click="deleteAllocation(allocation.allocationId)">{{
                  mdiTrashCan
                }}</v-icon>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { allocationsService } from '@/_services/allocations.service';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { subMonths, format } from 'date-fns';

import { mdiMagnify, mdiPencil, mdiTrashCan } from '@mdi/js';
import { eCategoryType } from '@/typings/enums/eCategoryType';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { Budget } from '@/typings/Budget';
import { Allocation } from '@/typings/Allocation';
import { ErrorMessage } from '@/typings/TypedResponse';

const alertModule = namespace('alert');
const budgetsModule = namespace('budgets');

@Component({
  components: {
    'v-allocation-editor': () => import('@/components/AllocationEditor.vue'),
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'v-date-range-slider': () => import('@/components/DateRangeSlider.vue'),
  },
})
export default class Allocations extends Vue {
  allocations: Allocation[] = [];
  categoryType: eCategoryType = eCategoryType.Spending;
  selectedRange: any[] = [new Date(), new Date()];
  selectedCategories: BudgetCategory[] | null = null;
  headers: any[] = [];
  requiredRule: any[] = [];

  mdiMagnify = mdiMagnify;
  mdiPencil = mdiPencil;
  mdiTrashCan = mdiTrashCan;
  format = format;
  eCategoryType = eCategoryType;
  search: string | null = null;

  @budgetsModule.Getter('budget') budget?: Budget;
  @budgetsModule.Getter('budgetCategoryById')
  getCategoryById?: (budgetCategoryId: number) => BudgetCategory;

  @alertModule.Action('error') dispatchError;
  @alertModule.Action('success') dispatchSuccess;
  @budgetsModule.Action('activeBudgetChange') activeBudgetChange;
  @budgetsModule.Action('reloadInitialized') reloadInitialized;

  get today() {
    return new Date();
  }

  get monthAgoOrStart() {
    return this.budget && subMonths(new Date(), 1) < this.budget.startingDate
      ? this.budget.startingDate
      : subMonths(new Date(), 1);
  }

  created() {
    this.requiredRule = [v => !!v || this.$t('forms.requiredField')];
    this.headers = [
      {
        text: this.$t('categories.destinationCategory'),
        sortable: true,
        value: 'targetCategory',
      },
      {
        text: this.$t('categories.sourceCategory'),
        sortable: true,
        value: 'sourceCategory',
      },
      {
        text: this.$t('general.date'),
        sortable: true,
        value: 'date',
      },
      {
        text: this.$t('general.description'),
        sortable: true,
        value: 'description',
      },
      {
        text: this.$t('general.amount'),
        sortable: true,
        value: 'amount',
      },
      {
        text: this.$t('general.actions'),
        sortable: false,
      },
    ];
    this.activeBudgetChange(this.$route.params.id);
    if (this.budget) {
      this.selectedCategories = this.budget.budgetCategories.filter(
        v => v.type == this.categoryType,
      );
      this.selectedRange = [this.monthAgoOrStart, new Date()];
      this.fetchAllocations();
    }
  }

  @Watch('$route')
  OnRouteChange(to, from) {
    if (from.params.id != to.params.id) {
      this.activeBudgetChange(to.params.id);
      this.reloadInitialized();
      this.fetchAllocations();
    }
    if (this.budget) {
      this.selectedRange = [this.monthAgoOrStart, new Date()];
    }
  }

  @Watch('budget')
  OnBudgetChange(budget) {
    if (budget) {
      this.selectedRange = [this.monthAgoOrStart, new Date()];
      this.selectedCategories = budget.budgetCategories.filter(v => v.type == this.categoryType);
      this.fetchAllocations();
    }
  }

  @Watch('categoryType')
  OnCategoryTypeChange() {
    if (this.budget && this.budget.budgetCategories) {
      this.selectedCategories = this.budget.budgetCategories.filter(
        v => v.type == this.categoryType,
      );
    }
  }

  async fetchAllocations() {
    this.$wait.start('loading.allocations');
    try {
      const response = await allocationsService.listAllocations(
        (this.$route.params.id as unknown) as number,
        null,
        this.selectedRange[0],
        this.selectedRange[1],
        this.selectedCategories || [],
      );

      if (response.ok) {
        const data = await response.json();
        this.$wait.end('loading.allocations');
        this.allocations = data.map(v => {
          v.allocationDate = new Date(v.allocationDate);
          return v;
        });
      } else {
        this.$wait.end('loading.allocations');
        this.allocations = [];
        const errorData = await response.json<ErrorMessage>();
        this.dispatchError(errorData.message);
      }
    } catch (error) {
      this.$wait.end('saving.allocation');
      const errorDate = await error.json();
      this.dispatchError(errorDate.message);
    }
  }

  async updateAllocation(allocation) {
    if (!this.budget) {
      return;
    }
    this.$wait.start('saving.allocation');
    try {
      const response = await allocationsService.updateAllocation(this.budget.budgetId, allocation);
      if (response.ok) {
        this.$wait.end('saving.allocation');
        this.reloadInitialized();
        this.fetchAllocations();
      } else {
        const errorData = await response.json<ErrorMessage>();
        this.$wait.end('saving.allocation');
        this.dispatchError(errorData.message);
      }
    } catch (error) {
      this.$wait.end('saving.allocation');
      const errorData = await error.json();
      this.dispatchError(errorData.message);
    }
  }

  async deleteAllocation(id) {
    if (!this.budget) {
      return;
    }
    const confirm = await this.$confirm({
      title: 'general.remove',
      message: 'allocations.deleteConfirm',
      options: {
        color: 'red',
        buttons: { yes: true, no: true, cancel: false, ok: false },
      },
    });

    if (confirm) {
      try {
        const response = await allocationsService.deleteAllocation(this.budget.budgetId, id);
        if (response.ok) {
          this.fetchAllocations();
        } else {
          const errorData = await response.json<ErrorMessage>();
          this.dispatchError(errorData.message);
        }
      } catch (error) {
        this.$wait.end('saving.allocation');
        const errorData = await error.json();
        this.dispatchError(errorData.message);
      }
    }
  }
}
</script>
