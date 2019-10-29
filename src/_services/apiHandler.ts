import Vue from 'vue'
import { TypedResponse } from '@/typings/TypedResponse'

export const apiHandler = {
  logout,
  fetchAuthorized,
  getAccessToken
}

function getAccessToken () {
  return Vue.prototype.$keycloak ? Vue.prototype.$keycloak.token : null
}

function logout () {
  localStorage.removeItem('user')
  localStorage.removeItem('clientId')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('token')
}

function fetchAuthorized<T>(url, options): Promise<TypedResponse<T>> {
  var jwtToken = getAccessToken()
  options = options || {}
  options.headers = options.headers || {}
  if (jwtToken) {
    options.headers['Authorization'] = 'Bearer ' + jwtToken
  }
  return fetch(url, options)
}
