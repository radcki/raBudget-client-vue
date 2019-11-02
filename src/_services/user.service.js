
import {
  apiHandler
} from './apiHandler'

export const userService = {
  logout,
  getProfile,
  getAll,
  getById,
  update,
  adminUpdate,
  delete: _delete
}

function logout () {
  return apiHandler.logout()
}

function getAll () {
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users`, {
    method: 'GET'
  })
}

function getProfile () {
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users/profile`, {
    method: 'GET'
  })
    .then(response => {
      return response.json()
    })
}

function getById (id) {
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users/${id}`, {
    method: 'GET'
  })
}

function update (user) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  }

  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users/updateprofile`, requestOptions)
}

function adminUpdate (user) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  }

  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users/admin-updateprofile`, requestOptions)
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete (id, password) {
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      password: password
    })
  }
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users/${id}`, requestOptions)
}
