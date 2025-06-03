import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  MoreVertical,
  Truck,
  Package,
  Phone,
  Mail,
  User,
  MapPin,
  Building
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSupplierStore } from '../../store/useSupplierStore';
import { Supplier } from '../../types/supplier.types';

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Components
const SupplierCard = ({ supplier, darkMode = false, onDelete }: {
  supplier: Supplier;
  darkMode?: boolean;
  onDelete: (supplier: Supplier) => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
      onDelete(supplier);
    }
    setShowDropdown(false);
  };

  const hasContact = supplier.contact_person || supplier.phone || supplier.email;

  return (
    <div className={`
      rounded-lg border transition-all duration-200 hover:shadow-md
      ${darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200 hover:border-gray-300'
      }
    `}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}
            `}>
              <Building className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} break-words`}>
                {supplier.name}
              </h3>
              {supplier.address && (
                <div className="flex items-start mt-1">
                  <MapPin className={`w-4 h-4 mr-1 mt-0.5 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} break-words`}>
                    {supplier.address}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`
                p-2 rounded-lg transition-colors
                ${darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className={`
                  absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  border ring-1 ring-black ring-opacity-5
                `}>
                  <div className="py-1">
                    <Link
                      to={`/suppliers/${supplier.id}`}
                      className={`
                        flex items-center w-full px-4 py-2 text-sm transition-colors
                        ${darkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      onClick={() => setShowDropdown(false)}
                    >
                      <Eye className="w-4 h-4 mr-3" />
                      View Details
                    </Link>
                    <Link
                      to={`/suppliers/edit/${supplier.id}`}
                      className={`
                        flex items-center w-full px-4 py-2 text-sm transition-colors
                        ${darkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      onClick={() => setShowDropdown(false)}
                    >
                      <Edit className="w-4 h-4 mr-3" />
                      Edit Supplier
                    </Link>
                    <button
                      onClick={handleDelete}
                      className={`
                        flex items-center w-full px-4 py-2 text-sm transition-colors text-left
                        ${darkMode 
                          ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' 
                          : 'text-red-600 hover:bg-red-50'
                        }
                      `}
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Delete Supplier
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="mt-4 space-y-2">
          {supplier.contact_person && (
            <div className="flex items-center">
              <User className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {supplier.contact_person}
              </span>
            </div>
          )}
          
          {supplier.phone && (
            <div className="flex items-center">
              <Phone className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <a 
                href={`tel:${supplier.phone}`}
                className={`text-sm transition-colors ${
                  darkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {supplier.phone}
              </a>
            </div>
          )}
          
          {supplier.email && (
            <div className="flex items-center">
              <Mail className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <a 
                href={`mailto:${supplier.email}`}
                className={`text-sm transition-colors break-all ${
                  darkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {supplier.email}
              </a>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Updated {formatDate(supplier.updated_at)}
            </span>
          </div>
          
          {supplier.notes && (
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {supplier.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Suppliers List Component
const SuppliersList = () => {
  const { darkMode } = useTheme();
  const {
    suppliers,
    isLoading,
    error,
    fetchSuppliers,
    deleteSupplier,
    clearError
  } = useSupplierStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with-contact' | 'no-contact'>('all');

  // Load suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Handle supplier deletion
  const handleDeleteSupplier = async (supplier: Supplier) => {
    await deleteSupplier(supplier.id);
  };

  // Filter and search logic
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasContact = supplier.contact_person || supplier.phone || supplier.email;
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'with-contact' && hasContact) ||
                         (filterType === 'no-contact' && !hasContact);
    
    return matchesSearch && matchesFilter;
  });

  // Stats
  const stats = {
    total: suppliers.length,
    withContact: suppliers.filter(s => s.contact_person || s.phone || s.email).length,
    withoutContact: suppliers.filter(s => !s.contact_person && !s.phone && !s.email).length,
    recentlyAdded: suppliers.filter(s => {
      const created = new Date(s.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Suppliers
            </h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your supplier network and vendor relationships
            </p>
          </div>
          <Link
            to="/suppliers/create"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Supplier
          </Link>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Suppliers
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <User className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                With Contact
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.withContact}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <Building className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Incomplete Info
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.withoutContact}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900">
              <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Recently Added
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.recentlyAdded}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`p-6 rounded-xl border mb-8 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search suppliers by name, contact person, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                }
                focus:outline-none focus:ring-2
              `}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className={`
                px-4 py-3 rounded-lg border transition-colors
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                }
                focus:outline-none focus:ring-2
              `}
            >
              <option value="all">All Suppliers</option>
              <option value="with-contact">With Contact Info</option>
              <option value="no-contact">Incomplete Contact</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              darkMode={darkMode}
              onDelete={handleDeleteSupplier}
            />
          ))}
        </div>
      ) : (
        <div className={`
          text-center py-12 rounded-xl border-2 border-dashed
          ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}
        `}>
          <Truck className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            No suppliers found
          </h3>
          <p className={`mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first supplier'
            }
          </p>
          {(!searchTerm && filterType === 'all') && (
            <Link
              to="/suppliers/create"
              className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default SuppliersList;