import axios from 'axios';
import { config } from '../config';

const API = axios.create({ 
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth tokens if needed
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const claimsAPI = {
  search: (query) => API.get(`/api/claims/search?q=${encodeURIComponent(query)}`),
  getById: (id) => API.get(`/api/claims/${id}`),
  getStats: () => API.get('/api/claims/stats'),
};

export const atlasAPI = {
  getLayers: () => API.get('/api/atlas/layers'),
  getVillages: (params) => API.get('/api/atlas/villages', { params }),
  getClaims: (params) => API.get('/api/atlas/claims', { params }),
  getHeatmap: () => API.get('/api/atlas/heatmap'),
};

export const iotAPI = {
  getSensorData: (villageId) => API.get(`/api/iot/sensors/${villageId}`),
  getLatestReadings: () => API.get('/api/iot/latest'),
};

export const feedbackAPI = {
  submit: (feedback) => API.post('/api/feedback', feedback),
  getGrievances: () => API.get('/api/grievances'),
};

export default API;
