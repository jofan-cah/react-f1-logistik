// src/types/userLevel.types.ts
export interface UserPermission {
  id?: string;
  user_level_id?: string;
  module: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserLevel {
  id: string;
  level_name: string;
  description: string;
  UserPermissions?: UserPermission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserLevelRequest {
  level_name: string;
  description: string;
  permissions: Omit<UserPermission, 'id' | 'user_level_id' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateUserLevelRequest {
  level_name?: string;
  description?: string;
  permissions?: Omit<UserPermission, 'id' | 'user_level_id' | 'createdAt' | 'updatedAt'>[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}