// src/store/useCategoryStore.ts
import { create } from 'zustand';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CategoryFilters,
  PaginationInfo,
  CategoryStats,
  UpdateStockRequest,
  StockAdjustment,
  BulkAdjustmentResponse
} from '../types/category.types';
import { categoryService } from '../services/categoryService';

interface CategoryStore {
  // State
  categories: Category[];
  currentCategory: Category | null;
  categoriesWithStock: Category[];
  lowStockCategories: Category[];
  categoryStats: CategoryStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  pagination: PaginationInfo | null;
  
  // Filters
  filters: CategoryFilters;
  
  // Actions - Basic CRUD
  fetchCategories: (filters?: CategoryFilters) => Promise<void>;
  getCategoryById: (id: number) => Promise<Category | null>;
  createCategory: (data: CreateCategoryRequest) => Promise<boolean>;
  updateCategory: (id: number, data: UpdateCategoryRequest) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
  
  // Actions - Stock Management
  fetchCategoriesWithStock: () => Promise<void>;
  fetchLowStockCategories: () => Promise<void>;
  updateCategoryStock: (id: number, data: UpdateStockRequest) => Promise<boolean>;
  bulkStockAdjustment: (adjustments: StockAdjustment[]) => Promise<BulkAdjustmentResponse | null>;
  
  // Actions - Stats & Analytics
  fetchCategoryStats: () => Promise<void>;
  
  // Actions - Filters & Utilities
  setFilters: (filters: CategoryFilters) => void;
  clearFilters: () => void;
  setPagination: (page: number, limit?: number) => void;
  clearError: () => void;
  clearCurrentCategory: () => void;
  reset: () => void;
}

const initialState = {
  categories: [],
  currentCategory: null,
  categoriesWithStock: [],
  lowStockCategories: [],
  categoryStats: null,
  isLoading: false,
  error: null,
  pagination: null,
  filters: { page: 1, limit: 10 }
};

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  ...initialState,

  // Basic CRUD Operations
  fetchCategories: async (filters?: CategoryFilters) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = filters || get().filters;
      const response = await categoryService.getCategories(currentFilters);
      
      if (response.success && response.data) {
        set({
          categories: response.data,
          pagination: response.pagination,
          filters: currentFilters,
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
        // Refresh categories list and current category if it's the one being updated
        await get().fetchCategories();
        if (get().currentCategory?.id === id) {
          await get().getCategoryById(id);
        }
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
        // Refresh categories list and clear current category if it was deleted
        await get().fetchCategories();
        if (get().currentCategory?.id === id) {
          set({ currentCategory: null });
        }
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

  // Stock Management Operations
  fetchCategoriesWithStock: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.getCategoriesWithStock();
      if (response.success && response.data) {
        set({
          categoriesWithStock: response.data,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch categories with stock', 
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

  fetchLowStockCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.getLowStockCategories();
      if (response.success && response.data) {
        set({
          lowStockCategories: response.data,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch low stock categories', 
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

  updateCategoryStock: async (id: number, data: UpdateStockRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.updateCategoryStock(id, data);
      if (response.success) {
        // Refresh related data
        await Promise.all([
          get().fetchCategories(),
          get().fetchCategoriesWithStock(),
          get().fetchLowStockCategories(),
          get().fetchCategoryStats()
        ]);
        
        // Update current category if it's the one being updated
        if (get().currentCategory?.id === id) {
          await get().getCategoryById(id);
        }
        
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to update category stock', 
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

  bulkStockAdjustment: async (adjustments: StockAdjustment[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.bulkStockAdjustment(adjustments);
      if (response.success && response.data) {
        // Refresh all stock-related data
        await Promise.all([
          get().fetchCategories(),
          get().fetchCategoriesWithStock(),
          get().fetchLowStockCategories(),
          get().fetchCategoryStats()
        ]);
        
        set({ isLoading: false });
        return response.data;
      } else {
        set({ 
          error: response.message || 'Failed to perform bulk stock adjustment', 
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

  // Stats & Analytics
  fetchCategoryStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.getCategoryStats();
      if (response.success && response.data) {
        set({
          categoryStats: response.data,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch category statistics', 
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

  // Filters & Utilities
  setFilters: (filters: CategoryFilters) => {
    const newFilters = { ...get().filters, ...filters };
    set({ filters: newFilters });
  },

  clearFilters: () => {
    set({ filters: { page: 1, limit: 10 } });
  },

  setPagination: (page: number, limit?: number) => {
    const currentFilters = get().filters;
    const newFilters = { 
      ...currentFilters, 
      page, 
      ...(limit && { limit }) 
    };
    set({ filters: newFilters });
  },

  clearError: () => set({ error: null }),
  
  clearCurrentCategory: () => set({ currentCategory: null }),

  reset: () => set(initialState)
}));