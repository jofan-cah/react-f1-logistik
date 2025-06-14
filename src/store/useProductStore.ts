// src/store/useProductStore.ts
import { create } from 'zustand';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest, 
  UpdateStatusRequest,
  ProductFilters, 
  ProductStats,
  PrintProductData,
  CreateBreakdownRequest,
  BreakdownHistory
} from '../types/product.types';
import { productService } from '../services/productService';

interface ProductStore {
  // State
  products: Product[];
  currentProduct: Product | null;
  productStats: ProductStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filters
  filters: ProductFilters;
  
  // Image upload state
  isUploadingImage: boolean;
  uploadProgress: number;
  
  // Print state
  printData: PrintProductData[];
  
  // Breakdown state
  breakdownHistory: BreakdownHistory | null;
  
  // Actions - Basic CRUD
  fetchProducts: (page?: number, limit?: number) => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
  createProduct: (data: CreateProductRequest, imageFile?: File) => Promise<boolean>;
  updateProduct: (id: string, data: UpdateProductRequest, imageFile?: File) => Promise<boolean>;
  updateProductStatus: (id: string, status: string, notes?: string) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // Actions - Search & Filter
  searchProducts: (query?: string, filters?: any) => Promise<Product[]>;
  getProductsByCategory: (categoryId: number, page?: number, limit?: number) => Promise<void>;
  getProductsByLocation: (location: string, page?: number, limit?: number) => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  
  // Actions - Image handling
  uploadProductImage: (file: File) => Promise<string | null>;
  deleteProductImage: (filename: string) => Promise<boolean>;
  setUploadProgress: (progress: number) => void;
  
  // Actions - Statistics
  fetchProductStats: () => Promise<void>;
  
  // Actions - QR Code
  generateQRCode: (id: string) => Promise<any>;
  
  // Actions - Print
  getProductsForPrint: (productIds: string[]) => Promise<void>;
  
  // Actions - Breakdown
  createBreakdownTransaction: (data: CreateBreakdownRequest) => Promise<boolean>;
  getProductBreakdownHistory: (id: string) => Promise<void>;
  
  // Actions - Utility
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  clearCurrentProduct: () => void;
  clearPrintData: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  // Initial State
  products: [],
  currentProduct: null,
  productStats: null,
  isLoading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  
  // Filters
  filters: {},
  
  // Image upload state
  isUploadingImage: false,
  uploadProgress: 0,
  
  // Print state
  printData: [],
  
  // Breakdown state
  breakdownHistory: null,

  // === BASIC CRUD ACTIONS ===
  
  fetchProducts: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      console.log('Store - Fetching products with filters:', filters);
      
      const response = await productService.getProducts(page, limit, filters);
      console.log('Store - Service response:', response);
      
      if (response.success && response.data) {
        console.log('Store - Products data:', response.data.products);
        console.log('Store - Pagination data:', response.data.pagination);
        
        set({
          products: response.data.products || [],
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.total,
          itemsPerPage: response.data.pagination.limit,
          isLoading: false
        });
      } else {
        console.error('Store - Invalid response structure:', response);
        set({ 
          error: response.message || 'Failed to fetch products', 
          isLoading: false 
        });
      }
    } catch (error: any) {
      console.error('Store - Fetch error:', error);
      console.error('Store - Error response:', error.response?.data);
      console.error('Store - Error status:', error.response?.status);
      
      let errorMessage = 'Network error occurred';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 204) {
          errorMessage = 'No content returned from server';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server';
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      set({ 
        error: errorMessage,
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
        const filename = await get().uploadProductImage(imageFile);
        if (filename) {
          finalData.img_product = filename;
          console.log('=== IMAGE UPLOAD SUCCESS ===');
          console.log('Filename from upload:', filename);
        } else {
          console.error('=== IMAGE UPLOAD FAILED ===');
          // Continue without image
        }
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
        set({ 
          error: response.message || 'Failed to create product', 
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
        const filename = await get().uploadProductImage(imageFile);
        if (filename) {
          finalData.img_product = filename;
          console.log('=== NEW IMAGE UPLOAD SUCCESS ===');
        }
      }
      
      const response = await productService.updateProduct(id, finalData);
      
      if (response.success) {
        console.log('=== PRODUCT UPDATED SUCCESSFULLY ===');
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

  updateProductStatus: async (id: string, status: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.updateProductStatus(id, { status: status as any, notes });
      
      if (response.success) {
        // Refresh products list
        await get().fetchProducts(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to update product status', 
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

  // === SEARCH & FILTER ACTIONS ===

  searchProducts: async (query?: string, filters: any = {}) => {
    set({ error: null });
    try {
      const response = await productService.searchProducts(query, filters);
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

  getProductsByCategory: async (categoryId: number, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getProductsByCategory(categoryId, page, limit);
      
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
          error: response.message || 'Failed to fetch products by category', 
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

  getProductsByLocation: async (location: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getProductsByLocation(location, page, limit);
      
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
          error: response.message || 'Failed to fetch products by location', 
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

  setFilters: (filters: ProductFilters) => {
    set({ filters, currentPage: 1 });
    get().fetchProducts(1, get().itemsPerPage);
  },

  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
    get().fetchProducts(1, get().itemsPerPage);
  },

  // === IMAGE ACTIONS ===

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
        return response.data.filename;
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

  setUploadProgress: (progress: number) => {
    set({ uploadProgress: progress });
  },

  // === STATISTICS ACTIONS ===

  fetchProductStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getProductStats();
      if (response.success && response.data) {
        set({ 
          productStats: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch product statistics', 
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

  // === QR CODE ACTIONS ===

  generateQRCode: async (id: string) => {
    set({ error: null });
    try {
      const response = await productService.generateQRCode(id);
      if (response.success) {
        // Optionally refresh the current product to get updated QR data
        if (get().currentProduct?.product_id === id) {
          await get().getProductById(id);
        }
        return response.data;
      } else {
        set({ error: response.message || 'Failed to generate QR code' });
        return null;
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'QR generation failed' });
      return null;
    }
  },

  // === PRINT ACTIONS ===

  getProductsForPrint: async (productIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getProductsForPrint(productIds);
      if (response.success && response.data) {
        set({ 
          printData: response.data.products,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to get products for print', 
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

  // === BREAKDOWN ACTIONS ===

  createBreakdownTransaction: async (data: CreateBreakdownRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.createBreakdownTransaction(data);
      if (response.success) {
        // Refresh products list to show updated status
        await get().fetchProducts(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to create breakdown transaction', 
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

  getProductBreakdownHistory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getProductBreakdownHistory(id);
      if (response.success && response.data) {
        set({ 
          breakdownHistory: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to get breakdown history', 
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

  // === UTILITY ACTIONS ===

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchProducts(page, get().itemsPerPage);
  },

  clearError: () => set({ error: null }),
  
  clearCurrentProduct: () => set({ currentProduct: null }),

  clearPrintData: () => set({ printData: [] }),

  // === ADDITIONAL UTILITY METHODS ===

  // Reset all state to initial values
  resetStore: () => set({
    products: [],
    currentProduct: null,
    productStats: null,
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    filters: {},
    isUploadingImage: false,
    uploadProgress: 0,
    printData: [],
    breakdownHistory: null,
  }),

  // Get product by ID from current products list (without API call)
  getProductFromList: (productId: string) => {
    const { products } = get();
    return products.find(p => p.product_id === productId) || null;
  },

  // Update specific product in the list
  updateProductInList: (productId: string, updatedData: Partial<Product>) => {
    const { products } = get();
    const updatedProducts = products.map(product => 
      product.product_id === productId 
        ? { ...product, ...updatedData }
        : product
    );
    set({ products: updatedProducts });
  },

  // Remove product from list
  removeProductFromList: (productId: string) => {
    const { products } = get();
    const filteredProducts = products.filter(p => p.product_id !== productId);
    set({ products: filteredProducts });
  },

  // Add product to list
  addProductToList: (product: Product) => {
    const { products } = get();
    set({ products: [product, ...products] });
  },

  // Check if product exists in current list
  isProductInList: (productId: string) => {
    const { products } = get();
    return products.some(p => p.product_id === productId);
  },

  // Get filtered products count
  getFilteredProductsCount: () => {
    const { products, filters } = get();
    if (!filters || Object.keys(filters).length === 0) {
      return products.length;
    }

    return products.filter(product => {
      let matches = true;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        matches = matches && (
          product.product_id.toLowerCase().includes(searchLower) ||
          product.name?.toLowerCase().includes(searchLower) || // ADDED: Search by name
          product.brand?.toLowerCase().includes(searchLower) ||
          product.model?.toLowerCase().includes(searchLower) ||
          product.serial_number?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.status) {
        matches = matches && product.status === filters.status;
      }
      
      if (filters.condition) {
        matches = matches && product.condition === filters.condition;
      }
      
      if (filters.category_id) {
        matches = matches && product.category_id === filters.category_id;
      }
      
      if (filters.supplier_id) {
        matches = matches && product.supplier_id === filters.supplier_id;
      }
      
      if (filters.location) {
        matches = matches && product.location?.toLowerCase().includes(filters.location.toLowerCase());
      }
      
      if (filters.has_image !== undefined) {
        matches = matches && (filters.has_image ? !!product.img_product : !product.img_product);
      }
      
      return matches;
    }).length;
  },

  // Bulk update products status
  bulkUpdateProductsStatus: async (productIds: string[], status: string, notes?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatePromises = productIds.map(id => 
        productService.updateProductStatus(id, { status: status as any, notes })
      );
      
      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter(result => !result.success);
      
      if (failedUpdates.length === 0) {
        // All updates successful - refresh products
        await get().fetchProducts(get().currentPage, get().itemsPerPage);
        set({ isLoading: false });
        return { success: true, message: `${productIds.length} products updated successfully` };
      } else {
        set({ 
          error: `${failedUpdates.length} products failed to update`, 
          isLoading: false 
        });
        return { success: false, message: `${failedUpdates.length} products failed to update` };
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Bulk update failed', 
        isLoading: false 
      });
      return { success: false, message: 'Bulk update failed' };
    }
  },

  // Get products by status from current list
  getProductsByStatus: (status: string) => {
    const { products } = get();
    return products.filter(p => p.status === status);
  },

  // Get products by condition from current list
  getProductsByCondition: (condition: string) => {
    const { products } = get();
    return products.filter(p => p.condition === condition);
  },

  // Get products with images
  getProductsWithImages: () => {
    const { products } = get();
    return products.filter(p => p.img_product);
  },

  // Get products without images
  getProductsWithoutImages: () => {
    const { products } = get();
    return products.filter(p => !p.img_product);
  },

  // Check if there are any loading states
  isAnyLoading: () => {
    const { isLoading, isUploadingImage } = get();
    return isLoading || isUploadingImage;
  },

  // Get current filters as display string
  getFiltersDisplayString: () => {
    const { filters } = get();
    const activeFilters: string[] = [];
    
    if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
    if (filters.status) activeFilters.push(`Status: ${filters.status}`);
    if (filters.condition) activeFilters.push(`Condition: ${filters.condition}`);
    if (filters.category_id) activeFilters.push(`Category ID: ${filters.category_id}`);
    if (filters.supplier_id) activeFilters.push(`Supplier ID: ${filters.supplier_id}`);
    if (filters.location) activeFilters.push(`Location: "${filters.location}"`);
    if (filters.has_image !== undefined) activeFilters.push(`Has Image: ${filters.has_image ? 'Yes' : 'No'}`);
    
    return activeFilters.join(', ') || 'No active filters';
  },
}));