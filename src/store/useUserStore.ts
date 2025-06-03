// src/store/useUserStore.ts
import { create } from 'zustand';
import { User, UserLevel, CreateUserRequest, UpdateUserRequest, UserFilters } from '../types/user.types';
import { userService } from '../services/userService';

interface UserStore {
  users: User[];
  userLevels: UserLevel[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filters
  filters: UserFilters;
  
  // Actions
  fetchUsers: (page?: number, limit?: number, filters?: UserFilters) => Promise<void>;
  fetchUserLevels: () => Promise<void>;
  getUserById: (id: string) => Promise<User | null>;
  createUser: (data: CreateUserRequest) => Promise<boolean>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  toggleUserStatus: (id: string) => Promise<boolean>;
  changePassword: (id: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  setFilters: (filters: UserFilters) => void;
  clearFilters: () => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  clearCurrentUser: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  userLevels: [],
  currentUser: null,
  isLoading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  
  // Filters
  filters: {},

  fetchUsers: async (page = 1, limit = 10, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUsers(page, limit, filters);
      
      if (response.success && response.data) {
        set({
          users: response.data.users,
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.total,
          itemsPerPage: response.data.pagination.limit,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch users', 
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
    }
  },

  fetchUserLevels: async () => {
    try {
      const response = await userService.getUserLevels();
      
      if (response.success && response.data) {
        set({ userLevels: response.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch user levels:', error);
    }
  },

  getUserById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUserById(id);
      if (response.success && response.data) {
        set({ currentUser: response.data, isLoading: false });
        return response.data;
      } else {
        set({ 
          error: response.message || 'User not found', 
          isLoading: false 
        });
        return null;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
      return null;
    }
  },

  createUser: async (data: CreateUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.createUser(data);
      if (response.success) {
        // Refresh users list
        await get().fetchUsers(get().currentPage, get().itemsPerPage, get().filters);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to create user', 
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
      return false;
    }
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.updateUser(id, data);
      if (response.success) {
        // Refresh users list
        await get().fetchUsers(get().currentPage, get().itemsPerPage, get().filters);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to update user', 
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
      return false;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        // Refresh users list
        await get().fetchUsers(get().currentPage, get().itemsPerPage, get().filters);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to delete user', 
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
      return false;
    }
  },

  toggleUserStatus: async (id: string) => {
    try {
      const response = await userService.toggleUserStatus(id);
      if (response.success) {
        // Update user in local state
        set(state => ({
          users: state.users.map(user => 
            user.id === id ? { ...user, is_active: !user.is_active } : user
          )
        }));
        return true;
      } else {
        set({ error: response.message || 'Failed to update user status' });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred'
      });
      return false;
    }
  },

  changePassword: async (id: string, currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.changePassword(id, currentPassword, newPassword);
      if (response.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to change password', 
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
      return false;
    }
  },

  setFilters: (filters: UserFilters) => {
    set({ filters, currentPage: 1 }); // Reset to first page when filtering
  },

  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  clearError: () => set({ error: null }),
  
  clearCurrentUser: () => set({ currentUser: null })
}));