// src/types/category.types.ts
export interface Category {
  id: number;
  name: string;
  code: string;
  has_stock: boolean;
  min_stock: number;
  max_stock: number;
  current_stock: number;
  unit: string | null;
  reorder_point: number;
  is_low_stock: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  products?: Product[]; // When included in response
}

export interface Product {
  product_id: number;
  brand: string;
  model: string;
  status: string;
  condition: string;
}

export interface CreateCategoryRequest {
  name: string;
  code: string;
  has_stock?: boolean;
  min_stock?: number;
  max_stock?: number;
  current_stock?: number;
  unit?: string;
  reorder_point?: number;
  notes?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryFilters {
  search?: string;
  has_stock?: boolean;
  is_low_stock?: boolean;
  code?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface StockAdjustment {
  categoryId: number;
  quantity: number;
  notes?: string;
}

export interface UpdateStockRequest {
  quantity: number;
  notes?: string;
  movement_type?: 'in' | 'out' | 'adjustment';
}

export interface StockMovementInfo {
  oldStock: number;
  newStock: number;
  change: number;
}

export interface CategoryStats {
  total: number;
  withStock: number;
  lowStock: number;
  totalStockValue: number;
  topStock: Category[];
  criticalStock: Category[];
}

export interface BulkAdjustmentResult {
  categoryId: number;
  success: boolean;
  oldStock?: number;
  newStock?: number;
  change?: number;
  error?: string;
}

export interface BulkAdjustmentResponse {
  results: BulkAdjustmentResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  pagination: PaginationInfo;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface StockUpdateResponse {
  category: Category;
  stockMovement: StockMovementInfo;
}