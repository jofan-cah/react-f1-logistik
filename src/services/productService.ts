// src/services/productService.ts
import api from './api';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductFilters,
  ProductListResponse,
  ApiResponse 
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

  // Create new product
  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Update product
  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get product statistics
  async getProductStats(): Promise<ApiResponse<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    lowStock: number;
  }>> {
    const response = await api.get('/products/stats');
    return response.data;
  },

  // Generate QR code for product
  async generateQRCode(id: string): Promise<ApiResponse<{ qr_data: string; qr_image: string }>> {
    const response = await api.post(`/products/${id}/qr`);
    return response.data;
  }
};