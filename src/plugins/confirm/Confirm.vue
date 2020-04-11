<template>
  <v-dialog v-model="dialog" :max-width="options.width" @keydown.esc="cancel">
    <v-card>
      <v-toolbar dark :color="options.color" dense flat>
        <v-toolbar-title class="white--text">{{ $t(title) }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-if="!options.input && !options.select" v-show="!!message" class="pa-3">
        <vue-markdown>{{ $t(message) }}</vue-markdown>
      </v-card-text>
      <v-card-text v-if="options.input">
        <v-text-field v-model="input" :type="options.input" :label="$t(message)"></v-text-field>
      </v-card-text>
      <v-card-text v-if="options.select">
        <v-select
          v-model="selection"
          :items="options.selectList"
          item-text="text"
          item-value="value"
          return-object
          single-line
          :label="$t(message)"
        ></v-select>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn v-if="options.buttons.cancel" color="red" text @click.native="cancel">{{
          $t('general.cancel')
        }}</v-btn>
        <v-btn v-if="options.buttons.no" color="red" text @click.native="cancel">{{
          $t('general.no')
        }}</v-btn>
        <v-btn v-if="options.buttons.yes" color="primary darken-1" text @click.native="agree">{{
          $t('general.yes')
        }}</v-btn>
        <v-btn v-if="options.buttons.ok" color="primary darken-1" text @click.native="agree">{{
          $t('general.ok')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ConfirmDialogOptions } from './types';
import { Vue, Component } from 'vue-property-decorator';
import VueMarkdown from 'vue-markdown';

@Component({
  components: {
    'vue-markdown': VueMarkdown,
  },
})
export default class VueConfirm extends Vue {
  options: ConfirmDialogOptions = {
    color: 'primary',
    select: false,
    width: 290,
    input: false,
    buttons: {
      yes: false,
      no: false,
      cancel: true,
      ok: true,
    },
  };
  selection: any = null;
  dialog = false;
  input: any = null;
  inputType = 'text';
  resolve: any = null;
  reject: any = null;
  message = '';
  title = '';

  beforeDestroy() {
    this.$wait.end('dialog');
  }

  open(title: string, message: string, options: ConfirmDialogOptions): Promise<boolean | any> {
    this.input = null;
    this.inputType = 'text';
    this.resolve = null;
    this.reject = null;
    this.message = '';
    this.title = '';
    this.options = {
      color: 'primary',
      selectList: undefined,
      select: false,
      width: 290,
      input: false,
      buttons: {
        yes: false,
        no: false,
        cancel: true,
        ok: true,
      },
    };

    this.dialog = true;
    this.title = title;
    this.message = message;
    this.options = Object.assign(this.options, options);
    return new Promise<boolean | any>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  agree(): void {
    if (this.options.input) {
      this.resolve(this.input);
    } else if (this.options.select) {
      this.resolve(this.selection);
    } else {
      this.resolve(true);
    }
    this.dialog = false;
  }

  cancel(): void {
    this.resolve(false);
    this.dialog = false;
  }
}
</script>
