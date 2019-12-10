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
        :clearable="clearable"
        :label="label"
        :rules="rules"
        :hide-details="hideDetails"
        :prepend-icon="mdiCalendar"
        :prepend-inner-icon="readonly ? 'lock' : ''"
        readonly
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="date"
      :readonly="readonly"
      :type="pickerType"
      @input="dateMenu = false"
    ></v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import { mdiCalendar } from '@mdi/js';
import { format } from 'date-fns';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

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

  get pickerType() {
    return this.type == 'month' ? 'month' : 'date';
  }

  @Watch('date')
  OnInput(value) {
    this.$emit('input', new Date(value));
  }

  @Watch('value')
  OnValueChange(value) {
    this.date = !value ? null : format(value, this.pickerType == 'date' ? 'yyyy-MM-dd' : 'yyyy-MM');
  }

  mounted() {
    this.date = !this.value
      ? null
      : format(this.value, this.pickerType == 'date' ? 'yyyy-MM-dd' : 'yyyy-MM');
  }
}
</script>
