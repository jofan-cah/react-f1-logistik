// src/types/transaction.types.ts

export interface Product {
  product_id: string;
  name?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  category?: {
    id: number;
    name: string;
    code: string;
  };
  condition: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  status: 'Available' | 'In Use' | 'Checked Out' | 'Maintenance' | 'Under Maintenance' | 'Lost' | 'Repair' | 'Damaged' | 'Disposed';
  location?: string;
  quantity?: number;
  last_maintenance_date?: string;
  created_at: string;
  updated_at: string;
  
  // NEW: Ticketing integration fields
  is_linked_to_ticketing?: boolean;
  ticketing_id?: string | null;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: string;
  quantity: number;
  condition_before?: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  condition_after?: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  breakdown_quantity?: number;
  breakdown_unit?: string;
  status: 'processed' | 'pending';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  product?: Product;
  Product?: Product;
}

export interface Transaction {
  id?: number;
  transaction_type: 'check_out' | 'check_in' | 'transfer' | 'maintenance' | 'repair' | 'lost';
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
  TransactionItems?: TransactionItem[];
}

// NEW: Enhanced create request with ticketing
export interface CreateTransactionRequest {
  transaction_type: Transaction['transaction_type'];
  reference_no?: string;
  first_person: string;
  second_person?: string;
  location: string;
  transaction_date?: string;
  notes?: string;
  status?: Transaction['status'];
  items: CreateTransactionItemRequest[];
  
  // NEW: Ticketing options - choose one approach
  selected_ticket?: string; // Single ticket for all products (TransactionForm approach)
  ticket_assignments?: Record<string, string>; // Per-product ticket assignment (Scanner approach)
}

export interface CreateTransactionItemRequest {
  product_id: string;
  quantity?: number;
  condition_before?: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  condition_after?: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  breakdown_quantity?: number;
  breakdown_unit?: string;
  status?: 'processed' | 'pending';
  notes?: string;
}

export interface UpdateTransactionRequest {
  reference_no?: string;
  first_person?: string;
  second_person?: string;
  location?: string;
  transaction_date?: string;
  notes?: string;
  status?: Transaction['status'];
}


export interface ActiveTicketsResponse {
  success: boolean;
  data: {
    tickets: string[];
    count: number;
    fetched_at: string;
  };
  message?: string;
}

// Existing types continue...
export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  transaction_type?: Transaction['transaction_type'];
  status?: Transaction['status'];
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  location?: string;
  created_by?: string;
}

export interface TransactionFilters {
  transaction_type?: Transaction['transaction_type'];
  status?: Transaction['status'];
  start_date?: string;
  end_date?: string;
  search?: string;
  location?: string;
  created_by?: string;
}

export interface TransactionListResponse {
  success: boolean;
  count: number;
  data: Transaction[];
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
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

// Statistics with ticket integration
export interface TransactionStats {
  total: number;
  byStatus: {
    open: number;
    closed: number;
    pending: number;
  };
  byType: {
    check_out: number;
    check_in: number;
    transfer: number;
    maintenance: number;
    repair?: number;
    lost?: number;
  };
  // NEW: Ticket integration stats
  ticket_integration?: {
    products_with_tickets: number;
    active_ticket_assignments: number;
  };
  recent: Transaction[];
  byLocation: Array<{
    location: string;
    count: number;
  }>;
}

export interface TransactionStatsResponse extends ApiResponse<TransactionStats> {}

// Form validation types
export interface TransactionFormErrors {
  transaction_type?: string;
  first_person?: string;
  location?: string;
  items?: string;
  selectedTicket?: string; // NEW: Ticket validation error
  [key: string]: string | undefined;
}

export interface TransactionItemFormErrors {
  product_id?: string;
  quantity?: string;
  condition_before?: string;
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
  include_tickets?: boolean; // NEW: Include ticket info in export
}

// Utility types
export type TransactionTypeLabel = {
  [K in Transaction['transaction_type']]: string;
};

export type TransactionStatusLabel = {
  [K in Transaction['status']]: string;
};

// Updated labels
export const TRANSACTION_TYPE_LABELS: TransactionTypeLabel = {
  check_out: 'Check Out',
  check_in: 'Check In',
  transfer: 'Transfer',
  maintenance: 'Maintenance',
  repair: 'Repair',
  lost: 'Lost'
};

export const TRANSACTION_STATUS_LABELS: TransactionStatusLabel = {
  open: 'Open',
  closed: 'Closed',
  pending: 'Pending'
};

// Valid condition options
export const CONDITION_OPTIONS = [
  'New',
  'Good', 
  'Fair',
  'Poor',
  'Damaged'
] as const;

// Valid transaction types
export const VALID_TRANSACTION_TYPES = [
  'check_out',
  'check_in', 
  'transfer',
  'maintenance',
  'repair',
  'lost'
] as const;