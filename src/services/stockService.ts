// src/services/stockService.ts
import api from './api';
import {
  StockMovement,
  CreateStockMovementRequest,
  CreateStockMovementResponse,
  BulkAdjustmentRequest,
  BulkAdjustmentResponse,
  StockMovementFilters,
  StockSummary,
  StockAnalytics,
  StockAlertSummary,
  ApiResponse
} from '../types/stock.types';

export const stockService = {

  // Get all stock movements with pagination and filters
  async getStockMovements(
    page: number = 1,
    limit: number = 10,
    filters: StockMovementFilters = {}
  ): Promise<ApiResponse<StockMovement[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters to params
      if (filters.category_id) params.append('category_id', filters.category_id.toString());
      if (filters.movement_type) params.append('movement_type', filters.movement_type);
      if (filters.reference_type) params.append('reference_type', filters.reference_type);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/stocks?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('StockService - Get movements error:', error);
      throw error;
    }
  },

  // Get stock movement by ID
  async getStockMovementById(id: number): Promise<ApiResponse<StockMovement>> {
    try {
      const response = await api.get(`/stocks/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('StockService - Get by ID error:', error);
      throw error;
    }
  },

  // Create manual stock movement
  async createStockMovement(data: CreateStockMovementRequest): Promise<ApiResponse<CreateStockMovementResponse>> {
    try {
      console.log('StockService - Creating movement:', data);
      const response = await api.post('/stocks/movements', data);
      console.log('StockService - Create response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('StockService - Create error:', error);
      throw error;
    }
  },

  // Get stock summary by categories
  async getStockSummary(lowStockOnly: boolean = false): Promise<ApiResponse<StockSummary>> {
    try {
      const params = new URLSearchParams();
      if (lowStockOnly) params.append('low_stock_only', 'true');

      const response = await api.get(`/stocks/summary?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('StockService - Get summary error:', error);
      throw error;
    }
  },

  // Get recent stock movements
  async getRecentMovements(limit: number = 10): Promise<ApiResponse<StockMovement[]>> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());

      const response = await api.get(`/stocks/recent?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('StockService - Get recent movements error:', error);
      throw error;
    }
  },

  // Get stock analytics
  async getStockAnalytics(period: number = 30): Promise<ApiResponse<StockAnalytics>> {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period.toString());

      const response = await api.get(`/stocks/analytics?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('StockService - Get analytics error:', error);
      throw error;
    }
  },

  // Get low stock alerts
  async getLowStockAlerts(): Promise<ApiResponse<StockAlertSummary>> {
    try {
      const response = await api.get('/stocks/alerts');
      return response.data;
    } catch (error: any) {
      console.error('StockService - Get alerts error:', error);
      throw error;
    }
  },

  // Perform bulk stock adjustments
  async bulkStockAdjustment(data: BulkAdjustmentRequest): Promise<ApiResponse<BulkAdjustmentResponse>> {
    try {
      console.log('StockService - Bulk adjustment:', data);
      const response = await api.post('/stocks/bulk-adjustment', data);
      console.log('StockService - Bulk adjustment response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('StockService - Bulk adjustment error:', error);
      throw error;
    }
  },

  // Validation functions
  validateMovementType(movementType: string): { isValid: boolean; error?: string } {
    const validTypes = ['in', 'out', 'adjustment'];
    if (!validTypes.includes(movementType)) {
      return {
        isValid: false,
        error: 'Movement type must be: in, out, or adjustment'
      };
    }
    return { isValid: true };
  },

  validateQuantity(quantity: number): { isValid: boolean; error?: string } {
    if (!quantity || quantity <= 0) {
      return {
        isValid: false,
        error: 'Quantity must be greater than 0'
      };
    }
    return { isValid: true };
  },

  validateNotes(notes?: string): { isValid: boolean; error?: string } {
    if (notes && notes.length > 1000) {
      return {
        isValid: false,
        error: 'Notes cannot exceed 1000 characters'
      };
    }
    return { isValid: true };
  },

  validateCategoryId(categoryId: number): { isValid: boolean; error?: string } {
    if (!categoryId || categoryId <= 0) {
      return {
        isValid: false,
        error: 'Category ID is required and must be a positive integer'
      };
    }
    return { isValid: true };
  },

  // Utility functions
  formatMovementType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'in': 'Stock In',
      'out': 'Stock Out',
      'adjustment': 'Adjustment'
    };
    return typeMap[type] || type;
  },

  formatUrgency(urgency: string): string {
    const urgencyMap: { [key: string]: string } = {
      'critical': 'Critical',
      'high': 'High',
      'medium': 'Medium'
    };
    return urgencyMap[urgency] || urgency;
  },

  getUrgencyColor(urgency: string): string {
    const colorMap: { [key: string]: string } = {
      'critical': 'text-red-600',
      'high': 'text-orange-600',
      'medium': 'text-yellow-600'
    };
    return colorMap[urgency] || 'text-gray-600';
  },

  formatStockStatus(current: number, min: number, reorderPoint: number): string {
    if (current === 0) return 'Out of Stock';
    if (current <= reorderPoint) return 'Low Stock';
    if (current <= min) return 'Below Minimum';
    return 'In Stock';
  },

  getStockStatusColor(current: number, min: number, reorderPoint: number): string {
    if (current === 0) return 'text-red-600';
    if (current <= reorderPoint) return 'text-orange-600';
    if (current <= min) return 'text-yellow-600';
    return 'text-green-600';
  }
};