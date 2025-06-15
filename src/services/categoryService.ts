// src/services/categoryService.ts
import api from './api';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CategoryListResponse,
  CategoryFilters,
  ApiResponse,
  CategoryStats,
  UpdateStockRequest,
  StockUpdateResponse,
  StockAdjustment,
  BulkAdjustmentResponse
} from '../types/category.types';

export const categoryService = {
  // Get all categories with pagination and filters
  async getCategories(filters: CategoryFilters = {}): Promise<CategoryListResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.has_stock !== undefined) params.append('has_stock', filters.has_stock.toString());
    if (filters.is_low_stock !== undefined) params.append('is_low_stock', filters.is_low_stock.toString());
    if (filters.code) params.append('code', filters.code);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);

    const response = await api.get(`/categories?${params.toString()}`);
    return response.data;
  },

  // Get categories that track stock
  async getCategoriesWithStock(): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/categories/with-stock');
    return response.data;
  },

  // Get categories with low stock
  async getLowStockCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/categories/low-stock');
    return response.data;
  },

  // Get category statistics
  async getCategoryStats(): Promise<ApiResponse<CategoryStats>> {
    const response = await api.get('/categories/stats');
    return response.data;
  },

  // Get category by ID
  async getCategoryById(id: number): Promise<ApiResponse<Category>> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category
  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Update category
  async updateCategory(id: number, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  async deleteCategory(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Update category stock (manual adjustment)
  async updateCategoryStock(id: number, data: UpdateStockRequest): Promise<ApiResponse<StockUpdateResponse>> {
    const response = await api.put(`/categories/${id}/stock`, data);
    return response.data;
  },

  // Bulk stock adjustment
  async bulkStockAdjustment(adjustments: StockAdjustment[]): Promise<ApiResponse<BulkAdjustmentResponse>> {
    const response = await api.post('/categories/bulk-adjustment', { adjustments });
    return response.data;
  }
};