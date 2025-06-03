// src/types/supplier.types.ts

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

export interface CreateSupplierRequest {
  name: string;
  address: string;
  contact_person: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export interface SupplierFilters {
  search?: string;
  name?: string;
  contact_person?: string;
  email?: string;
  sort_by?: 'name' | 'contact_person' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface SupplierListResponse extends ApiResponse<Supplier[]> {
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}