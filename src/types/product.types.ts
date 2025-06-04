// src/types/product.types.ts
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
  img_product?: string;  // NEW: Added image field
  status: 'Available' | 'In Use' | 'Under Maintenance' | 'Retired' | 'Lost';
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  quantity: number;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  ticketing_id?: string;
  is_linked_to_ticketing: boolean;
  qr_data?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: {
    id: number;
    name: string;
  };
  supplier?: {
    id: number;
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
  };
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
  img_product?: string;  // NEW: Added image field
  status: string;
  condition: string;
  quantity: number;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  ticketing_id?: string;
  is_linked_to_ticketing: boolean;
  notes?: string;
}

export interface UpdateProductRequest {
  product_id?: string;
  name?: string;
  category_id?: number;
  brand?: string;
  model?: string;
  serial_number?: string;
  origin?: string;
  supplier_id?: number;
  po_number?: string;
  description?: string;
  location?: string;
  img_product?: string;  // NEW: Added image field
  status?: string;
  condition?: string;
  quantity?: number;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  ticketing_id?: string;
  is_linked_to_ticketing?: boolean;
  notes?: string;
}

export interface ProductFilters {
  search?: string;
  status?: string;
  category_id?: number;
  supplier_id?: number;
  condition?: string;
  location?: string;
  has_image?: boolean;  // NEW: Filter for products with/without images
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
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// NEW: Interface for image upload
export interface ProductImageUpload {
  file: File;
  preview: string;
}

export interface ImageUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    filename: string;
    url: string;
    size: number;
    type: string;
  };
}