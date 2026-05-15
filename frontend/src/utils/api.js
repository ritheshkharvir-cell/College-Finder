import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  signup: (data) => API.post('/auth/signup', data),
  me: () => API.get('/auth/me'),
  updatePrefs: (data) => API.put('/auth/preferences', data),
};

export const collegesAPI = {
  getAll: (params) => API.get('/colleges', { params }),
  getTop: () => API.get('/colleges/top'),
  getStats: () => API.get('/colleges/stats'),
  getById: (id) => API.get(`/colleges/${id}`),
  getNearby: (params) => API.get('/colleges/nearby', { params }),
  compare: (ids) => API.get('/colleges/compare', { params: { ids: ids.join(',') } }),
  recommend: (params) => API.get('/colleges/recommend', { params }),
};

export const chatAPI = {
  send: (data) => API.post('/chat', data),
  getHistory: () => API.get('/chat/history'),
  clearHistory: () => API.delete('/chat/history'),
};

export const favoritesAPI = {
  getAll: () => API.get('/favorites'),
  add: (id) => API.post(`/favorites/${id}`),
  remove: (id) => API.delete(`/favorites/${id}`),
};

export default API;
