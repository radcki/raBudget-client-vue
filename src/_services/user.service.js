import config from 'config';
import  { apiHandler }  from './apiHandler';

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
    delete: _delete
};

function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    return fetch(`${config.apiUrl}/users/authenticate`, requestOptions)
}

function logout(){
    return apiHandler.logout();
}

function register(user) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };
    return fetch(`${config.apiUrl}/users/register`, requestOptions);
}

function getAll() {
    return apiHandler.fetchAuthorized(`${config.apiUrl}/users`, {method: 'GET'});
}

function getProfile() {
    return apiHandler.fetchAuthorized(`${config.apiUrl}/users/profile`, {method: 'GET'})
            .then( response => {return response.json()});
}

function getById(id) {
    return apiHandler.fetchAuthorized(`${config.apiUrl}/users/${id}`, {method: 'GET'});
}

function update(user) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return apiHandler.fetchAuthorized(`${config.apiUrl}/users/updateprofile`, requestOptions);
}

function adminUpdate(user) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return apiHandler.fetchAuthorized(`${config.apiUrl}/users/admin-updateprofile`, requestOptions);
}

function changePassword(oldpassword, newpassword) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            oldPassword: oldpassword,
            newPassword: newpassword
        })
    };

    return apiHandler.fetchAuthorized(`${config.apiUrl}/users/changepassword`, requestOptions);
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id, password) {
    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            password: password
        })
    };
    return apiHandler.fetchAuthorized(`${config.apiUrl}/users/${id}`, requestOptions)
}
