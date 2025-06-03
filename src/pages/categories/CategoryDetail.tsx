// src/pages/categories/CategoryDetail.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  EditIcon, 
  DeleteIcon, 
  ExclamationIcon
} from '../../components/ui/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useCategoryStore } from '../../store/useCategoryStore';
import { Category } from '../../types/category.types';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get ISP category icon
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

// Status Badge Component
const StatusBadge = ({ has_stock, darkMode = false }: { has_stock: boolean; darkMode?: boolean }) => {
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
      ${has_stock 
        ? darkMode 
          ? 'bg-green-900 text-green-200' 
          : 'bg-green-100 text-green-800'
        : darkMode 
          ? 'bg-gray-700 text-gray-300' 
          : 'bg-gray-100 text-gray-600'
      }
    `}>
      {has_stock ? '✅ Stock Tracking Enabled' : '❌ No Stock Tracking'}
    </span>
  );
};

const CategoryDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { darkMode } = useTheme();
  
  const {
    currentCategory,
    isLoading,
    error,
    getCategoryById,
    deleteCategory,
    clearError,
    clearCurrentCategory
  } = useCategoryStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load category data
  useEffect(() => {
    if (id) {
      getCategoryById(parseInt(id));
    }

    // Cleanup when component unmounts
    return () => {
      clearCurrentCategory();
    };
  }, [id, getCategoryById, clearCurrentCategory]);

  const handleEdit = () => {
    navigate(`/categories/edit/${id}`);
  };

  const handleDelete = async () => {
    if (currentCategory) {
      const success = await deleteCategory(currentCategory.id);
      if (success) {
        navigate('/categories');
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleBack = () => {
    navigate('/categories');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading category details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">❌</span>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Error Loading Category
            </h3>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {error}
            </p>
            <div className="mt-4 space-x-3">
              <button
                onClick={() => {
                  clearError();
                  if (id) getCategoryById(parseInt(id));
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Category not found
  if (!currentCategory) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Category not found
            </h3>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              The category you're looking for doesn't exist.
            </p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Categories
            </button>
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
          <button
            onClick={handleBack}
            className={`
              flex items-center text-sm mb-4 transition-colors
              ${darkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Categories
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`
                w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl
                ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-indigo-100 text-indigo-800'}
              `}>
                <span className="text-2xl">{getCategoryIcon(currentCategory.code)}</span>
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentCategory.name}
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentCategory.code}
                  </span>
                  <StatusBadge has_stock={currentCategory.has_stock} darkMode={darkMode} />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Updated {formatDate(currentCategory.updated_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEdit}
                className={`
                  inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }
                `}
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Category
              </button>
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <DeleteIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Information */}
          <div className={`
            rounded-xl border p-6
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Category Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Category Name
                </label>
                <p className={`mt-1 text-lg ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {currentCategory.name}
                </p>
              </div>
              
              <div>
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Category Code
                </label>
                <p className={`mt-1 text-lg font-mono ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {currentCategory.code}
                </p>
              </div>
              
              <div>
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Stock Tracking
                </label>
                <div className="mt-2">
                  <StatusBadge has_stock={currentCategory.has_stock} darkMode={darkMode} />
                </div>
              </div>
              
              {currentCategory.has_stock && (
                <>
                  <div>
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Minimum Stock Level
                    </label>
                    <p className={`mt-1 text-lg ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {currentCategory.min_stock.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Stock Unit
                    </label>
                    <p className={`mt-1 text-lg ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {currentCategory.unit || 'Not specified'}
                    </p>
                  </div>
                </>
              )}
              
              {currentCategory.notes && (
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Notes
                  </label>
                  <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentCategory.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics & Timeline */}
          <div className="space-y-6">
            {/* Statistics Card */}
            <div className={`
              rounded-xl border p-6
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
              <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Statistics
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Category ID
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentCategory.id}
                      </p>
                    </div>
                    <span className="text-2xl">🏷️</span>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Status
                      </p>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Active
                      </p>
                    </div>
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className={`
              rounded-xl border p-6
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
              <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Timeline
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      Created
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(currentCategory.created_at)}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      Last Updated
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(currentCategory.updated_at)}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className={`
              rounded-xl border p-6
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
              <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate(`/products?category_id=${currentCategory.id}`)}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg transition-colors
                    ${darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-lg mr-3">📦</span>
                  View Products in Category
                </button>
                
                <button 
                  onClick={() => navigate(`/products/new?category_id=${currentCategory.id}`)}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg transition-colors
                    ${darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-lg mr-3">➕</span>
                  Add Product to Category
                </button>
                
                {currentCategory.has_stock && (
                  <button className={`
                    w-full flex items-center px-4 py-3 rounded-lg transition-colors
                    ${darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}>
                    <span className="text-lg mr-3">⚠️</span>
                    Check Low Stock Items
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${currentCategory.name}"? This action cannot be undone.`}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CategoryDetail;