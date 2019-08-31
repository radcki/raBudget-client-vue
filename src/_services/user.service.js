
import {
  apiHandler
} from './apiHandler'

export const userService = {
  login,
  logout,
  register,
  getProfile,
  getAll,
  getById,
  update,
  adminUpdate,
  changePassword,
  confirmAuthorization,
  delete: _delete,
  requestEmailConfirmationCode,
  submitEmailConfirmationCode,
  requestPasswordReset,
  submitPasswordResetCode
}

function login (username, password) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  }
  return fetch(`${process.env.VUE_APP_APIURL}/users/authenticate`, requestOptions)
}

function logout () {
  return apiHandler.logout()
}
function confirmAuthorization () {
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users/confirm-authorization`, {
    method: 'GET'
  })
}

function register (user) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  }
  return fetch(`${process.env.VUE_APP_APIURL}/users/register`, requestOptions)
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

function changePassword (oldpassword, newpassword) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      oldPassword: oldpassword,
      newPassword: newpassword
    })
  }

  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users/changepassword`, requestOptions)
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

function requestEmailConfirmationCode () {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users/request-email-confirmation`, requestOptions)
}

function submitEmailConfirmationCode (confirmCode) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      confirmCode: confirmCode
    })
  }

  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/users/confirm-email`, requestOptions)
}

function requestPasswordReset (email) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email
    })
  }

  return fetch(`${process.env.VUE_APP_APIURL}/users/request-password-reset`, requestOptions)
}

function submitPasswordResetCode (email, confirmCode, newPassword) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      token: confirmCode,
      newPassword: newPassword
    })
  }

  return fetch(`${process.env.VUE_APP_APIURL}/users/submit-password-reset`, requestOptions)
}
