import { userService } from '../_services/user.service';
import { router } from '../_helpers';
import { apiHandler } from '../_services/apiHandler';

const user = localStorage.getItem('user');
const state = user
    ? { status: { loggedIn: true }, user: JSON.parse(user) }
    : { status: { loggedIn: false }, user: null };

const actions = {
    login({ dispatch, commit }, { username, password }) {
        commit('loginRequest', { username });
        
        return userService.login(username, password)
            .then( (response) => {
                if (response.ok){
                    return response.json()
                            .then( (data) => {
                                localStorage.setItem('user', JSON.stringify(data.user));
                                apiHandler.saveAccessToken(data.token);
                                apiHandler.saveRefreshToken(data.refreshToken);
                                apiHandler.saveClientId(data.clientId); 
                                
                                commit('loginSuccess', data.user);
                                return true;
                            });                    
                } else if(response.status === 404 ) {
                    return response.json()
                        .then( error => {
                            commit('loginFailure', error.message);
                            dispatch('alert/error', error.message, { root: true });
                            return false;
                        });  
                } else {
                    throw response;
                }
            })
            .catch( (error) => {
                commit('loginFailure', error);
                dispatch('alert/error', "account.loginFailed", { root: true });
            });
    },
    logout({ commit }) {
        userService.logout();
        commit('logout');
    },
    register({ dispatch, commit }, user) {
        commit('registerRequest', user);
    
        userService.register(user)
            .then( response => {
                if (response.ok) {                    
                    commit('registerSuccess', user);
                    router.push('/login');
                    setTimeout(() => {
                        // display success message after route change completes
                        dispatch('alert/success', "account.registerOk", { root: true });
                    });                    
                } else {
                    return response.json()
                        .then( error => {
                            commit('registerFailure', error.message);
                            dispatch('alert/error', error.message, { root: true });                   
                        });  
                }          
        });
    },
    updateProfile({ dispatch, commit }, user) {
        userService.update(user)
            .then( response => {
                if (response.ok) {                    
                    dispatch('alert/success', "general.changesSaved", { root: true });                
                } else {
                    return response.json()
                        .then( error => {
                            dispatch('alert/error', error, { root: true });                   
                        });  
                }          
            });
    },
    changePassword({ dispatch, commit }, data) {
        return userService.changePassword(data.oldpassword, data.newpassword)
            .then( response => {
                if (response.ok) {
                    dispatch('alert/success', "general.changesSaved", { root: true });
                    return true;
                } else {
                    return response.json()
                        .then( error => {
                            dispatch('alert/error', error.message, { root: true });
                            return false;
                        });
                }
            });
    }
};

const mutations = {
    loginRequest(state, user) {
        state.status = { loggingIn: true };
        state.user = user;
    },
    loginSuccess(state, user) {
        state.status = { loggedIn: true };
        state.user = user;
    },
    loginFailure(state) {
        state.status = {};
        state.user = null;
    },
    logout(state) {
        state.status = {};
        state.user = null;
    },
    registerRequest(state, user) {
        state.status = { registering: true };
    },
    registerSuccess(state, user) {
        state.status = {};
    },
    registerFailure(state, error) {
        state.status = {};
    }
};

export const account = {
    namespaced: true,
    state,
    actions,
    mutations
};