import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Mail,
  Phone,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  Building,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/useUserStore';
import { User as UserType, UserFilters } from '../../types/user.types';

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Zustand store
  const {
    users,
    userLevels,
    isLoading,
    error,
    totalPages,
    currentPage,
    totalItems,
    fetchUsers,
    fetchUserLevels,
    deleteUser,
    toggleUserStatus,
    setCurrentPage: setPage,
    clearError
  } = useUserStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchUsers();
    fetchUserLevels();
  }, [fetchUsers, fetchUserLevels]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm.trim() || undefined };
    setFilters(newFilters);
    fetchUsers(1, 10, newFilters);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    const newFilters = { ...filters, [key]: value === '' ? undefined : value };
    setFilters(newFilters);
    fetchUsers(1, 10, newFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPage(page);
    fetchUsers(page, 10, filters);
  };

  // Handle user deletion
  const handleDelete = async (id: string) => {
    if (!id) return;

    setIsDeleting(true);
    try {
      const success = await deleteUser(id);
      if (success) {
        setDeleteConfirm(null);
        // Refresh current page
        fetchUsers(currentPage, 10, filters);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle user status
  const handleToggleActive = async (id: string) => {
    try {
      await toggleUserStatus(id);
      // Refresh current page
      fetchUsers(currentPage, 10, filters);
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  // Helper functions
  const getUserLevelBadgeColor = (levelId: string) => {
    switch (levelId.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return `${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'}`;
      case 'manager':
        return `${darkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800'}`;
      case 'staff':
        return `${darkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'}`;
      case 'viewer':
        return `${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`;
      default:
        return `${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueValues = (key: keyof UserType) => {
    return [...new Set(users.map(u => u[key]).filter(Boolean))];
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Users Management
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage user accounts and permissions
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchUsers(currentPage, 10, filters)}
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode 
                    ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => navigate('/users/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className={`rounded-lg shadow mb-6 border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search users by name, username, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md transition-colors duration-200 focus:ring-blue-500 focus:border-blue-500 ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                    darkMode 
                      ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Advanced Filters */}
            {showFilters && (
              <div className={`mt-4 pt-4 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      User Level
                    </label>
                    <select
                      value={filters.user_level_id || ''}
                      onChange={(e) => handleFilterChange('user_level_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:ring-blue-500 focus:border-blue-500 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="">All Levels</option>
                      {userLevels.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Department
                    </label>
                    <select
                      value={filters.department || ''}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:ring-blue-500 focus:border-blue-500 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="">All Departments</option>
                      {getUniqueValues('department').map(dept => (
                        <option key={dept} value={dept as string}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Status
                    </label>
                    <select
                      value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                      onChange={(e) => handleFilterChange('is_active', 
                        e.target.value === '' ? undefined : e.target.value === 'true'
                      )}
                      className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:ring-blue-500 focus:border-blue-500 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Sort By
                    </label>
                    <select
                      value={filters.sort_by || 'created_at'}
                      onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:ring-blue-500 focus:border-blue-500 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="created_at">Date Created</option>
                      <option value="full_name">Name</option>
                      <option value="username">Username</option>
                      <option value="last_login">Last Login</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className={`rounded-lg shadow overflow-hidden border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Users ({totalItems})
              </h2>
              
              <button
                onClick={() => {/* Implement export */}}
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode 
                    ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <User className={`h-12 w-12 mx-auto mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-300'
              }`} />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No users found
              </p>
              <p className={`mb-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchTerm || Object.keys(filters).length > 0 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first user'
                }
              </p>
              {(!searchTerm && Object.keys(filters).length === 0) && (
                <button
                  onClick={() => navigate('/users/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${
                darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      User
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Contact
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Level & Department
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Last Login
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                }`}>
                  {users.map((user) => (
                    <tr key={user.id} className={`transition-colors duration-200 ${
                      darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                            }`}>
                              <User className={`h-5 w-5 ${
                                darkMode ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {user.full_name}
                            </div>
                            <div className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {user.email && (
                            <div className={`flex items-center text-sm ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              <Mail className={`h-3 w-3 mr-1 ${
                                darkMode ? 'text-gray-500' : 'text-gray-400'
                              }`} />
                              {user.email}
                            </div>
                          )}
                          {user.phone && (
                            <div className={`flex items-center text-sm mt-1 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getUserLevelBadgeColor(user.user_level_id)
                          }`}>
                            {user.UserLevel?.name || user.user_level_id}
                          </span>
                          {user.department && (
                            <div className={`flex items-center text-xs mt-1 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <Building className="h-3 w-3 mr-1" />
                              {user.department}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-sm ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          <Calendar className={`h-4 w-4 mr-1 ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                          {formatDate(user.last_login)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          user.is_active
                            ? `${darkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'}`
                            : `${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'}`
                        }`}>
                          {user.is_active ? (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/users/${user.id}`)}
                            className={`transition-colors duration-200 ${
                              darkMode 
                                ? 'text-blue-400 hover:text-blue-300' 
                                : 'text-blue-600 hover:text-blue-900'
                            }`}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => navigate(`/users/edit/${user.id}`)}
                            className={`transition-colors duration-200 ${
                              darkMode 
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-yellow-600 hover:text-yellow-900'
                            }`}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleActive(user.id)}
                            className={`transition-colors duration-200 ${
                              user.is_active
                                ? darkMode 
                                  ? 'text-orange-400 hover:text-orange-300' 
                                  : 'text-orange-600 hover:text-orange-900'
                                : darkMode 
                                  ? 'text-green-400 hover:text-green-300' 
                                  : 'text-green-600 hover:text-green-900'
                            }`}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className={`transition-colors duration-200 ${
                              darkMode 
                                ? 'text-red-400 hover:text-red-300' 
                                : 'text-red-600 hover:text-red-900'
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-4 py-3 flex items-center justify-between border-t sm:px-6 rounded-lg shadow mt-6 border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode 
                    ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode 
                    ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Showing{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * 10 + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, totalItems)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600' 
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    const isCurrentPage = pageNumber === currentPage;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                          isCurrentPage
                            ? darkMode 
                              ? 'z-10 bg-blue-900/30 border-blue-400 text-blue-400'
                              : 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : darkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600' 
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="mt-3 text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                darkMode ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <Trash2 className={`h-6 w-6 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <h3 className={`text-lg font-medium mt-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Delete User
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className={`px-4 py-2 border rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' 
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 inline-flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;