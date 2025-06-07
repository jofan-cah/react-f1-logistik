// src/types/user.types.ts

export interface UserLevel {
  id: string;
  level_name: string;  // Changed from 'name' to match backend
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
  user_level_id: string;
  department?: string;
  profile_image?: string;
  last_login?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
  
  // Relations from backend
  UserLevel?: UserLevel;
  
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
  confirm_password: string;
  user_level_id: string;
  department?: string;
  is_active?: boolean;
  notes?: string;
}

export interface UpdateUserRequest {
  username?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  user_level_id?: string;
  department?: string;
  is_active?: boolean;
  notes?: string;
  profile_image?: string;
}

export interface UserFilters {
  search?: string;
  user_level_id?: string;
  department?: string;
  is_active?: boolean;
  last_login_from?: string;
  last_login_to?: string;
  sort_by?: 'username' | 'full_name' | 'email' | 'created_at' | 'last_login';
  sort_order?: 'ASC' | 'DESC';
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordRequest {
  new_password: string;
  confirm_password: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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