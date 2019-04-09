import Vue from 'vue'
import Router from 'vue-router'
import { store } from '../_store'

const HomePage = () => import('../home/HomePage.vue')
const LoginPage = () => import('../login/LoginPage.vue')
const EmailVerification = () => import('../login/EmailVerification.vue')
const PasswordReset = () => import('../login/PasswordReset.vue')
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
const TransactionSchedules = () => import('../transactionSchedules/TransactionSchedules.vue')

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
    path: '/email-verification',
    name: 'email-verification',
    component: EmailVerification
  },
  {
    path: '/password-reset',
    name: 'password-reset',
    component: PasswordReset
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
    path: '/budget/:id/transaction-schedules',
    name: 'transactionSchedules',
    component: TransactionSchedules
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
  const publicPages = ['/login', '/register', '/password-reset']
  const authRequired = !publicPages.includes(to.path)
  if (!authRequired) {
    return next(true)
  }
  store.dispatch('account/checkLogin').then(() => {
    if (!store.state.account.status.loggedIn) {
      return next('/login')
    }

    if (!store.state.account.user.emailVerified && to.name != 'email-verification') {
      return next('/email-verification')
    }

    return next(true)
  })
})
