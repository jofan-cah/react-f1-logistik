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
  
  // NEW: Image upload state
  isUploadingImage: boolean;
  uploadProgress: number;
  
  // Actions
  fetchProducts: (page?: number, limit?: number) => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
  createProduct: (data: CreateProductRequest, imageFile?: File) => Promise<boolean>;
  updateProduct: (id: string, data: UpdateProductRequest, imageFile?: File) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  clearCurrentProduct: () => void;
  
  // NEW: Image actions
  uploadProductImage: (file: File) => Promise<string | null>;
  deleteProductImage: (filename: string) => Promise<boolean>;
  setUploadProgress: (progress: number) => void;
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
  
  // NEW: Image upload state
  isUploadingImage: false,
  uploadProgress: 0,

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

  // UPDATED: Create product with image handling
  createProduct: async (data: CreateProductRequest, imageFile?: File) => {
    set({ isLoading: true, error: null });
    try {
      console.log('=== STORE CREATE PRODUCT ===');
      console.log('Data received:', data);
      console.log('Image file received:', imageFile);
      
      let finalData = { ...data };
      
      // Upload image first if provided
      if (imageFile) {
        console.log('=== UPLOADING IMAGE FILE ===');
        console.log('Image file details:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
        
        const filename = await get().uploadProductImage(imageFile);
        if (filename) {
          finalData.img_product = filename;
          console.log('=== IMAGE UPLOAD SUCCESS ===');
          console.log('Filename from upload:', filename);
        } else {
          console.error('=== IMAGE UPLOAD FAILED ===');
          set({ error: 'Failed to upload image' });
          // You can choose to continue without image or stop here
          // For now, let's continue without image
        }
      } else {
        console.log('=== NO IMAGE FILE PROVIDED ===');
      }
      
      console.log('=== SENDING TO API ===');
      console.log('Final data being sent:', finalData);
      
      const response = await productService.createProduct(finalData);
      
      if (response.success) {
        console.log('=== PRODUCT CREATED SUCCESSFULLY ===');
        // Refresh products list
        await get().fetchProducts(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        console.error('=== PRODUCT CREATION FAILED ===');
        console.error('API Response:', response);
        set({ 
          error: response.message || 'Failed to create product', 
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      console.error('=== STORE CREATE ERROR ===');
      console.error('Error details:', error);
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isLoading: false 
      });
      return false;
    }
  },

  // UPDATED: Update product with image handling
  updateProduct: async (id: string, data: UpdateProductRequest, imageFile?: File) => {
    set({ isLoading: true, error: null });
    try {
      console.log('=== STORE UPDATE PRODUCT ===');
      console.log('Product ID:', id);
      console.log('Data received:', data);
      console.log('Image file received:', imageFile);
      
      let finalData = { ...data };
      
      // Upload new image if provided
      if (imageFile) {
        console.log('=== UPLOADING NEW IMAGE FILE ===');
        console.log('Image file details:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
        
        const filename = await get().uploadProductImage(imageFile);
        if (filename) {
          finalData.img_product = filename;
          console.log('=== NEW IMAGE UPLOAD SUCCESS ===');
          console.log('Filename from upload:', filename);
        } else {
          console.error('=== NEW IMAGE UPLOAD FAILED ===');
          // Continue with existing image
        }
      } else {
        console.log('=== NO NEW IMAGE FILE PROVIDED ===');
      }
      
      console.log('=== SENDING UPDATE TO API ===');
      console.log('Final update data:', finalData);
      
      const response = await productService.updateProduct(id, finalData);
      
      if (response.success) {
        console.log('=== PRODUCT UPDATED SUCCESSFULLY ===');
        // Refresh products list
        await get().fetchProducts(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        console.error('=== PRODUCT UPDATE FAILED ===');
        console.error('API Response:', response);
        set({ 
          error: response.message || 'Failed to update product', 
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      console.error('=== STORE UPDATE ERROR ===');
      console.error('Error details:', error);
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

  // NEW: Upload product image - FIXED VERSION
  uploadProductImage: async (file: File) => {
    set({ isUploadingImage: true, uploadProgress: 0, error: null });
    try {
      console.log('=== STORE UPLOAD IMAGE ===');
      console.log('File to upload:', file);
      
      // Validate file first
      const validation = productService.validateImageFile(file);
      if (!validation.isValid) {
        console.error('=== FILE VALIDATION FAILED ===');
        console.error('Validation error:', validation.error);
        set({ 
          error: validation.error || 'Invalid file', 
          isUploadingImage: false 
        });
        return null;
      }

      console.log('=== CALLING SERVICE UPLOAD ===');
      const response = await productService.uploadProductImage(file);
      console.log('=== SERVICE UPLOAD RESPONSE ===');
      console.log('Response:', response);
      
      if (response.success && response.data && response.data.filename) {
        console.log('=== UPLOAD SUCCESS ===');
        console.log('Filename from response:', response.data.filename);
        set({ 
          isUploadingImage: false, 
          uploadProgress: 100 
        });
        return response.data.filename; // FIXED: Return filename dari response.data
      } else {
        console.error('=== UPLOAD RESPONSE ERROR ===');
        console.error('Response:', response);
        set({ 
          error: response.message || 'Failed to upload image', 
          isUploadingImage: false 
        });
        return null;
      }
    } catch (error: any) {
      console.error('=== UPLOAD EXCEPTION ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      set({ 
        error: error.response?.data?.message || 'Upload failed', 
        isUploadingImage: false 
      });
      return null;
    }
  },

  // NEW: Delete product image
  deleteProductImage: async (filename: string) => {
    set({ error: null });
    try {
      const response = await productService.deleteProductImage(filename);
      if (response.success) {
        return true;
      } else {
        set({ error: response.message || 'Failed to delete image' });
        return false;
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Delete failed' });
      return false;
    }
  },

  // NEW: Set upload progress
  setUploadProgress: (progress: number) => {
    set({ uploadProgress: progress });
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