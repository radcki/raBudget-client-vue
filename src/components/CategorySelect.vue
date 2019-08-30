<template>
    <v-select
        :items="items"
        v-model="selected"
        :multiple="multiple"
        :label="label"
        item-text="name"
        item-value="categoryId"
        return-object
        single-line
        :clearable="clearable"
        :disabled="disabled"
        :class="!multiple ? '' : 'caption'"
        :rules="rules && rules.length > 0 ? rules : []"
        :persistent-hint="persistentHint"
        :hint="hint">

        <template v-slot:prepend-item v-if="multiple">
        <v-list-item
            :color="categoriesSelected != 'none' ? 'blue darken-2' : ''"
            ripple
            @click="toggleSelectedCategories">
            <v-list-item-action>
                <v-icon color="blue darken-2" v-if="categoriesSelected == 'all'">
                    {{mdiCheckboxMarked}}
                </v-icon>
                <v-icon color="blue darken-2"  v-if="categoriesSelected == 'some'">
                    {{mdiCheckboxIntermediate}}
                </v-icon>
                <v-icon v-if="categoriesSelected == 'none'">
                    {{mdiCheckboxBlank}}
                </v-icon>
            </v-list-item-action>
            <v-list-item-title >
                {{$t("general.selectAll")}}
            </v-list-item-title>
        </v-list-item>
        <v-divider class="mt-2"></v-divider>
        </template>

        <template v-slot:item="{item}">
            <v-list-item-action v-if="item">
                <v-icon>{{ $categoryIcons[item.icon] }}</v-icon>
            </v-list-item-action>
                <span>{{ item.name }}</span>
        </template>

        <template v-slot:selection="{ item, index }">
            <span v-if="multiple && index > 0">,&nbsp;</span>
            <v-list-item-action v-if="!multiple" >
                <v-icon>{{ $categoryIcons[item.icon]}}</v-icon>
            </v-list-item-action>
            <span>{{ item.name }}</span>
        </template>

    </v-select>
</template>
<script>

import { mdiCheckboxBlank, mdiCheckboxMarked, mdiCheckboxIntermediate } from '@mdi/js'

export default {
  name: 'VCategorySelect',
  props: {
    label: String,
    rules: Array,
    hint: String,
    persistentHint: Boolean,
    items: {
      type: [Array, Object]
    },
    value: {
      type: [Array, Object]
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: Boolean
  },
  data () {
    return {
      model: this.value,
      requiredRule: [v => !!v || this.$t('forms.requiredField')],

      mdiCheckboxBlank,
      mdiCheckboxMarked,
      mdiCheckboxIntermediate
    }
  },
  watch: {
    value: function (value) { this.model = value }
  },
  computed: {
    selected: {
      get () { return this.model },
      set (value) {
        this.model = value
        this.$emit('input', value)
      }
    },
    categoriesSelected: function () {
      if (!this.multiple || !this.items || !this.selected || this.selected.length == 0) {
        return 'none'
      }
      var n = this.selected.length
      var total = this.items.length
      return (n == total ? 'all' : 'some')
    }
  },
  methods: {
    toggleSelectedCategories () {
      if (this.categoriesSelected == 'all') {
        this.selected = []
      } else {
        this.selected = this.items.slice()
      }
    }
  }
}
</script>
