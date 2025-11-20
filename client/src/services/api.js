import axios from 'axios';

// Use local backend during development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not on auth pages
      if (!window.location.pathname.includes('/auth') && 
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleAuth: (googleData) => api.post('/auth/google', googleData),
  getMe: () => api.get('/auth/me'),
};

// Problems API
export const problemsAPI = {
  create: (problemData) => api.post('/problems', problemData),
  getAll: (params = {}) => api.get('/problems', { params }),
  getById: (id) => api.get(`/problems/${id}`),
  upvote: (id) => api.post(`/problems/${id}/upvote`),
  addComment: (id, commentData) => api.post(`/problems/${id}/comments`, commentData),
};

// AI API
export const aiAPI = {
  analyzeImage: (imageData) => api.post('/ai/analyze-image', imageData),
  generateDescription: (data) => api.post('/ai/generate-description', data),
  checkDuplicates: (data) => api.post('/ai/check-duplicates', data),
  prioritizeProblems: () => api.get('/ai/prioritize-problems'),
  analyzeSentiment: (text) => api.post('/ai/analyze-sentiment', { text }),
  predictResolution: (data) => api.post('/ai/predict-resolution', data),
  suggestAssignment: (id) => api.get(`/ai/suggest-assignment/${id}`),
  generateProgressUpdate: (id) => api.get(`/ai/progress-update/${id}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  generateReport: (id) => api.get(`/admin/problems/${id}/report`, { responseType: 'blob' }),
  updateStatus: (id, data) => api.patch(`/admin/problems/${id}/status`, data),
};

export default api;