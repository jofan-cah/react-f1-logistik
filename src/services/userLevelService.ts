// src/services/userLevelService.ts
import api from './api';
import {
  UserLevel,
  CreateUserLevelRequest,
  UpdateUserLevelRequest,
  UserLevelFilters,
  UserLevelListResponse,
  ApiResponse,
  UserLevelStats,
  AvailableUserLevel,
  UserLevelUsageFilters,
  UserLevelUsage
} from '../types/userLevel.types';

export const userLevelService = {

  // Get all user levels with pagination and filters
  async getUserLevels(
    page: number = 1,
    limit: number = 10,
    filters: UserLevelFilters = {}
  ): Promise<UserLevelListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters to params
      if (filters.search) params.append('search', filters.search);
      if (filters.level_name) params.append('level_name', filters.level_name);
      if (filters.include_users !== undefined) params.append('include_users', filters.include_users.toString());
      if (filters.include_permissions !== undefined) params.append('include_permissions', filters.include_permissions.toString());

      const url = `/usersLevel?${params.toString()}`;
      console.log('UserLevelService - Making request to:', url);

      const response = await api.get(url);
      console.log('UserLevelService - Response:', response.data);
      console.log('UserLevelService - Response status:', response.status);

      // Handle the actual response structure from your API
      if (response.status === 200 && response.data.success) {
        // FIXED: Your API returns data directly in 'data' field, not nested
        return {
          success: true,
          data: {
            userLevels: response.data.data, // The actual user levels array
            pagination: response.data.meta.pagination // The pagination meta
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch user levels');
      }
    } catch (error: any) {
      console.error('UserLevelService - Error:', error);
      console.error('UserLevelService - Error response:', error.response?.data);
      console.error('UserLevelService - Error status:', error.response?.status);
      throw error;
    }
  },

  // Get user level by ID
  async getUserLevelById(
    id: string, 
    includeUsers: boolean = false, 
    includePermissions: boolean = false
  ): Promise<ApiResponse<UserLevel>> {
    try {
      const params = new URLSearchParams();
      if (includeUsers) params.append('include_users', 'true');
      if (includePermissions) params.append('include_permissions', 'true');

      const url = `/usersLevel/${id}${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('UserLevelService - getUserLevelById URL:', url);
      
      const response = await api.get(url);
      console.log('UserLevelService - getUserLevelById response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('UserLevelService - Get by ID Error:', error);
      throw error;
    }
  },

  // Search user levels
  async searchUserLevels(query: string): Promise<ApiResponse<UserLevel[]>> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);

      const response = await api.get(`/usersLevel/search?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('UserLevelService - Search Error:', error);
      throw error;
    }
  },

  // Get available user levels (for dropdowns)
  async getAvailableUserLevels(): Promise<ApiResponse<AvailableUserLevel[]>> {
    try {
      const response = await api.get('/usersLevel/available');
      return response.data;
    } catch (error: any) {
      console.error('UserLevelService - Get Available Error:', error);
      throw error;
    }
  },

  // Get user level statistics
  async getUserLevelStats(): Promise<ApiResponse<UserLevelStats>> {
    try {
      const response = await api.get('/usersLevel/stats');
      return response.data;
    } catch (error: any) {
      console.error('UserLevelService - Get Stats Error:', error);
      throw error;
    }
  },

  // Get user level usage (users assigned to specific level)
  async getUserLevelUsage(
    id: string,
    page: number = 1,
    limit: number = 10,
    filters: UserLevelUsageFilters = {}
  ): Promise<UserLevelUsage> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters to params
      if (filters.search) params.append('search', filters.search);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters.department) params.append('department', filters.department);

      const url = `/usersLevel/${id}/usage?${params.toString()}`;
      const response = await api.get(url);

      // Transform the response to match UserLevelUsage interface
      if (response.status === 200 && response.data.success) {
        return {
          success: true,
          data: {
            users: response.data.data,
            pagination: response.data.meta.pagination
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch user level usage');
      }
    } catch (error: any) {
      console.error('UserLevelService - Get Usage Error:', error);
      throw error;
    }
  },

  // Create new user level
  async createUserLevel(data: CreateUserLevelRequest): Promise<ApiResponse<UserLevel>> {
    try {
      console.log('UserLevelService createUserLevel called with:', data);
      const response = await api.post('/usersLevel', data);
      console.log('UserLevelService createUserLevel response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('UserLevelService - Create Error:', error);
      throw error;
    }
  },

  // Update user level
  async updateUserLevel(id: string, data: UpdateUserLevelRequest): Promise<ApiResponse<UserLevel>> {
    try {
      console.log('UserLevelService updateUserLevel called with:', { id, data });
      const response = await api.put(`/usersLevel/${id}`, data);
      console.log('UserLevelService updateUserLevel response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('UserLevelService - Update Error:', error);
      throw error;
    }
  },

  // Delete user level
  async deleteUserLevel(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/usersLevel/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('UserLevelService - Delete Error:', error);
      throw error;
    }
  },

  // Update user level permissions - FIXED: Use proper endpoint structure
  async updateUserLevelPermissions(userLevelId: string, permissions: any[]): Promise<ApiResponse<any>> {
    try {
      console.log('UserLevelService updatePermissions called with:', { userLevelId, permissions });
      
      // Convert permissions to the format expected by backend
      const permissionUpdates = permissions.map(perm => ({
        module: perm.module,
        can_view: Boolean(perm.can_view),
        can_add: Boolean(perm.can_add),
        can_edit: Boolean(perm.can_edit),
        can_delete: Boolean(perm.can_delete)
      }));

      console.log('Sending permissions to backend:', permissionUpdates);

      // Use the new endpoint
      const response = await api.put(`/usersLevel/${userLevelId}/permissions`, { 
        permissions: permissionUpdates 
      });
      
      console.log('UserLevelService updatePermissions response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('UserLevelService - Update Permissions Error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Validate user level ID format
  validateUserLevelId(id: string): { isValid: boolean; error?: string } {
    if (!id || id.length < 2 || id.length > 20) {
      return {
        isValid: false,
        error: 'User level ID must be between 2 and 20 characters'
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(id)) {
      return {
        isValid: false,
        error: 'User level ID can only contain letters, numbers, and underscores'
      };
    }

    return { isValid: true };
  },

  // Validate level name
  validateLevelName(levelName: string): { isValid: boolean; error?: string } {
    if (!levelName || levelName.length < 2 || levelName.length > 50) {
      return {
        isValid: false,
        error: 'Level name must be between 2 and 50 characters'
      };
    }

    return { isValid: true };
  },

  // Validate description
  validateDescription(description?: string): { isValid: boolean; error?: string } {
    if (description && description.length > 1000) {
      return {
        isValid: false,
        error: 'Description cannot exceed 1000 characters'
      };
    }

    return { isValid: true };
  }
};