<template>
  <v-dialog
    :fullscreen="!$vuetify.breakpoint.smAndUp"
    v-model="dialog"
    persistent
    :max-width="800"
    @keydown.esc="cancel"
    :transition="!$vuetify.breakpoint.smAndUp ? 'dialog-bottom-transition' : 'dialog-transition'"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <v-card>
      <v-toolbar color="primary" dark dense flat :fixed="!$vuetify.breakpoint.smAndUp">
        <v-btn v-if="!$vuetify.breakpoint.smAndUp" icon dark @click="cancel">
          <v-icon>{{mdiClose}}</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">{{ $t("allocations.editing") }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="$vuetify.breakpoint.smAndUp" text icon @click="cancel">
          <v-icon light>{{mdiClose}}</v-icon>
        </v-btn>
        <v-btn
          v-if="!$vuetify.breakpoint.smAndUp"
          text
          @click.native="save"
        >{{ $t('general.save') }}</v-btn>
      </v-toolbar>
      <v-card-text>
        <v-form ref="editorForm" v-model="valid" lazy-validation>
          <v-container grid-list-md>
            <v-layout row wrap align-center justify-center>
              <v-flex xs12>
                <v-date-field
                  :rules="requiredRule"
                  v-model="editor.date"
                  :label="$t('transactions.date')"
                ></v-date-field>
              </v-flex>

              <v-flex xs12 md5>
                <v-category-select
                    :items="categories[allocationType]"
                    :label="$t('general.category')"
                    :rules="requiredRule"
                    v-model="editor.destinationCategory"
                  ></v-category-select>

              </v-flex>

              <v-flex xs12 md7>
                <v-text-field
                  v-model="editor.description"
                  :rules="requiredRule"
                  :label="$t('general.description')"
                ></v-text-field>
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="editor.modifyAmount"
                  type="number"
                  step="0.01"
                  :label="$t('transactions.addOrDelete')"
                ></v-text-field>
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="editor.amount"
                  type="number"
                  step="0.01"
                  :label="$t('transactions.baseAmount')"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
        <span class="subheading">{{ $t("transactions.finalAmount") }}:</span>
        <span class="headline">{{finalAmount | currency($currencyConfig(budget))}}</span>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>

        <v-btn
          v-if="$vuetify.breakpoint.smAndUp"
          color="red"
          text
          @click.native="cancel"
        >{{ $t('general.cancel') }}</v-btn>
        <v-btn
          v-if="$vuetify.breakpoint.smAndUp"
          color="primary darken-1"
          text
          @click.native="save"
        >{{ $t('general.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mdiClose } from '@mdi/js'

export default {
  components: {
    'v-category-select': () => import('../components/CategorySelect'),
    'v-date-field': () => import('../components/DateField.vue')
  },
  props: {
    value: Object,
    dataBudget: {
      type: Object,
      default: () => {
        return { currency: 'PLN' }
      }
    }
  },
  data: function () {
    return {
      budget: this.dataBudget,
      dateMenu: false,
      requiredRule: [v => !!v],
      categoryTypes: [
        { value: 'spendingCategories', text: 'general.spendings' },
        { value: 'incomeCategories', text: 'general.incomes' },
        { value: 'savingCategories', text: 'general.savings' }
      ],
      dialog: false,
      valid: true,
      editor: {
        ...{
          destinationCategory: null,
          date: null,
          description: null,
          amount: null,
          modifyAmount: 0.0
        },
        ...JSON.parse(JSON.stringify(this.value ? this.value : {}))
      },

      mdiClose
    }
  },
  computed: {
    mobile () {
      return !this.$vuetify.breakpoint.smAndUp
    },
    allocationType () { return this.editor.destinationCategory ? this.categoryTypes[this.editor.destinationCategory.type].value : 'spendingCategories' },
    categories () {
      return this.budget
    },
    finalAmount: function () {
      return 1 * this.editor.modifyAmount + 1 * this.editor.amount
    }
  },
  mounted: function () {
    this.$root.$on('closeDialogs', () => {
      this.dialog = false
    })
    this.requiredRule = [v => !!v || this.$t('forms.requiredField')]
  },
  beforeDestroy: function () {
    this.$wait.end('dialog')
  },
  watch: {
    dialog (open) {
      if (open) {
        this.$wait.start('dialog')
      } else {
        this.$wait.end('dialog')
      }
    }
  },
  methods: {
    save () {
      if (this.$refs.editorForm.validate()) {
        this.dialog = false
        this.editor.amount = this.finalAmount
        this.editor.modifyAmount = 0
        this.$emit('save', this.editor)
      }
    },
    cancel () {
      this.dialog = false
    }
  }
}
</script>
