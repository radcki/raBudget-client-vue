<template>
  <v-card class="text-sm-center" :color="color" dark>
    <v-card-title class="subtitle-2">{{ label }}</v-card-title>
    <v-card-text class="display-1 pb-1">
      <animated-number v-if="value" :value="value" :format-value="formatAmount" :duration="300" />
      <span v-else>-</span>
    </v-card-text>
    <v-card-actions style="min-height: 7px" class="pa-0 ma-0">
      <v-progress-linear
        v-show="loading"
        class="pa-0 ma-0"
        indeterminate
        color="white"
      ></v-progress-linear>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  components: {
    'animated-number': () => import('@/components/AnimatedNumber.vue'),
  },
})
export default class ValueCard extends Vue {
  @Prop(Number) value?: number;
  @Prop(String) label?: string;
  @Prop(Boolean) loading?: string;
  @Prop(String) color?: string;
  @Prop(Object) budget?: string;

  formatAmount(value) {
    return this.$options.filters
      ? this.$options.filters.currency(value, this.$currencyConfig(this.budget))
      : value;
  }
}
</script>
