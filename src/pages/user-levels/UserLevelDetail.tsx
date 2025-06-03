// src/pages/user-levels/UserLevelDetail.tsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Shield, 
  Calendar,
  Eye,
  Plus,
  Edit as EditIcon,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { useUserLevelStore } from '../../store/useUserLevelStore';

const UserLevelDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const {
    currentUserLevel,
    isLoading,
    error,
    getUserLevelById,
    clearCurrentUserLevel
  } = useUserLevelStore();

  useEffect(() => {
    if (id) {
      getUserLevelById(id);
    }
    return () => {
      clearCurrentUserLevel();
    };
  }, [id]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModulePermissions = (module: string) => {
    if (!currentUserLevel?.UserPermissions) return null;
    return currentUserLevel.UserPermissions.find(p => p.module === module);
  };

  const availableModules = [
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUserLevel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'User level not found'}</p>
          <button
            onClick={() => navigate('/user-levels')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to User Levels
          </button>
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
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentUserLevel.level_name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  User Level Details
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate(`/user-levels/edit/${currentUserLevel.id}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Level
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Information</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level Name
                    </label>
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <p className="text-gray-900 dark:text-white font-medium">
                        {currentUserLevel.level_name}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {currentUserLevel.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Permissions</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {availableModules.map((module) => {
                    const modulePerms = getModulePermissions(module.id);
                    const hasPermissions = modulePerms && (
                      modulePerms.can_view || modulePerms.can_add || 
                      modulePerms.can_edit || modulePerms.can_delete
                    );
                    
                    return (
                      <div key={module.id} className={`border rounded-lg p-4 ${
                        hasPermissions 
                          ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-medium ${
                              hasPermissions 
                                ? 'text-green-900 dark:text-green-100' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {module.name}
                            </h3>
                            <p className={`text-sm ${
                              hasPermissions 
                                ? 'text-green-700 dark:text-green-300' 
                                : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {module.description}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {hasPermissions ? (
                              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {hasPermissions && modulePerms && (
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                            <div className="flex flex-wrap gap-2">
                              {modulePerms.can_view && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </span>
                              )}
                              {modulePerms.can_add && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </span>
                              )}
                              {modulePerms.can_edit && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                  <EditIcon className="h-3 w-3 mr-1" />
                                  Edit
                                </span>
                              )}
                              {modulePerms.can_delete && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </span>
                              )}
                            </div>
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
            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Statistics</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Modules enabled:</span>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {currentUserLevel.UserPermissions?.filter(p => 
                        p.can_view || p.can_add || p.can_edit || p.can_delete
                      ).length || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total permissions:</span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {currentUserLevel.UserPermissions?.reduce((sum, p) => 
                        sum + (p.can_view ? 1 : 0) + (p.can_add ? 1 : 0) + 
                        (p.can_edit ? 1 : 0) + (p.can_delete ? 1 : 0), 0
                      ) || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Details</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Created Date
                  </label>
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(currentUserLevel.createdAt)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Updated
                  </label>
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(currentUserLevel.updatedAt)}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => navigate(`/user-levels/edit/${currentUserLevel.id}`)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit User Level
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLevelDetail;