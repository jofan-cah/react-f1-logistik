// src/components/forms/UserLevelForm.tsx
import React, { useState, useEffect } from 'react';
import { UserLevel, UserPermission } from '../../types/userLevel.types';
import { PermissionCard } from '../ui/PermissionCard';

interface UserLevelFormProps {
  userLevel?: UserLevel;
  onSubmit: (data: {
    level_name: string;
    description: string;
    permissions: Omit<UserPermission, 'id' | 'user_level_id' | 'createdAt' | 'updatedAt'>[];
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AVAILABLE_MODULES = [
  'dashboard',
  'products',
  'categories',
  'suppliers',
  'users',
  'transactions',
  'reports'
];

export const UserLevelForm: React.FC<UserLevelFormProps> = ({
  userLevel,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    level_name: '',
    description: ''
  });

  const [permissions, setPermissions] = useState<
    Record<string, Omit<UserPermission, 'id' | 'user_level_id' | 'createdAt' | 'updatedAt'>>
  >({});

  useEffect(() => {
    if (userLevel) {
      setFormData({
        level_name: userLevel.level_name,
        description: userLevel.description
      });

      // Initialize permissions from userLevel
      const permissionsMap: Record<string, Omit<UserPermission, 'id' | 'user_level_id' | 'createdAt' | 'updatedAt'>> = {};
      
      if (userLevel.UserPermissions) {
        userLevel.UserPermissions.forEach(perm => {
          permissionsMap[perm.module] = {
            module: perm.module,
            can_view: perm.can_view,
            can_add: perm.can_add,
            can_edit: perm.can_edit,
            can_delete: perm.can_delete
          };
        });
      }

      // Initialize permissions for all modules
      AVAILABLE_MODULES.forEach(module => {
        if (!permissionsMap[module]) {
          permissionsMap[module] = {
            module,
            can_view: false,
            can_add: false,
            can_edit: false,
            can_delete: false
          };
        }
      });

      setPermissions(permissionsMap);
    } else {
      // Initialize empty permissions for new user level
      const permissionsMap: Record<string, Omit<UserPermission, 'id' | 'user_level_id' | 'createdAt' | 'updatedAt'>> = {};
      AVAILABLE_MODULES.forEach(module => {
        permissionsMap[module] = {
          module,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false
        };
      });
      setPermissions(permissionsMap);
    }
  }, [userLevel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (module: string, permission: Omit<UserPermission, 'id' | 'user_level_id' | 'createdAt' | 'updatedAt'>) => {
    setPermissions(prev => ({
      ...prev,
      [module]: permission
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const permissionsArray = Object.values(permissions).filter(perm => 
      perm.can_view || perm.can_add || perm.can_edit || perm.can_delete
    );

    onSubmit({
      ...formData,
      permissions: permissionsArray
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {userLevel ? 'Edit User Level' : 'Create New User Level'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="level_name" className="block text-sm font-medium text-gray-700 mb-2">
              Level Name *
            </label>
            <input
              type="text"
              id="level_name"
              name="level_name"
              value={formData.level_name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Enter level name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Enter description"
            />
          </div>
        </div>

        {/* Permissions Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_MODULES.map(module => (
              <PermissionCard
                key={module}
                module={module}
                permission={permissions[module]}
                onChange={(perm) => handlePermissionChange(module, perm)}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading || !formData.level_name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : userLevel ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};