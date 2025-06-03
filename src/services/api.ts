// src/services/api.ts
import axios from 'axios';

// Base URL untuk API
// const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = import.meta.env.VITE_API_URL || 'https://nr9g70q7-5000.asse.devtunnels.ms/api';

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
    return response;
  },
  (error) => {
    // Tangani error authentication (401)
    if (error.response && error.response.status === 401) {
      // Token tidak valid, logout user
      localStorage.removeItem('auth_token');
      // Redirect ke halaman login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;