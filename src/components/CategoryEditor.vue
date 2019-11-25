<template>
  <v-dialog
    v-model="dialog"
    width="600"
    persistent
    :fullscreen="mobile"
    :transition="mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" :open="openEditor" />
    </template>

    <v-spacer v-if="mobile" class="py-3"></v-spacer>
    <v-card>
      <v-toolbar color="primary" dark dense text :fixed="mobile">
        <v-btn v-if="mobile" icon dark @click="dialog = false">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title class="white--text">{{ $t('categories.categoryEdit') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="!mobile" text icon @click="dialog = false">
          <v-icon light>{{ mdiClose }}</v-icon>
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
                  v-model="category.name"
                  :rules="requiredRule"
                  :label="$t('categories.name')"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 class="text-xs-right">
                <v-subheader class="text-xs-right">
                  <v-spacer></v-spacer>
                  <v-icon class="mr-3">{{ mdiCreditCard }}</v-icon>
                  {{ $t('categories.monthlyAmount') }}
                </v-subheader>
                <v-btn small color="primary" class="mb-4" @click="addPeriod"
                  >+ {{ $t('categories.addPeriod') }}</v-btn
                >
                <template v-for="(amountConfig, amountConfigIndex) in category.amountConfigs">
                  <v-divider
                    v-if="amountConfigIndex == 0"
                    :key="'dividerUp' + amountConfigIndex"
                  ></v-divider>
                  <v-container :key="'row' + amountConfigIndex" grid-list-md class="pa-0 ma-0">
                    <v-layout row wrap class="pa-0 ma-0">
                      <v-flex :xs4="!mobile" :xs9="mobile">
                        <v-date-field
                          v-model="amountConfig.validFrom"
                          :rules="requiredRule"
                          type="month"
                          :label="$t('general.from')"
                        ></v-date-field>
                      </v-flex>

                      <v-flex :xs4="!mobile" :xs9="mobile">
                        <v-text-field
                          v-model="amountConfig.amount"
                          :rules="requiredRule"
                          :label="$t('categories.monthlyAmount')"
                        ></v-text-field>
                      </v-flex>

                      <v-flex v-if="!mobile" xs3>
                        <div>
                          {{ $t('categories.daily') }}:
                          {{ (amountConfig.amount / 30) | currency($currencyConfig(dataBudget)) }}
                        </div>
                        <div>
                          {{ $t('categories.annual') }}:
                          {{ (amountConfig.amount * 12) | currency($currencyConfig(dataBudget)) }}
                        </div>
                      </v-flex>

                      <v-flex xs1>
                        <v-btn
                          v-if="category.amountConfigs.length > 1"
                          icon
                          color="red"
                          small
                          dark
                          @click="category.amountConfigs.splice(amountConfigIndex, 1)"
                        >
                          <v-icon>{{ mdiClose }}</v-icon>
                        </v-btn>
                      </v-flex>

                      <v-flex v-if="mobile" xs9 class="pb-3">
                        <div>
                          {{ $t('categories.daily') }}:
                          {{ (amountConfig.amount / 30) | currency($currencyConfig(dataBudget)) }}
                        </div>
                        <div>
                          {{ $t('categories.annual') }}:
                          {{ (amountConfig.amount * 12) | currency($currencyConfig(dataBudget)) }}
                        </div>
                      </v-flex>
                    </v-layout>
                  </v-container>
                  <v-divider :key="'dividerDown' + amountConfigIndex"></v-divider>
                </template>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>

      <v-divider v-if="!mobile"></v-divider>

      <v-card-actions v-if="!mobile">
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="dialog = false">{{ $t('general.cancel') }}</v-btn>

        <v-btn color="primary" text @click="save">{{ $t('general.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { mdiClose, mdiCreditCard } from '@mdi/js';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { BudgetCategory } from '@/typings/BudgetCategory';
import { Budget } from '@/typings/Budget';

@Component({
  components: {
    'v-date-field': () => import('@/components/DateField.vue'),
  },
})
export default class CategoryEditor extends Vue {
  @Prop(Object) value?: BudgetCategory;
  @Prop(Object) dataBudget?: Budget;

  dialog = false;
  requiredRule: ((v) => boolean | string)[] = [
    v => !!v || this.$t('forms.requiredField').toString(),
  ];
  icons: string[] = Object.keys(this.$categoryIcons);

  category: BudgetCategory = {
    ...{
      categoryId: null,
      name: null,
      icon: null,
      type: null,
      amountConfigs: [],
    },
    ...Object.assign({}, this.value),
  };
  mdiCreditCard = mdiCreditCard;
  mdiClose = mdiClose;

  get mobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  @Watch('dialog')
  OnDialogChange(open) {
    if (open) {
      this.$wait.start('dialog');
    } else {
      this.$wait.end('dialog');
    }
    setTimeout(() => {
      this.category = {
        ...this.category,
        ...Object.assign({}, this.value),
      };
    }, 500);
  }

  beforeDestroy() {
    this.$wait.end('dialog');
  }

  mounted() {
    this.$root.$on('closeDialogs', () => {
      this.dialog = false;
    });
  }
  addPeriod() {
    this.category.amountConfigs.push({
      validFrom: new Date(),
      amount: 0,
    });
  }
  save() {
    this.$emit('save', this.category);
    this.dialog = false;
  }

  openEditor() {
    this.dialog = true;
  }
}
</script>
