// src/pages/user-levels/UserLevelForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Shield, 
  Eye,
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useUserLevelStore } from '../../store/useUserLevelStore';
import { CreateUserLevelRequest, UpdateUserLevelRequest } from '../../../types/userLevel.types';

interface UserLevelFormProps {
  mode: 'create' | 'edit';
}

// Available modules in the system
const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard', description: 'Access to dashboard and overview' },
  { id: 'users', name: 'Users', description: 'Manage user accounts' },
  { id: 'user-levels', name: 'User Levels', description: 'Manage user roles and permissions' },
  { id: 'categories', name: 'Categories', description: 'Manage product categories' },
  { id: 'suppliers', name: 'Suppliers', description: 'Manage supplier information' },
  { id: 'products', name: 'Products', description: 'Manage product catalog' },
  { id: 'transactions', name: 'Transactions', description: 'Handle transactions and sales' },
  { id: 'reports', name: 'Reports', description: 'Generate and view reports' },
  { id: 'settings', name: 'Settings', description: 'System configuration' }
];

const UserLevelForm: React.FC<UserLevelFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const {
    currentUserLevel,
    isLoading,
    error,
    getUserLevelById,
    createUserLevel,
    updateUserLevel,
    clearError,
    clearCurrentUserLevel
  } = useUserLevelStore();

  // Form state
  const [formData, setFormData] = useState({
    level_name: '',
    description: ''
  });

  const [permissions, setPermissions] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load data for edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      getUserLevelById(id);
    } else {
      clearCurrentUserLevel();
      setFormData({ level_name: '', description: '' });
      setPermissions([]);
    }
  }, [mode, id]);

  // Populate form when data is loaded
  useEffect(() => {
    if (currentUserLevel && mode === 'edit') {
      setFormData({
        level_name: currentUserLevel.level_name,
        description: currentUserLevel.description
      });
      
      // Convert permissions
      const formPermissions = currentUserLevel.UserPermissions?.map(perm => ({
        module: perm.module,
        can_view: perm.can_view,
        can_add: perm.can_add,
        can_edit: perm.can_edit,
        can_delete: perm.can_delete
      })) || [];
      
      setPermissions(formPermissions);
    }
  }, [currentUserLevel, mode]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle permission changes
  const handlePermissionChange = (module: string, permission: string, value: boolean) => {
    setPermissions(prev => {
      const existingIndex = prev.findIndex(p => p.module === module);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], [permission]: value };
        return updated;
      } else {
        return [...prev, {
          module,
          can_view: permission === 'can_view' ? value : false,
          can_add: permission === 'can_add' ? value : false,
          can_edit: permission === 'can_edit' ? value : false,
          can_delete: permission === 'can_delete' ? value : false
        }];
      }
    });
  };

  // Get permission for module
  const getPermissionForModule = (module: string) => {
    return permissions.find(p => p.module === module) || {
      module,
      can_view: false,
      can_add: false,
      can_edit: false,
      can_delete: false
    };
  };

  // Toggle all permissions for a module
  const toggleAllPermissions = (module: string, enable: boolean) => {
    if (enable) {
      handlePermissionChange(module, 'can_view', true);
      handlePermissionChange(module, 'can_add', true);
      handlePermissionChange(module, 'can_edit', true);
      handlePermissionChange(module, 'can_delete', true);
    } else {
      setPermissions(prev => prev.filter(p => p.module !== module));
    }
  };

  // Check if module has any permissions
  const hasAnyPermission = (module: string) => {
    const perm = getPermissionForModule(module);
    return perm.can_view || perm.can_add || perm.can_edit || perm.can_delete;
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.level_name.trim()) {
      errors.level_name = 'Level name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const validPermissions = permissions.filter(p => 
      p.can_view || p.can_add || p.can_edit || p.can_delete
    );

    try {
      let success = false;
      
      if (mode === 'create') {
        const createData: CreateUserLevelRequest = {
          level_name: formData.level_name,
          description: formData.description,
          permissions: validPermissions
        };
        success = await createUserLevel(createData);
      } else if (mode === 'edit' && id) {
        const updateData: UpdateUserLevelRequest = {
          level_name: formData.level_name,
          description: formData.description,
          permissions: validPermissions
        };
        success = await updateUserLevel(id, updateData);
      }
      
      if (success) {
        navigate('/user-levels');
      }
    } catch (error) {
      console.error('Error saving user level:', error);
    }
  };

  if (isLoading && mode === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/user-levels')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === 'create' ? 'Create User Level' : 'Edit User Level'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level Name *
                    </label>
                    <input
                      type="text"
                      value={formData.level_name}
                      onChange={(e) => handleInputChange('level_name', e.target.value)}
                      placeholder="e.g., Administrator, Manager, Staff"
                      className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.level_name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {validationErrors.level_name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.level_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      placeholder="Describe this user level's purpose and responsibilities"
                      className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.description ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Permissions</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure what this user level can access and modify
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {AVAILABLE_MODULES.map((module) => {
                      const modulePerms = getPermissionForModule(module.id);
                      const hasAnyPerm = hasAnyPermission(module.id);
                      
                      return (
                        <div key={module.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {module.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {module.description}
                              </p>
                            </div>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={hasAnyPerm}
                                onChange={(e) => toggleAllPermissions(module.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Enable
                              </span>
                            </label>
                          </div>
                          
                          {hasAnyPerm && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={modulePerms.can_view}
                                  onChange={(e) => handlePermissionChange(module.id, 'can_view', e.target.checked)}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <Eye className="h-3 w-3 ml-2 mr-1 text-green-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">View</span>
                              </label>
                              
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={modulePerms.can_add}
                                  onChange={(e) => handlePermissionChange(module.id, 'can_add', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <Plus className="h-3 w-3 ml-2 mr-1 text-blue-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Add</span>
                              </label>
                              
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={modulePerms.can_edit}
                                  onChange={(e) => handlePermissionChange(module.id, 'can_edit', e.target.checked)}
                                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <Edit className="h-3 w-3 ml-2 mr-1 text-yellow-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Edit</span>
                              </label>
                              
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={modulePerms.can_delete}
                                  onChange={(e) => handlePermissionChange(module.id, 'can_delete', e.target.checked)}
                                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <Trash2 className="h-3 w-3 ml-2 mr-1 text-red-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Delete</span>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Actions</h2>
                </div>
                
                <div className="p-6 space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : mode === 'create' ? 'Create Level' : 'Update Level'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/user-levels')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>

                  {/* Permission Summary */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
                      Summary
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Modules:</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {permissions.filter(p => p.can_view || p.can_add || p.can_edit || p.can_delete).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Permissions:</span>
                        <span className="text-green-600 dark:text-green-400">
                          {permissions.reduce((sum, p) => 
                            sum + (p.can_view ? 1 : 0) + (p.can_add ? 1 : 0) + 
                            (p.can_edit ? 1 : 0) + (p.can_delete ? 1 : 0), 0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mt-6">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                        <p>{error}</p>
                      </div>
                      <button
                        onClick={clearError}
                        className="mt-2 text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLevelForm;