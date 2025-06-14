// src/services/purchasingService.ts
import api from './api';
import { 
  PurchaseReceipt,
  CreatePurchaseReceiptRequest,
  UpdatePurchaseReceiptRequest,
  AddReceiptItemRequest,
  PurchaseReceiptQueryParams,
  PurchaseReceiptFilters,
  PurchaseStats,
  PaginatedResponse,
  ApiResponse,
  PurchaseReceiptItem,
  PurchaseReceiptListResponse
} from '../types/purchasing.types';

class PurchasingService {
  private baseURL = '/purchases';

  // Helper method to build query string
  private buildQueryString(params: PurchaseReceiptQueryParams): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  // Get all purchase receipts with pagination and filters
  async getPurchaseReceipts(params: PurchaseReceiptQueryParams = {}): Promise<PaginatedResponse<PurchaseReceipt>> {
    try {
      console.log('PurchasingService - Fetching purchase receipts with params:', params);
      
      const queryString = this.buildQueryString(params);
      const endpoint = queryString ? `${this.baseURL}?${queryString}` : this.baseURL;
      
      const response = await api.get(endpoint);
      console.log('PurchasingService - Response:', response.data);
      
      if (response.data.success && response.data.data) {
        return {
          data: response.data.data,
          pagination: response.data.pagination || {
            page: params.page || 1,
            limit: params.limit || 10,
            total: response.data.data.length,
            totalPages: Math.ceil(response.data.data.length / (params.limit || 10)),
            hasNext: false,
            hasPrev: false
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch purchase receipts');
      }
    } catch (error: any) {
      console.error('PurchasingService - Error fetching receipts:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async getPurchaseReceiptsLegacy(
    page: number = 1, 
    limit: number = 10, 
    filters: PurchaseReceiptFilters = {}
  ): Promise<PurchaseReceiptListResponse> {
    const response = await this.getPurchaseReceipts({ page, limit, ...filters });
    return {
      success: true,
      data: {
        receipts: response.data,
        pagination: {
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        }
      }
    };
  }

  // Get purchase receipt by ID
  async getPurchaseReceiptById(id: number): Promise<PurchaseReceipt> {
    try {
      console.log('PurchasingService - Fetching receipt by ID:', id);
      
      const response = await api.get(`${this.baseURL}/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Purchase receipt not found');
      }
    } catch (error: any) {
      console.error('PurchasingService - Error fetching receipt:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Create new purchase receipt
  async createPurchaseReceipt(data: CreatePurchaseReceiptRequest): Promise<PurchaseReceipt> {
    try {
      console.log('PurchasingService - Creating receipt:', data);
      
      const response = await api.post(this.baseURL, data);
      
      if (response.data.success && response.data.data) {
        console.log('PurchasingService - Receipt created successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create purchase receipt');
      }
    } catch (error: any) {
      console.error('PurchasingService - Error creating receipt:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Update purchase receipt
  async updatePurchaseReceipt(id: number, data: UpdatePurchaseReceiptRequest): Promise<PurchaseReceipt> {
    try {
      console.log('PurchasingService - Updating receipt:', id, data);
      
      const response = await api.put(`${this.baseURL}/${id}`, data);
      
      if (response.data.success && response.data.data) {
        console.log('PurchasingService - Receipt updated successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update purchase receipt');
      }
    } catch (error: any) {
      console.error('PurchasingService - Error updating receipt:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Delete purchase receipt
  async deletePurchaseReceipt(id: number): Promise<void> {
    try {
      console.log('PurchasingService - Deleting receipt:', id);
      
      const response = await api.delete(`${this.baseURL}/${id}`);
      
      // Handle different response formats
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to delete purchase receipt');
      }
      
      // If response doesn't have success field, check status code
      if (response.status >= 200 && response.status < 300) {
        console.log('PurchasingService - Receipt deleted successfully');
        return;
      }
      
      throw new Error('Failed to delete purchase receipt');
    } catch (error: any) {
      console.error('PurchasingService - Error deleting receipt:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Network error: No response received');
      } else {
        throw new Error(error.message || 'Unknown error occurred');
      }
    }
  }

  // Add item to purchase receipt
  async addReceiptItem(receiptId: number, itemData: AddReceiptItemRequest): Promise<PurchaseReceiptItem> {
    try {
      console.log('PurchasingService - Adding item to receipt:', receiptId, itemData);
      
      const response = await api.post(`${this.baseURL}/${receiptId}/items`, itemData);
      
      if (response.data.success && response.data.data) {
        console.log('PurchasingService - Item added successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add item to receipt');
      }
    } catch (error: any) {
      console.error('PurchasingService - Error adding item:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Remove item from purchase receipt
  async removeReceiptItem(receiptId: number, itemId: number): Promise<void> {
    try {
      console.log('PurchasingService - Removing item from receipt:', receiptId, itemId);
      
      const response = await api.delete(`${this.baseURL}/${receiptId}/items/${itemId}`);
      
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to remove item from receipt');
      }
      
      console.log('PurchasingService - Item removed successfully');
    } catch (error: any) {
      console.error('PurchasingService - Error removing item:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Get purchase statistics
  async getPurchaseStats(): Promise<PurchaseStats> {
    try {
      console.log('PurchasingService - Fetching purchase statistics');
      
      const response = await api.get(`${this.baseURL}/stats`);
      
      if (response.data.success && response.data.data) {
        console.log('PurchasingService - Statistics fetched successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch purchase statistics');
      }
    } catch (error: any) {
      console.error('PurchasingService - Error fetching stats:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // Search purchase receipts
  async searchPurchaseReceipts(searchTerm: string, filters: Partial<PurchaseReceiptQueryParams> = {}): Promise<PaginatedResponse<PurchaseReceipt>> {
    return this.getPurchaseReceipts({
      ...filters,
      search: searchTerm,
    });
  }

  // Get receipts by supplier
  async getReceiptsBySupplier(supplierId: number, params: Omit<PurchaseReceiptQueryParams, 'supplier_id'> = {}): Promise<PaginatedResponse<PurchaseReceipt>> {
    return this.getPurchaseReceipts({
      ...params,
      supplier_id: supplierId,
    });
  }

  // Get receipts by status
  async getReceiptsByStatus(status: string, params: Omit<PurchaseReceiptQueryParams, 'status'> = {}): Promise<PaginatedResponse<PurchaseReceipt>> {
    return this.getPurchaseReceipts({
      ...params,
      status: status as any,
    });
  }

  // Get pending receipts
  async getPendingReceipts(params: Omit<PurchaseReceiptQueryParams, 'status'> = {}): Promise<PaginatedResponse<PurchaseReceipt>> {
    return this.getReceiptsByStatus('pending', params);
  }

  // Get completed receipts
  async getCompletedReceipts(params: Omit<PurchaseReceiptQueryParams, 'status'> = {}): Promise<PaginatedResponse<PurchaseReceipt>> {
    return this.getReceiptsByStatus('completed', params);
  }

  // Update receipt status
  async updateReceiptStatus(id: number, status: string): Promise<PurchaseReceipt> {
    return this.updatePurchaseReceipt(id, { status: status as any });
  }

  // Cancel receipt
  async cancelReceipt(id: number): Promise<PurchaseReceipt> {
    return this.updateReceiptStatus(id, 'cancelled');
  }

  // Complete receipt
  async completeReceipt(id: number): Promise<PurchaseReceipt> {
    return this.updateReceiptStatus(id, 'completed');
  }

  // Get receipts by date range
  async getReceiptsByDateRange(
    startDate: string, 
    endDate: string, 
    params: Omit<PurchaseReceiptQueryParams, 'receipt_date_from' | 'receipt_date_to'> = {}
  ): Promise<PaginatedResponse<PurchaseReceipt>> {
    return this.getPurchaseReceipts({
      ...params,
      receipt_date_from: startDate,
      receipt_date_to: endDate,
    });
  }

  // Get today's receipts
  async getTodayReceipts(params: Omit<PurchaseReceiptQueryParams, 'receipt_date'> = {}): Promise<PaginatedResponse<PurchaseReceipt>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getPurchaseReceipts({
      ...params,
      receipt_date: today,
    });
  }

  // Get this month's receipts
  async getThisMonthReceipts(params: Omit<PurchaseReceiptQueryParams, 'receipt_date_from' | 'receipt_date_to'> = {}): Promise<PaginatedResponse<PurchaseReceipt>> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    return this.getReceiptsByDateRange(startOfMonth, endOfMonth, params);
  }

  // Utility methods for validation
  validateReceiptData(data: CreatePurchaseReceiptRequest): string[] {
    const errors: string[] = [];

    if (!data.po_number?.trim()) {
      errors.push('PO number is required');
    } else if (data.po_number.length < 3 || data.po_number.length > 50) {
      errors.push('PO number must be between 3 and 50 characters');
    }

    if (!data.supplier_id) {
      errors.push('Supplier is required');
    }

    if (data.receipt_number && (data.receipt_number.length < 3 || data.receipt_number.length > 50)) {
      errors.push('Receipt number must be between 3 and 50 characters');
    }

    if (data.notes && data.notes.length > 1000) {
      errors.push('Notes cannot exceed 1000 characters');
    }

    if (data.items && data.items.length > 0) {
      data.items.forEach((item, index) => {
        if (!item.category_id) {
          errors.push(`Item ${index + 1}: Category is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (item.unit_price === undefined || item.unit_price < 0) {
          errors.push(`Item ${index + 1}: Unit price must be 0 or greater`);
        }
        if (item.serial_numbers && item.serial_numbers.length > 1000) {
          errors.push(`Item ${index + 1}: Serial numbers cannot exceed 1000 characters`);
        }
        if (item.notes && item.notes.length > 500) {
          errors.push(`Item ${index + 1}: Notes cannot exceed 500 characters`);
        }
      });
    }

    return errors;
  }

  // Calculate total amount for receipt
  calculateReceiptTotal(items: CreatePurchaseReceiptRequest['items']): number {
    if (!items || items.length === 0) return 0;
    
    return items.reduce((total, item) => {
      return total + ((item.unit_price || 0) * (item.quantity || 0));
    }, 0);
  }

  // Format receipt number
  formatReceiptNumber(date: Date = new Date()): string {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP-${dateStr}-${randomNum}`;
  }

  // Validate item data
  validateItemData(data: AddReceiptItemRequest): string[] {
    const errors: string[] = [];

    if (!data.category_id) {
      errors.push('Category is required');
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (data.unit_price === undefined || data.unit_price < 0) {
      errors.push('Unit price must be 0 or greater');
    }

    if (data.serial_numbers && data.serial_numbers.length > 1000) {
      errors.push('Serial numbers cannot exceed 1000 characters');
    }

    if (data.notes && data.notes.length > 500) {
      errors.push('Notes cannot exceed 500 characters');
    }

    return errors;
  }
}

// Export singleton instance
export const purchasingService = new PurchasingService();
export default purchasingService;