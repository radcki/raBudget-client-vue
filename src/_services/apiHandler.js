
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

function noRefreshPending () {
  return new Promise((resolve, reject) => {
    var i = 0
    var finished = setInterval(() => {
      var isRefreshing = localStorage.getItem('tokenRefreshing')
      if (!isRefreshing || i > 50) {
        clearInterval(finished)
        resolve()
      }
      i++
    }, 100)
  })
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
  return new Promise((resolve, reject) => {
    noRefreshPending().then(() => { // potwierdzenie czy aktualnie w toku nie jest odświeżenie tokenu
      var jwtToken = getAccessToken()
      options = options || {}
      options.headers = options.headers || {}
      options.headers['Authorization'] = 'Bearer ' + jwtToken
      fetch(url, options).then(response => {
        if (response.ok) {
          // zapytanie udane
          resolve(response)
        } else {
          if (response.status === 401 && response.headers.has('Token-Expired')) {
            localStorage.setItem('tokenRefreshing', true) // oznaczenie że token jest własnie odświeżany
            renewToken().then(refreshResponse => { // wysłanie requestu o nowy token
              if (refreshResponse.ok) {
                refreshResponse.json().then(freshTokens => {
                  saveAccessToken(freshTokens.token)
                  saveRefreshToken(freshTokens.refreshToken)
                  localStorage.removeItem('tokenRefreshing') // oznaczenie końca odświeżania
                  resolve(fetchAuthorized(url, options))
                })
              } else {
                localStorage.removeItem('tokenRefreshing') // oznaczenie końca odświeżania
                logout()
                resolve(response)
              }
            })
          }
        }
      }).catch(error => {
        reject(error)
      })
    })
  })
}
