import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCategoryStore } from '../../store/useCategoryStore';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../../types/category.types';

// Form data interface
interface CategoryFormData {
  name: string;
  code: string;
  has_stock: boolean;
  min_stock: number;
  unit: string;
  notes: string;
}

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { darkMode } = useTheme();
  const isEdit = Boolean(id);

  // Zustand store
  const {
    currentCategory,
    isLoading,
    error,
    getCategoryById,
    createCategory,
    updateCategory,
    clearError,
    clearCurrentCategory
  } = useCategoryStore();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    code: '',
    has_stock: false,
    min_stock: 0,
    unit: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data for editing
  useEffect(() => {
    if (isEdit && id) {
      const categoryId = parseInt(id);
      if (!isNaN(categoryId)) {
        getCategoryById(categoryId);
      }
    }

    // Cleanup when component unmounts
    return () => {
      clearCurrentCategory();
      clearError();
    };
  }, [isEdit, id, getCategoryById, clearCurrentCategory, clearError]);

  // Populate form when category data is loaded
  useEffect(() => {
    if (currentCategory && isEdit) {
      setFormData({
        name: currentCategory.name || '',
        code: currentCategory.code || '',
        has_stock: currentCategory.has_stock || false,
        min_stock: currentCategory.min_stock || 0,
        unit: currentCategory.unit || '',
        notes: currentCategory.notes || ''
      });
    }
  }, [currentCategory, isEdit]);

  const validate = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Category code is required';
    } else if (formData.code.length !== 3) {
      newErrors.code = 'Category code must be exactly 3 characters';
    }

    if (formData.has_stock && formData.min_stock < 0) {
      newErrors.min_stock = 'Minimum stock cannot be negative';
    }

    if (formData.has_stock && !formData.unit.trim()) {
      newErrors.unit = 'Stock unit is required when stock tracking is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    clearError();
    
    try {
      let success = false;

      if (isEdit && id) {
        const updateData: UpdateCategoryRequest = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          has_stock: formData.has_stock,
          min_stock: formData.has_stock ? formData.min_stock : 0,
          unit: formData.has_stock ? formData.unit.trim() : '',
          notes: formData.notes.trim()
        };
        success = await updateCategory(parseInt(id), updateData);
      } else {
        const createData: CreateCategoryRequest = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          has_stock: formData.has_stock,
          min_stock: formData.has_stock ? formData.min_stock : 0,
          unit: formData.has_stock ? formData.unit.trim() : '',
          notes: formData.notes.trim()
        };
        success = await createCategory(createData);
      }

      if (success) {
        navigate('/categories');
      }
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCancel = () => {
    navigate('/categories');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Loading category data...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="w-full mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className={`
              flex items-center text-sm mb-4 transition-colors
              ${darkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </button>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isEdit ? 'Edit Category' : 'Add New Category'}
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isEdit ? 'Update category information' : 'Create a new product category'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
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

        {/* Form */}
        <div className={`
          rounded-xl border shadow-sm
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter category name"
                className={`
                  w-full px-4 py-3 rounded-lg border transition-colors
                  ${errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : darkMode
                      ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                  }
                  focus:outline-none focus:ring-2
                `}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Category Code */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Category Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="ELC"
                maxLength={3}
                className={`
                  w-full px-4 py-3 rounded-lg border transition-colors uppercase
                  ${errors.code
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : darkMode
                      ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                  }
                  focus:outline-none focus:ring-2
                `}
              />
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                3-character unique code for this category
              </p>
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            {/* Stock Tracking */}
            <div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="has_stock"
                  checked={formData.has_stock}
                  onChange={(e) => handleInputChange('has_stock', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="has_stock" className={`text-sm font-medium ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Enable stock tracking for this category
                </label>
              </div>
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                When enabled, products in this category will track stock levels
              </p>
            </div>

            {/* Minimum Stock & Unit (only show if stock tracking enabled) */}
            {formData.has_stock && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => handleInputChange('min_stock', parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="0"
                    className={`
                      w-full px-4 py-3 rounded-lg border transition-colors
                      ${errors.min_stock
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : darkMode
                          ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                      }
                      focus:outline-none focus:ring-2
                    `}
                  />
                  {errors.min_stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.min_stock}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Stock Unit *
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    placeholder="pcs, kg, liters, etc."
                    className={`
                      w-full px-4 py-3 rounded-lg border transition-colors
                      ${errors.unit
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : darkMode
                          ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                      }
                      focus:outline-none focus:ring-2
                    `}
                  />
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder="Additional information about this category..."
                className={`
                  w-full px-4 py-3 rounded-lg border transition-colors resize-none
                  ${darkMode
                    ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                  }
                  focus:outline-none focus:ring-2
                `}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className={`
                  px-6 py-3 text-sm font-medium rounded-lg transition-colors
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  inline-flex items-center px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors
                  bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEdit ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;