<template>
  <span>{{ formatValue(Number(animatedValue)) }}</span>
</template>
<script lang="ts">
import anime from 'animejs';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class AnimatedNumber extends Vue {
  @Prop({ type: [Number, String], default: 0, required: true }) value?: number | string;
  @Prop({ type: Function, default: v => v }) formatValue?: <T>(v: T) => T;
  @Prop({ type: String, default: 'linear' }) easing?: string;
  @Prop({ type: Number, default: 1000 }) duration?: number;
  @Prop(Function) update?: () => void;
  @Prop(Function) begin?: () => void;
  @Prop(Function) complete?: () => void;
  @Prop(Function) run?: () => void;
  @Prop({ type: Number, default: 0 }) delay?: number;
  @Prop({ type: Number, default: 0 }) round?: number;

  animatedValue = 0;

  @Watch('value')
  OnValuechange(value) {
    this.animateValue(value);
  }
  mounted() {
    this.animateValue(this.value);
  }
  animateValue(value) {
    const { begin, easing, duration, complete, update, run, delay, round } = this;
    anime({
      targets: this,
      animatedValue: value,
      duration,
      easing,
      update,
      begin,
      complete,
      run,
      delay,
      round,
    });
  }
}
</script>
