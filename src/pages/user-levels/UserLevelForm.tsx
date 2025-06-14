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
import { userLevelService } from '../../services/userLevelService'; // ADDED: Import service directly
import api from '../../services/api'; // ADDED: Import api for testing
import { CreateUserLevelRequest, UpdateUserLevelRequest } from '../../types/userLevel.types';

interface UserLevelFormProps {
  mode: 'create' | 'edit';
}

// Available modules in the system - UPDATED to match backend resources
const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard', description: 'Access to dashboard and overview' },
  { id: 'users', name: 'Users', description: 'Manage user accounts and user levels' },
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
    clearCurrentUserLevel,
    validateUserLevelId,
    validateLevelName,
    validateDescription
  } = useUserLevelStore();

  // Form state - UPDATED to match backend structure
  const [formData, setFormData] = useState<{
    id?: string;
    level_name: string;
    description: string;
  }>({
    id: '',
    level_name: '',
    description: ''
  });

  const [permissions, setPermissions] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load data for edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      console.log('=== LOADING EDIT DATA ===');
      console.log('Mode:', mode);
      console.log('ID:', id);
      // UPDATED: Load with permissions
      getUserLevelById(id, false, true); // includeUsers=false, includePermissions=true
    } else {
      console.log('=== CLEARING DATA ===');
      clearCurrentUserLevel();
      setFormData({ id: '', level_name: '', description: '' });
      setPermissions([]);
    }
  }, [mode, id]);

  // Populate form when data is loaded - UPDATED to match backend response
  useEffect(() => {
    console.log('=== POPULATE FORM EFFECT ===');
    console.log('currentUserLevel:', currentUserLevel);
    console.log('mode:', mode);
    
    if (currentUserLevel && mode === 'edit') {
      console.log('=== SETTING FORM DATA ===');
      console.log('ID:', currentUserLevel.id);
      console.log('Level Name:', currentUserLevel.level_name);
      console.log('Description:', currentUserLevel.description);
      
      setFormData({
        id: currentUserLevel.id,
        level_name: currentUserLevel.level_name,
        description: currentUserLevel.description || ''
      });
      
      // Convert permissions - UPDATED to match actual database structure
      console.log('=== PROCESSING PERMISSIONS ===');
      console.log('Raw permissions:', currentUserLevel.permissions);
      
      const formPermissions = currentUserLevel.permissions?.map(perm => {
        console.log('Processing permission:', perm);
        return {
          module: perm.module, // FIXED: Use 'module' instead of 'resource'
          can_view: Boolean(perm.can_view),
          can_add: Boolean(perm.can_add),
          can_edit: Boolean(perm.can_edit),
          can_delete: Boolean(perm.can_delete)
        };
      }) || [];
      
      console.log('Processed permissions:', formPermissions);
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

  // Handle permission changes - UPDATED to use 'module' instead of 'resource'
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

  // Get permission for module - UPDATED
  const getPermissionForModule = (module: string) => {
    return permissions.find(p => p.module === module) || {
      module,
      can_view: false,
      can_add: false,
      can_edit: false,
      can_delete: false
    };
  };

  // Toggle all permissions for a module - UPDATED
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

  // Check if module has any permissions - UPDATED
  const hasAnyPermission = (module: string) => {
    const perm = getPermissionForModule(module);
    return perm.can_view || perm.can_add || perm.can_edit || perm.can_delete;
  };

  // Validate form - UPDATED to use store validation methods
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validate ID for create mode
    if (mode === 'create') {
      const idValidation = validateUserLevelId(formData.id || '');
      if (!idValidation.isValid) {
        errors.id = idValidation.error || 'Invalid ID';
      }
    }
    
    // Validate level name
    const nameValidation = validateLevelName(formData.level_name);
    if (!nameValidation.isValid) {
      errors.level_name = nameValidation.error || 'Invalid level name';
    }
    
    // Validate description
    const descValidation = validateDescription(formData.description);
    if (!descValidation.isValid) {
      errors.description = descValidation.error || 'Invalid description';
    }
    
    // Description is required based on backend validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission - UPDATED to actually save permissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMIT ===');
    console.log('Mode:', mode);
    console.log('Form data:', formData);
    console.log('Permissions:', permissions);
    
    if (!validateForm()) {
      console.log('=== FORM VALIDATION FAILED ===');
      return;
    }

    // Filter out permissions with no actions
    const validPermissions = permissions.filter(p => 
      p.can_view || p.can_add || p.can_edit || p.can_delete
    );

    console.log('=== VALID PERMISSIONS ===');
    console.log('Valid permissions:', validPermissions);

    try {
      let success = false;
      
      if (mode === 'create') {
        console.log('=== CREATING USER LEVEL ===');
        const createData: CreateUserLevelRequest = {
          id: formData.id || '',
          level_name: formData.level_name,
          description: formData.description
        };
        console.log('Create data:', createData);
        success = await createUserLevel(createData);
        
        // Try to save permissions after creating user level
        if (success && validPermissions.length > 0) {
          console.log('=== SAVING PERMISSIONS FOR NEW USER LEVEL ===');
          try {
            await userLevelService.updateUserLevelPermissions(formData.id || '', validPermissions);
            console.log('Permissions saved successfully');
          } catch (permError) {
            console.error('Failed to save permissions:', permError);
            // Continue anyway, user level was created
          }
        }
        
      } else if (mode === 'edit' && id) {
        console.log('=== UPDATING USER LEVEL ===');
        const updateData: UpdateUserLevelRequest = {
          level_name: formData.level_name,
          description: formData.description
        };
        console.log('Update data:', updateData);
        success = await updateUserLevel(id, updateData);
        
        // IMPORTANT: Save permissions after updating user level
        if (success) {
          console.log('=== SAVING PERMISSIONS ===');
          console.log('Permissions to save:', validPermissions);
          try {
            const permissionResponse = await userLevelService.updateUserLevelPermissions(id, validPermissions);
            console.log('Permission response:', permissionResponse);
            console.log('Permissions updated successfully');
          } catch (permError) {
            console.error('=== PERMISSION SAVE ERROR ===');
            console.error('Permission error details:', permError);
            console.error('Permission error response:', permError.response?.data);
            console.error('Permission error status:', permError.response?.status);
            console.error('Permission error message:', permError.message);
            
            // Show detailed error message
            let errorMessage = 'Failed to update permissions. ';
            if (permError.response?.status === 404) {
              errorMessage += 'Permissions endpoint not found (404). Please add the PUT /user-levels/:id/permissions endpoint to your backend.';
            } else if (permError.response?.status === 500) {
              errorMessage += `Server error: ${permError.response?.data?.message || 'Internal server error'}`;
            } else if (permError.response?.data?.message) {
              errorMessage += permError.response.data.message;
            } else {
              errorMessage += permError.message || 'Unknown error occurred';
            }
            
            alert(errorMessage);
          }
        }
      }
      
      console.log('=== OPERATION RESULT ===');
      console.log('Success:', success);
      
      if (success) {
        const totalPermissions = validPermissions.reduce((sum, p) => 
          sum + (p.can_view ? 1 : 0) + (p.can_add ? 1 : 0) + 
          (p.can_edit ? 1 : 0) + (p.can_delete ? 1 : 0), 0
        );
        
        console.log(`User level ${mode === 'create' ? 'created' : 'updated'} with ${totalPermissions} permissions across ${validPermissions.length} modules`);
        navigate('/user-levels');
      } else {
        console.error('=== OPERATION FAILED ===');
      }
    } catch (error) {
      console.error('=== SUBMIT ERROR ===');
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
                  {/* ID Field - Only show in create mode */}
                  {mode === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        User Level ID *
                      </label>
                      <input
                        type="text"
                        value={formData.id}
                        onChange={(e) => handleInputChange('id', e.target.value)}
                        placeholder="e.g., admin, manager, staff (2-20 chars, alphanumeric + underscore)"
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.id ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {validationErrors.id && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.id}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        ID can only contain letters, numbers, and underscores. Cannot be changed after creation.
                      </p>
                    </div>
                  )}

                  {/* Level Name */}
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

                  {/* Description */}
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

              {/* Permissions - UPDATED: Interactive form for both create and edit */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {mode === 'edit' ? 'Edit Permissions' : 'Set Permissions'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {mode === 'edit' 
                      ? 'Configure what this user level can access and modify. Changes will be saved when you update the user level.'
                      : 'Configure permissions for this new user level. These will be applied after creating the user level.'
                    }
                  </p>
                </div>
                
                <div className="p-6">
                  {/* Show permissions form for both create and edit modes */}
                  <div className="space-y-4">
                    {/* Interactive permission editing */}
                    {AVAILABLE_MODULES.map((module) => {
                      const modulePerms = getPermissionForModule(module.id);
                      const hasAnyPerm = hasAnyPermission(module.id);
                      
                      return (
                        <div key={module.id} className={`border rounded-lg p-4 transition-all duration-200 ${
                          hasAnyPerm 
                            ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {module.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {module.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              {hasAnyPerm && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  Active
                                </span>
                              )}
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={hasAnyPerm}
                                  onChange={(e) => toggleAllPermissions(module.id, e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  Enable Module
                                </span>
                              </label>
                            </div>
                          </div>
                          
                          {/* Show permission checkboxes when module is enabled OR always show for better UX */}
                          <div className={`transition-all duration-200 ${hasAnyPerm ? 'opacity-100' : 'opacity-50'}`}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={modulePerms.can_view}
                                  onChange={(e) => handlePermissionChange(module.id, 'can_view', e.target.checked)}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <Eye className="h-3 w-3 ml-2 mr-1 text-green-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">View</span>
                              </label>
                              
                              <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={modulePerms.can_add}
                                  onChange={(e) => handlePermissionChange(module.id, 'can_add', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <Plus className="h-3 w-3 ml-2 mr-1 text-blue-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Add</span>
                              </label>
                              
                              <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={modulePerms.can_edit}
                                  onChange={(e) => handlePermissionChange(module.id, 'can_edit', e.target.checked)}
                                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <Edit className="h-3 w-3 ml-2 mr-1 text-yellow-600" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Edit</span>
                              </label>
                              
                              <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
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
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Bulk Actions */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Quick Actions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            AVAILABLE_MODULES.forEach(module => {
                              toggleAllPermissions(module.id, true);
                            });
                          }}
                          className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          Enable All Modules
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPermissions([]);
                          }}
                          className="px-3 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          Clear All Permissions
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            AVAILABLE_MODULES.forEach(module => {
                              handlePermissionChange(module.id, 'can_view', true);
                            });
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        >
                          View Only (All Modules)
                        </button>
                        
                        {/* DEBUG BUTTON - Test endpoint (only show in edit mode) */}
                        {mode === 'edit' && id && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                console.log('=== TESTING ENDPOINT ===');
                                const response = await api.get(`/user-levels/${id}/permissions/test`);
                                console.log('Test response:', response.data);
                                alert('Endpoint accessible! Check console for details.');
                              } catch (error) {
                                console.error('Test error:', error);
                                alert(`Endpoint test failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
                              }
                            }}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50"
                          >
                            🔧 Test API Endpoint
                          </button>
                        )}
                      </div>
                    </div>
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

                  {/* Summary - UPDATED */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
                      Summary
                    </h3>
                    <div className="space-y-1 text-sm">
                      {mode === 'edit' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">ID:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono">
                              {formData.id}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Resources:</span>
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
                        </>
                      )}
                      {mode === 'create' && (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-2">
                          Configure permissions after creation
                        </div>
                      )}
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