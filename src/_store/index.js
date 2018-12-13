import Vue from 'vue'
import Vuex from 'vuex'

import { alert } from './alert.module'
import { account } from './account.module'
import { budgets } from './budgets.module'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    alert,
    account,
    budgets
  }
})
