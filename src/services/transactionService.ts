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
  ApiResponse
} from '../types/transaction.types';

export const transactionService = {
  // Get all transactions with filtering
  async getTransactions(params: TransactionQueryParams = {}): Promise<TransactionListResponse> {
    try {
      console.log('TransactionService - Getting transactions with params:', params);
      
      // Build query string
      const queryParams = new URLSearchParams();
      
      if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
      if (params.status) queryParams.append('status', params.status);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);
      
      const queryString = queryParams.toString();
      const url = `/transactions${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      
      console.log('TransactionService - Response:', response.data);
      
      if (response.data.success) {
        return {
          success: true,
          count: response.data.count || response.data.data?.length || 0,
          data: response.data.data || [],
          message: response.data.message
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

  // Get transaction items
  async getTransactionItems(transactionId: number): Promise<TransactionItemsResponse> {
    try {
      console.log('TransactionService - Getting transaction items for ID:', transactionId);
      
      const response = await api.get(`/transactions/${transactionId}/items`);
      
      if (response.data.success) {
        return {
          success: true,
          count: response.data.count || response.data.data?.length || 0,
          data: response.data.data || [],
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch transaction items');
      }
    } catch (error: any) {
      console.error('TransactionService - Error getting transaction items:', error);
      throw error;
    }
  },

  // Create new transaction
  async createTransaction(data: CreateTransactionRequest): Promise<TransactionResponse> {
    try {
      console.log('TransactionService - Creating transaction:', data);
      
      // Validate required fields
      if (!data.transaction_type || !data.first_person || !data.location) {
        throw new Error('Transaction type, first person, and location are required');
      }
      
      if (!data.items || data.items.length === 0) {
        throw new Error('At least one item is required');
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

  // Close transaction (update status to closed)
  async closeTransaction(id: number): Promise<TransactionResponse> {
    try {
      console.log('TransactionService - Closing transaction:', id);
      
      return await this.updateTransaction(id, { status: 'closed' });
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

  // Get transaction statistics
  async getTransactionStats(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byMonth: Record<string, number>;
    recentActivity: Transaction[];
  }>> {
    try {
      console.log('TransactionService - Getting transaction stats');
      
      // Get all transactions for statistics
      const response = await this.getTransactions({
        start_date: startDate,
        end_date: endDate,
        limit: 1000 // Get a large number for stats
      });
      
      if (response.success && response.data) {
        const transactions = response.data;
        
        const stats = {
          total: transactions.length,
          byType: {} as Record<string, number>,
          byStatus: {} as Record<string, number>,
          byMonth: {} as Record<string, number>,
          recentActivity: transactions.slice(0, 10) // Last 10 transactions
        };
        
        // Count by type
        transactions.forEach(transaction => {
          stats.byType[transaction.transaction_type] = 
            (stats.byType[transaction.transaction_type] || 0) + 1;
        });
        
        // Count by status
        transactions.forEach(transaction => {
          stats.byStatus[transaction.status] = 
            (stats.byStatus[transaction.status] || 0) + 1;
        });
        
        // Count by month
        transactions.forEach(transaction => {
          const date = new Date(transaction.transaction_date || transaction.created_at || '');
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
        });
        
        return {
          success: true,
          data: stats,
          message: 'Transaction statistics calculated successfully'
        };
      } else {
        throw new Error('Failed to fetch transactions for statistics');
      }
    } catch (error: any) {
      console.error('TransactionService - Error getting transaction stats:', error);
      throw error;
    }
  },

  // Export transactions
  async exportTransactions(params: TransactionQueryParams & { format?: 'csv' | 'excel' | 'pdf' }): Promise<Blob> {
    try {
      console.log('TransactionService - Exporting transactions:', params);
      
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await api.get(`/transactions/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error: any) {
      console.error('TransactionService - Error exporting transactions:', error);
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
  }
};