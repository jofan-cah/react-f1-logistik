// src/types/transaction.types.ts

// Based on your Sequelize models
export interface Product {
  id: string; // Using string ID as per your transaction_item model
  name: string;
  sku?: string;
  barcode?: string;
  qr_data?: string;
  description?: string;
  serial_number?: string;
  category?: string;
  location?: string;
  status?: 'available' | 'checked_out' | 'maintenance' | 'lost' | 'repair';
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionItem {
  id?: number;
  transaction_id?: number;
  product_id: string;
  product?: Product;
  related_item_id?: number;
  condition_before?: string;
  condition_after?: string;
  quantity: number;
  notes?: string;
  status: 'processed' | 'pending' | 'returned' | 'lost';
}

export interface Transaction {
  id?: number;
  transaction_type: 'check_out' | 'check_in' | 'maintenance' | 'lost' | 'repair' | 'return';
  reference_no?: string;
  first_person: string;
  second_person?: string;
  location: string;
  transaction_date: string;
  notes?: string;
  status: 'open' | 'closed' | 'pending';
  created_by?: string;
  created_at?: string;
  items?: TransactionItem[];
}

export interface TransactionFormData {
  transaction_type: Transaction['transaction_type'];
  reference_no?: string;
  first_person: string;
  second_person?: string;
  location: string;
  transaction_date: string;
  notes?: string;
  status?: Transaction['status'];
  items: Omit<TransactionItem, 'id' | 'transaction_id'>[];
}

export interface ScanResult {
  type: 'QR' | 'BARCODE';
  data: string;
  product?: Product;
  error?: string;
}

export interface ScannerConfig {
  enabled: boolean;
  mode: 'QR' | 'BARCODE' | 'BOTH';
  continuous: boolean;
  audio: boolean;
  constraints?: MediaTrackConstraints;
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  transaction_type?: Transaction['transaction_type'];
  status?: Transaction['status'];
  date_from?: string;
  date_to?: string;
  location?: string;
  first_person?: string;
  sort_by?: keyof Transaction;
  sort_order?: 'ASC' | 'DESC';
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction | Transaction[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TransactionValidation {
  isValid: boolean;
  errors: {
    [key: string]: string[];
  };
}

export interface TransactionSummary {
  total_items: number;
  total_quantity: number;
  by_type: Record<Transaction['transaction_type'], number>;
  by_status: Record<Transaction['status'], number>;
}

// Context types
export interface TransactionContextState {
  currentTransaction: Transaction | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  scannerActive: boolean;
  scannerConfig: ScannerConfig;
  lastScanResult: ScanResult | null;
}

export interface TransactionContextActions {
  // CRUD operations
  createTransaction: (data: TransactionFormData) => Promise<Transaction>;
  updateTransaction: (id: number, data: Partial<TransactionFormData>) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<void>;
  getTransaction: (id: number) => Promise<Transaction>;
  getTransactions: (params?: TransactionQueryParams) => Promise<Transaction[]>;
  
  // Transaction management
  setCurrentTransaction: (transaction: Transaction | null) => void;
  addItemToTransaction: (product: Product, data?: Partial<TransactionItem>) => void;
  updateTransactionItem: (itemIndex: number, data: Partial<TransactionItem>) => void;
  removeItemFromTransaction: (itemIndex: number) => void;
  clearCurrentTransaction: () => void;
  
  // Transaction operations
  closeTransaction: (id: number) => Promise<Transaction>;
  reopenTransaction: (id: number) => Promise<Transaction>;
  
  // Scanner management
  startScanner: () => void;
  stopScanner: () => void;
  toggleScanner: () => void;
  updateScannerConfig: (config: Partial<ScannerConfig>) => void;
  handleScanResult: (result: ScanResult) => void;
  
  // Utilities
  validateTransaction: (transaction: Partial<Transaction>) => TransactionValidation;
  generateReferenceNumber: () => string;
  getTransactionSummary: () => TransactionSummary;
  clearError: () => void;
}

export interface TransactionContextType extends TransactionContextState, TransactionContextActions {}

// Theme context
export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

// Transaction type labels for UI
export const TRANSACTION_TYPE_LABELS: Record<Transaction['transaction_type'], string> = {
  check_out: 'Check Out',
  check_in: 'Check In',
  maintenance: 'Maintenance',
  lost: 'Lost',
  repair: 'Repair',
  return: 'Return'
};

// Status labels for UI
export const TRANSACTION_STATUS_LABELS: Record<Transaction['status'], string> = {
  open: 'Open',
  closed: 'Closed',
  pending: 'Pending'
};

// Item status labels for UI
export const ITEM_STATUS_LABELS: Record<TransactionItem['status'], string> = {
  processed: 'Processed',
  pending: 'Pending',
  returned: 'Returned',
  lost: 'Lost'
};

// Condition options
export const CONDITION_OPTIONS = [
  'excellent',
  'good',
  'fair',
  'poor',
  'damaged',
  'need_repair'
] as const;

export type ProductCondition = typeof CONDITION_OPTIONS[number];