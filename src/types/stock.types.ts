// src/types/stock.types.ts

export interface Category {
  id: number;
  name: string;
  code: string;
  unit: string;
  has_stock: boolean;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface StockMovement {
  id: number;
  category_id: number;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_type: string;
  reference_id?: number;
  before_stock: number;
  after_stock: number;
  movement_date: string;
  created_by: string | number;
  notes?: string;
  category?: Category;
}

export interface CreateStockMovementRequest {
  category_id: number;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  notes?: string;
  reference_type?: string;
  reference_id?: number;
}

export interface BulkAdjustment {
  category_id: number;
  quantity: number;
  notes?: string;
}

export interface BulkAdjustmentRequest {
  adjustments: BulkAdjustment[];
}

export interface BulkAdjustmentResult {
  category_id: number;
  success: boolean;
  before_stock?: number;
  after_stock?: number;
  change?: number;
  error?: string;
}

export interface StockMovementFilters {
  category_id?: number;
  movement_type?: 'in' | 'out' | 'adjustment';
  reference_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface StockSummary {
  total_categories: number;
  low_stock_count: number;
  out_of_stock_count: number;
  categories: Category[];
}

export interface StockAnalytics {
  period_days: number;
  movements_by_type: {
    in?: number;
    out?: number;
    adjustment?: number;
  };
  daily_trends: {
    [date: string]: {
      in: number;
      out: number;
      adjustment: number;
    };
  };
  top_categories: {
    name: string;
    in: number;
    out: number;
    adjustment: number;
    total: number;
  }[];
  total_movements: number;
}

export interface StockAlert {
  id: number;
  name: string;
  code: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  reorder_point: number;
  urgency: 'critical' | 'high' | 'medium';
  shortage: number;
}

export interface StockAlertSummary {
  alerts: StockAlert[];
  total_alerts: number;
  critical_count: number;
  high_count: number;
}

export interface CreateStockMovementResponse {
  movement: StockMovement;
  updated_stock: number;
  is_low_stock: boolean;
}

export interface BulkAdjustmentResponse {
  results: BulkAdjustmentResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  };
}