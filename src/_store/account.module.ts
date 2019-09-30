import { User } from '@/typings/User';
import { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import Vue from 'vue';
import { RootState } from '.';

export interface UserState {}

const userState: UserState = {};

const actions: ActionTree<UserState, RootState> = {};

const getters: GetterTree<UserState, RootState> = {
  currentUser(): User | null {
    return Vue.prototype.$keycloak && Vue.prototype.$keycloak.authenticated
      ? {
          userName: Vue.prototype.$keycloak.userName,
          userEmail: Vue.prototype.$keycloak.tokenParsed.email,
          fullName: Vue.prototype.$keycloak.fullName,
          userId: Vue.prototype.$keycloak.subject
        }
      : null;
  }
};

const mutations: MutationTree<UserState> = {};

export const account: Module<UserState, RootState> = {
  namespaced: true,
  state: userState,
  actions,
  getters,
  mutations
};
