import Vue from 'vue';
import { TypedResponse } from '@/typings/TypedResponse';

function getAccessToken() {
  return Vue.prototype.$keycloak ? Vue.prototype.$keycloak.token : null;
}

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('clientId');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('token');
}

function fetchAuthorized<T>(url: string, options: RequestInit): Promise<TypedResponse<T>> {
  const jwtToken = getAccessToken();
  options = options || {};
  options.headers = options.headers || {};
  if (jwtToken) {
    options.headers['Authorization'] = 'Bearer ' + jwtToken;
  }
  return fetch(url, options);
}

export const apiHandler = {
  logout,
  fetchAuthorized,
  getAccessToken,
};
