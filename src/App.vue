<template>
  <v-app>
    <v-app-bar v-if="mobile" dense fixed app dark color="navigationBarHeader">
      <v-app-bar-nav-icon v-if="$keycloak.authenticated && mobile" @click.stop="drawer = !drawer">
        <v-icon>{{ mdiMenu }}</v-icon>
      </v-app-bar-nav-icon>

      <template v-if="mobile">
        <v-spacer></v-spacer>
        <span class="title white--text">raBudget</span>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      width="260"
      enable-resize-watcher
      mobile-breakpoint="960"
      color="navigationBar"
      class="elevation-2"
      :floating="!mobile"
      app
      :mini-variant="minNav"
    >
      <v-list dense single-line class="pt-0">
        <v-list-item class="navigationBarHeader elevation-5">
          <v-list-item-title v-if="!minNav">
            <span class="title white--text">raBudget</span>
          </v-list-item-title>
          <v-list-item-action>
            <v-btn v-if="!mobile" icon dark @click.stop="minNavSelected = !minNavSelected">
              <v-icon>{{ minNav ? mdiChevronRight : mdiChevronLeft }}</v-icon>
            </v-btn>
            <v-btn v-if="mobile" icon dark @click.stop="drawer = !drawer">
              <v-icon>{{ mdiChevronLeft }}</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-list-item v-if="!minNav">
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn text class="pl-0 subheading" v-on="on">
                <span>{{ budget ? budget.name : '' }}</span>
                <v-icon>{{ mdiChevronDown }}</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item :to="{ name: 'newBudget' }">
                <v-list-item-title>{{ $t('budgets.new') }}</v-list-item-title>
                <v-list-item-action>
                  <v-icon>{{ mdiPlusCircleOutline }}</v-icon>
                </v-list-item-action>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item
                v-for="(budget, index) in budgets"
                :key="index"
                :to="{
                  name: $route.params.id ? $route.name : 'overview',
                  params: { id: budget.budgetId },
                }"
              >
                <v-list-item-title>{{ budget.name }}</v-list-item-title>
                <v-list-item-action>
                  <v-btn icon :to="{ name: 'editBudget', params: { id: budget.budgetId } }">
                    <v-icon>{{ mdiPencil }}</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>

        <v-divider class="mb-5"></v-divider>

        <menu-item
          v-for="(item, i) in menuItems"
          :key="item.name + i.toString()"
          :name="item.name"
          :icon="item.icon"
          :to="item.to"
          :children="item.children"
          :collapsed="minNav"
        ></menu-item>
      </v-list>

      <template v-slot:append>
        <v-divider></v-divider>
        <v-expand-transition>
          <div v-if="!minNav" class="navigationBarAccent pb-3">
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle> {{ $t('account.logged') }}: </v-list-item-subtitle>
                <v-list-item-title class="py-3">
                  {{ user.fullName }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-row no-gutters>
              <v-col class="text-right">
                <v-menu>
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon class="mr-2">{{ mdiWeb }}</v-icon>
                    </v-btn>
                  </template>

                  <v-list light dense subheader>
                    <v-list-item @click="switchLocale('pl')">
                      <v-list-item-avatar>
                        <v-icon v-if="$locale == 'pl'" size="24">{{ mdiCheckCircle }}</v-icon>
                        <v-icon v-else size="24">{{ mdiCircleOutline }}</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>PL</v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="switchLocale('en')">
                      <v-list-item-avatar>
                        <v-icon v-if="$locale == 'en'" size="24">{{ mdiCheckCircle }}</v-icon>
                        <v-icon v-else size="24">{{ mdiCircleOutline }}</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>EN</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
              <v-col v-if="$keycloak.authenticated" class="text-center">
                <v-btn icon to="/profile">
                  <v-icon>{{ mdiAccountBoxOutline }}</v-icon>
                </v-btn>
              </v-col>
              <v-col class="text-center">
                <v-btn icon @click="$vuetify.theme.dark = !$vuetify.theme.dark">
                  <v-icon>{{ mdiWeatherNight }}</v-icon>
                </v-btn>
              </v-col>
              <v-col v-if="$keycloak.authenticated" class="text-left" @click="signOut">
                <v-btn icon>
                  <v-icon>{{ mdiLogout }}</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
        <v-divider></v-divider>
      </template>
    </v-navigation-drawer>

    <v-snackbar
      v-if="alert && alert.message"
      v-model="alert.message"
      right
      top
      :color="alert ? alert.type : null"
    >
      {{ $t(alert.message) }}
      <v-btn dark text @click="clearAlert">
        <v-icon>{{ mdiClose }}</v-icon>
      </v-btn>
    </v-snackbar>

    <v-main class="contentBackground">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<style>
.white--icon .v-icon {
  color: #ffffff;
}

.centered-overlay {
  background-color: rgba(0, 0, 0, 0.27);
  width: 100%;
  height: 100%;
}

.centered-overlay > div {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

import {
  mdiDotsVertical,
  mdiAccountBoxOutline,
  mdiLogout,
  mdiMenu,
  mdiPlusCircleOutline,
  mdiPencil,
  mdiHome,
  mdiCheckCircle,
  mdiCircleOutline,
  mdiWeb,
  mdiFormatListBulleted,
  mdiCalendarClock,
  mdiPollBox,
  mdiTune,
  mdiDirections,
  mdiAccountMultiple,
  mdiClose,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronDown,
  mdiWeatherNight,
} from '@mdi/js';
import { Budget } from './typings/Budget';
import MenuItem from './typings/MenuItem';
import { Route } from 'vue-router';
import { eTransactionHubEvent, eBudgetHubEvent } from './plugins/signalr/types';

const budgetsStore = namespace('budgets');
const alertStore = namespace('alert');
const accountStore = namespace('account');
const transactionsModule = namespace('transactions');

@Component({
  components: {
    'menu-item': () => import('@/components/MenuItem.vue'),
  },
})
export default class App extends Vue {
  drawer = true;
  loadingOverlay = false;

  mdiDotsVertical = mdiDotsVertical;
  mdiAccountBoxOutline = mdiAccountBoxOutline;
  mdiLogout = mdiLogout;
  mdiMenu = mdiMenu;
  mdiPlusCircleOutline = mdiPlusCircleOutline;
  mdiPencil = mdiPencil;
  mdiHome = mdiHome;
  mdiCheckCircle = mdiCheckCircle;
  mdiCircleOutline = mdiCircleOutline;
  mdiWeb = mdiWeb;
  mdiFormatListBulleted = mdiFormatListBulleted;
  mdiCalendarClock = mdiCalendarClock;
  mdiPollBox = mdiPollBox;
  mdiTune = mdiTune;
  mdiDirections = mdiDirections;
  mdiAccountMultiple = mdiAccountMultiple;
  mdiClose = mdiClose;
  mdiChevronLeft = mdiChevronLeft;
  mdiChevronRight = mdiChevronRight;
  mdiChevronDown = mdiChevronDown;
  mdiWeatherNight = mdiWeatherNight;

  minNavSelected = true;
  get minNav() {
    return this.mobile ? false : this.minNavSelected;
  }

  @budgetsStore.Getter('budget') budget?: Budget;
  @budgetsStore.State('budgets') budgets?: Budget[];
  @budgetsStore.Action('activeBudgetChange') activeBudgetChange?: (
    budgetId: number | string,
  ) => void;

  @alertStore.State('alert') alert?: any;
  @alertStore.Action('error') error?: (message: string) => void;

  get account() {
    return this.$store.state.account;
  }

  get user() {
    return this.$store.getters['account/currentUser'];
  }

  get budgetId() {
    return this.$route.params.id;
  }

  get isAdmin() {
    return (
      this.account.user &&
      this.account.user.roles &&
      this.account.user.roles.filter(function (v) {
        return v === 1;
      }).length > 0
    );
  }

  get mobile() {
    return this.$vuetify.breakpoint.smAndDown;
  }

  get budgetsAreLoading() {
    return this.$wait.is('loading.budgets');
  }

  get menuItems(): MenuItem[] {
    if (!this.budget) {
      return [];
    }
    return [
      {
        name: this.$t('budgets.overview').toString(),
        icon: mdiHome,
        to: { name: 'overview', params: { id: this.budget.budgetId } },
        children: [],
      },
      {
        name: this.$t('budgets.history').toString(),
        icon: mdiFormatListBulleted,
        to: { name: 'history', params: { id: this.budget.budgetId } },
        children: [],
      },
      {
        name: this.$t('transactionSchedules.transactionSchedules').toString(),
        icon: mdiCalendarClock,
        to: { name: 'transactionSchedules', params: { id: this.budget.budgetId } },
        children: [],
      },
      {
        name: this.$t('reports.reports').toString(),
        icon: mdiPollBox,
        to: { name: 'reports', params: { id: this.budget.budgetId } },
        children: [],
      },
      {
        name: this.$t('budgets.categories').toString(),
        icon: mdiTune,
        to: { name: 'budgetCategories', params: { id: this.budget.budgetId } },
        children: [],
      },
      {
        name: this.$t('general.allocations').toString(),
        icon: mdiDirections,
        to: { name: 'allocations', params: { id: this.budget.budgetId } },
        children: [],
      },
    ];
  }

  @Watch('mobile')
  onResize(mobile) {
    this.drawer = !mobile;
  }

  @Watch('budgetsAreLoading')
  onBudgetsLoadingStatusChange(isLoading) {
    if (!isLoading) {
      if (
        this.$route.params['id'] &&
        this.budgets &&
        !this.budgets.find(v => v.budgetId.toString() == this.$route.params['id'])
      ) {
        if (this.error) this.error(this.$t('budgets.notFound').toString());

        this.$router.push('/');
        return;
      }
    }
  }

  @Watch('$route', { immediate: true, deep: true })
  onUrlChange(route: Route) {
    if (
      this.budget &&
      this.budget.budgetId.toString() != route.params['id'] &&
      this.activeBudgetChange
    ) {
      this.activeBudgetChange(route.params['id']);
    }
  }

  @Watch('budget', { immediate: true, deep: true })
  OnBudgetChange(newBudget: Budget, oldBudget: Budget) {
    if (!newBudget || !oldBudget || newBudget.budgetId == oldBudget.budgetId) {
      return;
    }
    if (this.activeBudgetChange) {
      this.activeBudgetChange(newBudget.budgetId);
    }
    this.$router.push({
      name: this.$route.name || 'home',
      params: { id: newBudget.budgetId.toString() },
    });
  }

  @Watch('$vuetify.theme.dark')
  onThemeChange(isDark) {
    localStorage.setItem('darkTheme', isDark);
  }

  beforeCreate() {
    this.$vuetify.theme.dark = !!localStorage.getItem('darkTheme') || false;
  }

  mounted() {
    const savedLocale = this.$locale;
    if (savedLocale) {
      this.switchLocale(savedLocale);
    } else {
      this.switchLocale(navigator.language != 'pl' ? 'en' : 'pl');
    }

    this.drawer = this.$vuetify.breakpoint.lgAndUp;

    if (this.$keycloak.authenticated && this.initializeBudgets) {
      this.initializeBudgets().then(() => {
        if (this.$route.params.id && this.activeBudgetChange) {
          this.activeBudgetChange(this.$route.params.id);
        }
        this.noBudgetsGuard();
      });
    }

    this.registerNotificationHandlers();
  }

  @alertStore.Action('clear') clearAlert?: () => Promise<void>;
  @accountStore.Action('logout') logout?: () => Promise<void>;
  @budgetsStore.Action('initializeBudgets') initializeBudgets?: () => Promise<void>;
  @budgetsStore.Action('reloadInitialized') reloadInitialized?: () => Promise<void>;
  @budgetsStore.Action('fetchBudgets') fetchBudgets?: () => Promise<void>;
  @transactionsModule.Action('fetchTransactions') fetchTransactions?: () => Promise<void>;

  async registerNotificationHandlers() {
    this.$notificationHub.$on(
      eTransactionHubEvent[eTransactionHubEvent.TransactionAdded],
      payload => {
        if (this.budget && this.budgetId == payload.budgetId) {
          if (this.reloadInitialized) this.reloadInitialized();
          if (this.fetchTransactions) this.fetchTransactions();
        }
      },
    );
    this.$notificationHub.$on(
      eTransactionHubEvent[eTransactionHubEvent.TransactionUpdated],
      payload => {
        if (this.budget && this.budgetId == payload.budgetId) {
          if (this.reloadInitialized) this.reloadInitialized();
          if (this.fetchTransactions) this.fetchTransactions();
        }
      },
    );
    this.$notificationHub.$on(
      eTransactionHubEvent[eTransactionHubEvent.TransactionRemoved],
      payload => {
        if (this.budget && this.budgetId == payload.budgetId) {
          if (this.reloadInitialized) this.reloadInitialized();
          if (this.fetchTransactions) this.fetchTransactions();
        }
      },
    );
    this.$notificationHub.$on(eBudgetHubEvent[eBudgetHubEvent.BudgetAdded], payload => {
      if (this.budget && this.budgetId == payload.budgetId) {
        if (this.reloadInitialized) this.reloadInitialized();
      }
    });
    this.$notificationHub.$on(eBudgetHubEvent[eBudgetHubEvent.BudgetRemoved], payload => {
      if (this.budget && this.budgetId == payload.budgetId) {
        if (this.reloadInitialized) this.reloadInitialized();
        this.$router.push('/');
      }
    });
    this.$notificationHub.$on(eBudgetHubEvent[eBudgetHubEvent.BudgetUpdated], payload => {
      if (this.budget && this.budgetId == payload.budgetId) {
        if (this.reloadInitialized) this.reloadInitialized();
      }
    });

    this.$notificationHub.$on(eBudgetHubEvent[eBudgetHubEvent.BudgetCategoryAdded], payload => {
      if (this.budget && this.budgetId == payload.budgetId) {
        if (this.reloadInitialized) this.reloadInitialized();
      }
    });
    this.$notificationHub.$on(eBudgetHubEvent[eBudgetHubEvent.BudgetCategoryRemoved], payload => {
      if (this.budget && this.budgetId == payload.budgetId) {
        if (this.reloadInitialized) this.reloadInitialized();
      }
    });
    this.$notificationHub.$on(eBudgetHubEvent[eBudgetHubEvent.BudgetCategoryUpdated], payload => {
      if (this.budget && this.budgetId == payload.budgetId) {
        if (this.reloadInitialized) this.reloadInitialized();
      }
    });
  }

  signOut() {
    if (this.logout) {
      this.logout().then(() => {
        this.$router.push('/');
      });
    }
  }

  switchLocale(locale): void {
    locale = locale.substring(0, 2);
    this.$locale = locale;
    localStorage.setItem('locale', locale);
    document.getElementsByTagName('html')[0].setAttribute('lang', locale);
    this.$i18n.locale = locale;
  }

  noBudgetsGuard(): void {
    if (this.budgets && this.budgets.length == 0 && !this.$wait.is('loading.budgets')) {
      this.$router.push({ name: 'newBudget' });
    } else if (this.$route.name === 'home') {
      const defaultBudget = this.budgets ? this.budgets.find(v => v.default) : null;
      let activeBudget: Budget | null = null;

      if (defaultBudget) {
        activeBudget = defaultBudget;
      } else if (this.budgets) {
        activeBudget = this.budgets[0];
      }
      if (activeBudget && this.activeBudgetChange) {
        this.activeBudgetChange(this.$route.params.id);
        this.$router.push({
          name: 'overview',
          params: { id: activeBudget.budgetId.toString() },
        });
      }
    }
  }

  @Watch('$keycloak.authenticated')
  OnAuthentication(isLogged) {
    let metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta[name=theme-color]');
      document.appendChild(metaThemeColor);
    }
    if (!isLogged) {
      metaThemeColor.setAttribute('content', '#90a4ae');
      return;
    }
    metaThemeColor.setAttribute('content', '#455a64');
  }

  @Watch('budgets')
  OnBudgetsChange() {
    this.noBudgetsGuard();
  }
}
</script>
