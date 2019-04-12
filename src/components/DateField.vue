<template>
    <v-menu ref="dateMenu"
            :close-on-content-click="false"
            v-model="dateMenu"
            :nudge-right="40"
            :return-value.sync="date"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px">
        <v-text-field slot="activator"
                        v-model="date"
                        :clearable="clearable"
                        :label="label"
                        :rules="rules"
                        :hide-details="hideDetails"
                        prepend-icon="event"
                        :prepend-inner-icon="readonly ? 'lock' : ''"
                        readonly>
        </v-text-field>
        <v-date-picker :readonly="readonly" v-model="date" @input="$refs.dateMenu.save(date)"></v-date-picker>
    </v-menu>
</template>
 
<script>
 
export default {
  name: "VDateField",
  props: ["value", "label", "rules", "clearable","readonly","hideDetails"],
 
  data: () => ({
      date: null,
      dateMenu: false
  }),
  watch: {
      date: function(value){this.$emit('input', value)},
      value: function(value){this.date = !value? null : this.$moment(value).format("YYYY-MM-DD")}
  },
  mounted: function(){
      this.date = !this.value ? null : this.$moment(this.value).format("YYYY-MM-DD");
  },
}
 
</script>