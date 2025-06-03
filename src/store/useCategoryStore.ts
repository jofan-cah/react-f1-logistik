// src/store/useCategoryStore.ts
import { create } from 'zustand';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryFilters } from '../types/category.types';
import { categoryService } from '../services/categoryService';

interface CategoryStore {
  categories: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: CategoryFilters;
  
  // Actions
  fetchCategories: () => Promise<void>;
  getCategoryById: (id: number) => Promise<Category | null>;
  createCategory: (data: CreateCategoryRequest) => Promise<boolean>;
  updateCategory: (id: number, data: UpdateCategoryRequest) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
  setFilters: (filters: CategoryFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearCurrentCategory: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,
  
  // Filters
  filters: {},

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.getCategories();
      
      if (response.success && response.data) {
        set({
          categories: response.data,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch categories', 
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

  getCategoryById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.getCategoryById(id);
      if (response.success && response.data) {
        set({ currentCategory: response.data, isLoading: false });
        return response.data;
      } else {
        set({ 
          error: response.message || 'Category not found', 
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

  createCategory: async (data: CreateCategoryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.createCategory(data);
      if (response.success) {
        // Refresh categories list
        await get().fetchCategories();
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to create category', 
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

  updateCategory: async (id: number, data: UpdateCategoryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.updateCategory(id, data);
      if (response.success) {
        // Refresh categories list
        await get().fetchCategories();
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to update category', 
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

  deleteCategory: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.deleteCategory(id);
      if (response.success) {
        // Refresh categories list
        await get().fetchCategories();
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to delete category', 
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

  setFilters: (filters: CategoryFilters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearError: () => set({ error: null }),
  
  clearCurrentCategory: () => set({ currentCategory: null })
}));