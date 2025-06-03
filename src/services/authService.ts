// src/services/authService.ts
import { api } from './api';

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    name: string;
    role: string;
    // Tambahkan field lain sesuai kebutuhan
  };
  message?: string;
}

// Fungsi untuk login
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Respons server dengan status code di luar 2xx
      return {
        success: false,
        message: error.response.data.message || 'Login gagal'
      };
    } else if (error.request) {
      // Request dibuat tetapi tidak ada respons
      return {
        success: false,
        message: 'Tidak dapat terhubung ke server'
      };
    } else {
      // Error saat setup request
      return {
        success: false,
        message: 'Error saat mengirim permintaan login'
      };
    }
  }
};

// Fungsi untuk logout (memanggil endpoint logout jika ada)
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Fungsi untuk memverifikasi token
export const verifyToken = async (): Promise<boolean> => {
  try {
    const response = await api.get('/auth/verify');
    return response.data.valid;
  } catch (error) {
    return false;
  }
};

// Fungsi untuk mengubah password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return {
      success: true,
      message: response.data.message || 'Password berhasil diubah'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Gagal mengubah password'
    };
  }
};

// Fungsi untuk request reset password
export const requestPasswordReset = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return {
      success: true,
      message: response.data.message || 'Instruksi reset password telah dikirim'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Gagal mengirim permintaan reset password'
    };
  }
};