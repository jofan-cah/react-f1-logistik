// src/store/useUserStore.ts
import { create } from 'zustand';
import { 
  User, 
  UserLevelInfo, 
  CreateUserRequest, 
  UpdateUserRequest, 
  ResetPasswordRequest,
  BulkUpdateRequest,
  UserFilters, 
  UserQueryParams,
  UserStats,
  DepartmentStats 
} from '../types/user.types';
import { userService } from '../services/userService';

interface UserStore {
  // Data
  users: User[];
  userLevels: UserLevelInfo[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filters and Selection
  filters: UserFilters;
  selectedUsers: string[];
  
  // Stats
  stats: UserStats | null;
  departmentStats: DepartmentStats | null;
  
  // Legacy Actions (keeping for backward compatibility)
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
  
  // New Actions (matching new backend API)
  fetchUsersNew: (params?: UserQueryParams) => Promise<void>;
  resetUserPassword: (id: string, passwordData: ResetPasswordRequest) => Promise<boolean>;
  bulkUpdateUsers: (bulkData: BulkUpdateRequest) => Promise<boolean>;
  fetchUserStats: () => Promise<void>;
  fetchDepartmentStats: () => Promise<void>;
  
  // Selection Actions
  selectUser: (userId: string) => void;
  unselectUser: (userId: string) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;
  
  // Bulk Actions
  bulkActivateUsers: (userIds: string[]) => Promise<boolean>;
  bulkDeactivateUsers: (userIds: string[]) => Promise<boolean>;
  bulkChangeUserLevel: (userIds: string[], userLevel: string) => Promise<boolean>;
  bulkChangeDepartment: (userIds: string[], department: string) => Promise<boolean>;
  
  // Utility Actions
  refreshUsers: () => Promise<void>;
  searchUsers: (searchTerm: string) => Promise<void>;
}

const initialFilters: UserFilters = {
  search: '',
  user_level_id: undefined,
  department: undefined,
  is_active: undefined,
};

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial State
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
  
  // Filters and Selection
  filters: initialFilters,
  selectedUsers: [],
  
  // Stats
  stats: null,
  departmentStats: null,

  // Legacy Actions (keeping for backward compatibility)
  fetchUsers: async (page = 1, limit = 10, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUsersLegacy(page, limit, filters);
      
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
        error: error.response?.data?.message || error.message || 'Network error occurred', 
        isLoading: false 
      });
    }
  },

  // New fetch method using new backend API
  fetchUsersNew: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const currentState = get();
      const queryParams = params || {
        ...currentState.filters,
        page: currentState.currentPage,
        limit: currentState.itemsPerPage,
      };

      const response = await userService.getUsers(queryParams);
      
      set({
        users: response.data,
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
        itemsPerPage: response.pagination.limit,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch users',
        isLoading: false,
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
      const user = await userService.getUserById(id);
      set({ currentUser: user, isLoading: false });
      return user;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Network error occurred', 
        isLoading: false 
      });
      return null;
    }
  },

  createUser: async (data: CreateUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      await userService.createUser(data);
      
      // Refresh users list
      await get().fetchUsers(get().currentPage, get().itemsPerPage, get().filters);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Network error occurred', 
        isLoading: false 
      });
      return false;
    }
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateUser(id, data);
      
      // Update in current list
      const currentUsers = get().users;
      const updatedUsers = currentUsers.map(user => 
        user.id === id ? updatedUser : user
      );
      
      set({ 
        users: updatedUsers,
        currentUser: get().currentUser?.id === id ? updatedUser : get().currentUser,
        isLoading: false 
      });
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Network error occurred', 
        isLoading: false 
      });
      return false;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Store - Attempting to delete user:', id);
      
      await userService.deleteUser(id);
      console.log('Store - User deleted successfully');
      
      // Remove from current list and update counts
      const currentState = get();
      const filteredUsers = currentState.users.filter(user => user.id !== id);
      const newTotal = currentState.totalItems - 1;
      const newTotalPages = Math.ceil(newTotal / currentState.itemsPerPage);
      
      // If current page becomes empty and it's not the first page, go to previous page
      let newCurrentPage = currentState.currentPage;
      if (filteredUsers.length === 0 && currentState.currentPage > 1) {
        newCurrentPage = currentState.currentPage - 1;
      }
      
      set({ 
        users: filteredUsers,
        selectedUsers: currentState.selectedUsers.filter(selectedId => selectedId !== id),
        totalItems: newTotal,
        totalPages: newTotalPages,
        currentPage: newCurrentPage,
        isLoading: false 
      });
      
      // If we moved to a different page or the list is empty, refresh
      if (newCurrentPage !== currentState.currentPage || filteredUsers.length === 0) {
        await get().fetchUsers(newCurrentPage, currentState.itemsPerPage, currentState.filters);
      }
      
      return true;
    } catch (error: any) {
      console.error('Store - Error deleting user:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to delete user. Please try again.';
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return false;
    }
  },

  toggleUserStatus: async (id: string) => {
    try {
      const updatedUser = await userService.toggleUserStatus(id);
      
      // Update user in local state
      const currentUsers = get().users;
      const updatedUsers = currentUsers.map(user => 
        user.id === id ? updatedUser : user
      );
      
      set({ 
        users: updatedUsers,
        currentUser: get().currentUser?.id === id ? updatedUser : get().currentUser,
      });
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Network error occurred'
      });
      return false;
    }
  },

  changePassword: async (id: string, currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      await userService.changePassword(id, currentPassword, newPassword);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Network error occurred', 
        isLoading: false 
      });
      return false;
    }
  },

  // New Actions
  resetUserPassword: async (id: string, passwordData: ResetPasswordRequest) => {
    set({ isLoading: true, error: null });
    try {
      await userService.resetUserPassword(id, passwordData);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to reset password',
        isLoading: false,
      });
      return false;
    }
  },

  bulkUpdateUsers: async (bulkData: BulkUpdateRequest) => {
    set({ isLoading: true, error: null });
    try {
      await userService.bulkUpdateUsers(bulkData);
      set({ selectedUsers: [], isLoading: false });
      
      // Refresh the list
      await get().fetchUsers(get().currentPage, get().itemsPerPage, get().filters);
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to bulk update users',
        isLoading: false,
      });
      return false;
    }
  },

  fetchUserStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await userService.getUserStats();
      set({ stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch user statistics',
        isLoading: false,
      });
    }
  },

  fetchDepartmentStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const departmentStats = await userService.getUsersByDepartment();
      set({ departmentStats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch department statistics',
        isLoading: false,
      });
    }
  },

  // Selection Actions
  selectUser: (userId: string) => {
    const selectedUsers = get().selectedUsers;
    if (!selectedUsers.includes(userId)) {
      set({ selectedUsers: [...selectedUsers, userId] });
    }
  },

  unselectUser: (userId: string) => {
    set({ 
      selectedUsers: get().selectedUsers.filter(id => id !== userId) 
    });
  },

  selectAllUsers: () => {
    const allUserIds = get().users.map(user => user.id);
    set({ selectedUsers: allUserIds });
  },

  clearSelection: () => {
    set({ selectedUsers: [] });
  },

  // Bulk Actions
  bulkActivateUsers: async (userIds: string[]) => {
    return get().bulkUpdateUsers({
      userIds,
      updates: { is_active: true }
    });
  },

  bulkDeactivateUsers: async (userIds: string[]) => {
    return get().bulkUpdateUsers({
      userIds,
      updates: { is_active: false }
    });
  },

  bulkChangeUserLevel: async (userIds: string[], userLevel: string) => {
    return get().bulkUpdateUsers({
      userIds,
      updates: { user_level_id: userLevel as any }
    });
  },

  bulkChangeDepartment: async (userIds: string[], department: string) => {
    return get().bulkUpdateUsers({
      userIds,
      updates: { department }
    });
  },

  // Filter and Pagination Actions
  setFilters: (filters: UserFilters) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...filters };
    
    set({ 
      filters: updatedFilters,
      currentPage: 1 // Reset to first page when filtering
    });
    
    // Auto-fetch with new filters (using legacy method for compatibility)
    get().fetchUsers(1, get().itemsPerPage, updatedFilters);
  },

  clearFilters: () => {
    set({ 
      filters: initialFilters,
      currentPage: 1
    });
    get().fetchUsers(1, get().itemsPerPage, {});
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchUsers(page, get().itemsPerPage, get().filters);
  },

  // Utility Actions
  refreshUsers: async () => {
    await get().fetchUsers(get().currentPage, get().itemsPerPage, get().filters);
  },

  searchUsers: async (searchTerm: string) => {
    get().setFilters({ search: searchTerm });
  },

  // State Management
  clearError: () => set({ error: null }),
  
  clearCurrentUser: () => set({ currentUser: null }),
}));