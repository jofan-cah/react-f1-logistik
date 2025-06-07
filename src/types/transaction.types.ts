// src/types/transaction.types.ts

export interface Product {
  id: string;
  name: string;
  category?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'Available' | 'Checked Out' | 'Maintenance' | 'Lost' | 'Repair';
  location?: string;
  last_maintenance_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: string;
  quantity: number;
  condition_before: 'excellent' | 'good' | 'fair' | 'poor';
  condition_after?: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'processed' | 'pending' | 'returned';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  Product?: Product;
}

export interface Transaction {
  id?: number;
  transaction_type: 'check_out' | 'check_in' | 'maintenance' | 'lost' | 'repair' | 'return';
  reference_no?: string;
  first_person: string;
  second_person?: string;
  location: string;
  transaction_date?: string;
  notes?: string;
  status: 'open' | 'closed' | 'pending';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  items?: TransactionItem[];
  TransactionItems?: TransactionItem[]; // Alternative relation name from backend
}

export interface CreateTransactionRequest {
  transaction_type: Transaction['transaction_type'];
  reference_no?: string;
  first_person: string;
  second_person?: string;
  location: string;
  notes?: string;
  status?: Transaction['status'];
  items: CreateTransactionItemRequest[];
}

export interface CreateTransactionItemRequest {
  product_id: string;
  quantity?: number;
  condition_before?: 'excellent' | 'good' | 'fair' | 'poor';
  condition_after?: 'excellent' | 'good' | 'fair' | 'poor';
  status?: 'processed' | 'pending';
  notes?: string;
}

export interface UpdateTransactionRequest {
  reference_no?: string;
  first_person?: string;
  second_person?: string;
  location?: string;
  notes?: string;
  status?: Transaction['status'];
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  transaction_type?: Transaction['transaction_type'];
  status?: Transaction['status'];
  start_date?: string;
  end_date?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: 'transaction_date' | 'created_at' | 'reference_no' | 'first_person' | 'status';
  sort_order?: 'ASC' | 'DESC';
}

export interface TransactionFilters {
  transaction_type?: Transaction['transaction_type'];
  status?: Transaction['status'];
  start_date?: string;
  end_date?: string;
  search?: string;
  first_person?: string;
  location?: string;
}

export interface TransactionListResponse {
  success: boolean;
  count: number;
  data: Transaction[];
  message?: string;
}

export interface TransactionResponse {
  success: boolean;
  data?: Transaction;
  message?: string;
  error?: string;
}

export interface TransactionItemsResponse {
  success: boolean;
  count: number;
  data: TransactionItem[];
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

// Statistics and reporting types
export interface TransactionStats {
  total: number;
  byType: Record<Transaction['transaction_type'], number>;
  byStatus: Record<Transaction['status'], number>;
  byMonth: Record<string, number>;
  recentActivity: Transaction[];
}

export interface TransactionStatsResponse extends ApiResponse<TransactionStats> {}

// Form validation types
export interface TransactionFormErrors {
  transaction_type?: string;
  first_person?: string;
  location?: string;
  items?: string;
  [key: string]: string | undefined;
}

export interface TransactionItemFormErrors {
  product_id?: string;
  quantity?: string;
  condition_after?: string;
  [key: string]: string | undefined;
}

// Export/Import types
export interface TransactionExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  date_from?: string;
  date_to?: string;
  transaction_type?: Transaction['transaction_type'];
  status?: Transaction['status'];
  include_items?: boolean;
}

// Utility types
export type TransactionTypeLabel = {
  [K in Transaction['transaction_type']]: string;
};

export type TransactionStatusLabel = {
  [K in Transaction['status']]: string;
};

export const TRANSACTION_TYPE_LABELS: TransactionTypeLabel = {
  check_out: 'Check Out',
  check_in: 'Check In',
  maintenance: 'Maintenance',
  lost: 'Lost',
  repair: 'Repair',
  return: 'Return'
};

export const TRANSACTION_STATUS_LABELS: TransactionStatusLabel = {
  open: 'Open',
  closed: 'Closed',
  pending: 'Pending'
};