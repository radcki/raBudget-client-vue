<template>
  <v-card>
    <v-card-title v-if="isMobile" class="cardBackground pb-0 pt-1" @click="expanded = !expanded">
      <v-row no-gutters>
        <v-col class="subtitle-2 py-2">{{ title }}</v-col>
        <v-col class="flex-grow-0">
          <v-btn icon small>
            <v-icon v-if="expanded">{{ mdiChevronUp }}</v-icon>
            <v-icon v-else>{{ mdiChevronDown }}</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-list class="py-1" dense color="cardBackground" subheader>
      <template v-if="!isMobile">
        <div :style="maxHeight ? 'overflow-y: auto; max-height: ' + maxHeight + 'px' : ''">
          <v-list-item
            v-for="transaction in items"
            :key="'tr_' + transaction.transactionScheduleId + transaction.transactionDate"
            class="pb-1"
          >
            <v-list-item-avatar size="30">
              <v-icon :color="$categoryColor[getCategoryById(transaction.budgetCategoryId).type]">{{
                $categoryIcons[getCategoryById(transaction.budgetCategoryId).icon]
              }}</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title class="font-weight-medium">{{
                transaction.description
              }}</v-list-item-title>
              <v-list-item-subtitle class="text--primary">
                {{ transaction.transactionDate | dateFormat('yyyy-MM-dd', $dateLocales[$locale]) }}
                -
                {{ transaction.amount | currency($currencyConfig(dataBudget)) }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-tooltip top>
                <template v-slot:activator="{}">
                  <v-icon color="primary" @click="$emit('create', transaction)">{{
                    mdiLocationEnter
                  }}</v-icon>
                </template>
                <span>{{ $t('transactions.saveTransaction') }}</span>
              </v-tooltip>
            </v-list-item-action>
          </v-list-item>
        </div>
      </template>

      <v-expand-transition v-else>
        <div v-show="expanded">
          <div
            class="cardBackground"
            :style="maxHeight ? 'overflow-y: auto; max-height: ' + maxHeight + 'px' : ''"
          >
            <v-list-item
              v-for="transaction in items"
              :key="'tr_' + transaction.transactionScheduleId + transaction.transactionDate"
              class="pb-1"
            >
              <v-list-item-avatar size="24">
                <v-icon
                  :color="$categoryColor[getCategoryById(transaction.budgetCategoryId).type]"
                  >{{ $categoryIcons[getCategoryById(transaction.budgetCategoryId).icon] }}</v-icon
                >
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">{{
                  transaction.description
                }}</v-list-item-title>
                <v-list-item-subtitle class="text--primary">
                  {{ transaction.date | dateFormat('yyyy-MM-dd', $dateLocales[$locale]) }} -
                  {{ transaction.amount | currency($currencyConfig(dataBudget)) }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-tooltip top>
                  <template v-slot:activator="{}">
                    <v-icon color="primary" @click="$emit('create', transaction)">{{
                      mdiLocationEnter
                    }}</v-icon>
                  </template>
                  <span>{{ $t('transactions.saveTransaction') }}</span>
                </v-tooltip>
              </v-list-item-action>
            </v-list-item>
          </div>
        </div>
      </v-expand-transition>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import { mdiLocationEnter, mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { TransactionSchedule } from '@/typings/TransactionSchedule';
import { Budget } from '@/typings/Budget';
import { namespace } from 'vuex-class';
import { BudgetCategory } from '@/typings/BudgetCategory';

const budgetsModule = namespace('budgets');

@Component
export default class ScheduledTransactionsList extends Vue {
  @Prop(Array) items?: TransactionSchedule[];
  @Prop(Object) dataBudget?: Budget;
  @Prop(String) title?: string;
  @Prop(String) maxHeight?: string;

  expanded = true;
  mdiLocationEnter = mdiLocationEnter;
  mdiChevronDown = mdiChevronDown;
  mdiChevronUp = mdiChevronUp;

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  @Watch('$vuetify.breakpoint.lgAndUp')
  OnResize(isDesktop) {
    this.expanded = isDesktop;
  }

  mounted() {
    this.expanded = this.$vuetify.breakpoint.lgAndUp;
  }

  @budgetsModule.Getter('budgetCategoryById')
  getCategoryById?: (budgetCategoryId: number) => BudgetCategory;
}
</script>
