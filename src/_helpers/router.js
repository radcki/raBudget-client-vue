import Vue from 'vue';
import Router from 'vue-router';

const HomePage = () => import('../pages/home/HomePage.vue');
const NewBudget = () => import('../pages/budgets/NewBudget.vue');
const BudgetCategories = () => import('../pages/budgets/BudgetCategories.vue');
const EditBudget = () => import('../pages/budgets/EditBudget.vue');
const Overview = () => import('../pages/overview/Overview.vue');
const Transactions = () => import('../pages/history/Transactions.vue');
const Allocations = () => import('../pages/history/Allocations.vue');
const Reports = () => import('../pages/reports/Reports.vue');
const TransactionSchedules = () => import('../pages/transactionSchedules/TransactionSchedules.vue');

Vue.use(Router);

export const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/budget/new',
      name: 'newBudget',
      component: NewBudget,
    },
    {
      path: '/budget/:id/overview',
      name: 'overview',
      component: Overview,
    },
    {
      path: '/budget/:id/history',
      name: 'history',
      component: Transactions,
    },
    {
      path: '/budget/:id/allocations',
      name: 'allocations',
      component: Allocations,
    },
    {
      path: '/budget/:id/reports',
      name: 'reports',
      component: Reports,
    },
    {
      path: '/budget/:id/categories',
      name: 'budgetCategories',
      component: BudgetCategories,
    },
    {
      path: '/budget/:id/edit',
      name: 'editBudget',
      component: EditBudget,
    },
    {
      path: '/budget/:id/transaction-schedules',
      name: 'transactionSchedules',
      component: TransactionSchedules,
    },

    {
      path: '*',
      redirect: '/',
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (router.app.$wait && router.app.$wait.is('dialog')) {
    router.app.$root.$emit('closeDialogs');
    return next(false);
  }

  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login', '/register', '/password-reset'];
  const authRequired = !publicPages.includes(to.path);
  if (!authRequired) {
    return next(true);
  }
  if (router.app.$keycloak.authenticated) {
    next();
  } else {
    const loginUrl = router.app.$keycloak.createLoginUrl();
    window.location.replace(loginUrl);
  }
});
