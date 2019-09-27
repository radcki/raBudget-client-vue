import { eAlertType } from '@/typings/enums/eAlertType'
import { RootState } from '.'
import { ActionTree, MutationTree, Module } from 'vuex'

interface AlertState {
  type: eAlertType | null,
  message: string | null,
}

const stateData: AlertState = {
  type: null,
  message: null
}

const actions: ActionTree<AlertState, RootState> = {
  success({ commit }, message) {
    commit('success', message)
  },
  error({ commit }, message) {
    commit('error', message)
  },
  info({ commit }, message) {
    commit('info', message)
  },
  warning({ commit }, message) {
    commit('warning', message)
  },
  clear({ commit }) {
    commit('clear')
  }
}

const mutations: MutationTree<AlertState> = {
  success(state, message) {
    state.type = eAlertType.Success
    state.message = message
  },
  error(state, message) {
    state.type = eAlertType.Error
    state.message = message
  },
  info(state, message) {
    state.type = eAlertType.Info
    state.message = message
  },
  warning(state, message) {
    state.type = eAlertType.Warning
    state.message = message
  },
  clear(state) {
    state.type = null
    state.message = null
  }
}

export const alert: Module<AlertState, RootState> = {
  namespaced: true,
  state: stateData,
  actions,
  mutations
}
