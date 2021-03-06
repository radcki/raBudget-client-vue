<template>
  <v-container v-if="budget" grid-list-md>
    <v-layout row wrap align-center justify-center>
      <v-flex xs12></v-flex>

      <v-flex xs12>
        <v-card v-if="!$wait.is('budgets.load')" max-width="800">
          <v-card-title>
            <v-subheader class="headline">{{ $t('budgets.budget') }}</v-subheader>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout row wrap align-center justify-center>
                <v-flex xs8 sm6>
                  <v-text-field
                    v-model="budget.name"
                    :prepend-icon="mdiFormatTitle"
                    :rules="requiredRule"
                    :label="$t('general.name')"
                    required
                  ></v-text-field>
                </v-flex>

                <v-flex xs4 sm2>
                  <v-autocomplete
                    v-model="budget.currency"
                    :items="currencies"
                    return-object
                    item-text="code"
                    :label="$t('budgets.currency')"
                  ></v-autocomplete>
                </v-flex>

                <v-flex xs8 sm4>
                  <v-date-field
                    v-model="budget.startingDate"
                    :label="$t('budgets.startDate')"
                    :rules="requiredRule"
                    type="month"
                  ></v-date-field>
                </v-flex>
                <v-flex xs12>
                  <v-btn
                    :disabled="budget.default"
                    color="green"
                    class="white--text"
                    @click="setDefault"
                  >
                    <v-icon left>{{ budget.default ? mdiStar : mdiStarOutline }}</v-icon>
                    {{ $t('budgets.setDefault') }}
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="red" dark @click="deleteBudget">
              <v-icon left>{{ mdiTrashCan }}</v-icon>
              {{ $t('general.delete') }}
            </v-btn>

            <v-btn text color="primary" @click="saveBudget">
              <v-icon left>{{ mdiContentSave }}</v-icon>
              {{ $t('general.save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { budgetService } from '@/_services/budget.service';

import {
  mdiFormatTitle,
  mdiTrashCan,
  mdiStarOutline,
  mdiStar,
  mdiCalendar,
  mdiContentSave,
} from '@mdi/js';
import { Vue, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/Budget';
import { Currency } from '@/typings/Currency';

const budgetsModule = namespace('budgets');
const alertModule = namespace('alert');

@Component({
  components: {
    'v-date-field': () => import('@/components/DateField.vue'),
  },
})
export default class EditBudget extends Vue {
  valid = true;
  requiredRule: any[] = [];
  mdiFormatTitle = mdiFormatTitle;
  mdiTrashCan = mdiTrashCan;
  mdiStarOutline = mdiStarOutline;
  mdiStar = mdiStar;
  mdiCalendar = mdiCalendar;
  mdiContentSave = mdiContentSave;
  currencies: Currency[] = [];

  @budgetsModule.State('budgets') budgets?: Budget[];

  get budget() {
    return this.budgets
      ? this.budgets.find(v => v.budgetId == parseInt(this.$route.params.id))
      : null;
  }

  @alertModule.Action('error') dispatchError;
  @alertModule.Action('success') dispatchSuccess;
  @budgetsModule.Action('fetchBudgets') budgetsFetch;

  mounted() {
    this.getCurrencies();
    this.requiredRule = [v => !!v || this.$t('forms.requiredField')];
  }

  saveBudget() {
    if (!this.budget) {
      return;
    }
    //this.$route.params.id, this.budget
    budgetService
      .saveBudget({
        budgetId: parseInt(this.$route.params.id),
        name: this.budget.name,
        currency: this.budget.currency,
        startingDate: this.budget.startingDate,
        ownedByUserId: this.budget.ownedByUser.userId,
      })
      .then(response => {
        if (response.ok) {
          this.budgetsFetch();
          this.dispatchSuccess('general.changesSaved');
        } else {
          response.json().then(data => {
            this.dispatchError(data.message);
          });
        }
      });
  }

  setDefault() {
    budgetService.setDefault(this.$route.params.id).then(response => {
      if (response.ok) {
        this.dispatchSuccess('general.changesSaved');
        this.budgetsFetch();
      } else {
        response.json().then(data => {
          this.dispatchError(data.message);
        });
      }
    });
  }

  deleteBudget() {
    this.$root
      .$confirm({
        title: 'general.remove',
        message: 'budgets.deleteConfirm',
        options: {
          color: 'red',
          buttons: { yes: true, no: true, cancel: false, ok: false },
        },
      })
      .then(confirm => {
        if (confirm) {
          budgetService
            .deleteBudget((this.$route.params.id as unknown) as number)
            .then(response => {
              if (response.ok) {
                this.$router.push('/');
                this.budgetsFetch();
              } else {
                response.json().then(data => {
                  this.dispatchError(data.message);
                });
              }
            });
        }
      });
  }

  async getCurrencies() {
    const response = await budgetService.supportedCurrencies();
    if (response.ok) {
      this.currencies = await response.json();
    }
  }
}
</script>
