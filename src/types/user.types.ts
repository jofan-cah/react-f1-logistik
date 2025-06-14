// src/types/user.types.ts

export type UserLevel = 'admin' | 'manager' | 'technician' | 'warehouse' | 'viewer';

export interface UserLevelInfo {
  id: UserLevel;
  level_name: string;
  description?: string;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  user_level_id: UserLevel;
  department?: string;
  profile_image?: string;
  last_login?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
  
  // Relations from backend
  userLevel?: UserLevelInfo;
  
  // For login tracking
  login_count?: number;
  last_login_ip?: string;
}

export interface CreateUserRequest {
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  password: string;
  confirm_password?: string; // Optional for compatibility
  user_level_id: UserLevel;
  department?: string;
  is_active?: boolean;
  notes?: string;
}

export interface UpdateUserRequest {
  username?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  user_level_id?: UserLevel;
  department?: string;
  is_active?: boolean;
  notes?: string;
  profile_image?: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface BulkUpdateRequest {
  userIds: string[];
  updates: {
    user_level_id?: UserLevel;
    department?: string;
    is_active?: boolean;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byLevel: {
    admin: number;
    manager: number;
    technician: number;
    warehouse: number;
    viewer: number;
  };
}

export interface DepartmentStats {
  [department: string]: number;
}

export interface UserFilters {
  search?: string;
  user_level_id?: UserLevel;
  department?: string;
  is_active?: boolean | string;
  last_login_from?: string;
  last_login_to?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface UserQueryParams extends UserFilters {
  page?: number;
  limit?: number;
}

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

// Legacy compatibility types
export interface UserListResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserStatsResponse extends ApiResponse<{
  total: number;
  active: number;
  inactive: number;
  byLevel: Record<string, number>;
  byDepartment: Record<string, number>;
  recentLogins: number;
}> {}

// Permission system types
export interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
  action: string;
}

export interface UserPermission {
  user_id: string;
  permission_id: string;
  granted_by: string;
  granted_at: string;
}

// Session and login types
export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  ip_address: string;
  user_agent: string;
  expires_at: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
}

export interface LoginAttempt {
  id: string;
  username: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  attempted_at: string;
}

// Form validation types
export interface UserFormErrors {
  username?: string;
  password?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  user_level_id?: string;
  department?: string;
  notes?: string;
}

// Store state types
export interface UserListState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  filters: UserFilters;
  selectedUsers: string[];
}

export interface UserDetailState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserStatsState {
  stats: UserStats | null;
  departmentStats: DepartmentStats | null;
  isLoading: boolean;
  error: string | null;
}