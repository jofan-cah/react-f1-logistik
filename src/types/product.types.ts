// src/types/product.types.ts
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
}

export interface Supplier {
  id: number;
  name: string;
  address: string;
  contact_person: string;
  phone: string;
  email: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  product_id: string;
  name: string;
  category_id: number;
  brand?: string;
  model?: string;
  serial_number?: string;
  origin?: string;
  supplier_id?: number;
  po_number?: string;
  description?: string;
  location?: string;
  status: string;
  condition: string;
  quantity: number;
  purchase_date?: string;
  purchase_price?: string; // Backend sends as string
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  ticketing_id?: string;
  is_linked_to_ticketing: boolean;
  qr_data?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations from backend
  Category?: Category;
  Supplier?: Supplier;
  
  // Computed fields for frontend
  categoryName?: string;
  supplierName?: string;
}

export interface CreateProductRequest {
  product_id: string;  
  name: string;
  category_id: number;
  brand?: string;
  model?: string;
  serial_number?: string;
  origin?: string;
  supplier_id?: number;
  po_number?: string;
  description?: string;
  location?: string;
  status: string;
  condition: string;
  quantity: number;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  ticketing_id?: string;
  is_linked_to_ticketing?: boolean;
  notes?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductFilters {
  search?: string;
  status?: string;
  category_id?: number;
  supplier_id?: number;
  condition?: string;
  location?: string;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}