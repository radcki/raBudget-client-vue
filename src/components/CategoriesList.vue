<template>
  <v-list subheader class="elevation-3">
    <v-subheader :class="color" dark>
      {{ title }}
      <v-spacer></v-spacer>
      <v-btn icon @click="$emit('new')">
        <v-icon>add_circle_outline</v-icon>
      </v-btn>
      <v-chip
        :color="colorSecondary" 
        text-color="white"
      >{{ itemsSum | currency($currencies[dataBudget.currency]) }}</v-chip>
    </v-subheader>

    <v-list-tile
      avatar
      v-for="(category, i) in items"
      v-bind:data="category"
      v-bind:key="i"
    >
      <v-list-tile-avatar :color="color">
        <v-icon dark>{{ category.icon }}</v-icon>
      </v-list-tile-avatar>

      <v-list-tile-content>
        <v-list-tile-title>{{ category.name }}</v-list-tile-title>
        <v-list-tile-sub-title>{{ category.amount | currency($currencies[dataBudget.currency]) }}</v-list-tile-sub-title>
      </v-list-tile-content>

      <v-list-tile-action v-if="!hideActions">
        <v-menu>
          <v-btn slot="activator" icon>
            <v-icon>more_vert</v-icon>
          </v-btn>
          <v-list light dense subheader>
            <v-list-tile @click="$emit('edit',category)">
              <v-list-tile-action>
                <v-icon color="primary darken-1">edit</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>{{ $t("categories.categoryEdit") }}</v-list-tile-title>
            </v-list-tile>

            <v-list-tile @click="$emit('transfer',category)">
              <v-list-tile-action>
                <v-icon color="purple">reply_all</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>{{ $t("transactions.categoryTransfer") }}</v-list-tile-title>
            </v-list-tile>

            <v-list-tile @click="$emit('delete',category)">
              <v-list-tile-action>
                <v-icon color="red">cancel</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>{{ $t("general.remove") }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>

<script>
export default {
  name: "VCategoriesList",
  props: {
    items: Array,
    dataBudget: {
      type: Object,
      default: () => {
        return { currency: "PLN" };
      }
    },
    title: {
      type: String
    },
    color: String,
    colorSecondary: String,
    hideActions: Boolean
  },
  computed: {
      itemsSum: function() {
          if (this.items && this.items.length > 0){
            return this.items.map(v=>v.amount).reduce(function(a,b){return 1*a+1*b})
          }
          return 0;          
      }
  }

};
</script>
