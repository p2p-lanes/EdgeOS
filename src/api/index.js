import axios from 'axios';

export const instance = axios.create({
  baseURL: 'https://api-citizen-portal.simplefi.tech/',
  timeout: 30000,
});

const catchError = (e) => {
  console.error('Unexpected error: ', e.response);
  return e.response;
};

export const api = {
  get: async (url, params = {}) => {
    return instance
      .get(url, params)
      .then((data) => data)
  },

  get_one: (url, params) => {
    return instance
      .get(url, params)
      .then((data) => data)
      .catch(catchError);
  },

  put: (url, data, config) => {
    return instance
      .put(url, data, config)
      .then((data) => data)
      .catch(catchError);
  },
  patch: (url, ...params) => {
    return instance
      .patch(url, ...params)
      .then((data) => data)
      .catch(catchError);
  },
  post: (url, ...params) => {
    return instance.post(url, ...params).then((d) => d).catch(catchError);
  },

  delete: (url, params) => {
    return instance
      .delete(url, params)
      .then((data) => data)
      .catch(catchError);
  },
};