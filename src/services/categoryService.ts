// src/services/categoryService.ts
import api from './api';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CategoryListResponse,
  ApiResponse 
} from '../types/category.types';

export const categoryService = {
  // Get all categories
  async getCategories(): Promise<CategoryListResponse> {
    const response = await api.get('/categories');
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
  }
};