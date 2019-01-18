<template>
  <v-list subheader class="elevation-3">
    <v-subheader :class="color" dark>
      {{ title }}
      <v-spacer></v-spacer>
      <v-category-editor :data-budget="dataBudget" :value="{type: categoriesType}" v-on:save="emitSave">
        <v-btn icon>
          <v-icon>add_circle_outline</v-icon>
        </v-btn>
      </v-category-editor> 
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
        <v-list-tile-sub-title>{{ readCurrentAmount(category)  | currency($currencies[dataBudget.currency]) }}</v-list-tile-sub-title>
      </v-list-tile-content>

      <v-list-tile-action v-if="!hideActions">
        <v-menu ref="menu">
          <v-btn slot="activator" icon>
            <v-icon>more_vert</v-icon>
          </v-btn>
          <v-list light dense subheader>
            

            <v-category-editor :data-budget="dataBudget" :value="category" v-on:save="emitSave" >
              <v-list-tile>
                <v-list-tile-action>                
                    <v-icon color="primary darken-1">edit</v-icon>                             
                </v-list-tile-action>
                <v-list-tile-title>{{ $t("categories.categoryEdit") }}</v-list-tile-title>
              </v-list-tile> 
            </v-category-editor> 


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
  components: {
    "v-category-editor": () => import("../components/CategoryEditor"),
  },
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
    categoriesType: String,
    colorSecondary: String,
    hideActions: Boolean
  },
  data: function(){return{
    menu: false
  }},
  computed: {
      itemsSum: function() {
          if (this.items && this.items.length > 0){
            return this.items.map(v=>this.readCurrentAmount(v)).reduce(function(a,b){return 1*a+1*b})
          }
          return 0;          
      }
  },

  methods: {
    emitSave: function(payload) {
      this.$emit('edit', payload);
    },
    readCurrentAmount(category) {
      var matching = category.amountConfigs.filter( v => {
        return this.$moment().startOf('month') >= this.$moment(v.validFrom, 'YYYY-MM') && (!v.validTo || this.$moment(v.validTo, 'YYYY-MM') >= this.$moment().startOf('month'))
      });
      return matching && matching.length > 0 ? matching[0].amount : null
    }
  }

};
</script>
