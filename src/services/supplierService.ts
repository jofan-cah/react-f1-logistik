// src/services/supplierService.ts
import api from './api';
import { 
  Supplier, 
  CreateSupplierRequest, 
  UpdateSupplierRequest, 
  SupplierListResponse,
  ApiResponse 
} from '../types/supplier.types';

export const supplierService = {
  // Get all suppliers
  async getSuppliers(): Promise<SupplierListResponse> {
    try {
      const response = await api.get('/suppliers');
      
      // Handle backend response structure: { success, count, data }
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: 'Suppliers fetched successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch suppliers');
      }
    } catch (error: any) {
      console.error('SupplierService - Error:', error);
      throw error;
    }
  },

  // Get supplier by ID
  async getSupplierById(id: number): Promise<ApiResponse<Supplier>> {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('SupplierService - Error getting supplier by ID:', error);
      throw error;
    }
  },

  // Create new supplier
  async createSupplier(data: CreateSupplierRequest): Promise<ApiResponse<Supplier>> {
    try {
      const response = await api.post('/suppliers', data);
      return response.data;
    } catch (error: any) {
      console.error('SupplierService - Error creating supplier:', error);
      throw error;
    }
  },

  // Update supplier
  async updateSupplier(id: number, data: UpdateSupplierRequest): Promise<ApiResponse<Supplier>> {
    try {
      const response = await api.put(`/suppliers/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('SupplierService - Error updating supplier:', error);
      throw error;
    }
  },

  // Delete supplier
  async deleteSupplier(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('SupplierService - Error deleting supplier:', error);
      throw error;
    }
  }
};