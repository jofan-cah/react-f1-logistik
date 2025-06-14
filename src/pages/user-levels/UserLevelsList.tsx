// src/pages/user-levels/UserLevelsList.tsx - Updated to match backend
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  Users,
  Search
} from 'lucide-react';
import { useUserLevelStore } from '../../store/useUserLevelStore';
import { UserLevelFilters } from '../../types/userLevel.types';

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const UserLevelsList: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    userLevels,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,
    fetchUserLevels,
    deleteUserLevel,
    setFilters,
    setCurrentPage,
    clearError,
    clearFilters
  } = useUserLevelStore();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(filters.search || '');
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Load data when component mounts - UPDATED: Include users and permissions
  useEffect(() => {
    console.log('=== INITIAL LOAD WITH INCLUDES ===');
    // Set filters first to include users and permissions
    setFilters({
      include_users: true,
      include_permissions: true
    });
  }, [setFilters]);

  // Update filters when debounced search term changes
  useEffect(() => {
    const newFilters: UserLevelFilters = {
      ...filters,
      search: debouncedSearchTerm || undefined
    };
    
    if (debouncedSearchTerm !== (filters.search || '')) {
      setFilters(newFilters);
    }
  }, [debouncedSearchTerm, filters, setFilters]);

  // Handle delete
  const handleDelete = async (id: string) => {
    const success = await deleteUserLevel(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get permission count - UPDATED to match actual backend response
  const getPermissionCount = (userLevel: any) => {
    console.log('Getting permission count for:', userLevel.id);
    console.log('UserLevel permissions:', userLevel.permissions);
    
    if (!userLevel.permissions || !Array.isArray(userLevel.permissions)) {
      console.log('No permissions array found');
      return 0;
    }
    
    const totalPermissions = userLevel.permissions.reduce((total: number, perm: any) => {
      const count = (perm.can_view ? 1 : 0) + (perm.can_add ? 1 : 0) + 
                   (perm.can_edit ? 1 : 0) + (perm.can_delete ? 1 : 0);
      console.log(`Permission for ${perm.module}:`, count);
      return total + count;
    }, 0);
    
    console.log('Total permissions:', totalPermissions);
    return totalPermissions;
  };

  // Get user count - UPDATED to match actual backend response
  const getUserCount = (userLevel: any) => {
    console.log('Getting user count for:', userLevel.id);
    console.log('UserLevel users:', userLevel.users);
    
    if (!userLevel.users || !Array.isArray(userLevel.users)) {
      console.log('No users array found');
      return 0;
    }
    
    const userCount = userLevel.users.length;
    console.log('User count:', userCount);
    return userCount;
  };

  // Calculate pagination info
  const paginationInfo = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  }, [currentPage, itemsPerPage, totalItems]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                User Levels
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage user roles and permissions ({totalItems} total)
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchUserLevels()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => navigate('/user-levels/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User Level
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search user levels..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-100 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-blue-500 dark:focus:border-blue-400 
                    placeholder-gray-400 dark:placeholder-gray-500
                    w-full sm:w-80 transition-colors duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                    rounded-md bg-white dark:bg-gray-800 
                    text-gray-700 dark:text-gray-200 
                    hover:bg-gray-50 dark:hover:bg-gray-700 
                    text-sm transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              User Levels ({totalItems})
              {filters.search && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  - filtered by "{filters.search}"
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : userLevels.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg text-gray-500">
                {filters.search ? 
                  'No user levels found matching your search.' :
                  'No user levels found'
                }
              </p>
              {!filters.search && (
                <button
                  onClick={() => navigate('/user-levels/create')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User Level
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {userLevels.map((level) => (
                  <div
                    key={level.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {level.level_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {level.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {level.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {level.description}
                        </p>
                      </div>
                    )}

                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Users
                        </span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {getUserCount(level)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Permissions</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {getPermissionCount(level)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Created: {formatDate(level.created_at)}
                      </div>
                      
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/user-levels/${level.id}`)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => navigate(`/user-levels/edit/${level.id}`)}
                          className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-md"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => setDeleteConfirm(level.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {paginationInfo.start} to {paginationInfo.end} of {totalItems} user levels
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium ${
                          page === currentPage
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium mt-4 text-gray-900 dark:text-white">
                Delete User Level
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this user level? This action cannot be undone and will affect all users assigned to this level.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLevelsList;