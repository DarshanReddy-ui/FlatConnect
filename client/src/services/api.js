import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flatConnectToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('flatConnectToken');
      localStorage.removeItem('flatConnectUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Complaints API
export const complaintsAPI = {
  getAll: (params = {}) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  addComment: (id, data) => api.post(`/complaints/${id}/comments`, data),
  getStats: () => api.get('/complaints/stats/overview'),
};

// Events API
export const eventsAPI = {
  getAll: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  register: (id, data) => api.post(`/events/${id}/register`, data),
  unregister: (id) => api.delete(`/events/${id}/register`),
  getUpcoming: () => api.get('/events/upcoming/list'),
};

// Announcements API
export const announcementsAPI = {
  getAll: (params = {}) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
  markAsRead: (id) => api.post(`/announcements/${id}/read`),
  getRecent: () => api.get('/announcements/recent/list'),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  activate: (id) => api.put(`/users/${id}/activate`),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats/overview'),
  search: (query) => api.get('/users/search/quick', { params: { q: query } }),
};

export default api;