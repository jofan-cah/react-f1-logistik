// src/store/usePurchasingStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  PurchaseReceipt,
  PurchaseReceiptItem,
  CreatePurchaseReceiptRequest,
  UpdatePurchaseReceiptRequest,
  AddReceiptItemRequest,
  PurchaseReceiptFilters,
  PurchaseReceiptQueryParams,
  PurchaseStats,
  PurchasingListState,
  PurchasingDetailState,
  PurchasingStatsState
} from '../types/purchasing.types';
import { purchasingService } from '../services/purchasingService';

interface PurchasingStore extends PurchasingListState, PurchasingDetailState, PurchasingStatsState {
  // List Actions
  fetchReceipts: (params?: PurchaseReceiptQueryParams) => Promise<void>;
  setFilters: (filters: Partial<PurchaseReceiptFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  selectReceipt: (receiptId: number) => void;
  unselectReceipt: (receiptId: number) => void;
  selectAllReceipts: () => void;
  clearSelection: () => void;
  
  // Detail Actions
  fetchReceiptById: (id: number) => Promise<void>;
  clearReceiptDetail: () => void;
  
  // CRUD Actions
  createReceipt: (data: CreatePurchaseReceiptRequest) => Promise<PurchaseReceipt>;
  updateReceipt: (id: number, data: UpdatePurchaseReceiptRequest) => Promise<PurchaseReceipt>;
  deleteReceipt: (id: number) => Promise<void>;
  
  // Status Actions
  completeReceipt: (id: number) => Promise<PurchaseReceipt>;
  cancelReceipt: (id: number) => Promise<PurchaseReceipt>;
  updateReceiptStatus: (id: number, status: string) => Promise<PurchaseReceipt>;
  
  // Item Actions
  addReceiptItem: (receiptId: number, itemData: AddReceiptItemRequest) => Promise<PurchaseReceiptItem>;
  removeReceiptItem: (receiptId: number, itemId: number) => Promise<void>;
  
  // Stats Actions
  fetchPurchaseStats: () => Promise<void>;
  
  // Utility Actions
  refreshReceipts: () => Promise<void>;
  searchReceipts: (searchTerm: string) => Promise<void>;
  
  // Legacy Actions (for backward compatibility)
  fetchReceiptsLegacy: (page?: number, limit?: number, filters?: any) => Promise<void>;
  
  // Error handling
  clearError: () => void;
}

const initialFilters: PurchaseReceiptFilters = {
  search: '',
  supplier_id: undefined,
  status: undefined,
  receipt_date: undefined,
};

export const usePurchasingStore = create<PurchasingStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      receipts: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      filters: initialFilters,
      selectedReceipts: [],
      
      currentReceipt: null,
      
      stats: null,

      // List Actions
      fetchReceipts: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const currentState = get();
          const queryParams = params || {
            ...currentState.filters,
            page: currentState.currentPage,
            limit: currentState.itemsPerPage,
          };

          console.log('Store - Fetching receipts with params:', queryParams);
          const response = await purchasingService.getPurchaseReceipts(queryParams);
          
          set({
            receipts: response.data,
            currentPage: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.total,
            itemsPerPage: response.pagination.limit,
            isLoading: false,
          });
          
          console.log('Store - Receipts fetched successfully:', response.data.length);
        } catch (error: any) {
          console.error('Store - Error fetching receipts:', error);
          set({
            error: error.message || 'Failed to fetch purchase receipts',
            isLoading: false,
          });
        }
      },

      // Legacy method for backward compatibility
      fetchReceiptsLegacy: async (page = 1, limit = 10, filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await purchasingService.getPurchaseReceiptsLegacy(page, limit, filters);
          
          if (response.success && response.data) {
            set({
              receipts: response.data.receipts,
              currentPage: response.data.pagination.page,
              totalPages: response.data.pagination.totalPages,
              totalItems: response.data.pagination.total,
              itemsPerPage: response.data.pagination.limit,
              isLoading: false
            });
          } else {
            throw new Error('Failed to fetch purchase receipts');
          }
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || error.message || 'Network error occurred', 
            isLoading: false 
          });
        }
      },

      setFilters: (newFilters) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        
        set({ 
          filters: updatedFilters,
          currentPage: 1 // Reset to first page
        });
        
        // Auto-fetch with new filters
        get().fetchReceipts();
      },

      clearFilters: () => {
        set({ 
          filters: initialFilters,
          currentPage: 1
        });
        get().fetchReceipts();
      },

      setPage: (page) => {
        set({ currentPage: page });
        get().fetchReceipts();
      },

      setLimit: (limit) => {
        set({ itemsPerPage: limit, currentPage: 1 });
        get().fetchReceipts();
      },

      selectReceipt: (receiptId) => {
        const selectedReceipts = get().selectedReceipts;
        if (!selectedReceipts.includes(receiptId)) {
          set({ selectedReceipts: [...selectedReceipts, receiptId] });
        }
      },

      unselectReceipt: (receiptId) => {
        set({ 
          selectedReceipts: get().selectedReceipts.filter(id => id !== receiptId) 
        });
      },

      selectAllReceipts: () => {
        const allReceiptIds = get().receipts.map(receipt => receipt.id);
        set({ selectedReceipts: allReceiptIds });
      },

      clearSelection: () => {
        set({ selectedReceipts: [] });
      },

      // Detail Actions
      fetchReceiptById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Store - Fetching receipt by ID:', id);
          const receipt = await purchasingService.getPurchaseReceiptById(id);
          set({ currentReceipt: receipt, isLoading: false });
          console.log('Store - Receipt fetched successfully:', receipt);
        } catch (error: any) {
          console.error('Store - Error fetching receipt:', error);
          set({
            error: error.message || 'Failed to fetch purchase receipt',
            isLoading: false,
          });
        }
      },

      clearReceiptDetail: () => {
        set({ currentReceipt: null, error: null });
      },

      // CRUD Actions
      createReceipt: async (data) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Store - Creating receipt:', data);
          const newReceipt = await purchasingService.createPurchaseReceipt(data);
          
          // Add to current list if we're on first page
          const currentState = get();
          if (currentState.currentPage === 1) {
            set({ 
              receipts: [newReceipt, ...currentState.receipts],
              totalItems: currentState.totalItems + 1,
              isLoading: false 
            });
          } else {
            // Refresh the list
            await get().fetchReceipts();
          }
          
          console.log('Store - Receipt created successfully:', newReceipt);
          return newReceipt;
        } catch (error: any) {
          console.error('Store - Error creating receipt:', error);
          set({
            error: error.message || 'Failed to create purchase receipt',
            isLoading: false,
          });
          throw error;
        }
      },

      updateReceipt: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Store - Updating receipt:', id, data);
          const updatedReceipt = await purchasingService.updatePurchaseReceipt(id, data);
          
          // Update in current list
          const currentReceipts = get().receipts;
          const updatedReceipts = currentReceipts.map(receipt => 
            receipt.id === id ? updatedReceipt : receipt
          );
          
          set({ 
            receipts: updatedReceipts,
            currentReceipt: get().currentReceipt?.id === id ? updatedReceipt : get().currentReceipt,
            isLoading: false 
          });
          
          console.log('Store - Receipt updated successfully:', updatedReceipt);
          return updatedReceipt;
        } catch (error: any) {
          console.error('Store - Error updating receipt:', error);
          set({
            error: error.message || 'Failed to update purchase receipt',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteReceipt: async (id) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Store - Deleting receipt:', id);
          await purchasingService.deletePurchaseReceipt(id);
          
          // Remove from current list and update counts
          const currentState = get();
          const filteredReceipts = currentState.receipts.filter(receipt => receipt.id !== id);
          const newTotal = currentState.totalItems - 1;
          const newTotalPages = Math.ceil(newTotal / currentState.itemsPerPage);
          
          // If current page becomes empty and it's not the first page, go to previous page
          let newCurrentPage = currentState.currentPage;
          if (filteredReceipts.length === 0 && currentState.currentPage > 1) {
            newCurrentPage = currentState.currentPage - 1;
          }
          
          set({ 
            receipts: filteredReceipts,
            selectedReceipts: currentState.selectedReceipts.filter(selectedId => selectedId !== id),
            totalItems: newTotal,
            totalPages: newTotalPages,
            currentPage: newCurrentPage,
            isLoading: false 
          });
          
          // If we moved to a different page or the list is empty, refresh
          if (newCurrentPage !== currentState.currentPage || filteredReceipts.length === 0) {
            await get().fetchReceipts();
          }
          
          console.log('Store - Receipt deleted successfully');
        } catch (error: any) {
          console.error('Store - Error deleting receipt:', error);
          set({
            error: error.message || 'Failed to delete purchase receipt',
            isLoading: false,
          });
          throw error;
        }
      },

      // Status Actions
      completeReceipt: async (id) => {
        try {
          console.log('Store - Completing receipt:', id);
          const updatedReceipt = await purchasingService.completeReceipt(id);
          
          // Update in current list
          const currentReceipts = get().receipts;
          const updatedReceipts = currentReceipts.map(receipt => 
            receipt.id === id ? updatedReceipt : receipt
          );
          
          set({ 
            receipts: updatedReceipts,
            currentReceipt: get().currentReceipt?.id === id ? updatedReceipt : get().currentReceipt,
          });
          
          console.log('Store - Receipt completed successfully');
          return updatedReceipt;
        } catch (error: any) {
          console.error('Store - Error completing receipt:', error);
          set({ error: error.message || 'Failed to complete receipt' });
          throw error;
        }
      },

      cancelReceipt: async (id) => {
        try {
          console.log('Store - Cancelling receipt:', id);
          const updatedReceipt = await purchasingService.cancelReceipt(id);
          
          // Update in current list
          const currentReceipts = get().receipts;
          const updatedReceipts = currentReceipts.map(receipt => 
            receipt.id === id ? updatedReceipt : receipt
          );
          
          set({ 
            receipts: updatedReceipts,
            currentReceipt: get().currentReceipt?.id === id ? updatedReceipt : get().currentReceipt,
          });
          
          console.log('Store - Receipt cancelled successfully');
          return updatedReceipt;
        } catch (error: any) {
          console.error('Store - Error cancelling receipt:', error);
          set({ error: error.message || 'Failed to cancel receipt' });
          throw error;
        }
      },

      updateReceiptStatus: async (id, status) => {
        try {
          console.log('Store - Updating receipt status:', id, status);
          const updatedReceipt = await purchasingService.updateReceiptStatus(id, status);
          
          // Update in current list
          const currentReceipts = get().receipts;
          const updatedReceipts = currentReceipts.map(receipt => 
            receipt.id === id ? updatedReceipt : receipt
          );
          
          set({ 
            receipts: updatedReceipts,
            currentReceipt: get().currentReceipt?.id === id ? updatedReceipt : get().currentReceipt,
          });
          
          console.log('Store - Receipt status updated successfully');
          return updatedReceipt;
        } catch (error: any) {
          console.error('Store - Error updating receipt status:', error);
          set({ error: error.message || 'Failed to update receipt status' });
          throw error;
        }
      },

      // Item Actions
      addReceiptItem: async (receiptId, itemData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Store - Adding item to receipt:', receiptId, itemData);
          const newItem = await purchasingService.addReceiptItem(receiptId, itemData);
          
          // Refresh the current receipt if it's loaded
          if (get().currentReceipt?.id === receiptId) {
            await get().fetchReceiptById(receiptId);
          }
          
          // Refresh the receipts list
          await get().fetchReceipts();
          
          set({ isLoading: false });
          console.log('Store - Item added successfully:', newItem);
          return newItem;
        } catch (error: any) {
          console.error('Store - Error adding item:', error);
          set({
            error: error.message || 'Failed to add item to receipt',
            isLoading: false,
          });
          throw error;
        }
      },

      removeReceiptItem: async (receiptId, itemId) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Store - Removing item from receipt:', receiptId, itemId);
          await purchasingService.removeReceiptItem(receiptId, itemId);
          
          // Refresh the current receipt if it's loaded
          if (get().currentReceipt?.id === receiptId) {
            await get().fetchReceiptById(receiptId);
          }
          
          // Refresh the receipts list
          await get().fetchReceipts();
          
          set({ isLoading: false });
          console.log('Store - Item removed successfully');
        } catch (error: any) {
          console.error('Store - Error removing item:', error);
          set({
            error: error.message || 'Failed to remove item from receipt',
            isLoading: false,
          });
          throw error;
        }
      },

      // Stats Actions
      fetchPurchaseStats: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Store - Fetching purchase statistics');
          const stats = await purchasingService.getPurchaseStats();
          set({ stats, isLoading: false });
          console.log('Store - Statistics fetched successfully:', stats);
        } catch (error: any) {
          console.error('Store - Error fetching stats:', error);
          set({
            error: error.message || 'Failed to fetch purchase statistics',
            isLoading: false,
          });
        }
      },

      // Utility Actions
      refreshReceipts: async () => {
        await get().fetchReceipts();
      },

      searchReceipts: async (searchTerm) => {
        get().setFilters({ search: searchTerm });
      },

      // Error handling
      clearError: () => set({ error: null }),
    }),
    {
      name: 'purchasing-store',
    }
  )
);