// src/services/userLevelService.ts
import api from './api';
import { 
  UserLevel, 
  CreateUserLevelRequest, 
  UpdateUserLevelRequest,
  ApiResponse 
} from '../types/userLevel.types';

export const userLevelService = {
  // Get all user levels
  async getUserLevels(): Promise<ApiResponse<UserLevel[]>> {
    try {
      const response = await api.get('/user-levels');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user levels:', error);
      throw error;
    }
  },

  // Get user level by ID
  async getUserLevelById(id: string): Promise<ApiResponse<UserLevel>> {
    try {
      const response = await api.get(`/user-levels/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user level:', error);
      throw error;
    }
  },

  // Create new user level
  async createUserLevel(data: CreateUserLevelRequest): Promise<ApiResponse<UserLevel>> {
    try {
      const response = await api.post('/user-levels', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user level:', error);
      throw error;
    }
  },

  // Update user level
  async updateUserLevel(id: string, data: UpdateUserLevelRequest): Promise<ApiResponse<UserLevel>> {
    try {
      const response = await api.put(`/user-levels/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user level:', error);
      throw error;
    }
  },

  // Delete user level
  async deleteUserLevel(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/user-levels/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting user level:', error);
      throw error;
    }
  }
};