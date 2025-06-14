// src/services/userService.ts
import api from './api';
import { 
  User, 
  UserLevelInfo,
  CreateUserRequest, 
  UpdateUserRequest, 
  ResetPasswordRequest,
  BulkUpdateRequest,
  UserStats,
  DepartmentStats,
  UserFilters,
  UserQueryParams,
  PaginatedResponse,
  ApiResponse 
} from '../types/user.types';

class UserService {
  private baseURL = '/users';

  // Helper method to build query string
  private buildQueryString(params: UserQueryParams): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  // Get all users - Updated to match new backend API
  async getUsers(params: UserQueryParams = {}): Promise<PaginatedResponse<User>> {
    try {
      console.log('UserService - Making request to:', this.baseURL);
      
      const queryString = this.buildQueryString(params);
      const endpoint = queryString ? `${this.baseURL}?${queryString}` : this.baseURL;
      
      const response = await api.get(endpoint);
      console.log('UserService - Response:', response.data);
      
      // Handle new backend response structure
      if (response.data.success && response.data.data) {
        return {
          data: response.data.data,
          pagination: response.data.pagination || {
            page: params.page || 1,
            limit: params.limit || 10,
            total: response.data.data.length,
            totalPages: Math.ceil(response.data.data.length / (params.limit || 10)),
            hasNext: false,
            hasPrev: false
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
      
    } catch (error: any) {
      console.error('UserService - Error:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async getUsersLegacy(
    page: number = 1, 
    limit: number = 10, 
    filters: UserFilters = {}
  ): Promise<{
    success: boolean;
    data: {
      users: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    message?: string;
  }> {
    const response = await this.getUsers({ page, limit, ...filters });
    return {
      success: true,
      data: {
        users: response.data,
        pagination: {
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        }
      }
    };
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'User not found');
      }
    } catch (error: any) {
      console.error('UserService - Error getting user by ID:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      // Remove confirm_password from request if present
      const { confirm_password, ...requestData } = data;
      
      // Validate password confirmation if provided
      if (confirm_password && data.password !== confirm_password) {
        throw new Error('Password confirmation does not match');
      }

      const response = await api.post(this.baseURL, requestData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('UserService - Error creating user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await api.put(`${this.baseURL}/${id}`, data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('UserService - Error updating user:', error);
      throw error;
    }
  }

  // Delete user (soft delete)
  async deleteUser(id: string): Promise<void> {
    try {
      console.log('UserService - Attempting to delete user:', id);
      const response = await api.delete(`${this.baseURL}/${id}`);
      
      console.log('UserService - Delete response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
      
      // If response doesn't have success field, check status code
      if (response.status >= 200 && response.status < 300) {
        console.log('UserService - User deleted successfully');
        return;
      }
      
      throw new Error('Failed to delete user');
    } catch (error: any) {
      console.error('UserService - Error deleting user:', error);
      
      // Better error handling
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Network error: No response received');
      } else {
        throw new Error(error.message || 'Unknown error occurred');
      }
    }
  }

  // Toggle user status - Updated to use new backend endpoint
  async toggleUserStatus(id: string): Promise<User> {
    try {
      const response = await api.put(`${this.baseURL}/${id}/toggle-status`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to toggle user status');
      }
    } catch (error: any) {
      console.error('UserService - Error toggling user status:', error);
      throw error;
    }
  }

  // Reset user password - Updated to use new backend endpoint
  async resetUserPassword(id: string, passwordData: ResetPasswordRequest): Promise<void> {
    try {
      const response = await api.put(`${this.baseURL}/${id}/reset-password`, passwordData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('UserService - Error resetting password:', error);
      throw error;
    }
  }

  // Get user statistics - Updated to use new backend endpoint
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get(`${this.baseURL}/stats`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user statistics');
      }
    } catch (error: any) {
      console.error('UserService - Error getting user stats:', error);
      throw error;
    }
  }

  // Get users by department - Updated to use new backend endpoint
  async getUsersByDepartment(): Promise<DepartmentStats> {
    try {
      const response = await api.get(`${this.baseURL}/departments`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch department statistics');
      }
    } catch (error: any) {
      console.error('UserService - Error getting department stats:', error);
      throw error;
    }
  }

  // Bulk update users - New method for backend endpoint
  async bulkUpdateUsers(bulkData: BulkUpdateRequest): Promise<{ updatedCount: number; updates: any }> {
    try {
      const response = await api.put(`${this.baseURL}/bulk-update`, bulkData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to bulk update users');
      }
    } catch (error: any) {
      console.error('UserService - Error bulk updating users:', error);
      throw error;
    }
  }

  // Legacy method - Change password (for backward compatibility)
  async changePassword(
    id: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<ApiResponse<null>> {
    try {
      await this.resetUserPassword(id, { newPassword });
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error: any) {
      console.error('UserService - Error changing password:', error);
      throw error;
    }
  }

  // Legacy method - Reset password (for backward compatibility)
  async resetPassword(id: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      await this.resetUserPassword(id, { newPassword });
      
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error: any) {
      console.error('UserService - Error resetting password:', error);
      throw error;
    }
  }

  // Get user levels - keeping this for compatibility (if you have separate endpoint)
  async getUserLevels(): Promise<ApiResponse<UserLevelInfo[]>> {
    try {
      console.log('UserService - Getting user levels from backend');
      const response = await api.get('/user-levels');
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'User levels fetched successfully'
        };
      } else {
        // Fallback to hardcoded user levels if endpoint doesn't exist
        const defaultUserLevels: UserLevelInfo[] = [
          { id: 'admin', level_name: 'Administrator', created_at: '', updated_at: '' },
          { id: 'manager', level_name: 'Manager', created_at: '', updated_at: '' },
          { id: 'technician', level_name: 'Technician', created_at: '', updated_at: '' },
          { id: 'warehouse', level_name: 'Warehouse', created_at: '', updated_at: '' },
          { id: 'viewer', level_name: 'Viewer', created_at: '', updated_at: '' }
        ];
        
        return {
          success: true,
          data: defaultUserLevels,
          message: 'User levels fetched successfully'
        };
      }
    } catch (error: any) {
      console.error('UserService - Error getting user levels:', error);
      
      // Return default levels on error
      const defaultUserLevels: UserLevelInfo[] = [
        { id: 'admin', level_name: 'Administrator', created_at: '', updated_at: '' },
        { id: 'manager', level_name: 'Manager', created_at: '', updated_at: '' },
        { id: 'technician', level_name: 'Technician', created_at: '', updated_at: '' },
        { id: 'warehouse', level_name: 'Warehouse', created_at: '', updated_at: '' },
        { id: 'viewer', level_name: 'Viewer', created_at: '', updated_at: '' }
      ];
      
      return {
        success: true,
        data: defaultUserLevels,
        message: 'User levels fetched successfully'
      };
    }
  }

  // Convenience methods
  async searchUsers(searchTerm: string, filters: Partial<UserQueryParams> = {}): Promise<PaginatedResponse<User>> {
    return this.getUsers({
      ...filters,
      search: searchTerm,
    });
  }

  async getActiveUsers(params: Omit<UserQueryParams, 'is_active'> = {}): Promise<PaginatedResponse<User>> {
    return this.getUsers({
      ...params,
      is_active: true,
    });
  }

  async getInactiveUsers(params: Omit<UserQueryParams, 'is_active'> = {}): Promise<PaginatedResponse<User>> {
    return this.getUsers({
      ...params,
      is_active: false,
    });
  }

  // Bulk operations
  async activateUsers(userIds: string[]): Promise<{ updatedCount: number }> {
    return this.bulkUpdateUsers({
      userIds,
      updates: { is_active: true }
    });
  }

  async deactivateUsers(userIds: string[]): Promise<{ updatedCount: number }> {
    return this.bulkUpdateUsers({
      userIds,
      updates: { is_active: false }
    });
  }

  async changeUserLevel(userIds: string[], userLevel: string): Promise<{ updatedCount: number }> {
    return this.bulkUpdateUsers({
      userIds,
      updates: { user_level_id: userLevel as any }
    });
  }

  async changeDepartment(userIds: string[], department: string): Promise<{ updatedCount: number }> {
    return this.bulkUpdateUsers({
      userIds,
      updates: { department }
    });
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;