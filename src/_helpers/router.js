import Vue from 'vue'
import Router from 'vue-router'
import {store} from '../_store'

import HomePage from '../home/HomePage'
import LoginPage from '../login/LoginPage'
import RegisterPage from '../register/RegisterPage'
import ProfilePage from '../profile/Profile'
import NewBudget from '../budgets/NewBudget'
import BudgetCategories from '../budgets/BudgetCategories.vue'
import EditBudget from '../budgets/EditBudget.vue'
import Overview from '../overview/Overview.vue'
import Transactions from '../history/Transactions.vue'
import Allocations from '../history/Allocations.vue'
import Reports from '../reports/Reports.vue'
import Users from '../admin/Users.vue'
import Logs from '../admin/Logs.vue'

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
        next()
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
        next()
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
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)
  if (!authRequired) {
    return next()
  }
  store.dispatch('account/checkLogin').then(() => {
    if (!store.state.account.status.loggedIn) {
      return next('/login')
    }
    return next()
  })
})
