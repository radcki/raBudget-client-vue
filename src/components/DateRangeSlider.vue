<template>
  <v-container fluid grid-list-sm class="pa-0">
    <v-layout row wrap>
      <v-flex xs4 md2 class="text-xs-center" v-if="chips">
        <v-chip
          small
          class="my-1"

          :color="period == 'full'? 'primary' : 'grey'"
          @click="period = 'full'"
          text-color="white"
        >{{ $t("reports.periodFull") }}</v-chip>
        <br />
        <v-chip
          small
          class="my-1"

          :color="period == '6m'? 'primary' : 'grey'"
          @click="period = '6m'"
          text-color="white"
        >{{ $t("reports.period6m") }}</v-chip>
        <br />
        <v-chip
          small
          class="my-1"

          :color="period == '1m'? 'primary' : 'grey'"
          @click="period = '1m'"
          text-color="white"
        >{{ $t("reports.period1m") }}</v-chip>
        <br />
      </v-flex>
      <v-flex xs12 :md6="!!chips">
        <v-container fluid grid-list-sm class="pa-0">
          <v-layout row wrap>
            <v-flex xs6 style="width: 120px">
              <v-menu
                ref="minMenu"
                :close-on-content-click="false"
                v-model="minMenu"
                :nudge-right="40"
                :return-value.sync="selectedMin"
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="selectedMin"
                    :label="$t('general.fromDate')"
                    :rules="requiredRule"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  :min="min"
                  :max="max"
                  :locale="locale"
                  :type="pickerType"
                  v-model="selectedMin"
                  @input="$refs.minMenu.save(selectedMin)"
                ></v-date-picker>
              </v-menu>
            </v-flex>

            <v-flex xs6 style="width: 120px">
              <v-menu
                ref="maxMenu"
                :close-on-content-click="false"
                v-model="maxMenu"
                :nudge-right="40"
                :return-value.sync="selectedMax"
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="selectedMax"
                    :label="$t('general.toDate')"
                    :rules="requiredRule"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  :min="min"
                  :max="max"
                  :locale="locale"
                  :type="pickerType"
                  v-model="selectedMax"
                  @input="$refs.maxMenu.save(selectedMax)"
                ></v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex xs12>
              <v-range-slider v-model="sliderValue" :max="rangeDiff" :min="0" :step="1"></v-range-slider>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  name: 'VDateRangeSlider',
  props: {
    min: String,
    max: String,
    value: Array,
    step: String,
    chips: Boolean
  },
  data () {
    return {
      period: null,
      sliderValue: [null, null],
      selectedMin: this.value[0],
      selectedMax: this.value[1],
      minMenu: false,
      maxMenu: false,
      requiredRule: [v => !!v || this.$t('forms.requiredField')]
    }
  },
  computed: {
    format () {
      if (this.step == 'months') {
        return 'YYYY-MM'
      }
      return 'YYYY-MM-DD'
    },
    pickerType () {
      return this.step == 'months' ? 'month' : 'date'
    },
    addSign () {
      return this.step == 'months' ? 'M' : 'd'
    },
    minMoment () {
      return this.$moment(this.min, this.format)
    },
    maxMoment () {
      return this.$moment(this.max, this.format)
    },
    rangeDiff () {
      return this.maxMoment.diff(this.minMoment, this.step)
    },
    selectedMinMoment () {
      return this.$moment(this.selectedMin, this.format)
    },
    selectedMaxMoment () {
      return this.$moment(this.selectedMax, this.format)
    },
    selectedMinInt () {
      return this.selectedMinMoment.diff(this.minMoment, this.step)
    },
    selectedMaxInt () {
      return this.selectedMaxMoment.diff(this.minMoment, this.step)
    },

    result () {
      return [this.selectedMin, this.selectedMax]
    },
    locale: function () {
      return this.$i18n.locale
    }
  },
  mounted () {
    this.sliderValue = [this.selectedMinInt, this.selectedMaxInt]
    if (this.chips) {
      this.checkChips(this.result)
    }
  },
  watch: {
    'value.0': function (value) {
      if (this.$moment(value, this.format) < this.minMoment) {
        this.selectedMin = this.minMoment.format(this.format)
      } else {
        this.selectedMin = value
      }
    },
    'value.1': function (value) {
      if (this.$moment(value, this.format) > this.maxMoment) {
        this.selectedMax = this.maxMoment.format(this.format)
      } else {
        this.selectedMax = value
      }
    },
    'sliderValue.0': function (min) {
      if (this.intToDate(min) != this.selectedMin) {
        this.selectedMin = this.intToDate(min)
      }
    },
    'sliderValue.1': function (max) {
      if (this.intToDate(max) != this.selectedMax) {
        this.selectedMax = this.intToDate(max)
      }
    },
    selectedMin: function (value) {
      if (this.dateToInt(value) != this.sliderValue[0]) {
        this.sliderValue = [this.selectedMinInt, this.sliderValue[1]]
      }
    },
    selectedMax: function (value) {
      if (this.dateToInt(value) != this.sliderValue[1]) {
        this.sliderValue = [this.sliderValue[0], this.selectedMaxInt]
      }
    },
    result: function (range) {
      this.$emit('input', range)
      if (this.chips) {
        this.checkChips(range)
      }
    },
    period: function (value) {
      if (value == 'full') {
        this.selectedMin = this.min
        this.selectedMax = this.max
      }
      if (value == '6m') {
        this.selectedMin = this.$moment()
          .subtract(6, 'month')
          .format('YYYY-MM')
        this.selectedMax = this.max
      }
      if (value == '1m') {
        this.selectedMin = this.$moment()
          .subtract(1, 'month')
          .format('YYYY-MM')
        this.selectedMax = this.max
      }
    }
  },
  methods: {
    intToDate (value) {
      return this.minMoment
        .clone()
        .add(value, this.addSign)
        .format(this.format)
    },
    dateToInt (value) {
      return this.$moment(value, this.format).diff(this.minMoment, this.step)
    },
    checkChips (range) {
      if (range[1] != this.max) {
        this.period = null
        return
      }
      if (range[0] == this.min) {
        this.period = 'full'
        return
      }
      if (
        range[0] ==
        this.$moment()
          .subtract(6, 'month')
          .format('YYYY-MM')
      ) {
        this.period = '6m'
        return
      }
      if (
        range[0] ==
        this.$moment()
          .subtract(1, 'month')
          .format('YYYY-MM')
      ) {
        this.period = '1m'
        return
      }
      this.period = null
    }
  }
}
</script>
