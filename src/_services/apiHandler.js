import config from 'config'

export const apiHandler = {
  saveAccessToken,
  saveRefreshToken,
  saveClientId,
  logout,
  fetchAuthorized
}

function getAccessToken () {
  return localStorage.getItem('token')
}

function getRefreshToken () {
  return localStorage.getItem('refreshToken')
}

function getClientId () {
  return localStorage.getItem('clientId')
}

function saveAccessToken (token) {
  localStorage.setItem('token', token)
}

function saveRefreshToken (refreshToken) {
  localStorage.setItem('refreshToken', refreshToken)
}

function saveClientId (clientId) {
  localStorage.setItem('clientId', clientId)
}

function logout () {
  localStorage.removeItem('user')
  localStorage.removeItem('clientId')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('token')
}

function renewToken () {
  var body = JSON.stringify({
    token: getAccessToken(),
    refreshToken: getRefreshToken(),
    clientId: getClientId()
  })

  return fetch(`${config.apiUrl}/users/renewtoken`, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function fetchAuthorized (url, options) {
  var jwtToken = getAccessToken()
  options = options || {}
  options.headers = options.headers || {}
  options.headers['Authorization'] = 'Bearer ' + jwtToken

  return fetch(url, options).then(response => {
    if (response.ok) {
      // zapytanie udane
      return response
    }
    // niepowodzenie zapytania - tez czy z powodu autoryzcaji
    if (response.status === 401 && response.headers.has('Token-Expired')) {
      // token wygasł - próba odnowienia
      renewToken().then(refreshResponse => {
        if (!refreshResponse.ok) {
          // odnowienie nieudane
          // wymuś wylogowanie
          logout()
          location.reload(true)
          return response // zwróć 401
        }
        // odnowienie udane - zapis nowych danych i ponowienie zapytania
        refreshResponse.json().then(freshTokens => {
          saveAccessToken(freshTokens.token)
          saveRefreshToken(freshTokens.refreshToken)
          return fetchAuthorized(url, options)
        })
      })
    } else {
      // zwrócenie nieudanej odpowiedzi
      return response
    }
  })
}
