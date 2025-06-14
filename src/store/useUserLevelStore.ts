// src/store/useUserLevelStore.ts
import { create } from 'zustand';
import { 
  UserLevel, 
  CreateUserLevelRequest, 
  UpdateUserLevelRequest, 
  UserLevelFilters,
  UserLevelStats,
  AvailableUserLevel,
  UserLevelUsageFilters,
  User
} from '../types/userLevel.types';
import { userLevelService } from '../services/userLevelService';

interface UserLevelStore {
  // State
  userLevels: UserLevel[];
  currentUserLevel: UserLevel | null;
  userLevelStats: UserLevelStats | null;
  availableUserLevels: AvailableUserLevel[];
  usageUsers: User[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Usage pagination
  usageCurrentPage: number;
  usageTotalPages: number;
  usageTotalItems: number;
  usageItemsPerPage: number;
  
  // Filters
  filters: UserLevelFilters;
  usageFilters: UserLevelUsageFilters;
  
  // Actions - Basic CRUD
  fetchUserLevels: (page?: number, limit?: number) => Promise<void>;
  getUserLevelById: (id: string, includeUsers?: boolean, includePermissions?: boolean) => Promise<UserLevel | null>;
  createUserLevel: (data: CreateUserLevelRequest) => Promise<boolean>;
  updateUserLevel: (id: string, data: UpdateUserLevelRequest) => Promise<boolean>;
  deleteUserLevel: (id: string) => Promise<boolean>;
  
  // Actions - Search & Filter
  searchUserLevels: (query: string) => Promise<UserLevel[]>;
  setFilters: (filters: UserLevelFilters) => void;
  clearFilters: () => void;
  
  // Actions - Statistics & Available
  fetchUserLevelStats: () => Promise<void>;
  fetchAvailableUserLevels: () => Promise<void>;
  
  // Actions - Usage
  fetchUserLevelUsage: (id: string, page?: number, limit?: number) => Promise<void>;
  setUsageFilters: (id: string, filters: UserLevelUsageFilters) => void;
  clearUsageFilters: () => void;
  
  // Actions - Utility
  setCurrentPage: (page: number) => void;
  setUsageCurrentPage: (page: number) => void;
  clearError: () => void;
  clearCurrentUserLevel: () => void;
  resetStore: () => void;
  
  // Validation methods
  validateUserLevelId: (id: string) => { isValid: boolean; error?: string };
  validateLevelName: (levelName: string) => { isValid: boolean; error?: string };
  validateDescription: (description?: string) => { isValid: boolean; error?: string };
  
  // Utility methods
  getUserLevelFromList: (id: string) => UserLevel | null;
  updateUserLevelInList: (id: string, updatedData: Partial<UserLevel>) => void;
  removeUserLevelFromList: (id: string) => void;
  addUserLevelToList: (userLevel: UserLevel) => void;
  isUserLevelInList: (id: string) => boolean;
}

export const useUserLevelStore = create<UserLevelStore>((set, get) => ({
  // Initial State
  userLevels: [],
  currentUserLevel: null,
  userLevelStats: null,
  availableUserLevels: [],
  usageUsers: [],
  isLoading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  
  // Usage pagination
  usageCurrentPage: 1,
  usageTotalPages: 1,
  usageTotalItems: 0,
  usageItemsPerPage: 10,
  
  // Filters
  filters: {},
  usageFilters: {},

  // === BASIC CRUD ACTIONS ===
  
  fetchUserLevels: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      console.log('Store - Fetching user levels with filters:', filters);
      
      const response = await userLevelService.getUserLevels(page, limit, filters);
      console.log('Store - Service response:', response);
      
      if (response.success && response.data) {
        console.log('Store - User levels data:', response.data.userLevels);
        console.log('Store - Pagination data:', response.data.pagination);
        
        set({
          userLevels: response.data.userLevels || [],
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.total,
          itemsPerPage: response.data.pagination.limit,
          isLoading: false
        });
      } else {
        console.error('Store - Invalid response structure:', response);
        set({ 
          error: response.message || 'Failed to fetch user levels', 
          isLoading: false 
        });
      }
    } catch (error: any) {
      console.error('Store - Fetch error:', error);
      console.error('Store - Error response:', error.response?.data);
      console.error('Store - Error status:', error.response?.status);
      
      let errorMessage = 'Network error occurred';
      
      if (error.response) {
        if (error.response.status === 204) {
          errorMessage = 'No content returned from server';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },

  getUserLevelById: async (id: string, includeUsers = false, includePermissions = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userLevelService.getUserLevelById(id, includeUsers, includePermissions);
      if (response.success && response.data) {
        set({ currentUserLevel: response.data, isLoading: false });
        return response.data;
      } else {
        set({ 
          error: response.message || 'User level not found', 
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

  createUserLevel: async (data: CreateUserLevelRequest) => {
    set({ isLoading: true, error: null });
    try {
      console.log('=== STORE CREATE USER LEVEL ===');
      console.log('Data received:', data);
      
      // Validate data
      const idValidation = get().validateUserLevelId(data.id);
      if (!idValidation.isValid) {
        set({ error: idValidation.error, isLoading: false });
        return false;
      }
      
      const nameValidation = get().validateLevelName(data.level_name);
      if (!nameValidation.isValid) {
        set({ error: nameValidation.error, isLoading: false });
        return false;
      }
      
      const descValidation = get().validateDescription(data.description);
      if (!descValidation.isValid) {
        set({ error: descValidation.error, isLoading: false });
        return false;
      }
      
      console.log('=== SENDING TO API ===');
      console.log('Final data being sent:', data);
      
      const response = await userLevelService.createUserLevel(data);
      
      if (response.success) {
        console.log('=== USER LEVEL CREATED SUCCESSFULLY ===');
        // Refresh user levels list
        await get().fetchUserLevels(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        console.error('=== USER LEVEL CREATION FAILED ===');
        set({ 
          error: response.message || 'Failed to create user level', 
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      console.error('=== STORE CREATE ERROR ===');
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
      return false;
    }
  },

  updateUserLevel: async (id: string, data: UpdateUserLevelRequest) => {
    set({ isLoading: true, error: null });
    try {
      console.log('=== STORE UPDATE USER LEVEL ===');
      console.log('User Level ID:', id);
      console.log('Data received:', data);
      
      // Validate data
      if (data.level_name) {
        const nameValidation = get().validateLevelName(data.level_name);
        if (!nameValidation.isValid) {
          set({ error: nameValidation.error, isLoading: false });
          return false;
        }
      }
      
      const descValidation = get().validateDescription(data.description);
      if (!descValidation.isValid) {
        set({ error: descValidation.error, isLoading: false });
        return false;
      }
      
      const response = await userLevelService.updateUserLevel(id, data);
      
      if (response.success) {
        console.log('=== USER LEVEL UPDATED SUCCESSFULLY ===');
        // Refresh user levels list
        await get().fetchUserLevels(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to update user level', 
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

  deleteUserLevel: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userLevelService.deleteUserLevel(id);
      if (response.success) {
        // Refresh user levels list
        await get().fetchUserLevels(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to delete user level', 
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

  // === SEARCH & FILTER ACTIONS ===

  searchUserLevels: async (query: string) => {
    set({ error: null });
    try {
      const response = await userLevelService.searchUserLevels(query);
      if (response.success && response.data) {
        return response.data;
      } else {
        set({ error: response.message || 'Search failed' });
        return [];
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Search error' });
      return [];
    }
  },

  setFilters: (filters: UserLevelFilters) => {
    set({ filters, currentPage: 1 });
    get().fetchUserLevels(1, get().itemsPerPage);
  },

  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
    get().fetchUserLevels(1, get().itemsPerPage);
  },

  // === STATISTICS & AVAILABLE ACTIONS ===

  fetchUserLevelStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userLevelService.getUserLevelStats();
      if (response.success && response.data) {
        set({ 
          userLevelStats: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch user level statistics', 
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

  fetchAvailableUserLevels: async () => {
    set({ error: null });
    try {
      const response = await userLevelService.getAvailableUserLevels();
      if (response.success && response.data) {
        set({ availableUserLevels: response.data });
      } else {
        set({ error: response.message || 'Failed to fetch available user levels' });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Network error occurred' });
    }
  },

  // === USAGE ACTIONS ===

  fetchUserLevelUsage: async (id: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const { usageFilters } = get();
      const response = await userLevelService.getUserLevelUsage(id, page, limit, usageFilters);
      
      if (response.success && response.data) {
        set({
          usageUsers: response.data.users || [],
          usageCurrentPage: response.data.pagination.page,
          usageTotalPages: response.data.pagination.totalPages,
          usageTotalItems: response.data.pagination.total,
          usageItemsPerPage: response.data.pagination.limit,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch user level usage', 
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

  setUsageFilters: (id: string, filters: UserLevelUsageFilters) => {
    set({ usageFilters: filters, usageCurrentPage: 1 });
    get().fetchUserLevelUsage(id, 1, get().usageItemsPerPage);
  },

  clearUsageFilters: () => {
    set({ usageFilters: {}, usageCurrentPage: 1 });
  },

  // === UTILITY ACTIONS ===

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchUserLevels(page, get().itemsPerPage);
  },

  setUsageCurrentPage: (page: number) => {
    set({ usageCurrentPage: page });
    // Note: You'll need to pass the user level ID when calling this
  },

  clearError: () => set({ error: null }),
  
  clearCurrentUserLevel: () => set({ currentUserLevel: null }),

  resetStore: () => set({
    userLevels: [],
    currentUserLevel: null,
    userLevelStats: null,
    availableUserLevels: [],
    usageUsers: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    usageCurrentPage: 1,
    usageTotalPages: 1,
    usageTotalItems: 0,
    usageItemsPerPage: 10,
    filters: {},
    usageFilters: {},
  }),

  // === VALIDATION METHODS ===

  validateUserLevelId: (id: string) => {
    return userLevelService.validateUserLevelId(id);
  },

  validateLevelName: (levelName: string) => {
    return userLevelService.validateLevelName(levelName);
  },

  validateDescription: (description?: string) => {
    return userLevelService.validateDescription(description);
  },

  // === UTILITY METHODS ===

  getUserLevelFromList: (id: string) => {
    const { userLevels } = get();
    return userLevels.find(ul => ul.id === id) || null;
  },

  updateUserLevelInList: (id: string, updatedData: Partial<UserLevel>) => {
    const { userLevels } = get();
    const updatedUserLevels = userLevels.map(userLevel => 
      userLevel.id === id 
        ? { ...userLevel, ...updatedData }
        : userLevel
    );
    set({ userLevels: updatedUserLevels });
  },

  removeUserLevelFromList: (id: string) => {
    const { userLevels } = get();
    const filteredUserLevels = userLevels.filter(ul => ul.id !== id);
    set({ userLevels: filteredUserLevels });
  },

  addUserLevelToList: (userLevel: UserLevel) => {
    const { userLevels } = get();
    set({ userLevels: [userLevel, ...userLevels] });
  },

  isUserLevelInList: (id: string) => {
    const { userLevels } = get();
    return userLevels.some(ul => ul.id === id);
  },
}));