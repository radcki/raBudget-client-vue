<template>
  <v-app>
    <v-navigation-drawer
      v-if="account.status.loggedIn && account.user.emailVerified"
      v-model="drawer"
      width="260"
      enable-resize-watcher
      mobile-break-point="960"
      fixed
      clipped
      app
    >
      <v-list dense single-line>
        <v-list-item>
          <v-list-item-title class="grey--text text--darken-1">{{ $t("general.budgets") }}:</v-list-item-title>
          <v-list-item-action class="justify-end">
            <v-btn :to="{ name: 'newBudget'}" icon small class="grey--text text--darken-1">
              <v-icon>{{mdiPlusCircleOutline}}</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        
<v-divider></v-divider>
        <v-list-group
          v-for="(budget, i) in this.budgets"
          v-bind:data="budget"
          v-bind:key="i"
          active-class="grey lighten-4 black--text"
          :value="$route.params.id == budget.id"
          no-action
          class="pl-0 ml-0"
        >
          <v-list-item slot="activator" class="pl-0 ml-0">
            <v-list-item-content>
              <v-list-item-title>{{ budget.name }}</v-list-item-title>
              <v-list-item-subtitle>
                <small>{{ $t("general.funds") }}: {{ budget.balance | currency($currencies[budget.currency]) }}</small>
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action>
              <v-btn
                icon
                small
                class="grey--text text--darken-1"
                :to="{ name: 'editBudget', params: { id: budget.id }}"
              >
                <v-icon small>{{mdiPencil}}</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>

          <v-list-item
            class="grey--text text--darken-1 "
            :to="{ name: 'overview', params: { id: budget.id }}"
          >
            <v-list-item-content>
              <v-list-item-title>{{ $t("budgets.overview") }}</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-icon>{{mdiHome}}</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item
            class="grey--text text--darken-1"
            :to="{ name: 'history', params: { id: budget.id }}"
          >
            <v-list-item-content>
              <v-list-item-title>{{ $t("budgets.history") }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>{{mdiFormatListBulleted}}</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item
            class="grey--text text--darken-1"
            :to="{ name: 'transactionSchedules', params: { id: budget.id }}"
          >
            <v-list-item-content>
              <v-list-item-title>{{ $t("transactionSchedules.transactionSchedules") }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>{{mdiCalendarClock}}</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item
            class="grey--text text--darken-1"
            :to="{ name: 'reports', params: { id: budget.id }}"
          >
            <v-list-item-content>
              <v-list-item-title>{{ $t("reports.reports") }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>{{mdiPollBox}}</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item
            class="grey--text text--darken-1"
            :to="{ name: 'budgetCategories', params: { id: budget.id }}"
          >
            <v-list-item-content>
              <v-list-item-title>{{ $t("budgets.categories") }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>{{mdiTune}}</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item
            class="grey--text text--darken-1"
            :to="{ name: 'allocations', params: { id: budget.id }}"
          >
            <v-list-item-content>
              <v-list-item-title>{{ $t("general.allocations") }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>{{mdiDirections }}</v-icon>
            </v-list-item-action>
          </v-list-item>
          <v-divider></v-divider>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      :color="account.status.loggedIn ? 'blue-grey darken-2' : 'blue-grey lighten-2'"
      dark
      dense
      fixed
      clipped-left
      app
    >
      <v-app-bar-nav-icon
        v-if="account.status.loggedIn && account.user.emailVerified"
        @click.stop="drawer = !drawer"
      >
        <v-icon>{{mdiMenu}}</v-icon>
      </v-app-bar-nav-icon>
      <v-toolbar-title class="align-center">
        <span class="title">raBudget</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-menu >
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" text>
            <v-icon class="mr-2">{{mdiWeb}}</v-icon>
            {{locale}}
          </v-btn>
        </template>

        <v-list light dense subheader>
          <v-list-item @click="switchLocale('pl')">
            <v-list-item-avatar>
              <v-icon size="24" v-if="locale=='pl'">{{mdiCheckCircle}}</v-icon>
              <v-icon size="24" v-else>{{mdiCircleOutline}}</v-icon>
            </v-list-item-avatar>
            <v-list-item-title>PL</v-list-item-title>
          </v-list-item>

          <v-list-item @click="switchLocale('en')">
            <v-list-item-avatar>
              <v-icon size="24" v-if="locale=='en'">{{mdiCheckCircle}}</v-icon>
              <v-icon size="24" v-else>{{mdiCircleOutline}}</v-icon>
            </v-list-item-avatar>
            <v-list-item-title>EN</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu v-if="account.status.loggedIn">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon>
            <v-icon>{{mdiDotsVertical}}</v-icon>
          </v-btn>
        </template>

        <v-list light subheader>
          <template v-if="isAdmin">
            <v-subheader>ADMIN</v-subheader>
            <v-list-item to="/admin/users">
              <v-list-item-action>
                <v-icon color="red">{{mdiAccountMultiple}}</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("admin.users") }}</v-list-item-title>
            </v-list-item>

            <v-list-item to="/admin/logs">
              <v-list-item-action>
                <v-icon color="red">{{mdiFormatListBulleted}}</v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t("admin.logs") }}</v-list-item-title>
            </v-list-item>
          </template>
          <v-subheader>{{ $t("account.logged") }}: {{ account.user.username }}</v-subheader>

          <v-list-item to="/profile">
            <v-list-item-action>
              <v-icon>{{mdiAccountBoxOutline}}</v-icon>
            </v-list-item-action>
            <v-list-item-title>{{ $t("account.account") }}</v-list-item-title>
          </v-list-item>

          <v-list-item @click="signOut">
            <v-list-item-action>
              <v-icon>{{mdiLogout}}</v-icon>
            </v-list-item-action>
            <v-list-item-title>{{ $t("account.signOut") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-snackbar v-if="alert.message" right top v-model="alert.message" :color="alert.type">
      {{$t(alert.message)}}
      <v-btn dark text@click="clearAlert">
        <v-icon>{{mdiClose}}</v-icon>
      </v-btn>
    </v-snackbar>
    <confirm ref="confirm"></confirm>
    <v-dialog fullscreen v-model="loadingOverlay">
      <div class="centered-overlay">
        <div>
          <v-progress-circular :size="400" :width="15" class color="purple" indeterminate></v-progress-circular>
        </div>
      </div>
    </v-dialog>
    <v-content>
      <router-view></router-view>
    </v-content>
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

<script>
import { mapState, mapActions } from "vuex";
import { budgetService } from "./_services/budget.service";

import Confirm from "./components/Confirm.vue";
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
  mdiAccountMultiple } from "@mdi/js";

export default {
  name: "app",
  components: {
    confirm: Confirm
  },
  data: () => ({
    locale: "pl",
    drawer: null,
    loadingOverlay: false,

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
  }),
  computed: {
    ...mapState({
      alert: state => state.alert,
      account: state => state.account,
      budgets: state => state.budgets.budgets
    }),
    isAdmin: function() {
      return (
        this.account.user &&
        this.account.user.roles &&
        this.account.user.roles.filter(function(v) {
          return v == 1;
        }).length > 0
      );
    },
    loginRefreshInProgress: function() {
      return this.$wait.is("login-check");
    }
  },
  mounted() {
    var savedLocale = localStorage.getItem("locale");
    if (savedLocale) {
      this.switchLocale(savedLocale);
    } else {
      this.switchLocale(navigator.language);
    }

    this.drawer = this.$vuetify.breakpoint.lgAndUp;
    this.$root.$confirm = this.$refs.confirm.open;
    this.loginCheckTimout = null;

    if (this.account.status.loggedIn) {
      this.initializeBudgets();
      this.noBudgetsGuard();
    }
  },
  created() {
    this.$root.$on("reloadBudgets", this.fetchBudgets);
  },
  methods: {
    ...mapActions({
      clearAlert: "alert/clear",
      logout: "account/logout",
      initializeBudgets: "budgets/initializeBudgets",
      fetchBudgets: "budgets/fetchBudgets"
    }),
    signOut() {
      this.logout().then(() => {
        this.$router.push("/");
      });
    },
    switchLocale(locale) {
      locale = locale.substring(0, 2);
      this.locale = locale;
      localStorage.setItem("locale", locale);
      document.getElementsByTagName("html")[0].setAttribute("lang", locale);
      this.$i18n.locale = locale;
      this.$moment.locale(locale);
    },
    noBudgetsGuard() {
      if (this.budgets.length === 0 && !this.$wait.is("loading.budgets")) {
        this.$router.push({ name: "newBudget" });
        return;
      } else if (this.$route.name == "home") {
        var defaultBudget = this.budgets.find(v => v.default);
        var activeBudget = null;

        if (!defaultBudget) {
          activeBudget = defaultBudget;
        } else {
          activeBudget = this.budgets[0];
        }
        this.$router.push({
          name: "overview",
          params: { id: activeBudget.id }
        });
      }
    }
  },
  watch: {
    "account.status.loggedIn": {
      handler: function(isLogged) {
        var metaThemeColor = document.querySelector("meta[name=theme-color]");
        if (!isLogged) {
          metaThemeColor.setAttribute("content", "#90a4ae");
          return;
        }
        metaThemeColor.setAttribute("content", "#455a64");
        this.fetchBudgets();
      },
      immediate: true
    },
    budgets: function() {
      this.noBudgetsGuard();
    },
    loginRefreshInProgress: function(isInProgress) {
      /*
      Debounced display of token refresh overlay
      */
      if (isInProgress) {
        var t = this;
        this.loginCheckTimout = setTimeout(function() {
          t.loadingOverlay = true;
        }, 300);
      } else {
        if (this.loginCheckTimout != null) {
          clearTimeout(this.loginCheckTimout);
        }
        this.loginCheckTimout = null;
        this.loadingOverlay = false;
      }
    }
  }
};
</script>