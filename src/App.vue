<template>
 <v-app>
   
    <v-navigation-drawer
      v-if="account.status.loggedIn"
      v-model="drawer"
      width="260"      
      enable-resize-watcher
      mobile-break-point="960"
      fixed
      clipped
      app>
      <v-list>

        <v-list-tile>
          <v-list-tile-title class="grey--text text--darken-1">
            {{ $t("general.budgets") }}:
          </v-list-tile-title>
          <v-list-tile-action class="justify-end">
            <v-btn :to="{ name: 'newBudget'}" icon class="grey--text text--darken-1">
                <v-icon >add_circle_outline</v-icon>
              </v-btn>
          </v-list-tile-action>
        </v-list-tile>      
        
        <v-list-group       
          v-for="(budget, i) in this.budgets"
          v-bind:data="budget"
          v-bind:key="i"
          :value="$route.params.id == budget.id"
          no-action >

          <v-list-tile slot="activator">
            <v-list-tile-content>
              <v-list-tile-title >{{ budget.name }}</v-list-tile-title>
              <v-list-tile-sub-title  >
                <small>{{ $t("general.funds") }}: {{ budget.balance | currency($currencies[budget.currency])  }}</small>
              </v-list-tile-sub-title>
            </v-list-tile-content>
             
            <v-list-tile-action>
              <v-btn icon class="grey--text text--darken-1" :to="{ name: 'editBudget', params: { id: budget.id }}">
                <v-icon small>edit</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile class="grey--text text--darken-1" :to="{ name: 'overview', params: { id: budget.id }}">
            <v-list-tile-content>
              <v-list-tile-title>{{ $t("budgets.overview") }}</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon>home</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile class="grey--text text--darken-1" :to="{ name: 'history', params: { id: budget.id }}">
            <v-list-tile-content>
              <v-list-tile-title>{{ $t("budgets.history") }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>list</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile class="grey--text text--darken-1" :to="{ name: 'reports', params: { id: budget.id }}">
            <v-list-tile-content>
              <v-list-tile-title>{{ $t("reports.reports") }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>assessment</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile class="grey--text text--darken-1" :to="{ name: 'budgetCategories', params: { id: budget.id }}">
            <v-list-tile-content>
              <v-list-tile-title>{{ $t("budgets.categories") }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>tune</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile class="grey--text text--darken-1" :to="{ name: 'allocations', params: { id: budget.id }}">
            <v-list-tile-content>
              <v-list-tile-title>{{ $t("general.allocations") }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>directions</v-icon>
            </v-list-tile-action>
          </v-list-tile>

        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar
      :color="account.status.loggedIn ? 'blue-grey darken-2' : 'blue-grey lighten-2'"
      dark dense fixed clipped-left app>
      
      <v-toolbar-side-icon v-if="account.status.loggedIn" @click.stop="drawer = !drawer">
        <v-icon>menu</v-icon>
      </v-toolbar-side-icon>
      <v-toolbar-title class="align-center">
        <span class="title">raBudget</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-menu left>
        <v-btn slot="activator" flat>
          <v-icon class="mr-2">language</v-icon>{{locale}}
        </v-btn>
        
        <v-list light dense subheader>
          <v-list-tile @click="switchLocale('pl')">
            <v-list-tile-avatar>
              <v-icon v-if="locale=='pl'">check_circle</v-icon>
              <v-icon v-else>radio_button_unchecked</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-title>              
              PL
              </v-list-tile-title>            
          </v-list-tile>

          <v-list-tile @click="switchLocale('en')">
            <v-list-tile-avatar>
              <v-icon v-if="locale=='en'">check_circle</v-icon>
              <v-icon v-else>radio_button_unchecked</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-title>              
              EN
              </v-list-tile-title>            
          </v-list-tile>

        </v-list>
      </v-menu>

      <v-menu v-if="account.status.loggedIn">
        <v-btn slot="activator" icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
        
        <v-list light subheader>
          <template v-if="isAdmin">
            <v-subheader>ADMIN</v-subheader>
            <v-list-tile to="/admin/users">
              <v-list-tile-action>
                  <v-icon color="red">supervised_user_circle</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>{{ $t("admin.users") }}</v-list-tile-title>            
            </v-list-tile>

            <v-list-tile to="/admin/logs">
              <v-list-tile-action>
                  <v-icon color="red">list</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>{{ $t("admin.logs") }}</v-list-tile-title>            
            </v-list-tile>
          </template>
          <v-subheader>{{ $t("account.logged") }}: {{ account.user.username }}</v-subheader>

          <v-list-tile to="/profile">
            <v-list-tile-action>
                <v-icon-fa class="fa-lg" icon="user-circle"/>
            </v-list-tile-action>
            <v-list-tile-title>{{ $t("account.account") }}</v-list-tile-title>            
          </v-list-tile>

          <v-list-tile @click="signOut">
            <v-list-tile-action>
                <v-icon-fa class="fa-lg" icon="sign-out-alt"/>
            </v-list-tile-action>
            <v-list-tile-title>{{ $t("account.signOut") }}</v-list-tile-title>            
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-snackbar
      v-if="alert.message"                    
      right
      top
      v-model="alert.message"  
      :color="alert.type">
        {{$t(alert.message)}}
        <v-btn dark flat @click="clearAlert">
          <v-icon>close</v-icon>
        </v-btn>
    </v-snackbar>   
    <confirm ref="confirm"></confirm>
    <v-content>                          
        <router-view></router-view>
    </v-content>    
 </v-app>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { budgetService } from "./_services/budget.service";
import { newBudget } from "./budgets/NewBudget";
import Confirm from "./components/Confirm.vue";

export default {
  name: "app",
  components: {
    "confirm": Confirm
  },
  data: () => ({
    locale: 'pl',
    drawer: null
  }),
  computed: {
    ...mapState({
      alert: state => state.alert,
      account: state => state.account,
      budgets: state => state.budgets.budgets
    }),
    isAdmin: function() {
      return this.account.user && this.account.user.roles && this.account.user.roles.filter(function(v){return v == 1}).length > 0;
    }
  },
  mounted() {
    this.drawer = this.$vuetify.breakpoint.lgAndUp;
    this.$root.$confirm = this.$refs.confirm.open

    var savedLocale = localStorage.getItem('locale');
    if (savedLocale){
      this.switchLocale(savedLocale);
    } else {
      this.switchLocale(navigator.language);
    }
    
  }, 
  created() {
    this.$root.$on('reloadBudgets', this.budgetsFetch);
  },
  methods: {
    ...mapActions({
      clearAlert: "alert/clear",
      logout: "account/logout",
      budgetsFetch: "budgets/fetchBudgets"
    }),
    signOut(){
      this.logout().then(()=>{this.$router.push("/")});
    },
    switchLocale(locale) {      
      locale = locale.substring(0, 2);
      this.locale = locale;
      localStorage.setItem('locale', locale);
      this.$i18n.locale = locale
      this.$moment.locale(locale);  
    }
  },
  watch: {
    "account.status.loggedIn": {
      handler: function(isLogged) {
        if(!isLogged){
          return;
        }
        this.$wait.start('budgets');
        this.budgetsFetch().then(result=>{this.$wait.end('budgets')});
      },
      immediate: true
    },
    budgets: function(budgets){
      if (budgets.length === 0) {
        this.$router.push({name: "newBudget"});
      } else if (this.$route.name == "home") {
        var defaultBudgets = this.budgets.filter( v => v.default )
        var activeBudget = null;

        if (defaultBudgets.length > 0){
          activeBudget = defaultBudgets[0]
        } else {
          activeBudget = this.budgets[0]
        }
        this.$router.push({name: "overview", params: {id: activeBudget.id}})
      }
          
    }
  }
};
</script>