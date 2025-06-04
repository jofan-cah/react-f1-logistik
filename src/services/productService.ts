// src/services/productService.ts
import api from './api';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  ProductListResponse,
  ApiResponse,
  ImageUploadResponse
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

      // Handle backend response structure: { success, data: { products, pagination } }
      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }

    } catch (error: any) {
      console.error('ProductService - Error:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // NEW: Upload product image - ENHANCED DEBUG VERSION
  async uploadProductImage(file: File): Promise<ImageUploadResponse> {
    try {
      console.log('=== FRONTEND UPLOAD START ===');
      console.log('File to upload:', file);
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);

      const formData = new FormData();
      formData.append('image', file);

      console.log('FormData created, entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], ':', pair[1]);
      }

      console.log('=== SENDING REQUEST ===');
      console.log('URL: /products/upload-image');

      const response = await api.post('/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // const response = await api.post('/dummy/upload-simple', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      console.log('=== RESPONSE RECEIVED ===');
      console.log('Status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response.data.success:', response.data.success);
      console.log('Response.data.data:', response.data.data);
      console.log('Response.data.data.filename:', response.data.data?.filename);

      // FIXED: Return the full response structure
      return response.data;
    } catch (error: any) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      throw error;
    }
  },

  // UPDATED: Create new product (simplified - no direct file handling)
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

  // UPDATED: Update product (simplified - no direct file handling)
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

  // Delete product
  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // NEW: Delete product image
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
  async getProductStats(): Promise<ApiResponse<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    lowStock: number;
    withImages: number;  // NEW: Count products with images
    withoutImages: number;  // NEW: Count products without images
  }>> {
    const response = await api.get('/products/stats');
    return response.data;
  },

  // Generate QR code for product
  async generateQRCode(id: string): Promise<ApiResponse<{ qr_data: string; qr_image: string }>> {
    const response = await api.post(`/products/${id}/qr`);
    return response.data;
  },

  // NEW: Get product image URL
  getImageUrl(filename: string): string {
    if (!filename) return '';

    // If filename already contains full URL, return as is
    if (filename.startsWith('http')) {
      return filename;
    }

    // Build URL based on your backend setup
    const baseUrl = import.meta.env.VITE_API_UPLOADS;
    return `${baseUrl}/uploads/products/${filename}`;
  },

  // NEW: Validate image file
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