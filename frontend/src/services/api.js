import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const medicineAPI = {
  getAll: () => api.get('/medicines'),
  getOne: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`)
};

export const logAPI = {
  getByDate: (date) => api.get(`/logs/date/${date}`),
  getByMedicine: (id) => api.get(`/logs/medicine/${id}`),
  update: (id, data) => api.put(`/logs/${id}`, data)
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getAdherenceHistory: (days = 7) => api.get(`/dashboard/adherence-history?days=${days}`)
};

export default api;