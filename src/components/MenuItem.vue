<template>
  <div>
    <v-list-item
      v-if="!children || children.length == 0"
      class="grey--text text--darken-1"
      :to="to"
    >
      <v-tooltip bottom :disabled="!collapsed">
        <template v-slot:activator="{ on }">
          <v-list-item-icon v-if="icon" v-on="on">
            <v-icon>{{ icon }}</v-icon>
          </v-list-item-icon>
        </template>
        <span>{{ name || '' }}</span>
      </v-tooltip>

      <v-list-item-content v-show="!collapsed">
        <v-list-item-title>{{ name || '' }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-group v-else>
      <v-list-item slot="activator" class="pl-0 ml-0">
        <v-list-item-icon v-if="icon">
          <v-icon>{{ icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ name || '' }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <menu-item
        v-for="(item, i) in children"
        :key="item.name + i.toString()"
        :name="item.name"
        :icon="item.icon"
        :to="item.to"
        :children="item.children"
      ></menu-item>
    </v-list-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import MenuItem from '@/typings/MenuItem';
import { Dictionary } from 'vue-router/types/router';

@Component({
  components: {
    'menu-item': () => import('./MenuItem.vue'),
  },
})
export default class MenuItemComponent extends Vue {
  @Prop(String) name?: string;
  @Prop(String) icon?: string;
  @Prop({ type: [Object, String] }) to?:
    | string
    | { name: string; params: Dictionary<string> | null };
  @Prop(Array) children?: MenuItem[];
  @Prop(Boolean) collapsed?: boolean;
}
</script>
