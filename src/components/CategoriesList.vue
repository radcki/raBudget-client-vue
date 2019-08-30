<template>
  <v-list subheader class="elevation-3">
    <v-subheader :class="color" dark>
      {{ title }}
      <v-spacer></v-spacer>
      <v-category-editor
        :data-budget="dataBudget"
        :value="{type: categoriesType}"
        v-on:save="emitSave"
      >
        <template v-slot:activator="{on}">
          <v-btn icon v-on="on">
            <v-icon>{{mdiPlusCircleOutline}}</v-icon>
          </v-btn>
        </template>
      </v-category-editor>
      <v-chip
        :color="colorSecondary"
        text-color="white"
      >{{ itemsSum | currency($currencies[dataBudget.currency]) }}</v-chip>
    </v-subheader>

    <v-list-item v-for="(category, i) in items" v-bind:data="category" v-bind:key="i">
      <v-list-item-avatar :color="color" size="40">
        <v-icon dark size="24">{{ $categoryIcons[category.icon] }}</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>{{ category.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ readCurrentAmount(category) | currency($currencies[dataBudget.currency]) }}</v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action v-if="!hideActions">
        <v-menu ref="menu" :left="!$vuetify.breakpoint.smAndUp" nudge-bottom="42">
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon>
              <v-icon>{{mdiDotsVertical}}</v-icon>
            </v-btn>
          </template>
          <v-list light dense single-line>
            <v-list-item @click>
              <v-category-editor :data-budget="dataBudget" :value="category" v-on:save="emitSave">
                <template v-slot:activator="{on, open}">
                  <v-list-item-action @click="start(open)" class="mr-0 pr-5">
                    <v-icon size="35" color="primary darken-1">{{mdiPencil}}</v-icon>
                  </v-list-item-action>
                  <v-list-item-title @click="start(open)">{{ $t("categories.categoryEdit") }}</v-list-item-title>
                </template>
              </v-category-editor>
            </v-list-item>

            <v-list-item @click="$emit('transfer',category)">
              <v-list-item-action class="mr-0 pr-5">
                <v-icon size="35" color="purple">{{mdiReplyAll}}</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("transactions.categoryTransfer") }}</v-list-item-title>
            </v-list-item>

            <v-list-item @click="$emit('delete',category)">
              <v-list-item-action class="mr-0 pr-5">
                <v-icon size="35" color="red">{{mdiTrashCan}}</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("general.remove") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script>
import {
  mdiDotsVertical,
  mdiPlusCircleOutline,
  mdiPencil,
  mdiTrashCan,
  mdiReplyAll
} from '@mdi/js'

export default {
  name: 'VCategoriesList',
  components: {
    'v-category-editor': () => import('../components/CategoryEditor')
  },
  props: {
    items: Array,
    dataBudget: {
      type: Object,
      default: () => {
        return { currency: 'PLN' }
      }
    },
    title: {
      type: String
    },
    color: String,
    categoriesType: String,
    colorSecondary: String,
    hideActions: Boolean
  },
  data: function () {
    return {
      menu: false,

      mdiDotsVertical,
      mdiPlusCircleOutline,
      mdiPencil,
      mdiTrashCan,
      mdiReplyAll
    }
  },
  computed: {
    itemsSum: function () {
      if (this.items && this.items.length > 0) {
        return this.items
          .map(v => this.readCurrentAmount(v))
          .reduce(function (a, b) {
            return 1 * a + 1 * b
          })
      }
      return 0
    }
  },

  methods: {
    emitSave: function (payload) {
      this.$emit('edit', payload)
    },
    readCurrentAmount (category) {
      var matching = category.amountConfigs.filter(v => {
        return (
          this.$moment().startOf('month') >=
            this.$moment(v.validFrom, 'YYYY-MM') &&
          (!v.validTo ||
            this.$moment(v.validTo, 'YYYY-MM') >=
              this.$moment().startOf('month'))
        )
      })
      return matching && matching.length > 0 ? matching[0].amount : null
    },
    start: function (method) {
      setTimeout(() => method())
    }
  }
}
</script>
