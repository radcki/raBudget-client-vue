<template>
  <v-card class="cardBackground">
    <v-card-title :class="`${color} my-0 py-0`">
      <v-subheader dark>
        {{ title }}
      </v-subheader>
      <v-spacer></v-spacer>
      <v-category-editor
        :data-budget="dataBudget"
        :value="{ type: categoriesType }"
        @save="emitCreate"
      >
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>{{ mdiPlusCircleOutline }}</v-icon>
          </v-btn>
        </template>
      </v-category-editor>
      <v-chip :color="colorSecondary" text-color="white">
        {{ itemsSum | currency($currencyConfig(dataBudget)) }}
      </v-chip>
    </v-card-title>
    <v-card-text class="px-0 pb-0">
      <v-list subheader class="cardBackground">
        <v-list-item v-for="(category, i) in items" :key="i" :data="category">
          <v-list-item-action class="pa-0 ma-0" style="width: 36px;">
            <v-row no-gutters>
              <v-col :cols="12">
                <v-icon v-show="i != 0" @click="moveCategoryUp(category)">{{
                  mdiChevronUp
                }}</v-icon>
              </v-col>
              <v-col :cols="12">
                <v-icon v-show="i != items.length - 1" @click="moveCategoryDown(category)">
                  {{ mdiChevronDown }}
                </v-icon>
              </v-col>
            </v-row>
          </v-list-item-action>
          <v-list-item-avatar :color="color" size="40" class="mr-4">
            <v-progress-circular
              v-if="
                $wait.is(`saving.category${category.budgetCategoryId}`) ||
                $wait.is(`loading.budget`)
              "
              color="white"
              indeterminate
            ></v-progress-circular>
            <v-icon v-else dark size="24">{{ $categoryIcons[category.icon] }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ category.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ readCurrentAmount(category) | currency($currencyConfig(dataBudget)) }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action v-if="!hideActions">
            <v-menu ref="menu" :left="!$vuetify.breakpoint.smAndUp" nudge-bottom="42">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                  <v-icon>{{ mdiDotsVertical }}</v-icon>
                </v-btn>
              </template>
              <v-list light dense single-line>
                <v-list-item
                  @click="
                    () => {
                      return;
                    }
                  "
                >
                  <v-category-editor :data-budget="dataBudget" :value="category" @save="emitSave">
                    <template v-slot:activator="{ on, open }">
                      <v-list-item-action class="mr-0 pr-5" @click="start(open)">
                        <v-icon size="35" color="primary darken-1">{{ mdiPencil }}</v-icon>
                      </v-list-item-action>
                      <v-list-item-title @click="start(open)">
                        {{ $t('categories.categoryEdit') }}
                      </v-list-item-title>
                    </template>
                  </v-category-editor>
                </v-list-item>

                <v-list-item @click="$emit('transfer', category)">
                  <v-list-item-action class="mr-0 pr-5">
                    <v-icon size="35" color="purple">{{ mdiReplyAll }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>{{ $t('transactions.categoryTransfer') }}</v-list-item-title>
                </v-list-item>

                <v-list-item @click="$emit('delete', category)">
                  <v-list-item-action class="mr-0 pr-5">
                    <v-icon size="35" color="red">{{ mdiTrashCan }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>{{ $t('general.remove') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import {
  mdiDotsVertical,
  mdiPlusCircleOutline,
  mdiPencil,
  mdiTrashCan,
  mdiReplyAll,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';

import { startOfMonth } from 'date-fns';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Budget } from '@/typings/Budget';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { eCategoryType } from '@/typings/enums/eCategoryType';

@Component({
  components: {
    'v-category-editor': () => import('../components/CategoryEditor.vue'),
  },
})
export default class CategoriesList extends Vue {
  @Prop(Array) items?: BudgetCategory[];
  @Prop(Object) dataBudget?: Budget;
  @Prop(String) title?: string;
  @Prop(String) color?: string;
  @Prop(Number) categoriesType?: eCategoryType;
  @Prop(String) colorSecondary?: string;
  @Prop(Boolean) hideActions?: boolean;

  menu = false;
  mdiDotsVertical = mdiDotsVertical;
  mdiPlusCircleOutline = mdiPlusCircleOutline;
  mdiPencil = mdiPencil;
  mdiTrashCan = mdiTrashCan;
  mdiReplyAll = mdiReplyAll;
  mdiChevronDown = mdiChevronDown;
  mdiChevronUp = mdiChevronUp;

  get itemsSum() {
    if (this.items && this.items.length > 0) {
      return this.items
        .map(v => this.readCurrentAmount(v))
        .reduce(function (a, b) {
          return 1 * (a || 0) + 1 * (b || 0);
        });
    }
    return 0;
  }

  swapArrayElements(array, a, b) {
    const _arr = [...array];
    const temp = _arr[a];
    _arr[a] = _arr[b];
    _arr[b] = temp;
    return _arr;
  }

  moveCategoryUp(category: BudgetCategory) {
    if (!this.items) {
      return;
    }
    const categoryIds = this.items.map(v => v.budgetCategoryId);
    const categoryIndex = categoryIds.indexOf(category.budgetCategoryId);
    if (categoryIndex == 0 || this.items.length == 1) {
      return;
    }
    const newOrder = this.swapArrayElements(categoryIds, categoryIndex, categoryIndex - 1);
    this.$emit('reorder', { newOrder: newOrder, movedCategoryId: category.budgetCategoryId });
  }

  moveCategoryDown(category: BudgetCategory) {
    if (!this.items) {
      return;
    }
    const categoryIds = this.items.map(v => v.budgetCategoryId);
    const categoryIndex = categoryIds.indexOf(category.budgetCategoryId);
    if (categoryIndex == this.items.length - 1 || this.items.length == 1) {
      return;
    }
    const newOrder = this.swapArrayElements(categoryIds, categoryIndex, categoryIndex + 1);
    this.$emit('reorder', { newOrder: newOrder, movedCategoryId: category.budgetCategoryId });
  }

  emitSave(payload) {
    this.$emit('edit', payload);
  }
  emitCreate(payload) {
    this.$emit('create', payload);
  }
  readCurrentAmount(category: BudgetCategory) {
    const matching = category.amountConfigs.filter(v => {
      return (
        startOfMonth(new Date()) >= v.validFrom &&
        (!v.validTo || v.validTo >= startOfMonth(new Date()))
      );
    });
    return matching && matching.length > 0 ? matching[0].monthlyAmount : null;
  }
  start(method) {
    setTimeout(() => method());
  }
}
</script>
