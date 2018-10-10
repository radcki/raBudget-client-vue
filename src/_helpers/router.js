import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../home/HomePage';
import LoginPage from '../login/LoginPage';
import RegisterPage from '../register/RegisterPage';
import ProfilePage from '../profile/Profile';
import NewBudget from '../budgets/NewBudget';
import BudgetCategories from '../budgets/BudgetCategories.vue';
import EditBudget from '../budgets/EditBudget.vue';
import Overview from '../overview/Overview.vue';
import History from '../history/History.vue';

Vue.use(Router);

export const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/profile', component: ProfilePage },
    { path: '/budget/new', name:'newBudget', component: NewBudget },
    { path: '/budget/:id/overview', name: 'overview', component: Overview },
    { path: '/budget/:id/history', name: 'history', component: History },
    { path: '/budget/:id/allocations', name: 'allocations' , component: NewBudget },
    { path: '/budget/:id/categories', name: 'budgetCategories', component: BudgetCategories },
    { path: '/budget/:id/edit', name: 'editBudget',  component: EditBudget },

    // otherwise redirect to home
    { path: '*', redirect: '/' }
  ]
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
})