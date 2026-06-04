import axios from 'axios';
import { toast } from 'react-hot-toast';

// Setup base instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized (Token expired or invalid)
        localStorage.removeItem('auth_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error('Anda tidak memiliki akses (Forbidden)');
      } else if (status === 422) {
        // Validation Errors
        const messages = Object.values(data.errors || {}).flat().join('\n');
        toast.error(messages || 'Validasi Gagal');
      } else {
        toast.error(data.message || 'Terjadi kesalahan pada server');
      }
    } else {
      toast.error('Gagal terhubung ke server');
    }
    return Promise.reject(error);
  }
);

export default api;
