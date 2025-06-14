// src/store/useStock.ts
import { create } from 'zustand';
import { 
  StockMovement, 
  CreateStockMovementRequest,
  BulkAdjustmentRequest,
  StockMovementFilters,
  StockSummary,
  StockAnalytics,
  StockAlertSummary,
  CreateStockMovementResponse,
  BulkAdjustmentResponse
} from '../types/stock.types';
import { stockService } from '../services/stockService';

interface StockStore {
  // State
  stockMovements: StockMovement[];
  currentMovement: StockMovement | null;
  stockSummary: StockSummary | null;
  stockAnalytics: StockAnalytics | null;
  stockAlerts: StockAlertSummary | null;
  recentMovements: StockMovement[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filters
  filters: StockMovementFilters;
  
  // Loading states for specific actions
  isCreatingMovement: boolean;
  isBulkProcessing: boolean;
  isFetchingSummary: boolean;
  isFetchingAnalytics: boolean;
  isFetchingAlerts: boolean;
  isFetchingRecent: boolean;

  // === BASIC CRUD ACTIONS ===
  
  fetchStockMovements: (page?: number, limit?: number) => Promise<void>;
  getStockMovementById: (id: number) => Promise<StockMovement | null>;
  createStockMovement: (data: CreateStockMovementRequest) => Promise<boolean>;
  
  // === SUMMARY & ANALYTICS ACTIONS ===
  
  fetchStockSummary: (lowStockOnly?: boolean) => Promise<void>;
  fetchRecentMovements: (limit?: number) => Promise<void>;
  fetchStockAnalytics: (period?: number) => Promise<void>;
  fetchLowStockAlerts: () => Promise<void>;
  
  // === BULK OPERATIONS ===
  
  performBulkAdjustment: (data: BulkAdjustmentRequest) => Promise<boolean>;
  
  // === FILTER & SEARCH ACTIONS ===
  
  setFilters: (filters: StockMovementFilters) => void;
  clearFilters: () => void;
  searchMovements: (query: string) => void;
  
  // === UTILITY ACTIONS ===
  
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  clearCurrentMovement: () => void;
  refreshAllData: () => Promise<void>;
  resetStore: () => void;
}

export const useStock = create<StockStore>((set, get) => ({
  // Initial State
  stockMovements: [],
  currentMovement: null,
  stockSummary: null,
  stockAnalytics: null,
  stockAlerts: null,
  recentMovements: [],
  isLoading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  
  // Filters
  filters: {},
  
  // Loading states
  isCreatingMovement: false,
  isBulkProcessing: false,
  isFetchingSummary: false,
  isFetchingAnalytics: false,
  isFetchingAlerts: false,
  isFetchingRecent: false,

  // === BASIC CRUD ACTIONS ===

  fetchStockMovements: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      console.log('Store - Fetching stock movements with filters:', filters);
      
      const response = await stockService.getStockMovements(page, limit, filters);
      console.log('Store - Service response:', response);
      
      if (response.success && response.data) {
        set({
          stockMovements: response.data || [],
          currentPage: response.meta?.pagination?.page || page,
          totalPages: response.meta?.pagination?.totalPages || 1,
          totalItems: response.meta?.pagination?.total || 0,
          itemsPerPage: response.meta?.pagination?.limit || limit,
          isLoading: false
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch stock movements', 
          isLoading: false 
        });
      }
    } catch (error: any) {
      console.error('Store - Fetch stock movements error:', error);
      
      let errorMessage = 'Network error occurred';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },

  getStockMovementById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stockService.getStockMovementById(id);
      if (response.success && response.data) {
        set({ 
          currentMovement: response.data, 
          isLoading: false 
        });
        return response.data;
      } else {
        set({ 
          error: response.message || 'Movement not found', 
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

  createStockMovement: async (data: CreateStockMovementRequest) => {
    set({ isCreatingMovement: true, error: null });
    try {
      console.log('=== STORE CREATE STOCK MOVEMENT ===');
      console.log('Data received:', data);
      
      const response = await stockService.createStockMovement(data);
      
      if (response.success) {
        console.log('=== STOCK MOVEMENT CREATED SUCCESSFULLY ===');
        // Refresh stock movements and summary
        await Promise.all([
          get().fetchStockMovements(get().currentPage, get().itemsPerPage),
          get().fetchStockSummary()
        ]);
        set({ isCreatingMovement: false });
        return true;
      } else {
        console.error('=== STOCK MOVEMENT CREATION FAILED ===');
        set({ 
          error: response.message || 'Failed to create stock movement', 
          isCreatingMovement: false 
        });
        return false;
      }
    } catch (error: any) {
      console.error('=== STORE CREATE STOCK MOVEMENT ERROR ===');
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isCreatingMovement: false 
      });
      return false;
    }
  },

  // === SUMMARY & ANALYTICS ACTIONS ===

  fetchStockSummary: async (lowStockOnly = false) => {
    set({ isFetchingSummary: true, error: null });
    try {
      const response = await stockService.getStockSummary(lowStockOnly);
      if (response.success && response.data) {
        set({ 
          stockSummary: response.data, 
          isFetchingSummary: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch stock summary', 
          isFetchingSummary: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isFetchingSummary: false 
      });
    }
  },

  fetchRecentMovements: async (limit = 10) => {
    set({ isFetchingRecent: true, error: null });
    try {
      const response = await stockService.getRecentMovements(limit);
      if (response.success && response.data) {
        set({ 
          recentMovements: response.data, 
          isFetchingRecent: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch recent movements', 
          isFetchingRecent: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isFetchingRecent: false 
      });
    }
  },

  fetchStockAnalytics: async (period = 30) => {
    set({ isFetchingAnalytics: true, error: null });
    try {
      const response = await stockService.getStockAnalytics(period);
      if (response.success && response.data) {
        set({ 
          stockAnalytics: response.data, 
          isFetchingAnalytics: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch stock analytics', 
          isFetchingAnalytics: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isFetchingAnalytics: false 
      });
    }
  },

  fetchLowStockAlerts: async () => {
    set({ isFetchingAlerts: true, error: null });
    try {
      const response = await stockService.getLowStockAlerts();
      if (response.success && response.data) {
        set({ 
          stockAlerts: response.data, 
          isFetchingAlerts: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch stock alerts', 
          isFetchingAlerts: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isFetchingAlerts: false 
      });
    }
  },

  // === BULK OPERATIONS ===

  performBulkAdjustment: async (data: BulkAdjustmentRequest) => {
    set({ isBulkProcessing: true, error: null });
    try {
      console.log('=== STORE BULK ADJUSTMENT ===');
      console.log('Data received:', data);
      
      const response = await stockService.bulkStockAdjustment(data);
      
      if (response.success) {
        console.log('=== BULK ADJUSTMENT COMPLETED ===');
        // Refresh all related data
        await Promise.all([
          get().fetchStockMovements(get().currentPage, get().itemsPerPage),
          get().fetchStockSummary(),
          get().fetchLowStockAlerts()
        ]);
        set({ isBulkProcessing: false });
        return true;
      } else {
        set({ 
          error: response.message || 'Failed to perform bulk adjustment', 
          isBulkProcessing: false 
        });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Network error occurred', 
        isBulkProcessing: false 
      });
      return false;
    }
  },

  // === FILTER & SEARCH ACTIONS ===

  setFilters: (filters: StockMovementFilters) => {
    set({ filters, currentPage: 1 });
    get().fetchStockMovements(1, get().itemsPerPage);
  },

  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
    get().fetchStockMovements(1, get().itemsPerPage);
  },

  searchMovements: (query: string) => {
    const filters = query ? { search: query } : {};
    set({ filters, currentPage: 1 });
    get().fetchStockMovements(1, get().itemsPerPage);
  },

  // === UTILITY ACTIONS ===

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().fetchStockMovements(page, get().itemsPerPage);
  },

  clearError: () => set({ error: null }),
  
  clearCurrentMovement: () => set({ currentMovement: null }),

  refreshAllData: async () => {
    const { currentPage, itemsPerPage } = get();
    
    try {
      await Promise.all([
        get().fetchStockMovements(currentPage, itemsPerPage),
        get().fetchStockSummary(),
        get().fetchRecentMovements(),
        get().fetchLowStockAlerts(),
        get().fetchStockAnalytics()
      ]);
    } catch (error) {
      console.error('Failed to refresh all stock data:', error);
    }
  },

  resetStore: () => set({
    stockMovements: [],
    currentMovement: null,
    stockSummary: null,
    stockAnalytics: null,
    stockAlerts: null,
    recentMovements: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    filters: {},
    isCreatingMovement: false,
    isBulkProcessing: false,
    isFetchingSummary: false,
    isFetchingAnalytics: false,
    isFetchingAlerts: false,
    isFetchingRecent: false,
  }),

  // === ADDITIONAL UTILITY METHODS ===

  // Get movement from current list without API call
  getMovementFromList: (movementId: number) => {
    const { stockMovements } = get();
    return stockMovements.find(m => m.id === movementId) || null;
  },

  // Filter movements by category
  getMovementsByCategory: (categoryId: number) => {
    const { stockMovements } = get();
    return stockMovements.filter(m => m.category_id === categoryId);
  },

  // Filter movements by type
  getMovementsByType: (movementType: 'in' | 'out' | 'adjustment') => {
    const { stockMovements } = get();
    return stockMovements.filter(m => m.movement_type === movementType);
  },

  // Get movements for date range
  getMovementsInDateRange: (startDate: string, endDate: string) => {
    const { stockMovements } = get();
    return stockMovements.filter(m => {
      const movementDate = new Date(m.movement_date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return movementDate >= start && movementDate <= end;
    });
  },

  // Check if any loading state is active
  isAnyLoading: () => {
    const { 
      isLoading, 
      isCreatingMovement, 
      isBulkProcessing, 
      isFetchingSummary, 
      isFetchingAnalytics, 
      isFetchingAlerts, 
      isFetchingRecent 
    } = get();
    
    return isLoading || isCreatingMovement || isBulkProcessing || 
           isFetchingSummary || isFetchingAnalytics || isFetchingAlerts || 
           isFetchingRecent;
  },

  // Get current filters as display string
  getFiltersDisplayString: () => {
    const { filters } = get();
    const activeFilters: string[] = [];
    
    if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
    if (filters.movement_type) activeFilters.push(`Type: ${stockService.formatMovementType(filters.movement_type)}`);
    if (filters.category_id) activeFilters.push(`Category ID: ${filters.category_id}`);
    if (filters.reference_type) activeFilters.push(`Reference: ${filters.reference_type}`);
    if (filters.start_date) activeFilters.push(`From: ${filters.start_date}`);
    if (filters.end_date) activeFilters.push(`To: ${filters.end_date}`);
    
    return activeFilters.join(', ') || 'No active filters';
  },

  // Get stock statistics from current summary
  getStockStatistics: () => {
    const { stockSummary } = get();
    if (!stockSummary) return null;
    
    return {
      total: stockSummary.total_categories,
      lowStock: stockSummary.low_stock_count,
      outOfStock: stockSummary.out_of_stock_count,
      inStock: stockSummary.total_categories - stockSummary.low_stock_count - stockSummary.out_of_stock_count
    };
  },

  // Get critical alerts count
  getCriticalAlertsCount: () => {
    const { stockAlerts } = get();
    return stockAlerts?.critical_count || 0;
  },

  // Get high priority alerts count
  getHighPriorityAlertsCount: () => {
    const { stockAlerts } = get();
    return stockAlerts?.high_count || 0;
  },

  // Get total alerts count
  getTotalAlertsCount: () => {
    const { stockAlerts } = get();
    return stockAlerts?.total_alerts || 0;
  },

  // Get recent movements count
  getRecentMovementsCount: () => {
    const { recentMovements } = get();
    return recentMovements.length;
  },

  // Check if category has low stock
  isCategoryLowStock: (categoryId: number) => {
    const { stockSummary } = get();
    if (!stockSummary) return false;
    
    const category = stockSummary.categories.find(c => c.id === categoryId);
    return category?.is_low_stock || false;
  },

  // Get category current stock
  getCategoryCurrentStock: (categoryId: number) => {
    const { stockSummary } = get();
    if (!stockSummary) return 0;
    
    const category = stockSummary.categories.find(c => c.id === categoryId);
    return category?.current_stock || 0;
  },

  // Validate movement data before create
  validateMovementData: (data: CreateStockMovementRequest) => {
    const errors: string[] = [];
    
    const categoryValidation = stockService.validateCategoryId(data.category_id);
    if (!categoryValidation.isValid) errors.push(categoryValidation.error!);
    
    const typeValidation = stockService.validateMovementType(data.movement_type);
    if (!typeValidation.isValid) errors.push(typeValidation.error!);
    
    const quantityValidation = stockService.validateQuantity(data.quantity);
    if (!quantityValidation.isValid) errors.push(quantityValidation.error!);
    
    const notesValidation = stockService.validateNotes(data.notes);
    if (!notesValidation.isValid) errors.push(notesValidation.error!);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Get movements summary by type
  getMovementsSummaryByType: () => {
    const { stockMovements } = get();
    const summary = {
      in: 0,
      out: 0,
      adjustment: 0,
      total: stockMovements.length
    };
    
    stockMovements.forEach(movement => {
      summary[movement.movement_type] += movement.quantity;
    });
    
    return summary;
  },

  // Get movements for specific date
  getMovementsForDate: (date: string) => {
    const { stockMovements } = get();
    return stockMovements.filter(m => {
      const movementDate = new Date(m.movement_date).toDateString();
      const targetDate = new Date(date).toDateString();
      return movementDate === targetDate;
    });
  },

  // Get latest movement for category
  getLatestMovementForCategory: (categoryId: number) => {
    const { stockMovements } = get();
    const categoryMovements = stockMovements
      .filter(m => m.category_id === categoryId)
      .sort((a, b) => new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime());
    
    return categoryMovements[0] || null;
  },

  // Calculate total stock value if prices are available
  calculateTotalStockValue: () => {
    const { stockSummary } = get();
    if (!stockSummary) return 0;
    
    // This would need price information from categories or products
    // For now, just return count
    return stockSummary.categories.reduce((total, category) => {
      return total + category.current_stock;
    }, 0);
  },

  // Get stock trend analysis
  getStockTrendAnalysis: () => {
    const { stockAnalytics } = get();
    if (!stockAnalytics) return null;
    
    const { movements_by_type, daily_trends } = stockAnalytics;
    const dates = Object.keys(daily_trends).sort();
    
    if (dates.length < 2) return null;
    
    const firstDate = daily_trends[dates[0]];
    const lastDate = daily_trends[dates[dates.length - 1]];
    
    return {
      totalIn: movements_by_type.in || 0,
      totalOut: movements_by_type.out || 0,
      totalAdjustments: movements_by_type.adjustment || 0,
      trend: {
        inTrend: lastDate.in - firstDate.in,
        outTrend: lastDate.out - firstDate.out,
        adjustmentTrend: lastDate.adjustment - firstDate.adjustment
      },
      period: stockAnalytics.period_days
    };
  },

  // Export stock data for reporting
  exportStockData: (type: 'movements' | 'summary' | 'alerts') => {
    const state = get();
    
    switch (type) {
      case 'movements':
        return {
          data: state.stockMovements,
          filename: `stock-movements-${new Date().toISOString().split('T')[0]}.json`,
          headers: ['ID', 'Category', 'Type', 'Quantity', 'Before Stock', 'After Stock', 'Date', 'Notes']
        };
      
      case 'summary':
        return {
          data: state.stockSummary?.categories || [],
          filename: `stock-summary-${new Date().toISOString().split('T')[0]}.json`,
          headers: ['ID', 'Name', 'Code', 'Current Stock', 'Min Stock', 'Max Stock', 'Status']
        };
      
      case 'alerts':
        return {
          data: state.stockAlerts?.alerts || [],
          filename: `stock-alerts-${new Date().toISOString().split('T')[0]}.json`,
          headers: ['ID', 'Name', 'Current Stock', 'Reorder Point', 'Urgency', 'Shortage']
        };
      
      default:
        return null;
    }
  }
}));