import { apiHandler } from './apiHandler';

function getAll() {
  return apiHandler.fetchAuthorized(`${process.env.VUE_APP_APIURL}/logs/all`, {
    method: 'GET',
  });
}

function getPeriod(from, to) {
  const url = new URL(`${process.env.VUE_APP_APIURL}/logs/period`, document.location);
  const params = {
    from: from,
    to: to,
  };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  return apiHandler.fetchAuthorized(url, {
    method: 'GET',
  });
}

export const logsService = {
  getAll,
  getPeriod,
};
