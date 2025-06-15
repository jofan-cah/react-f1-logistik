// src/pages/categories/CategoriesList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  SearchIcon, 
  EditIcon, 
  DeleteIcon, 
  ViewIcon,
  ExclamationIcon
} from '../../components/ui/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useCategoryStore } from '../../store/useCategoryStore';
import { Category, CategoryFilters } from '../../types/category.types';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Icons for ISP categories
const getCategoryIcon = (code: string) => {
  const icons: Record<string, string> = {
    'RTR': '🌐', // Router
    'SWT': '🔗', // Switch
    'AP': '📡',  // Access Point
    'FBR': '💡', // Fiber
    'OLT': '📶', // OLT
    'ONU': '📺', // ONU/ONT
    'TLS': '🔧', // Tools
    'SRV': '🖥️', // Server
    'UPS': '🔋', // UPS/Power
    'SPL': '🔀', // Splitter
    'DWDM': '🚀', // DWDM
    'WRL': '📡', // Wireless
    'PP': '🔌',  // Patch Panel
    'MON': '📊'  // Monitoring
  };
  return icons[code] || '📦';
};

// Components
const StatusBadge = ({ has_stock, darkMode = false }: { has_stock: boolean; darkMode?: boolean }) => {
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${has_stock 
        ? darkMode 
          ? 'bg-green-900 text-green-200' 
          : 'bg-green-100 text-green-800'
        : darkMode 
          ? 'bg-gray-700 text-gray-300' 
          : 'bg-gray-100 text-gray-600'
      }
    `}>
      {has_stock ? '✓ Stock Tracked' : '✗ No Stock'}
    </span>
  );
};

const LowStockBadge = ({ is_low_stock, darkMode = false }: { is_low_stock: boolean; darkMode?: boolean }) => {
  if (!is_low_stock) return null;
  
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${darkMode 
        ? 'bg-red-900 text-red-200' 
        : 'bg-red-100 text-red-800'
      }
    `}>
      ⚠️ Low Stock
    </span>
  );
};

const CategoryCard = ({ 
  category, 
  darkMode = false, 
  onDelete 
}: {
  category: Category;
  darkMode?: boolean;
  onDelete: (category: Category) => void;
}) => {
  const handleDelete = () => {
    onDelete(category);
  };

  return (
    <div className={`
      rounded-lg border transition-all duration-200 hover:shadow-md relative
      ${darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200 hover:border-gray-300'
      }
    `}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg
              ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-indigo-100 text-indigo-800'}
            `}>
              <span className="text-lg">{getCategoryIcon(category.code)}</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {category.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {category.code}
                </span>
                <StatusBadge has_stock={category.has_stock} darkMode={darkMode} />
                <LowStockBadge is_low_stock={category.is_low_stock} darkMode={darkMode} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={`/categories/${category.id}`}
              className={`
                p-2 rounded-lg transition-colors
                ${darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }
              `}
              title="View Details"
            >
              <ViewIcon className="w-4 h-4" />
            </Link>
            <Link
              to={`/categories/edit/${category.id}`}
              className={`
                p-2 rounded-lg transition-colors
                ${darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }
              `}
              title="Edit"
            >
              <EditIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              className={`
                p-2 rounded-lg transition-colors
                ${darkMode 
                  ? 'hover:bg-red-900 text-red-400 hover:text-red-300' 
                  : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                }
              `}
              title="Delete"
            >
              <DeleteIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {category.has_stock && (
              <>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Current Stock</p>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {category.current_stock.toLocaleString()} {category.unit}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Min/Max Stock</p>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {category.min_stock} / {category.max_stock} {category.unit}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Reorder Point</p>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {category.reorder_point} {category.unit}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Stock Status</p>
                  <p className={`text-sm font-semibold ${
                    category.is_low_stock 
                      ? 'text-red-600' 
                      : darkMode 
                        ? 'text-green-400' 
                        : 'text-green-600'
                  }`}>
                    {category.is_low_stock ? 'Low Stock' : 'Normal'}
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Updated {formatDate(category.updated_at)}
            </span>
          </div>
          
          {category.notes && (
            <p className={`mt-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
              {category.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ 
  pagination, 
  onPageChange, 
  darkMode = false 
}: {
  pagination: any;
  onPageChange: (page: number) => void;
  darkMode?: boolean;
}) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;

  return (
    <div className="flex items-center justify-between">
      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
        Showing page {page} of {totalPages} ({pagination.total} total categories)
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className={`
            p-2 rounded-lg border transition-colors
            ${!hasPrevPage 
              ? 'opacity-50 cursor-not-allowed' 
              : darkMode
                ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }
          `}
        >
          <ExclamationIcon className="w-4 h-4" />
        </button>
        
        <span className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {page} / {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className={`
            p-2 rounded-lg border transition-colors
            ${!hasNextPage 
              ? 'opacity-50 cursor-not-allowed' 
              : darkMode
                ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }
          `}
        >
          <ExclamationIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main Categories List Component
const CategoriesList = () => {
  const { darkMode } = useTheme();
  const {
    categories,
    pagination,
    categoryStats,
    isLoading,
    error,
    filters,
    fetchCategories,
    fetchCategoryStats,
    deleteCategory,
    setFilters,
    clearError
  } = useCategoryStore();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    fetchCategories();
    fetchCategoryStats();
  }, []);

  // Search and filter handlers
  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
    fetchCategories({ ...filters, search, page: 1 });
  };

  const handleFilterChange = (filterType: string) => {
    const newFilters: CategoryFilters = { ...filters, page: 1 };
    
    if (filterType === 'all') {
      delete newFilters.has_stock;
      delete newFilters.is_low_stock;
    } else if (filterType === 'stock') {
      newFilters.has_stock = true;
      delete newFilters.is_low_stock;
    } else if (filterType === 'no-stock') {
      newFilters.has_stock = false;
      delete newFilters.is_low_stock;
    } else if (filterType === 'low-stock') {
      newFilters.has_stock = true;
      newFilters.is_low_stock = true;
    }
    
    setFilters(newFilters);
    fetchCategories(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchCategories(newFilters);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCategory) {
      const success = await deleteCategory(selectedCategory.id);
      if (success) {
        setShowDeleteModal(false);
        setSelectedCategory(null);
        // Refresh stats after deletion
        fetchCategoryStats();
      }
    }
  };

  // Get current filter type for UI
  const getCurrentFilterType = () => {
    if (filters.is_low_stock) return 'low-stock';
    if (filters.has_stock === true) return 'stock';
    if (filters.has_stock === false) return 'no-stock';
    return 'all';
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Categories
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage your product categories and stock settings
                {pagination && ` (${pagination.total} total)`}
              </p>
            </div>
            <Link
              to="/categories/create"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Category
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationIcon />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {categoryStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Categories
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {categoryStats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    With Stock Tracking
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {categoryStats.withStock}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Low Stock
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {categoryStats.lowStock}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Stock Value
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {categoryStats.totalStockValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className={`p-6 rounded-xl border mb-8 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500'
                  }
                  focus:outline-none focus:ring-2
                `}
              />
            </div>
            
            <select
              value={getCurrentFilterType()}
              onChange={(e) => handleFilterChange(e.target.value)}
              className={`
                px-4 py-3 rounded-lg border transition-colors
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
                }
                focus:outline-none focus:ring-2
              `}
            >
              <option value="all">All Categories</option>
              <option value="stock">With Stock Tracking</option>
              <option value="no-stock">No Stock Tracking</option>
              <option value="low-stock">Low Stock Alert</option>
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  darkMode={darkMode}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {pagination && (
              <div className={`
                p-4 rounded-xl border
                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              `}>
                <Pagination 
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  darkMode={darkMode}
                />
              </div>
            )}
          </>
        ) : (
          <div className={`
            text-center py-12 rounded-xl border-2 border-dashed
            ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}
          `}>
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No categories found
            </h3>
            <p className={`mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {filters.search || getCurrentFilterType() !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first category'
              }
            </p>
            {(!filters.search && getCurrentFilterType() === 'all') && (
              <Link
                to="/categories/create"
                className="inline-flex items-center mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Category
              </Link>
            )}
          </div>
        )}

        {/* Delete confirmation modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Category"
          message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CategoriesList;