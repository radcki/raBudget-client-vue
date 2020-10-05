<template>
  <v-container fluid grid-list-sm class="pa-0">
    <v-layout row wrap>
      <v-flex v-if="chips" xs4 md2 class="text-xs-center">
        <v-chip
          small
          class="my-1"
          :color="period == 'full' ? 'primary' : 'grey'"
          text-color="white"
          @click="setFullPeriod()"
          >{{ $t('reports.periodFull') }}</v-chip
        >
        <br />
        <v-chip
          small
          class="my-1"
          :color="period == '6m' ? 'primary' : 'grey'"
          text-color="white"
          @click="set6mPeriod()"
          >{{ $t('reports.period6m') }}</v-chip
        >
        <br />
        <v-chip
          small
          class="my-1"
          :color="period == '1m' ? 'primary' : 'grey'"
          text-color="white"
          @click="set1mPeriod()"
          >{{ $t('reports.period1m') }}</v-chip
        >
        <br />
      </v-flex>
      <v-flex xs12 :md6="!!chips">
        <v-container fluid grid-list-sm class="pa-0">
          <v-layout row wrap>
            <v-flex xs6 style="width: 120px">
              <v-date-field
                v-model="selectedMin"
                :type="step === 'month' ? 'month' : 'day'"
                :label="$t('general.toDate')"
              ></v-date-field>
            </v-flex>

            <v-flex xs6 style="width: 120px">
              <v-date-field
                v-model="selectedMax"
                :type="step === 'month' ? 'month' : 'day'"
                :label="$t('general.toDate')"
              ></v-date-field>
            </v-flex>
            <v-flex xs12>
              <v-range-slider
                v-model="sliderValue"
                :max="sliderSteps"
                :min="0"
                :step="1"
              ></v-range-slider>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import {
  differenceInDays,
  differenceInMonths,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  isSameMonth,
  isSameDay,
} from 'date-fns';

@Component({
  components: {
    'v-date-field': () => import('../components/DateField.vue'),
  },
})
export default class DateRangeSlider extends Vue {
  @Prop({ type: Boolean, default: false }) chips!: boolean;
  @Prop(Date) min!: Date;
  @Prop(Date) max!: Date;
  @Prop(Array) value!: Date[];
  @Prop(String) step!: string;

  selectedMin: Date =
    this.value && this.value[0] ? new Date(this.value[0].toISOString()) : new Date();
  selectedMax: Date =
    this.value && this.value[1] ? new Date(this.value[1].toISOString()) : new Date();
  sliderValue: (number | null)[] = [null, null];

  @Watch('value')
  OnValueChange(newValue: Date[]) {
    if (newValue[0] != this.selectedMin) this.selectedMin = new Date(newValue[0].toISOString());
    if (newValue[1] != this.selectedMax) this.selectedMax = new Date(newValue[1].toISOString());
    this.sliderValue = [this.stepsFromMin(this.selectedMin), this.stepsFromMax(this.selectedMax)];
  }

  @Watch('selectedMin')
  onSelectedMinChange(date) {
    if (date < this.min) {
      this.selectedMin = this.min;
    }
    if (date > this.max) {
      this.selectedMin = this.max;
    }
    if (this.value[0] != date) {
      this.sliderValue = [this.stepsFromMin(this.selectedMin), this.sliderValue[1]];
      this.$emit('input', [this.selectedMin, this.selectedMax]);
    }
  }

  @Watch('selectedMax')
  onSelectedMaxChange(date) {
    if (date < this.min) {
      this.selectedMax = this.min;
    }
    if (date > this.max) {
      this.selectedMax = this.max;
    }
    if (this.value[1] != date) {
      this.sliderValue = [this.sliderValue[0], this.stepsFromMax(this.selectedMax)];
      this.$emit('input', [this.selectedMin, this.selectedMax]);
    }
  }

  @Watch('sliderValue.0')
  OnSliderMinChange(value) {
    if (value) {
      this.selectedMin = this.dateAdd(this.min, value);
    }
  }

  @Watch('sliderValue.1')
  OnSliderMaxChange(value) {
    if (value) {
      this.selectedMax = this.dateAdd(this.min, value);
    }
  }

  get dateDiff() {
    return this.step == 'month' ? differenceInMonths : differenceInDays;
  }

  get dateAdd() {
    return this.step == 'month' ? addMonths : addDays;
  }

  get sliderSteps() {
    return Math.abs(this.dateDiff(this.min, this.max));
  }

  get period(): string | null {
    if (!this.compareDate(this.selectedMax, this.max)) {
      return null;
    }
    if (this.compareDate(this.selectedMin, subMonths(this.selectedMax, 1))) {
      return '1m';
    }
    if (this.compareDate(this.selectedMin, subMonths(this.selectedMax, 6))) {
      return '6m';
    }
    if (this.compareDate(this.selectedMin, this.min)) {
      return 'full';
    }
    return null;
  }

  get compareDate() {
    return this.step == 'month' ? isSameMonth : isSameDay;
  }

  stepsFromMin(value: Date) {
    return Math.abs(this.dateDiff(value, this.min));
  }

  stepsFromMax(value: Date) {
    return Math.abs(this.dateDiff(value, this.min));
  }

  setFullPeriod() {
    this.selectedMax = this.max;
    this.selectedMin = this.min;
  }
  set6mPeriod() {
    this.selectedMax = this.step == 'month' ? startOfMonth(new Date()) : new Date();
    this.selectedMin = subMonths(this.selectedMax, 6);
  }
  set1mPeriod() {
    this.selectedMax = this.step == 'month' ? startOfMonth(new Date()) : new Date();
    this.selectedMin = subMonths(this.selectedMax, 1);
  }
}
</script>
