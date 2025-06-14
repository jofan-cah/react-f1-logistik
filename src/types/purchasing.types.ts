// src/types/purchasing.types.ts

export type PurchaseReceiptStatus = 'completed' | 'pending' | 'cancelled';
export type ItemCondition = 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';

// Base entities
export interface Supplier {
  id: number;
  name: string;
  code?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string;
  has_stock: boolean;
  current_stock: number;
  reorder_point: number;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

// Purchase Receipt Item
export interface PurchaseReceiptItem {
  id: number;
  receipt_id: number;
  category_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  serial_numbers?: string;
  condition: ItemCondition;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: Category;
}

// Main Purchase Receipt
export interface PurchaseReceipt {
  id: number;
  receipt_number: string;
  po_number: string;
  supplier_id: number;
  receipt_date: string;
  total_amount: number;
  status: PurchaseReceiptStatus;
  created_by: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  supplier?: Supplier;
  items?: PurchaseReceiptItem[];
}

// Request DTOs
export interface CreatePurchaseReceiptRequest {
  receipt_number?: string; // Auto-generated if not provided
  po_number: string;
  supplier_id: number;
  receipt_date?: string; // Default: today
  status?: PurchaseReceiptStatus; // Default: completed
  notes?: string;
  items?: CreatePurchaseReceiptItemRequest[];
}

export interface CreatePurchaseReceiptItemRequest {
  category_id: number;
  quantity: number;
  unit_price: number;
  serial_numbers?: string;
  condition?: ItemCondition; // Default: New
  notes?: string;
  generate_products?: boolean; // Generate individual products
}

export interface UpdatePurchaseReceiptRequest {
  receipt_number?: string;
  po_number?: string;
  supplier_id?: number;
  receipt_date?: string;
  status?: PurchaseReceiptStatus;
  notes?: string;
}

export interface AddReceiptItemRequest {
  category_id: number;
  quantity: number;
  unit_price: number;
  serial_numbers?: string;
  condition?: ItemCondition;
  notes?: string;
}

// Filters and Query Parameters
export interface PurchaseReceiptFilters {
  search?: string; // Search in receipt_number or po_number
  supplier_id?: number;
  status?: PurchaseReceiptStatus;
  receipt_date?: string;
  receipt_date_from?: string;
  receipt_date_to?: string;
}

export interface PurchaseReceiptQueryParams extends PurchaseReceiptFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

// Statistics
export interface PurchaseStats {
  total_receipts: number;
  completed_receipts: number;
  pending_receipts: number;
  total_amount: number;
  this_month_amount: number;
  recent_receipts: Array<{
    id: number;
    receipt_number: string;
    receipt_date: string;
    total_amount: number;
    status: PurchaseReceiptStatus;
    supplier?: {
      name: string;
    };
  }>;
  top_suppliers: Array<{
    supplier_id: number;
    receipt_count: number;
    total_amount: number;
    supplier?: {
      name: string;
    };
  }>;
}

// Common Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Store State Types
export interface PurchasingListState {
  receipts: PurchaseReceipt[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  filters: PurchaseReceiptFilters;
  selectedReceipts: number[];
}

export interface PurchasingDetailState {
  currentReceipt: PurchaseReceipt | null;
}

export interface PurchasingStatsState {
  stats: PurchaseStats | null;
}

// Form Validation Types
export interface PurchaseReceiptFormErrors {
  receipt_number?: string;
  po_number?: string;
  supplier_id?: string;
  receipt_date?: string;
  status?: string;
  notes?: string;
  items?: string;
}

export interface PurchaseReceiptItemFormErrors {
  category_id?: string;
  quantity?: string;
  unit_price?: string;
  serial_numbers?: string;
  condition?: string;
  notes?: string;
}

// Product Generation (hasil dari purchasing)
export interface Product {
  id: number;
  product_id: string;
  category_id: number;
  supplier_id: number;
  po_number: string;
  receipt_item_id?: number;
  status: string;
  condition: ItemCondition;
  quantity: number;
  purchase_date: string;
  purchase_price: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: Category;
  supplier?: Supplier;
}

// Stock Movement (untuk tracking pergerakan stock)
export interface StockMovement {
  id: number;
  category_id: number;
  movement_type: 'in' | 'out';
  quantity: number;
  reference_type: string;
  reference_id: number;
  before_stock: number;
  after_stock: number;
  created_by: number;
  notes?: string;
  created_at: string;
  
  // Relations
  category?: Category;
}

// Legacy compatibility types
export interface PurchaseReceiptListResponse {
  success: boolean;
  data: {
    receipts: PurchaseReceipt[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}