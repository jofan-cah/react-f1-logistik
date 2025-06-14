// src/types/userLevel.types.ts

export interface UserLevel {
  id: string;
  level_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  users?: User[];
  permissions?: UserPermission[];
}

export interface User {
  id: string; // FIXED: Changed from user_id to id (primary key)
  username: string;
  full_name: string;
  email: string;
  is_active: boolean;
  department?: string;
  user_level_id?: string;
  created_at: string;
}

export interface UserPermission {
  id: number;
  user_level_id: string;
  module: string; // FIXED: Changed from 'resource' to 'module' based on database
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface CreateUserLevelRequest {
  id: string;
  level_name: string;
  description?: string;
}

export interface UpdateUserLevelRequest {
  level_name?: string;
  description?: string;
}

export interface UserLevelFilters {
  search?: string;
  level_name?: string;
  include_users?: boolean;
  include_permissions?: boolean;
}

export interface UserLevelListResponse {
  success: boolean;
  message?: string;
  data?: {
    userLevels: UserLevel[];
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

// User Level Statistics
export interface UserLevelStats {
  total: number;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  levelBreakdown: Array<{
    id: string;
    level_name: string;
    description?: string;
    total_users: number;
    active_users: number;
    inactive_users: number;
  }>;
  recentLevels: Array<{
    id: string;
    level_name: string;
    created_at: string;
  }>;
}

// Available User Levels (for dropdowns)
export interface AvailableUserLevel {
  id: string;
  level_name: string;
  description?: string;
}

// User Level Usage
export interface UserLevelUsageFilters {
  search?: string;
  is_active?: boolean;
  department?: string;
}

export interface UserLevelUsage {
  success: boolean;
  message?: string;
  data?: {
    users: User[];
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