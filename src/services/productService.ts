// src/services/productService.ts
import api from './api';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateStatusRequest,
  ProductFilters,
  ProductListResponse,
  ApiResponse,
  ImageUploadResponse,
  ProductStats,
  QRCodeResponse,
  PrintProductRequest,
  PrintProductResponse,
  CreateBreakdownRequest,
  BreakdownResponse,
  BreakdownHistory
} from '../types/product.types';

export const productService = {

  // Get all products with pagination and filters
  async getProducts(
    page: number = 1,
    limit: number = 10,
    filters: ProductFilters = {}
  ): Promise<ProductListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters to params
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.category_id) params.append('category_id', filters.category_id.toString());
      if (filters.supplier_id) params.append('supplier_id', filters.supplier_id.toString());
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.location) params.append('location', filters.location);
      if (filters.has_image !== undefined) params.append('has_image', filters.has_image.toString());

      const url = `/products?${params.toString()}`;
      console.log('ProductService - Making request to:', url);

      const response = await api.get(url);
      console.log('ProductService - Response:', response.data);
      console.log('ProductService - Response status:', response.status);

      // UPDATED: Handle the actual response structure from your API
      if (response.status === 200 && response.data.success) {
        // Transform the response to match ProductListResponse interface
        return {
          success: true,
          data: {
            products: response.data.data, // The actual products array
            pagination: response.data.meta.pagination // The pagination meta
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (error: any) {
      console.error('ProductService - Error:', error);
      console.error('ProductService - Error response:', error.response?.data);
      console.error('ProductService - Error status:', error.response?.status);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Get by ID Error:', error);
      throw error;
    }
  },

  // Search products with advanced filters
  async searchProducts(
    query?: string,
    filters: {
      category_id?: number;
      status?: string;
      condition?: string;
      location?: string;
      supplier_id?: number;
    } = {}
  ): Promise<ApiResponse<Product[]>> {
    try {
      const params = new URLSearchParams();
      
      if (query) params.append('q', query);
      if (filters.category_id) params.append('category_id', filters.category_id.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.location) params.append('location', filters.location);
      if (filters.supplier_id) params.append('supplier_id', filters.supplier_id.toString());

      const response = await api.get(`/products/search?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Search Error:', error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/products/category/${categoryId}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Get by Category Error:', error);
      throw error;
    }
  },

  // Get products by location
  async getProductsByLocation(
    location: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/products/location/${encodeURIComponent(location)}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Get by Location Error:', error);
      throw error;
    }
  },

  // Create new product
  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      console.log('ProductService createProduct called with:', data);
      const response = await api.post('/products', data);
      console.log('ProductService createProduct response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Create Error:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      console.log('ProductService updateProduct called with:', { id, data });
      const response = await api.put(`/products/${id}`, data);
      console.log('ProductService updateProduct response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Update Error:', error);
      throw error;
    }
  },

  // Update product status
  async updateProductStatus(id: string, data: UpdateStatusRequest): Promise<ApiResponse<any>> {
    try {
      const response = await api.put(`/products/${id}/status`, data);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Update Status Error:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Delete Error:', error);
      throw error;
    }
  },

  // Upload product image
  async uploadProductImage(file: File): Promise<ImageUploadResponse> {
    try {
      console.log('=== FRONTEND UPLOAD START ===');
      console.log('File to upload:', file);
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);

      const formData = new FormData();
      formData.append('image', file);

      console.log('=== SENDING REQUEST ===');
      console.log('URL: /products/upload-image');

      const response = await api.post('/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('=== RESPONSE RECEIVED ===');
      console.log('Status:', response.status);
      console.log('Response data:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Delete product image
  async deleteProductImage(filename: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/products/image/${filename}`);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Delete Image Error:', error);
      throw error;
    }
  },

  // Get product statistics
  async getProductStats(): Promise<ApiResponse<ProductStats>> {
    try {
      const response = await api.get('/products/stats');
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Get Stats Error:', error);
      throw error;
    }
  },

  // Generate QR code for product
  async generateQRCode(id: string): Promise<ApiResponse<QRCodeResponse>> {
    try {
      const response = await api.post(`/products/${id}/qr-code`);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Generate QR Error:', error);
      throw error;
    }
  },

  // Get products for printing
  async getProductsForPrint(productIds: string[]): Promise<PrintProductResponse> {
    try {
      const response = await api.post('/products/print/custom', {
        product_ids: productIds
      });
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Get for Print Error:', error);
      throw error;
    }
  },

  // Create breakdown transaction
  async createBreakdownTransaction(data: CreateBreakdownRequest): Promise<ApiResponse<BreakdownResponse>> {
    try {
      const response = await api.post('/products/breakdown', data);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Create Breakdown Error:', error);
      throw error;
    }
  },

  // Get product breakdown history
  async getProductBreakdownHistory(id: string): Promise<ApiResponse<BreakdownHistory>> {
    try {
      const response = await api.get(`/products/${id}/breakdown-history`);
      return response.data;
    } catch (error: any) {
      console.error('ProductService - Get Breakdown History Error:', error);
      throw error;
    }
  },

  // Get product image URL
  getImageUrl(filename: string): string {
    if (!filename) return '';

    // If filename already contains full URL, return as is
    if (filename.startsWith('http')) {
      return filename;
    }

    // Build URL based on your backend setup
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/products/${filename}`;
  },

  // Validate image file
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Ukuran file terlalu besar. Maksimal 5MB.'
      };
    }

    return { isValid: true };
  }
};