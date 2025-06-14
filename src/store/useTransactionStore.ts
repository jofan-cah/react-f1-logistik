// src/store/useTransactionStore.ts
import { create } from 'zustand';
import {
  Transaction,
  TransactionItem,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryParams,
  TransactionFilters,
  TransactionStats
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
  
  // Statistics (matches backend response)
  stats: TransactionStats | null;
  
  // Loading states for specific actions
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isClosing: boolean;
  isFetchingStats: boolean;
  
  // Actions - Transaction CRUD
  fetchTransactions: (params?: TransactionQueryParams) => Promise<void>;
  getTransactionById: (id: number) => Promise<Transaction | null>;
  createTransaction: (data: CreateTransactionRequest) => Promise<boolean>;
  updateTransaction: (id: number, data: UpdateTransactionRequest) => Promise<boolean>;
  deleteTransaction: (id: number) => Promise<boolean>;
  
  // Actions - Transaction Operations
  closeTransaction: (id: number) => Promise<boolean>;
  reopenTransaction: (id: number) => Promise<boolean>;
  generateQRCode: (id: number) => Promise<any>;
  
  // Actions - Transaction Items
  addTransactionItem: (transactionId: number, itemData: any) => Promise<boolean>;
  removeTransactionItem: (transactionId: number, itemId: number) => Promise<boolean>;
  
  // Actions - Filters and Search
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  setQueryParams: (params: TransactionQueryParams) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  searchTransactions: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Actions - Statistics
  fetchTransactionStats: () => Promise<void>;
  
  // Actions - Utility
  clearError: () => void;
  clearCurrentTransaction: () => void;
  refreshTransactions: () => Promise<void>;
  resetStore: () => void;
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
    sort_by: 'transaction_date',
    sort_order: 'DESC'
  },
  
  // Search
  searchTerm: '',
  searchResults: [],
  isSearching: false,
  
  // Statistics
  stats: null,
  
  // Loading states
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isClosing: false,
  isFetchingStats: false,

  // Fetch all transactions
  fetchTransactions: async (params?: TransactionQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const currentParams = get().queryParams;
      const mergedParams = { ...currentParams, ...params };
      
      console.log('🔄 Fetching transactions with params:', mergedParams);
      
      const response = await transactionService.getTransactions(mergedParams);
      
      if (response.success && response.data) {
        // Handle pagination from backend response
        const pagination = response.meta?.pagination;
        
        set({
          transactions: response.data,
          totalItems: pagination?.total || response.count || response.data.length,
          totalPages: pagination?.totalPages || Math.ceil((response.count || response.data.length) / (mergedParams.limit || 10)),
          currentPage: pagination?.page || mergedParams.page || 1,
          itemsPerPage: pagination?.limit || mergedParams.limit || 10,
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
          // Also set transaction items if included
          transactionItems: response.data.items || response.data.TransactionItems || [],
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
    set({ isCreating: true, error: null });
    try {
      console.log('🔄 Creating transaction:', data);
      
      // Frontend validation
      const validation = transactionService.validateTransactionData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await transactionService.createTransaction(data);
      
      if (response.success) {
        // Refresh transactions list
        await get().fetchTransactions();
        set({ isCreating: false });
        
        console.log('✅ Transaction created successfully');
        return true;
      } else {
        set({
          error: response.message || 'Failed to create transaction',
          isCreating: false
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isCreating: false
      });
      console.error('❌ createTransaction error:', error);
      return false;
    }
  },

  // Update transaction
  updateTransaction: async (id: number, data: UpdateTransactionRequest) => {
    set({ isUpdating: true, error: null });
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
        set({ isUpdating: false });
        
        console.log('✅ Transaction updated successfully');
        return true;
      } else {
        set({
          error: response.message || 'Failed to update transaction',
          isUpdating: false
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isUpdating: false
      });
      console.error('❌ updateTransaction error:', error);
      return false;
    }
  },

  // Delete transaction
  deleteTransaction: async (id: number) => {
    set({ isDeleting: true, error: null });
    try {
      console.log('🔄 Deleting transaction:', id);
      
      const response = await transactionService.deleteTransaction(id);
      
      if (response.success) {
        // Clear current transaction if it's the deleted one
        if (get().currentTransaction?.id === id) {
          set({ currentTransaction: null, transactionItems: [] });
        }
        
        // Refresh transactions list
        await get().fetchTransactions();
        set({ isDeleting: false });
        
        console.log('✅ Transaction deleted successfully');
        return true;
      } else {
        set({
          error: response.message || 'Failed to delete transaction',
          isDeleting: false
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isDeleting: false
      });
      console.error('❌ deleteTransaction error:', error);
      return false;
    }
  },

  // Close transaction (uses backend endpoint)
  closeTransaction: async (id: number) => {
    set({ isClosing: true, error: null });
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
            : state.currentTransaction,
          isClosing: false
        }));
        
        console.log('✅ Transaction closed successfully');
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to close transaction',
          isClosing: false 
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({ 
        error: errorMessage,
        isClosing: false 
      });
      console.error('❌ closeTransaction error:', error);
      return false;
    }
  },

  // Reopen transaction
  reopenTransaction: async (id: number) => {
    set({ isUpdating: true, error: null });
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
            : state.currentTransaction,
          isUpdating: false
        }));
        
        console.log('✅ Transaction reopened successfully');
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to reopen transaction',
          isUpdating: false 
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({ 
        error: errorMessage,
        isUpdating: false 
      });
      console.error('❌ reopenTransaction error:', error);
      return false;
    }
  },

  // Generate QR code (backend endpoint)
  generateQRCode: async (id: number) => {
    set({ error: null });
    try {
      console.log('🔄 Generating QR code for transaction:', id);
      
      const response = await transactionService.generateTransactionQRCode(id);
      
      if (response.success) {
        console.log('✅ QR code generated successfully');
        return response.data;
      } else {
        set({ error: response.message || 'Failed to generate QR code' });
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({ error: errorMessage });
      console.error('❌ generateQRCode error:', error);
      return null;
    }
  },

  // Add transaction item (backend endpoint)
  addTransactionItem: async (transactionId: number, itemData: any) => {
    set({ isUpdating: true, error: null });
    try {
      console.log('🔄 Adding item to transaction:', { transactionId, itemData });
      
      const response = await transactionService.addTransactionItem(transactionId, itemData);
      
      if (response.success) {
        // Refresh current transaction
        await get().getTransactionById(transactionId);
        set({ isUpdating: false });
        
        console.log('✅ Item added to transaction successfully');
        return true;
      } else {
        set({
          error: response.message || 'Failed to add item',
          isUpdating: false
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isUpdating: false
      });
      console.error('❌ addTransactionItem error:', error);
      return false;
    }
  },

  // Remove transaction item (backend endpoint)
  removeTransactionItem: async (transactionId: number, itemId: number) => {
    set({ isUpdating: true, error: null });
    try {
      console.log('🔄 Removing item from transaction:', { transactionId, itemId });
      
      const response = await transactionService.removeTransactionItem(transactionId, itemId);
      
      if (response.success) {
        // Refresh current transaction
        await get().getTransactionById(transactionId);
        set({ isUpdating: false });
        
        console.log('✅ Item removed from transaction successfully');
        return true;
      } else {
        set({
          error: response.message || 'Failed to remove item',
          isUpdating: false
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isUpdating: false
      });
      console.error('❌ removeTransactionItem error:', error);
      return false;
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
        sort_by: 'transaction_date',
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

  // Fetch transaction statistics (backend endpoint)
  fetchTransactionStats: async () => {
    set({ isFetchingStats: true, error: null });
    try {
      console.log('📊 Fetching transaction stats from backend');
      
      const response = await transactionService.getTransactionStats();
      
      if (response.success && response.data) {
        set({
          stats: response.data,
          isFetchingStats: false
        });
        
        console.log('✅ Transaction stats fetched successfully');
      } else {
        set({
          error: response.message || 'Failed to fetch transaction statistics',
          isFetchingStats: false
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error occurred';
      set({
        error: errorMessage,
        isFetchingStats: false
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
  },

  // Reset store to initial state
  resetStore: () => {
    console.log('🔄 Resetting transaction store');
    set({
      transactions: [],
      currentTransaction: null,
      transactionItems: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      filters: {},
      queryParams: {
        page: 1,
        limit: 10,
        sort_by: 'transaction_date',
        sort_order: 'DESC'
      },
      searchTerm: '',
      searchResults: [],
      isSearching: false,
      stats: null,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isClosing: false,
      isFetchingStats: false
    });
  },

  // Utility methods
  getTransactionById_local: (id: number) => {
    const { transactions } = get();
    return transactions.find(t => t.id === id) || null;
  },

  getTransactionsByType: (type: string) => {
    const { transactions } = get();
    return transactions.filter(t => t.transaction_type === type);
  },

  getTransactionsByStatus: (status: string) => {
    const { transactions } = get();
    return transactions.filter(t => t.status === status);
  },

  isAnyLoading: () => {
    const { isLoading, isCreating, isUpdating, isDeleting, isClosing, isFetchingStats, isSearching } = get();
    return isLoading || isCreating || isUpdating || isDeleting || isClosing || isFetchingStats || isSearching;
  },

  getStatsDisplay: () => {
    const { stats } = get();
    if (!stats) return null;

    return {
      total: stats.total,
      open: stats.byStatus.open,
      closed: stats.byStatus.closed,
      checkOut: stats.byType.check_out,
      checkIn: stats.byType.check_in,
      repair: stats.byType.repair || 0,
      lost: stats.byType.lost || 0,
      maintenance: stats.byType.maintenance,
      transfer: stats.byType.transfer
    };
  }
}));