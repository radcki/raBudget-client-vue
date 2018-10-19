<template>
  <v-dialog v-model="dialog" :max-width="options.width" @keydown.esc="cancel">
    <v-card>
      <v-toolbar dark :color="options.color" dense flat>
        <v-toolbar-title class="white--text">{{ $t(title) }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-if="!options.input && !options.select" v-html="$t(message)" v-show="!!message"></v-card-text>
      <v-card-text v-if="options.input">
        <v-text-field 
          v-model="input" :type="options.input" :label="$t(message)"></v-text-field>
      </v-card-text>
      <v-card-text v-if="options.select">        
        <v-select
          v-model="selection"
          :items="options.selectList"
          item-text="text"
          item-value="value"
          return-object
          single-line
          :label="$t(message)"></v-select>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn v-if="options.buttons.cancel" color="red" flat="flat" @click.native="cancel">{{ $t('general.cancel') }}</v-btn>
        <v-btn v-if="options.buttons.no" color="red" flat="flat" @click.native="cancel">{{ $t('general.no') }}</v-btn>
        <v-btn v-if="options.buttons.yes" color="primary darken-1" flat="flat" @click.native="agree">{{ $t('general.yes') }}</v-btn>
        <v-btn v-if="options.buttons.ok" color="primary darken-1" flat="flat" @click.native="agree">{{ $t('general.ok') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "confirm",
  data: () => ({
    selection: null,
    dialog: false,
    input: null,
    inputType: "text",
    resolve: null,
    reject: null,
    message: null,
    title: null,
    options: {
      color: 'primary',
      selectList: null,
      select: false,
      width: 290,
      input: false,
      buttons: {
        yes: false,
        no: false,
        cancel: true,
        ok: true,
      }
    }
  }),
  methods: {
    open(title, message, options) {
      this.input= null;
      this.inputType= "text"
      this.resolve= null;
      this.reject= null;
      this.message= null;
      this.title= null;
      this.options= {
          color: 'primary',
          selectList: null,
          select: false,
          width: 290,
          input: false,
          buttons: {
            yes: false,
            no: false,
            cancel: true,
            ok: true,
          }
        };

      this.dialog = true;
      this.title = title;
      this.message = message;
      this.options = Object.assign(this.options, options)
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    agree() {
      if (this.options.input) {
        this.resolve(this.input)
      } else if (this.options.select) {
        this.resolve(this.selection)
      } else {
        this.resolve(true)
      }      
      this.dialog = false
    },
    cancel() {
      this.resolve(false)
      this.dialog = false
    }
  }
}
</script>