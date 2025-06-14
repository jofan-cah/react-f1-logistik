// src/services/api.ts
import axios from 'axios';

// Base URL untuk API - disesuaikan ke localhost:3000
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Buat instance axios
export const api = axios.create({
  baseURL,
  timeout: 10000, // 10 detik
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani respons
api.interceptors.response.use(
  (response) => {
    console.log('API Response interceptor:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    
    // Handle 204 No Content - this might be your issue
    if (response.status === 204) {
      console.warn('Received 204 No Content response for:', response.config.url);
      // You might want to return a default structure or handle this case
      return {
        ...response,
        data: { success: false, message: 'No content returned' }
      };
    }
    
    return response;
  },
  (error) => {
    console.error('API Response interceptor error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message
    });
    
    // Tangani error authentication (401)
    if (error.response && error.response.status === 401) {
      // Token tidak valid, logout user
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Redirect ke halaman login
      window.location.href = '/login';
    }
    
    // Tangani error lainnya
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;