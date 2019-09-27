<template>
  <v-dialog
    width="600"
    v-model="dialog"
    persistent
    :fullscreen="mobile"
    :transition="mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" :open="open" />
    </template>

    <v-spacer v-if="mobile" class="py-3"></v-spacer>
    <v-card>
      <v-toolbar color="primary" dark dense text :fixed="mobile">
        <v-btn v-if="mobile" icon dark @click="dialog = false">
          <v-icon>{{mdiClose}}</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">{{ $t("categories.categoryEdit") }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="!mobile" text icon @click="dialog = false">
          <v-icon light>{{mdiClose}}</v-icon>
        </v-btn>
        <v-btn v-if="mobile" text="flat" @click.native="save">{{ $t('general.save') }}</v-btn>
      </v-toolbar>

      <v-card-text>
        <v-form ref="editor">
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex :xs2="!mobile" :xs4="mobile">
                <v-select v-model="category.icon" :items="icons" :label="$t('general.icon')">
                  <template slot="selection" slot-scope="data">
                    <v-icon>{{ $categoryIcons[data.item] }}</v-icon>
                  </template>
                  <template slot="item" slot-scope="data">
                    <v-icon>{{ $categoryIcons[data.item] }}</v-icon>
                  </template>
                </v-select>
              </v-flex>
              <v-flex :xs10="!mobile" :xs8="mobile">
                <v-text-field
                  :rules="requiredRule"
                  v-model="category.name"
                  :label="$t('categories.name')"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 class="text-xs-right">
                <v-subheader class="text-xs-right">
                  <v-spacer></v-spacer>
                  <v-icon class="mr-3">{{mdiCreditCard}}</v-icon>
                  {{$t('categories.monthlyAmount')}}
                </v-subheader>
                <v-btn
                  @click="addPeriod"
                  small
                  color="primary"
                  class="mb-4"
                >+ {{$t("categories.addPeriod")}}</v-btn>
                <template v-for="(amountConfig, amountConfigIndex) in category.amountConfigs">
                  <v-divider :key="'dividerUp'+amountConfigIndex" v-if="amountConfigIndex == 0"></v-divider>
                  <v-container :key="'row'+amountConfigIndex" grid-list-md class="pa-0 ma-0">
                    <v-layout row wrap class="pa-0 ma-0">
                      <v-flex :xs4="!mobile" :xs9="mobile">
                        <v-date-field
                          :rules="requiredRule"
                          v-model="amountConfig.validFrom"
                          :label="$t('general.from')"
                        ></v-date-field>
                      </v-flex>

                      <v-flex :xs4="!mobile" :xs9="mobile">
                        <v-text-field
                          :rules="requiredRule"
                          v-model="amountConfig.amount"
                          :label="$t('categories.monthlyAmount')"
                        ></v-text-field>
                      </v-flex>

                      <v-flex xs3 v-if="!mobile">
                        <div>{{$t("categories.daily")}}: {{ (amountConfig.amount / 30) | currency($currencies[dataBudget.currency]) }}</div>
                        <div>{{$t("categories.annual")}}: {{ (amountConfig.amount * 12) | currency($currencies[dataBudget.currency]) }}</div>
                      </v-flex>

                      <v-flex xs1>
                        <v-btn
                          icon
                          color="red"
                          v-if="category.amountConfigs.length > 1"
                          small
                          dark
                          @click="category.amountConfigs.splice(amountConfigIndex, 1)"
                        >
                          <v-icon>{{mdiClose}}</v-icon>
                        </v-btn>
                      </v-flex>

                      <v-flex xs9 v-if="mobile" class="pb-3">
                        <div>{{$t("categories.daily")}}: {{ (amountConfig.amount / 30) | currency($currencies[dataBudget.currency]) }}</div>
                        <div>{{$t("categories.annual")}}: {{ (amountConfig.amount * 12) | currency($currencies[dataBudget.currency]) }}</div>
                      </v-flex>
                    </v-layout>
                  </v-container>
                  <v-divider :key="'dividerDown'+amountConfigIndex"></v-divider>
                </template>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>

      <v-divider v-if="!mobile"></v-divider>

      <v-card-actions v-if="!mobile">
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="dialog = false">{{$t('general.cancel')}}</v-btn>

        <v-btn color="primary" text @click="save">{{$t('general.save')}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script  lang="js">
import { mdiClose, mdiCreditCard } from '@mdi/js'
import { format } from 'date-fns'

export default {
  name: 'VCategoryEditor',
  props: {
    value: Object,
    dataBudget: {
      type: Object,
      default: () => {
        return { currency: 'PLN' }
      }
    }
  },
  components: {
    'v-date-field': () => import('../components/DateField.vue')
  },
  data () {
    return {
      dialog: false,
      requiredRule: [v => !!v || this.$t('forms.requiredField')],

      icons: Object.keys(this.$categoryIcons),
      category: {
        ...{
          categoryId: null,
          name: null,
          icon: null,
          type: null,
          amountConfigs: []
        },
        ...Object.assign({},this.value))
      },
      mdiCreditCard,
      mdiClose
    }
  },
  watch: {
    dialog (open) {
      if (open) {
        this.$wait.start('dialog')
      } else {
        this.$wait.end('dialog')
      }
      setTimeout(() => {
        this.category = {
          ...this.category,
          ...Object.assign({},this.value))
        }
      }, 500)
    }
  },
  beforeDestroy: function () {
    this.$wait.end('dialog')
  },
  mounted: function () {
    this.$root.$on('closeDialogs', () => {
      this.dialog = false
    })
    for (var config of this.category.amountConfigs) {
      config.dateMenu = false
      config.validFrom = format(new Date(config.validFrom), 'yyyy-MM')
      config.validTo = config.validTo
        ? format(new Date(), 'yyyy-MM')
        : null
    }
  },
  computed: {
    mobile () {
      return !this.$vuetify.breakpoint.smAndUp
    }
  },
  methods: {
    addPeriod () {
      this.category.amountConfigs.push({
        dateMenu: false,
        validFrom: new Date() ,
        amount: null
      })
    },
    save () {
      this.$emit('save', this.category)
      this.dialog = false
    },
    open () {
      this.dialog = true
    }
  }
}
</script>
