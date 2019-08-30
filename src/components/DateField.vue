<template>
  <v-menu
    :close-on-content-click="false"
    v-model="dateMenu"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    full-width
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
    <v-date-picker :readonly="readonly" v-model="date" @input="dateMenu = false"></v-date-picker>
  </v-menu>

</template>

<script>
import { mdiCalendar } from '@mdi/js'

export default {
  name: 'VDateField',
  props: ['value', 'label', 'rules', 'clearable', 'readonly', 'hideDetails'],

  data: () => ({
    date: null,
    dateMenu: false,
    mdiCalendar
  }),
  watch: {
    date: function (value) {
      this.$emit('input', value)
    },
    value: function (value) {
      this.date != value ? null : this.$moment(value).format('YYYY-MM-DD')
    }
  },
  mounted: function () {
    this.date = !this.value
      ? null
      : this.$moment(this.value).format('YYYY-MM-DD')
  }
}
</script>
