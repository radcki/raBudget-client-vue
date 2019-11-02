<template>
  <v-menu
    :close-on-content-click="false"
    v-model="dateMenu"
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
        v-on="on"
        :prepend-inner-icon="readonly ? 'lock' : ''"
        readonly
      ></v-text-field>
    </template>
    <v-date-picker :readonly="readonly" :type="pickerType" v-model="date" @input="dateMenu = false"></v-date-picker>
  </v-menu>
</template>

<script>
import { mdiCalendar } from '@mdi/js'
import { format } from 'date-fns'

export default {
  name: 'VDateField',
  props: ['value', 'label', 'rules', 'clearable', 'readonly', 'hideDetails', 'type'],

  data: () => ({
    date: null,
    dateMenu: false,
    mdiCalendar
  }),
  computed: {
    pickerType(){return this.type == 'month' ? 'month' : 'date'}
  },
  watch: {
    date: function (value) {
      this.$emit('input', new Date(value))
    },
    value: function (value) {
      this.date = !value ? null : format(value, this.pickerType == 'date' ? 'yyyy-MM-dd' : 'yyyy-MM')
    }
  },
  mounted: function () {
    this.date = !this.value
      ? null
      : format(this.value, this.pickerType == 'date' ? 'yyyy-MM-dd' : 'yyyy-MM')
  }
}
</script>
