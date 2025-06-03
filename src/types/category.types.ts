// src/types/category.types.ts
export interface Category {
  id: number;
  name: string;
  code: string;
  has_stock: boolean;
  min_stock: number;
  unit: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  products_count?: number; // Computed field for display
}

export interface CreateCategoryRequest {
  name: string;
  code: string;
  has_stock?: boolean;
  min_stock?: number;
  unit?: string;
  notes?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryFilters {
  search?: string;
  has_stock?: boolean;
}

export interface CategoryListResponse {
  success: boolean;
  count: number;
  data: Category[];
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}