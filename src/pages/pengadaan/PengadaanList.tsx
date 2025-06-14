// src/pages/pengadaan/PengadaanList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  Search, 
  RefreshCw,
  TrendingDown,
  ShoppingCart,
  BarChart3,
  Filter
} from 'lucide-react';
import { useCategoryStore } from '../../store/useCategoryStore';

const PengadaanList: React.FC = () => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    clearError
  } = useCategoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(true);

  // Load categories saat component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories berdasarkan search dan low stock
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLowStock = showOnlyLowStock ? category.is_low_stock : true;
    
    // Filter hanya kategori yang masuk akal untuk inventory fisik
    const isPhysicalInventory = category.has_stock && 
                               !category.name.toLowerCase().includes('license') &&
                               !category.name.toLowerCase().includes('software') &&
                               !category.name.toLowerCase().includes('digital') &&
                               !category.name.toLowerCase().includes('virtual') &&
                               !category.code.toLowerCase().includes('sft') &&
                               !category.code.toLowerCase().includes('lic');
    
    return matchesSearch && matchesLowStock && isPhysicalInventory;
  });

  // Hitung statistik hanya untuk physical inventory
  const physicalCategories = categories.filter(cat => 
    cat.has_stock && 
    !cat.name.toLowerCase().includes('license') &&
    !cat.name.toLowerCase().includes('software') &&
    !cat.name.toLowerCase().includes('digital') &&
    !cat.name.toLowerCase().includes('virtual') &&
    !cat.code.toLowerCase().includes('sft') &&
    !cat.code.toLowerCase().includes('lic')
  );

  const stats = {
    totalCategories: physicalCategories.length,
    lowStockCategories: physicalCategories.filter(cat => cat.is_low_stock).length,
    outOfStockCategories: physicalCategories.filter(cat => cat.current_stock === 0).length,
    totalCurrentStock: physicalCategories.reduce((sum, cat) => sum + (cat.current_stock || 0), 0)
  };

  // Get stock level color
  const getStockLevelColor = (current: number, reorder: number) => {
    if (current === 0) return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
    if (current <= reorder) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
    return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
  };

  // Get stock level text
  const getStockLevelText = (current: number, reorder: number) => {
    if (current === 0) return 'Out of Stock';
    if (current <= reorder) return 'Low Stock';
    return 'In Stock';
  };

  // Get urgency level
  const getUrgencyLevel = (current: number, reorder: number) => {
    if (current === 0) return 'Critical';
    if (current <= reorder * 0.5) return 'High';
    if (current <= reorder) return 'Medium';
    return 'Low';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pengadaan data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ShoppingCart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pengadaan Barang
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchCategories()}
                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </button>
              <Link
                to="/purchasing/create"
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Package className="h-4 w-4 mr-2" />
                Input Barang Masuk
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Kategori</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Perlu Pengadaan</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.lowStockCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stok Habis</p>
                <p className="text-2xl font-semibold text-red-600">{stats.outOfStockCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stok</p>
                <p className="text-2xl font-semibold text-green-600">{stats.totalCurrentStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari kategori atau kode..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showOnlyLowStock}
                    onChange={(e) => setShowOnlyLowStock(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Hanya yang perlu pengadaan
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Menampilkan {filteredCategories.length} dari {physicalCategories.length} kategori fisik
                <br />
                <span className="text-xs">*Mengecualikan software, license, dan item digital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        {filteredCategories.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stok Saat Ini
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reorder Point
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCategories.map((category) => {
                    const urgency = getUrgencyLevel(category.current_stock, category.reorder_point);
                    return (
                      <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {category.code}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {category.current_stock}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {category.reorder_point}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockLevelColor(category.current_stock, category.reorder_point)}`}>
                            {getStockLevelText(category.current_stock, category.reorder_point)}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${getUrgencyColor(urgency)}`}></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {urgency}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/purchasing/create?category=${category.id}`}
                            className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Order
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {showOnlyLowStock ? 'Tidak Ada Pengadaan Fisik' : 'Tidak Ada Data'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {showOnlyLowStock 
                ? 'Semua kategori barang fisik masih memiliki stok yang cukup.'
                : 'Tidak ada kategori barang fisik yang ditemukan dengan filter saat ini.'
              }
              <br />
              <span className="text-xs">*Software, license, dan item digital tidak ditampilkan</span>
            </p>
            {showOnlyLowStock && (
              <button
                onClick={() => setShowOnlyLowStock(false)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Lihat Semua Kategori
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PengadaanList;