<template>
  <v-menu
    v-model="dateMenu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="date"
        class="r-date-field"
        :type="pickerType"
        max="9999-12-31"
        :format="dateFormat"
        :clearable="clearable"
        :label="label"
        :rules="rules"
        :hide-details="hideDetails"
        :prepend-icon="mdiCalendar"
        :prepend-inner-icon="readonly ? 'lock' : ''"
        :readonly="readonly"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      v-if="!isMobile"
      v-model="date"
      :readonly="readonly"
      :type="pickerType"
      @input="dateMenu = false"
    ></v-date-picker>
  </v-menu>
</template>

<style>
.r-date-field input {
  -webkit-appearance: none;
}
.r-date-field input::-webkit-calendar-picker-indicator,
.r-date-field input::-webkit-clear-button,
.r-date-field input::-webkit-inner-spin-button {
  display: none;
  -webkit-appearance: none;
}
</style>

<script lang="ts">
import { mdiCalendar } from '@mdi/js';
import { format } from 'date-fns';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { debounce } from 'debounce';

@Component
export default class DateField extends Vue {
  @Prop(Date) value?: Date;
  @Prop(String) label?: string;
  @Prop(Array) rules?: ((v) => boolean | string)[];
  @Prop(Boolean) clearable?: boolean;
  @Prop(Boolean) readonly?: boolean;
  @Prop(Boolean) hideDetails?: boolean;
  @Prop(String) type?: 'date' | 'month';

  date: string | null = null;
  dateMenu = false;
  mdiCalendar = mdiCalendar;
  debouncedEmit: any = null;

  get pickerType() {
    return this.type == 'month' ? 'month' : 'date';
  }

  get dateFormat() {
    return this.pickerType == 'date' ? 'yyyy-MM-dd' : 'yyyy-MM';
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  @Watch('date')
  OnInput(value) {
    if (isNaN(Date.parse(value)) == true) {
      return;
    }
    this.debouncedEmit('input', new Date(value));
  }

  @Watch('value')
  OnValueChange(value) {
    this.date = !value ? null : format(value, this.dateFormat);
  }

  mounted() {
    this.date = !this.value ? null : format(this.value, this.dateFormat);
    this.debouncedEmit = debounce(this.$emit, 200);
  }
}
</script>
