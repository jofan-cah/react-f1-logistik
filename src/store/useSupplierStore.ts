// src/store/useSupplierStore.ts
import { create } from 'zustand';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest, SupplierFilters } from '../types/supplier.types';
import { supplierService } from '../services/supplierService';

interface SupplierStore {
  suppliers: Supplier[];
  currentSupplier: Supplier | null;
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: SupplierFilters;
  
  // Actions
  fetchSuppliers: () => Promise<void>;
  getSupplierById: (id: number) => Promise<Supplier | null>;
  createSupplier: (data: CreateSupplierRequest) => Promise<boolean>;
  updateSupplier: (id: number, data: UpdateSupplierRequest) => Promise<boolean>;
  deleteSupplier: (id: number) => Promise<boolean>;
  setFilters: (filters: SupplierFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearCurrentSupplier: () => void;
}

export const useSupplierStore = create<SupplierStore>((set, get) => ({
  suppliers: [],
  currentSupplier: null,
  isLoading: false,
  error: null,
  
  // Filters
  filters: {},

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.getSuppliers();
      
      if (response.success && response.data) {
        set({
          suppliers: response.data,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch suppliers', 
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

  getSupplierById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.getSupplierById(id);
      if (response.success && response.data) {
        set({ currentSupplier: response.data, isLoading: false });
        return response.data;
      } else {
        set({ 
          error: response.message || 'Supplier not found', 
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

  createSupplier: async (data: CreateSupplierRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.createSupplier(data);
      if (response.success) {
        // Refresh suppliers list
        await get().fetchSuppliers();
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to create supplier', 
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

  updateSupplier: async (id: number, data: UpdateSupplierRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.updateSupplier(id, data);
      if (response.success) {
        // Refresh suppliers list
        await get().fetchSuppliers();
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to update supplier', 
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

  deleteSupplier: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.deleteSupplier(id);
      if (response.success) {
        // Refresh suppliers list
        await get().fetchSuppliers();
        set({ isLoading: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to delete supplier', 
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

  setFilters: (filters: SupplierFilters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearError: () => set({ error: null }),
  
  clearCurrentSupplier: () => set({ currentSupplier: null })
}));