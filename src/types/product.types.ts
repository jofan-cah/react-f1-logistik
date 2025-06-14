// src/types/product.types.ts

export interface Product {
  product_id: string;
  name: string; // ADDED: Product name field yang digunakan di ProductsList
  category_id: number;
  brand?: string;
  model?: string;
  serial_number?: string;
  origin?: string;
  supplier_id?: number;
  po_number?: string;
  description?: string;
  location?: string;
  img_product?: string;
  status: 'Available' | 'In Use' | 'Under Maintenance' | 'Maintenance' | 'Damaged' | 'Disposed' | 'Retired' | 'Lost' | 'Checked Out';
  condition: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  quantity?: number; // CHANGED: Made optional to match usage
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  qr_data?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations - UPDATED: Match the actual API response structure
  category?: {
    id: number;
    name: string;
    code: string;
  };
  Category?: { // ADDED: Alternative naming used in ProductsList
    id: number;
    name: string;
    code: string;
  };
  supplier?: {
    id: number;
    name: string;
  };
  transactionItems?: TransactionItem[];
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  condition_before?: string;
  condition_after?: string;
  quantity: number;
}

export interface CreateProductRequest {
  product_id?: string; // Optional - akan di-generate otomatis jika tidak disediakan
  name: string; // ADDED: Product name field
  category_id: number;
  brand?: string;
  model?: string;
  serial_number?: string;
  origin?: string;
  supplier_id?: number;
  po_number?: string;
  description?: string;
  location?: string;
  img_product?: string;
  status?: 'Available' | 'In Use' | 'Under Maintenance' | 'Maintenance' | 'Damaged' | 'Disposed' | 'Retired' | 'Lost' | 'Checked Out';
  condition?: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  quantity?: number;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  notes?: string;
}

export interface UpdateProductRequest {
  name?: string; // ADDED: Product name field
  brand?: string;
  model?: string;
  serial_number?: string;
  origin?: string;
  supplier_id?: number;
  po_number?: string;
  description?: string;
  location?: string;
  img_product?: string;
  status?: 'Available' | 'In Use' | 'Under Maintenance' | 'Maintenance' | 'Damaged' | 'Disposed' | 'Retired' | 'Lost' | 'Checked Out';
  condition?: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  quantity?: number;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  notes?: string;
}

export interface UpdateStatusRequest {
  status: 'Available' | 'In Use' | 'Under Maintenance' | 'Maintenance' | 'Damaged' | 'Disposed' | 'Retired' | 'Lost' | 'Checked Out';
  notes?: string;
}

export interface ProductFilters {
  search?: string;
  status?: string;
  category_id?: number;
  supplier_id?: number;
  condition?: string;
  location?: string;
  has_image?: boolean;
  created_after?: string; // ADDED: For date range filtering used in ProductsList
}

export interface ProductListResponse {
  success: boolean;
  message?: string;
  data?: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ImageUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    filename: string;
    url?: string;
    size?: number;
    type?: string;
  };
}

// Product Statistics
export interface ProductStats {
  total: number;
  byStatus: {
    available: number;
    in_use: number;
    maintenance: number;
    damaged: number;
    disposed: number;
  };
  byCategory: Array<{
    category_id: number;
    count: number;
    category: {
      name: string;
      code: string;
    };
  }>;
  byLocation: Array<{
    location: string;
    count: number;
  }>;
}

// QR Code generation
export interface QRCodeResponse {
  product_id: string;
  qr_code: {
    filename: string;
    url: string;
    data: string;
  };
}

// Print functionality
export interface PrintProductRequest {
  product_ids: string[];
}

export interface PrintProductData {
  product_id: string;
  category_name?: string;
  category_code?: string;
  brand?: string;
  model?: string;
  location?: string;
  serial_number?: string;
  qr_data: {
    id: string;
    category?: string;
    brand?: string;
    model?: string;
  };
}

export interface PrintProductResponse {
  success: boolean;
  message?: string;
  data?: {
    total: number;
    products: PrintProductData[];
  };
}

// Breakdown functionality
export interface BreakdownItem {
  quantity?: number;
  description?: string;
  condition?: 'New' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  notes?: string;
}

export interface CreateBreakdownRequest {
  product_id: string;
  breakdown_items: BreakdownItem[];
  location?: string;
  notes?: string;
}

export interface BreakdownResponse {
  transaction_id: number;
  reference_no: string;
  parent_product: string;
  created_products: Array<{
    product_id: string;
    description: string;
    condition: string;
    quantity: number;
  }>;
}

export interface BreakdownHistory {
  product_id: string;
  breakdown_transactions: any[]; // Transaction objects
  child_products: Product[];
  parent_product?: Product;
  is_parent: boolean;
  is_child: boolean;
}