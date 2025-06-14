// src/services/transactionService.ts
import api from './api';
import {
  Transaction,
  TransactionItem,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryParams,
  TransactionListResponse,
  TransactionResponse,
  TransactionItemsResponse,
  TransactionStats,
  ApiResponse
} from '../types/transaction.types';

export const transactionService = {
  // Get all transactions with filtering (matches backend pagination response)
  async getTransactions(params: TransactionQueryParams = {}): Promise<TransactionListResponse> {
    try {
      console.log('TransactionService - Getting transactions with params:', params);
      
      // Build query string
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
      if (params.status) queryParams.append('status', params.status);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.search) queryParams.append('search', params.search);
      if (params.location) queryParams.append('location', params.location);
      if (params.created_by) queryParams.append('created_by', params.created_by);
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);
      
      const queryString = queryParams.toString();
      const url = `/transactions${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      console.log('TransactionService - Response:', response.data);
      
      // Backend returns paginated response
      if (response.data.success) {
        return {
          success: true,
          count: response.data.total || response.data.data?.length || 0,
          data: response.data.data || [],
          message: response.data.message,
          meta: response.data.meta
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error: any) {
      console.error('TransactionService - Error getting transactions:', error);
      throw error;
    }
  },

  // Get transaction by ID
  async getTransactionById(id: number): Promise<TransactionResponse> {
    try {
      console.log('TransactionService - Getting transaction by ID:', id);
      
      const response = await api.get(`/transactions/${id}`);
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Transaction not found');
      }
    } catch (error: any) {
      console.error('TransactionService - Error getting transaction by ID:', error);
      throw error;
    }
  },

  // Create new transaction (matches backend validation)
  async createTransaction(data: CreateTransactionRequest): Promise<TransactionResponse> {
    try {
      console.log('TransactionService - Creating transaction:', data);
      
      // Frontend validation before sending to backend
      if (!data.transaction_type || !data.first_person || !data.location) {
        throw new Error('Transaction type, first person, and location are required');
      }
      
      if (!data.items || data.items.length === 0) {
        throw new Error('At least one item is required');
      }
      
      // Validate transaction type matches backend
      const validTypes = ['check_out', 'check_in', 'transfer', 'maintenance', 'repair', 'lost'];
      if (!validTypes.includes(data.transaction_type)) {
        throw new Error('Invalid transaction type');
      }
      
      // Validate items
      for (const item of data.items) {
        if (!item.product_id) {
          throw new Error('Product ID is required for all items');
        }
      }
      
      const response = await api.post('/transactions', data);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Transaction created successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to create transaction');
      }
    } catch (error: any) {
      console.error('TransactionService - Error creating transaction:', error);
      throw error;
    }
  },

  // Update transaction
  async updateTransaction(id: number, data: UpdateTransactionRequest): Promise<TransactionResponse> {
    try {
      console.log('TransactionService - Updating transaction:', { id, data });
      
      const response = await api.put(`/transactions/${id}`, data);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Transaction updated successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to update transaction');
      }
    } catch (error: any) {
      console.error('TransactionService - Error updating transaction:', error);
      throw error;
    }
  },

  // Delete transaction
  async deleteTransaction(id: number): Promise<ApiResponse<null>> {
    try {
      console.log('TransactionService - Deleting transaction:', id);
      
      const response = await api.delete(`/transactions/${id}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Transaction deleted successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to delete transaction');
      }
    } catch (error: any) {
      console.error('TransactionService - Error deleting transaction:', error);
      throw error;
    }
  },

  // Close transaction (backend endpoint)
  async closeTransaction(id: number): Promise<TransactionResponse> {
    try {
      console.log('TransactionService - Closing transaction:', id);
      
      const response = await api.put(`/transactions/${id}/close`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Transaction closed successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to close transaction');
      }
    } catch (error: any) {
      console.error('TransactionService - Error closing transaction:', error);
      throw error;
    }
  },

  // Reopen transaction (update status to open)
  async reopenTransaction(id: number): Promise<TransactionResponse> {
    try {
      console.log('TransactionService - Reopening transaction:', id);
      
      return await this.updateTransaction(id, { status: 'open' });
    } catch (error: any) {
      console.error('TransactionService - Error reopening transaction:', error);
      throw error;
    }
  },

  // Add item to transaction (backend endpoint)
  async addTransactionItem(
    transactionId: number, 
    itemData: {
      product_id: string;
      condition_before?: string;
      condition_after?: string;
      quantity?: number;
      breakdown_quantity?: number;
      breakdown_unit?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<TransactionItem>> {
    try {
      console.log('TransactionService - Adding item to transaction:', { transactionId, itemData });
      
      const response = await api.post(`/transactions/${transactionId}/items`, itemData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Item added successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to add item');
      }
    } catch (error: any) {
      console.error('TransactionService - Error adding transaction item:', error);
      throw error;
    }
  },

  // Remove item from transaction (backend endpoint)
  async removeTransactionItem(transactionId: number, itemId: number): Promise<ApiResponse<null>> {
    try {
      console.log('TransactionService - Removing item from transaction:', { transactionId, itemId });
      
      const response = await api.delete(`/transactions/${transactionId}/items/${itemId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Item removed successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to remove item');
      }
    } catch (error: any) {
      console.error('TransactionService - Error removing transaction item:', error);
      throw error;
    }
  },

  // Get transaction statistics (backend endpoint)
  async getTransactionStats(): Promise<ApiResponse<TransactionStats>> {
    try {
      console.log('TransactionService - Getting transaction stats from backend');
      
      const response = await api.get('/transactions/stats');
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Statistics retrieved successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch statistics');
      }
    } catch (error: any) {
      console.error('TransactionService - Error getting transaction stats:', error);
      throw error;
    }
  },

  // Generate QR code for transaction (backend endpoint)
  async generateTransactionQRCode(id: number): Promise<ApiResponse<{
    transaction_id: number;
    qr_code: {
      filename: string;
      url: string;
      data: string;
    };
  }>> {
    try {
      console.log('TransactionService - Generating QR code for transaction:', id);
      
      const response = await api.post(`/transactions/${id}/qr-code`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'QR code generated successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to generate QR code');
      }
    } catch (error: any) {
      console.error('TransactionService - Error generating QR code:', error);
      throw error;
    }
  },

  // Search transactions
  async searchTransactions(query: string, limit: number = 10): Promise<TransactionListResponse> {
    try {
      console.log('TransactionService - Searching transactions:', query);
      
      return await this.getTransactions({
        search: query,
        limit,
        sort_by: 'created_at',
        sort_order: 'DESC'
      });
    } catch (error: any) {
      console.error('TransactionService - Error searching transactions:', error);
      throw error;
    }
  },

  // Utility function to validate transaction data
  validateTransactionData(data: CreateTransactionRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate transaction type
    const validTypes = ['check_out', 'check_in', 'transfer', 'maintenance', 'repair', 'lost'];
    if (!validTypes.includes(data.transaction_type)) {
      errors.push('Invalid transaction type');
    }
    
    // Validate required fields
    if (!data.first_person || data.first_person.length < 2 || data.first_person.length > 100) {
      errors.push('First person must be between 2 and 100 characters');
    }
    
    if (!data.location || data.location.length < 2 || data.location.length > 100) {
      errors.push('Location must be between 2 and 100 characters');
    }
    
    if (data.second_person && data.second_person.length > 100) {
      errors.push('Second person cannot exceed 100 characters');
    }
    
    if (data.notes && data.notes.length > 1000) {
      errors.push('Notes cannot exceed 1000 characters');
    }
    
    // Validate items
    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      data.items.forEach((item, index) => {
        if (!item.product_id) {
          errors.push(`Item ${index + 1}: Product ID is required`);
        }
        
        if (item.quantity && item.quantity < 1) {
          errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
        }
        
        if (item.notes && item.notes.length > 500) {
          errors.push(`Item ${index + 1}: Notes cannot exceed 500 characters`);
        }
        
        // Validate conditions
        const validConditions = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];
        if (item.condition_before && !validConditions.includes(item.condition_before)) {
          errors.push(`Item ${index + 1}: Invalid condition before`);
        }
        
        if (item.condition_after && !validConditions.includes(item.condition_after)) {
          errors.push(`Item ${index + 1}: Invalid condition after`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Utility function to format transaction type
  formatTransactionType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'check_out': 'Check Out',
      'check_in': 'Check In',
      'transfer': 'Transfer',
      'maintenance': 'Maintenance',
      'repair': 'Repair',
      'lost': 'Lost'
    };
    return typeMap[type] || type;
  },

  // Utility function to get transaction type color
  getTransactionTypeColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'check_out': 'text-green-600',
      'check_in': 'text-blue-600',
      'transfer': 'text-purple-600',
      'maintenance': 'text-orange-600',
      'repair': 'text-yellow-600',
      'lost': 'text-red-600'
    };
    return colorMap[type] || 'text-gray-600';
  },

  // Utility function to get status color
  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'open': 'text-green-600',
      'closed': 'text-gray-600',
      'pending': 'text-yellow-600'
    };
    return colorMap[status] || 'text-gray-600';
  }
};