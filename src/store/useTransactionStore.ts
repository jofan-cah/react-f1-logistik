// src/store/useTransactionStore.ts
import { create } from 'zustand';
import {
  Transaction,
  TransactionItem,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryParams,
  TransactionFilters
} from '../types/transaction.types';
import { transactionService } from '../services/transactionService';

interface TransactionStore {
  // State
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  transactionItems: TransactionItem[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filters
  filters: TransactionFilters;
  queryParams: TransactionQueryParams;
  
  // Search
  searchTerm: string;
  searchResults: Transaction[];
  isSearching: boolean;
  
  // Statistics
  stats: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byMonth: Record<string, number>;
    recentActivity: Transaction[];
  } | null;
  
  // Actions - Transaction CRUD
  fetchTransactions: (params?: TransactionQueryParams) => Promise<void>;
  getTransactionById: (id: number) => Promise<Transaction | null>;
  createTransaction: (data: CreateTransactionRequest) => Promise<boolean>;
  updateTransaction: (id: number, data: UpdateTransactionRequest) => Promise<boolean>;
  deleteTransaction: (id: number) => Promise<boolean>;
  
  // Actions - Transaction Operations
  closeTransaction: (id: number) => Promise<boolean>;
  reopenTransaction: (id: number) => Promise<boolean>;
  
  // Actions - Transaction Items
  fetchTransactionItems: (transactionId: number) => Promise<void>;
  
  // Actions - Filters and Search
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  setQueryParams: (params: TransactionQueryParams) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  searchTransactions: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Actions - Statistics
  fetchTransactionStats: (startDate?: string, endDate?: string) => Promise<void>;
  
  // Actions - Utility
  clearError: () => void;
  clearCurrentTransaction: () => void;
  refreshTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  // Initial state
  transactions: [],
  currentTransaction: null,
  transactionItems: [],
  isLoading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  
  // Filters
  filters: {},
  queryParams: {
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_order: 'DESC'
  },
  
  // Search
  searchTerm: '',
  searchResults: [],
  isSearching: false,
  
  // Statistics
  stats: null,

  // Fetch all transactions
  fetchTransactions: async (params?: TransactionQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const currentParams = get().queryParams;
      const mergedParams = { ...currentParams, ...params };
      
      console.log('🔄 Fetching transactions with params:', mergedParams);
      
      const response = await transactionService.getTransactions(mergedParams);
      
      if (response.success && response.data) {
        // Calculate pagination
        const totalItems = response.count || response.data.length;
        const totalPages = Math.ceil(totalItems / (mergedParams.limit || 10));
        
        set({
          transactions: response.data,
          totalItems,
          totalPages,
          currentPage: mergedParams.page || 1,
          itemsPerPage: mergedParams.limit || 10,
          queryParams: mergedParams,
          isLoading: false
        });
        
        console.log('✅ Transactions fetched successfully:', response.data.length);
      } else {
        set({
          error: response.message || 'Failed to fetch transactions',
          isLoading: false
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isLoading: false
      });
      console.error('❌ fetchTransactions error:', error);
    }
  },

  // Get transaction by ID
  getTransactionById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔄 Getting transaction by ID:', id);
      
      const response = await transactionService.getTransactionById(id);
      
      if (response.success && response.data) {
        set({
          currentTransaction: response.data,
          isLoading: false
        });
        
        console.log('✅ Transaction fetched successfully:', response.data);
        return response.data;
      } else {
        set({
          error: response.message || 'Transaction not found',
          isLoading: false
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isLoading: false
      });
      console.error('❌ getTransactionById error:', error);
      return null;
    }
  },

  // Create new transaction
  createTransaction: async (data: CreateTransactionRequest) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔄 Creating transaction:', data);
      
      const response = await transactionService.createTransaction(data);
      
      if (response.success) {
        // Refresh transactions list
        await get().fetchTransactions();
        set({ isLoading: false });
        
        console.log('✅ Transaction created successfully');
        return true;
      } else {
        set({
          error: response.message || 'Failed to create transaction',
          isLoading: false
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isLoading: false
      });
      console.error('❌ createTransaction error:', error);
      return false;
    }
  },

  // Update transaction
  updateTransaction: async (id: number, data: UpdateTransactionRequest) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔄 Updating transaction:', { id, data });
      
      const response = await transactionService.updateTransaction(id, data);
      
      if (response.success) {
        // Update current transaction if it's the same one
        if (get().currentTransaction?.id === id && response.data) {
          set({ currentTransaction: response.data });
        }
        
        // Refresh transactions list
        await get().fetchTransactions();
        set({ isLoading: false });
        
        console.log('✅ Transaction updated successfully');
        return true;
      } else {
        set({
          error: response.message || 'Failed to update transaction',
          isLoading: false
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isLoading: false
      });
      console.error('❌ updateTransaction error:', error);
      return false;
    }
  },

  // Delete transaction
  deleteTransaction: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔄 Deleting transaction:', id);
      
      const response = await transactionService.deleteTransaction(id);
      
      if (response.success) {
        // Clear current transaction if it's the deleted one
        if (get().currentTransaction?.id === id) {
          set({ currentTransaction: null });
        }
        
        // Refresh transactions list
        await get().fetchTransactions();
        set({ isLoading: false });
        
        console.log('✅ Transaction deleted successfully');
        return true;
      } else {
        set({
          error: response.message || 'Failed to delete transaction',
          isLoading: false
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isLoading: false
      });
      console.error('❌ deleteTransaction error:', error);
      return false;
    }
  },

  // Close transaction
  closeTransaction: async (id: number) => {
    try {
      console.log('🔄 Closing transaction:', id);
      
      const response = await transactionService.closeTransaction(id);
      
      if (response.success) {
        // Update local state
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === id ? { ...t, status: 'closed' as const } : t
          ),
          currentTransaction: state.currentTransaction?.id === id
            ? { ...state.currentTransaction, status: 'closed' as const }
            : state.currentTransaction
        }));
        
        console.log('✅ Transaction closed successfully');
        return true;
      } else {
        set({ error: response.message || 'Failed to close transaction' });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({ error: errorMessage });
      console.error('❌ closeTransaction error:', error);
      return false;
    }
  },

  // Reopen transaction
  reopenTransaction: async (id: number) => {
    try {
      console.log('🔄 Reopening transaction:', id);
      
      const response = await transactionService.reopenTransaction(id);
      
      if (response.success) {
        // Update local state
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === id ? { ...t, status: 'open' as const } : t
          ),
          currentTransaction: state.currentTransaction?.id === id
            ? { ...state.currentTransaction, status: 'open' as const }
            : state.currentTransaction
        }));
        
        console.log('✅ Transaction reopened successfully');
        return true;
      } else {
        set({ error: response.message || 'Failed to reopen transaction' });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({ error: errorMessage });
      console.error('❌ reopenTransaction error:', error);
      return false;
    }
  },

  // Fetch transaction items
  fetchTransactionItems: async (transactionId: number) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔄 Fetching transaction items for ID:', transactionId);
      
      const response = await transactionService.getTransactionItems(transactionId);
      
      if (response.success) {
        set({
          transactionItems: response.data || [],
          isLoading: false
        });
        
        console.log('✅ Transaction items fetched successfully:', response.data?.length);
      } else {
        set({
          error: response.message || 'Failed to fetch transaction items',
          isLoading: false
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isLoading: false
      });
      console.error('❌ fetchTransactionItems error:', error);
    }
  },

  // Set filters
  setFilters: (filters: TransactionFilters) => {
    console.log('🔧 Setting filters:', filters);
    set(state => ({
      filters,
      queryParams: {
        ...state.queryParams,
        ...filters,
        page: 1 // Reset to first page when filtering
      },
      currentPage: 1
    }));
  },

  // Clear filters
  clearFilters: () => {
    console.log('🧹 Clearing filters');
    set(state => ({
      filters: {},
      queryParams: {
        page: 1,
        limit: state.queryParams.limit || 10,
        sort_by: 'created_at',
        sort_order: 'DESC'
      },
      currentPage: 1
    }));
  },

  // Set query params
  setQueryParams: (params: TransactionQueryParams) => {
    console.log('🔧 Setting query params:', params);
    set(state => ({
      queryParams: { ...state.queryParams, ...params }
    }));
  },

  // Set current page
  setCurrentPage: (page: number) => {
    console.log('📄 Setting current page:', page);
    set(state => ({
      currentPage: page,
      queryParams: { ...state.queryParams, page }
    }));
  },

  // Set items per page
  setItemsPerPage: (limit: number) => {
    console.log('📋 Setting items per page:', limit);
    set(state => ({
      itemsPerPage: limit,
      currentPage: 1,
      queryParams: { ...state.queryParams, limit, page: 1 }
    }));
  },

  // Search transactions
  searchTransactions: async (query: string) => {
    set({ isSearching: true, searchTerm: query, error: null });
    try {
      console.log('🔍 Searching transactions:', query);
      
      if (!query.trim()) {
        set({ 
          searchResults: [], 
          isSearching: false,
          searchTerm: ''
        });
        return;
      }
      
      const response = await transactionService.searchTransactions(query, 20);
      
      if (response.success) {
        set({
          searchResults: response.data || [],
          isSearching: false
        });
        
        console.log('✅ Search completed:', response.data?.length, 'results');
      } else {
        set({
          error: response.message || 'Search failed',
          isSearching: false
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Search error occurred';
      set({
        error: errorMessage,
        isSearching: false
      });
      console.error('❌ searchTransactions error:', error);
    }
  },

  // Clear search
  clearSearch: () => {
    console.log('🧹 Clearing search');
    set({
      searchTerm: '',
      searchResults: [],
      isSearching: false
    });
  },

  // Fetch transaction statistics
  fetchTransactionStats: async (startDate?: string, endDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('📊 Fetching transaction stats:', { startDate, endDate });
      
      const response = await transactionService.getTransactionStats(startDate, endDate);
      
      if (response.success && response.data) {
        set({
          stats: response.data,
          isLoading: false
        });
        
        console.log('✅ Transaction stats fetched successfully');
      } else {
        set({
          error: response.message || 'Failed to fetch transaction statistics',
          isLoading: false
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isLoading: false
      });
      console.error('❌ fetchTransactionStats error:', error);
    }
  },

  // Clear error
  clearError: () => {
    console.log('🧹 Clearing error');
    set({ error: null });
  },

  // Clear current transaction
  clearCurrentTransaction: () => {
    console.log('🧹 Clearing current transaction');
    set({ 
      currentTransaction: null,
      transactionItems: []
    });
  },

  // Refresh transactions
  refreshTransactions: async () => {
    console.log('🔄 Refreshing transactions');
    const params = get().queryParams;
    await get().fetchTransactions(params);
  }
}));