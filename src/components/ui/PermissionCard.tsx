// src/components/ui/PermissionCard.tsx
import React from 'react';
import { UserPermission } from '../../types/userLevel.types';
import { PermissionCheckbox } from './PermissionCheckbox';

interface PermissionCardProps {
  module: string;
  permission: Omit<UserPermission, 'id' | 'user_level_id' | 'createdAt' | 'updatedAt'>;
  onChange: (permission: Omit<UserPermission, 'id' | 'user_level_id' | 'createdAt' | 'updatedAt'>) => void;
  disabled?: boolean;
}

export const PermissionCard: React.FC<PermissionCardProps> = ({
  module,
  permission,
  onChange,
  disabled = false
}) => {
  const handlePermissionChange = (type: keyof Omit<UserPermission, 'id' | 'user_level_id' | 'module' | 'createdAt' | 'updatedAt'>, value: boolean) => {
    onChange({
      ...permission,
      [type]: value
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
        {module}
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <PermissionCheckbox
          label="View"
          checked={permission.can_view}
          onChange={(checked) => handlePermissionChange('can_view', checked)}
          disabled={disabled}
        />
        
        <PermissionCheckbox
          label="Add"
          checked={permission.can_add}
          onChange={(checked) => handlePermissionChange('can_add', checked)}
          disabled={disabled}
        />
        
        <PermissionCheckbox
          label="Edit"
          checked={permission.can_edit}
          onChange={(checked) => handlePermissionChange('can_edit', checked)}
          disabled={disabled}
        />
        
        <PermissionCheckbox
          label="Delete"
          checked={permission.can_delete}
          onChange={(checked) => handlePermissionChange('can_delete', checked)}
          disabled={disabled}
        />
      </div>
    </div>
  );
};