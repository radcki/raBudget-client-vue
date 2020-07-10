<template>
  <v-select
    v-model="selected"
    :items="items"
    :multiple="multiple"
    :label="label"
    item-text="name"
    item-value="categoryId"
    return-object
    single-line
    :clearable="clearable"
    :disabled="disabled"
    :class="!multiple ? '' : 'caption'"
    :rules="rules"
    :persistent-hint="persistentHint"
    :hint="hint"
  >
    <template v-if="multiple" v-slot:prepend-item>
      <v-list-item
        :color="categoriesSelected != 'none' ? 'blue darken-2' : ''"
        ripple
        @click="toggleSelectedCategories"
      >
        <v-list-item-action>
          <v-icon v-if="categoriesSelected == 'all'" color="blue darken-2">{{
            mdiCheckboxMarked
          }}</v-icon>
          <v-icon v-if="categoriesSelected == 'some'" color="blue darken-2">{{
            mdiCheckboxIntermediate
          }}</v-icon>
          <v-icon v-if="categoriesSelected == 'none'">{{ mdiCheckboxBlank }}</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t('general.selectAll') }}</v-list-item-title>
      </v-list-item>
      <v-divider class="mt-2"></v-divider>
    </template>

    <template v-slot:item="{ item }">
      <v-list-item-action v-if="item">
        <v-icon>{{ $categoryIcons[item.icon] }}</v-icon>
      </v-list-item-action>
      <span>{{ item.name }}</span>
    </template>

    <template v-slot:selection="{ item, index }">
      <span v-if="multiple && index > 0">,&nbsp;</span>
      <v-list-item-action v-if="!multiple">
        <v-icon>{{ $categoryIcons[item.icon] }}</v-icon>
      </v-list-item-action>
      <span>{{ item.name }}</span>
    </template>
  </v-select>
</template>
<script lang="ts">
import { mdiCheckboxBlank, mdiCheckboxMarked, mdiCheckboxIntermediate } from '@mdi/js';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { BudgetCategory } from '../typings/BudgetCategory';

@Component
export default class CategorySelect extends Vue {
  @Prop({ type: [Array, Object] }) value?: BudgetCategory[] | BudgetCategory;
  @Prop({ type: [Array] }) items?: BudgetCategory[];

  @Prop(String) label?: string;
  @Prop(String) hint?: string;
  @Prop(Array) rules?: ((v) => boolean | string)[];
  @Prop(Boolean) clearable?: boolean;
  @Prop(Boolean) readonly?: boolean;
  @Prop(Boolean) multiple?: boolean;
  @Prop(Boolean) disabled?: boolean;
  @Prop(Boolean) persistentHint?: boolean;
  @Prop(Boolean) hideDetails?: boolean;

  model = this.value;
  requiredRule = [v => !!v || this.$t('forms.requiredField')];

  mdiCheckboxBlank = mdiCheckboxBlank;
  mdiCheckboxMarked = mdiCheckboxMarked;
  mdiCheckboxIntermediate = mdiCheckboxIntermediate;

  @Watch('value')
  OnValueChange(value) {
    this.model = value;
  }

  get selected() {
    return this.model;
  }
  set selected(value) {
    this.model = value;
    this.$emit('input', value);
  }

  get categoriesSelected() {
    if (
      !this.multiple ||
      !this.items ||
      !this.selected ||
      (this.selected as BudgetCategory[]).length == 0
    ) {
      return 'none';
    }
    const n = (this.selected as BudgetCategory[]).length;
    const total = this.items.length;
    return n == total ? 'all' : 'some';
  }

  toggleSelectedCategories() {
    if (this.categoriesSelected == 'all') {
      this.selected = [];
    } else {
      this.selected = this.items ? this.items.slice() : [];
    }
  }
}
</script>
