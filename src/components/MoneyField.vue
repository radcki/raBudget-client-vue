<template>
  <div :class="wrapperClass">
    <div v-if="prependIcon" class="v-input__prepend-outer">
      <div class="v-input__icon v-input__icon--prepend">
        <v-icon>{{ prependIcon }}</v-icon>
      </div>
    </div>
    <div class="v-input__control">
      <div class="v-input__slot">
        <div class="v-text-field__slot">
          <label
            v-if="label"
            :class="labelClass"
            style="left: 0px; right: auto; position: absolute;"
          >
            {{ label }}
          </label>
          <currency-input
            v-if="currency"
            v-model="innerValue"
            :readonly="readonly"
            :currency="currency.code"
            locale="PL"
            v-on="$listeners"
            @focus="hasFocus = true"
            @blur="hasFocus = false"
          />
          <input
            v-else
            v-model="innerValue"
            :readonly="readonly"
            type="number"
            step="0.01"
            v-on="$listeners"
            @focus="hasFocus = true"
            @blur="hasFocus = false"
          />
        </div>
      </div>
      <div v-if="!hideDetails" class="v-text-field__details">
        <div class="v-messages theme--dark">
          <div class="v-messages__wrapper">
            <div v-if="errors.length > 0" class="v-messages theme--dark error--text" role="alert">
              <div class="v-messages__wrapper">
                <div class="v-messages__message">Pole jest wymagane.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Currency } from '../typings/Currency';

@Component({
  inject: {
    form: {
      default: null,
    },
  },
})
export default class MoneyField extends Vue {
  @Prop(Number) value?: number;
  @Prop(String) label?: string;
  @Prop(Array) rules?: ((v) => boolean | string)[];
  @Prop(Boolean) clearable?: boolean;
  @Prop(Boolean) readonly?: boolean;
  @Prop(Boolean) hideDetails?: boolean;
  @Prop(Object) currency?: Currency;
  @Prop(String) prependIcon?: any;

  innerValue = this.value ? this.value : null;
  hasFocus = false;

  errors: string[] = [];
  mounted() {
    (this as any).form.register(this);
  }

  validate() {
    const errors: string[] = [];
    let rules: ((v) => boolean | string)[] = [];
    if (this.rules) {
      rules = [...this.rules];
    }
    for (const test of rules) {
      if (typeof test(this.innerValue) == 'string') {
        errors.push(test(this.innerValue) as string);
      }
    }
    this.errors = errors;
    return this.errors.length == 0;
  }

  resetValidation() {
    this.$nextTick(() => {
      this.errors = [];
    });
  }

  reset() {
    this.$nextTick(() => {
      this.innerValue = null;
      this.errors = [];
    });
  }

  generateWarning(child: string, parent: string) {
    return () => console.warn(`The ${child} component must be used inside a ${parent}`);
  }

  get labelClass(): string {
    const classes: string[] = ['v-label'];
    if (this.innerValue != null || this.hasFocus) {
      classes.push('v-label--active');
    }
    if (this.hasFocus) {
      classes.push('primary--text');
    }
    if (this.errors.length > 0) {
      classes.push('error--text');
    }
    if (this.$vuetify.theme.dark) {
      classes.push('theme--dark');
    } else {
      classes.push('theme--light');
    }
    return classes.join(' ');
  }

  get wrapperClass(): string {
    const classes: string[] = ['v-input v-text-field v-text-field--is-booted'];

    if (this.innerValue != null || this.hasFocus) {
      classes.push('v-input--is-label-active');
    }

    if (this.hasFocus) {
      classes.push('v-input--is-focused primary--text');
    }
    if (this.hasFocus || this.errors.length > 0) {
      classes.push('v-input--has-state');
    }

    if (this.$vuetify.theme.dark) {
      classes.push('theme--dark');
    } else {
      classes.push('theme--light');
    }
    if (this.errors.length > 0) {
      classes.push('error--text');
    }

    return classes.join(' ');
  }

  @Watch('value')
  onValueChange(value) {
    if (value != this.innerValue) {
      this.innerValue = value;
      this.validate();
    }
  }

  @Watch('innerValue')
  onInput(value) {
    if (this.value != value) {
      this.$emit('input', value);
    }
  }
}
</script>
