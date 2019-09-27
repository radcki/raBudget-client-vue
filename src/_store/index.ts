import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex';

import { budgets } from './budgets.module'
import { account } from './account.module'
import { alert } from './alert.module'
import { transactions } from './transactions.module'
import wait from 'vue-wait/src/vuex/store'

Vue.use(Vuex)
// tslint:disable-next-line: no-empty-interface
export interface RootState {}

const store: StoreOptions<RootState> = {
  modules: {
    alert,
    account,
    budgets,
    transactions,
    wait
  }
}

export default new Vuex.Store<RootState>(store);
