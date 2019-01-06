import Vue from 'vue'
import Router from 'vue-router'
import {store} from '../_store'

const HomePage = () => import('../home/HomePage.vue')
const LoginPage = () => import('../login/LoginPage.vue')
const RegisterPage = () => import('../register/RegisterPage.vue')
const ProfilePage = () => import('../profile/Profile.vue')
const NewBudget = () => import('../budgets/NewBudget.vue')
const BudgetCategories = () => import('../budgets/BudgetCategories.vue')
const EditBudget = () => import('../budgets/EditBudget.vue')
const Overview = () => import('../overview/Overview.vue')
const Transactions = () => import('../history/Transactions.vue')
const Allocations = () => import('../history/Allocations.vue')
const Reports = () => import('../reports/Reports.vue')
const Users = () => import('../admin/Users.vue')
const Logs = () => import('../admin/Logs.vue')

Vue.use(Router)

export const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/register',
    component: RegisterPage
  },
  {
    path: '/profile',
    component: ProfilePage
  },
  {
    path: '/admin/users',
    component: Users,
    beforeEnter: (to, from, next) => {
      if (store.state.account.user && store.state.account.user.roles.filter(function (v) {
        return v === 1
      }).length > 0) {
        next(true)
      } else {
        next(false)
      }
    }
  },
  {
    path: '/admin/logs',
    component: Logs,
    beforeEnter: (to, from, next) => {
      if (store.state.account.user && store.state.account.user.roles.filter(function (v) {
        return v === 1
      }).length > 0) {
        next(true)
      } else {
        next(false)
      }
    }
  },
  {
    path: '/budget/new',
    name: 'newBudget',
    component: NewBudget
  },
  {
    path: '/budget/:id/overview',
    name: 'overview',
    component: Overview
  },
  {
    path: '/budget/:id/history',
    name: 'history',
    component: Transactions
  },
  {
    path: '/budget/:id/allocations',
    name: 'allocations',
    component: Allocations
  },
  {
    path: '/budget/:id/reports',
    name: 'reports',
    component: Reports
  },
  {
    path: '/budget/:id/categories',
    name: 'budgetCategories',
    component: BudgetCategories
  },
  {
    path: '/budget/:id/edit',
    name: 'editBudget',
    component: EditBudget
  },

  {
    path: '*',
    redirect: '/'
  }
  ]
})

router.beforeEach((to, from, next) => {
  if (router.app.$wait && router.app.$wait.is('dialog')) {
    router.app.$root.$emit('closeDialogs')
    return next(false)
  }

  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)
  if (!authRequired) {
    return next(true)
  }
  store.dispatch('account/checkLogin').then(() => {
    if (!store.state.account.status.loggedIn) {
      return next('/login')
    }
    return next(true)
  })
})
