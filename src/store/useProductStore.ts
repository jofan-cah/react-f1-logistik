// src/store/useProductStore.ts
import { create } from 'zustand';
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../types/product.types';
import { productService } from '../services/productService';

interface ProductStore {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filters
  filters: ProductFilters;
  
  // Actions
  fetchProducts: (page?: number, limit?: number) => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
  createProduct: (data: CreateProductRequest) => Promise<boolean>;
  updateProduct: (id: string, data: UpdateProductRequest) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  clearCurrentProduct: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  
  // Filters
  filters: {},

  fetchProducts: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response = await productService.getProducts(page, limit, filters);
      console.log(response.data)
      console.log(response)
      
      if (response.success && response.data) {
        set({
          products: response.data.products,
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.total,
          itemsPerPage: response.data.pagination.limit,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch products', 
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

  getProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getProductById(id);
      if (response.success && response.data) {
        set({ currentProduct: response.data, isLoading: false });
        return response.data;
      } else {
        set({ 
          error: response.message || 'Product not found', 
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

  createProduct: async (data: CreateProductRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.createProduct(data);
      if (response.success) {
        // Refresh products list
        await get().fetchProducts(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to create product', 
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

  updateProduct: async (id: string, data: UpdateProductRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.updateProduct(id, data);
      if (response.success) {
        // Refresh products list
        await get().fetchProducts(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to update product', 
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

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        // Refresh products list
        await get().fetchProducts(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to delete product', 
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

  setFilters: (filters: ProductFilters) => {
    set({ filters, currentPage: 1 }); // Reset to first page when filtering
    get().fetchProducts(1, get().itemsPerPage);
  },

  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
    get().fetchProducts(1, get().itemsPerPage);
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchProducts(page, get().itemsPerPage);
  },

  clearError: () => set({ error: null }),
  
  clearCurrentProduct: () => set({ currentProduct: null })
}));