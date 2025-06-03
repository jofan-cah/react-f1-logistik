// src/store/useUserLevelStore.ts
import { create } from 'zustand';
import { UserLevel, CreateUserLevelRequest, UpdateUserLevelRequest } from '../types/userLevel.types';
import { userLevelService } from '../services/userLevelService';

interface UserLevelStore {
  // State
  userLevels: UserLevel[];
  currentUserLevel: UserLevel | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUserLevels: () => Promise<void>;
  getUserLevelById: (id: string) => Promise<void>;
  createUserLevel: (data: CreateUserLevelRequest) => Promise<boolean>;
  updateUserLevel: (id: string, data: UpdateUserLevelRequest) => Promise<boolean>;
  deleteUserLevel: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearCurrentUserLevel: () => void;
}

export const useUserLevelStore = create<UserLevelStore>((set, get) => ({
  // Initial state
  userLevels: [],
  currentUserLevel: null,
  isLoading: false,
  error: null,

  // Fetch all user levels
  fetchUserLevels: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userLevelService.getUserLevels();
      if (response.success && response.data) {
        set({ userLevels: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to fetch user levels', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
    }
  },

  // Get user level by ID
  getUserLevelById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userLevelService.getUserLevelById(id);
      if (response.success && response.data) {
        set({ currentUserLevel: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'User level not found', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
    }
  },

  // Create new user level
  createUserLevel: async (data: CreateUserLevelRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userLevelService.createUserLevel(data);
      if (response.success) {
        // Refresh the list
        await get().fetchUserLevels();
        set({ isLoading: false });
        return true;
      } else {
        set({ error: response.message || 'Failed to create user level', isLoading: false });
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

  // Update user level
  updateUserLevel: async (id: string, data: UpdateUserLevelRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userLevelService.updateUserLevel(id, data);
      if (response.success) {
        // Refresh the list and current user level
        await get().fetchUserLevels();
        if (response.data) {
          set({ currentUserLevel: response.data });
        }
        set({ isLoading: false });
        return true;
      } else {
        set({ error: response.message || 'Failed to update user level', isLoading: false });
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

  // Delete user level
  deleteUserLevel: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userLevelService.deleteUserLevel(id);
      if (response.success) {
        // Refresh the list
        await get().fetchUserLevels();
        // Clear current if it was deleted
        if (get().currentUserLevel?.id === id) {
          set({ currentUserLevel: null });
        }
        set({ isLoading: false });
        return true;
      } else {
        set({ error: response.message || 'Failed to delete user level', isLoading: false });
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

  // Clear error
  clearError: () => set({ error: null }),
  
  // Clear current user level
  clearCurrentUserLevel: () => set({ currentUserLevel: null })
}));