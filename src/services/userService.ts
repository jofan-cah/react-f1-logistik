// src/services/userService.ts
import api from './api';
import { 
  User, 
  UserLevel,
  CreateUserRequest, 
  UpdateUserRequest, 
  UserFilters,
  ApiResponse 
} from '../types/user.types';

export const userService = {
  // Get all users (Note: Backend doesn't support pagination yet, so we handle it on frontend)
  async getUsers(
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
    try {
      console.log('UserService - Making request to: /users');
      
      const response = await api.get('/users');
      
      console.log('UserService - Response:', response.data);
      
      // Handle backend response structure: { success, data: users[] }
      if (response.data.success && response.data.data) {
        let users = response.data.data;
        
        // Apply client-side filtering since backend doesn't support it yet
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          users = users.filter((user: User) =>
            user.username.toLowerCase().includes(searchLower) ||
            user.full_name.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.department?.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters.user_level_id) {
          users = users.filter((user: User) => user.user_level_id === filters.user_level_id);
        }
        
        if (filters.department) {
          users = users.filter((user: User) => user.department === filters.department);
        }
        
        if (filters.is_active !== undefined) {
          users = users.filter((user: User) => user.is_active === filters.is_active);
        }
        
        // Apply client-side sorting
        if (filters.sort_by) {
          users.sort((a: User, b: User) => {
            const aValue = a[filters.sort_by as keyof User] || '';
            const bValue = b[filters.sort_by as keyof User] || '';
            
            if (filters.sort_order === 'DESC') {
              return String(bValue).localeCompare(String(aValue));
            }
            return String(aValue).localeCompare(String(bValue));
          });
        }
        
        // Apply client-side pagination
        const total = users.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = users.slice(startIndex, endIndex);
        
        return {
          success: true,
          data: {
            users: paginatedUsers,
            pagination: {
              page,
              limit,
              total,
              totalPages
            }
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
      
    } catch (error: any) {
      console.error('UserService - Error:', error);
      throw error;
    }
  },

  // Get user levels (mock for now since not in controller)
  async getUserLevels(): Promise<ApiResponse<UserLevel[]>> {
    try {
      // Mock user levels since backend doesn't have this endpoint yet
      const mockUserLevels: UserLevel[] = [
        { 
          id: 'admin', 
          name: 'Administrator', 
          description: 'Full system access',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 'manager', 
          name: 'Manager', 
          description: 'Department management',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 'staff', 
          name: 'Staff', 
          description: 'Standard user access',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 'viewer', 
          name: 'Viewer', 
          description: 'Read-only access',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return {
        success: true,
        data: mockUserLevels,
        message: 'User levels fetched successfully'
      };
    } catch (error: any) {
      console.error('UserService - Error getting user levels:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('UserService - Error getting user by ID:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      // Map frontend data to backend format
      const backendData = {
        username: data.username,
        password: data.password,
        full_name: data.full_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        user_level_id: data.user_level_id,
        department: data.department || undefined
      };

      const response = await api.post('/users', backendData);
      return response.data;
    } catch (error: any) {
      console.error('UserService - Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('UserService - Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('UserService - Error deleting user:', error);
      throw error;
    }
  },

  // Toggle user active status (custom implementation using update)
  async toggleUserStatus(id: string): Promise<ApiResponse<User>> {
    try {
      // First get the current user to know current status
      const getUserResponse = await api.get(`/users/${id}`);
      if (!getUserResponse.data.success) {
        throw new Error('User not found');
      }
      
      const currentUser = getUserResponse.data.data;
      const newStatus = !currentUser.is_active;
      
      // Update with new status
      const response = await api.put(`/users/${id}`, {
        is_active: newStatus
      });
      
      return response.data;
    } catch (error: any) {
      console.error('UserService - Error toggling user status:', error);
      throw error;
    }
  },

  // Change user password (custom implementation)
  async changePassword(
    id: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<ApiResponse<null>> {
    try {
      // Since backend doesn't have separate endpoint, use update with password
      const response = await api.put(`/users/${id}`, {
        password: newPassword
      });
      
      return {
        success: response.data.success,
        message: response.data.message || 'Password changed successfully'
      };
    } catch (error: any) {
      console.error('UserService - Error changing password:', error);
      throw error;
    }
  },

  // Get user statistics (mock implementation)
  async getUserStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    byLevel: Record<string, number>;
    byDepartment: Record<string, number>;
    recentLogins: number;
  }>> {
    try {
      // Get all users first
      const response = await api.get('/users');
      
      if (response.data.success && response.data.data) {
        const users = response.data.data;
        
        const stats = {
          total: users.length,
          active: users.filter((u: User) => u.is_active).length,
          inactive: users.filter((u: User) => !u.is_active).length,
          byLevel: {} as Record<string, number>,
          byDepartment: {} as Record<string, number>,
          recentLogins: users.filter((u: User) => {
            if (!u.last_login) return false;
            const lastLogin = new Date(u.last_login);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return lastLogin > weekAgo;
          }).length
        };
        
        // Count by level
        users.forEach((user: User) => {
          const level = user.UserLevel?.name || user.user_level_id;
          stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
        });
        
        // Count by department
        users.forEach((user: User) => {
          if (user.department) {
            stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1;
          }
        });
        
        return {
          success: true,
          data: stats,
          message: 'User statistics calculated successfully'
        };
      } else {
        throw new Error('Failed to fetch users for statistics');
      }
    } catch (error: any) {
      console.error('UserService - Error getting user stats:', error);
      throw error;
    }
  },

  // Reset user password (admin function)
  async resetPassword(id: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.put(`/users/${id}`, {
        password: newPassword
      });
      
      return {
        success: response.data.success,
        message: response.data.message || 'Password reset successfully'
      };
    } catch (error: any) {
      console.error('UserService - Error resetting password:', error);
      throw error;
    }
  }
};