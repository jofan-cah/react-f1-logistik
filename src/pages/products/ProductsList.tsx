// src/pages/products/ProductsList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  TrashIcon, 
  PencilIcon, 
  EyeIcon,
  PrinterIcon,
  QrCodeIcon,
  CheckIcon,
  XIcon,
  CalendarIcon
} from '../../components/ui/Icons';
import Pagination from '../../components/ui/Pagination';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import Badge from '../../components/ui/Badge';
import BulkQRGenerator from '../../components/BulkQRGenerator';
import { useProductStore } from '../../store/useProductStore';
import { Product } from '../../types/product.types';

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

const ProductsList: React.FC = () => {
  const {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,
    fetchProducts,
    deleteProduct,
    setFilters,
    setCurrentPage,
    clearError
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState<string>(filters.search || '');
  const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  
  // MODIFIED: QR Label printing states
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showBulkQRModal, setShowBulkQRModal] = useState<boolean>(false);
  const [selectedProductsForQR, setSelectedProductsForQR] = useState<Product[]>([]);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Product statuses
  const statuses = ['Available', 'In Use', 'Under Maintenance', 'Retired', 'Lost', 'Checked Out'];

  // Date range options for filtering new products
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: '3months', label: 'Last 3 Months' }
  ];

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Update filters when debounced search term changes
  useEffect(() => {
    const newFilters = {
      ...filters,
      search: debouncedSearchTerm || undefined
    };
    
    // Only update if search term actually changed
    if (debouncedSearchTerm !== (filters.search || '')) {
      setFilters(newFilters);
    }
  }, [debouncedSearchTerm]);

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setFilterStatus(status);
    const newFilters = {
      ...filters,
      status: status === 'all' ? undefined : status
    };
    setFilters(newFilters);
  };

  // Handle date range filter change
  const handleDateRangeFilterChange = (range: string) => {
    setFilterDateRange(range);
    let dateFilter = undefined;
    
    if (range !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (range) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      dateFilter = startDate.toISOString().split('T')[0];
    }
    
    const newFilters = {
      ...filters,
      created_after: dateFilter
    };
    setFilters(newFilters);
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle product deletion
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      const success = await deleteProduct(selectedProduct.product_id);
      if (success) {
        setShowDeleteModal(false);
        setSelectedProduct(null);
      }
    }
  };

  // MODIFIED: QR Label printing functions
  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.product_id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts(new Set());
    setIsSelectMode(false);
  };

  // MODIFIED: Open BulkQRGenerator directly when Print QR button clicked
  const handlePrintQRClick = () => {
    if (selectedProducts.size === 0) {
      alert('Please select at least one product');
      return;
    }

    const selectedProductData = products.filter(p => selectedProducts.has(p.product_id));
    setSelectedProductsForQR(selectedProductData);
    setShowBulkQRModal(true);
  };

  // Handle BulkQRGenerator success
  const handleQRGeneratorSuccess = () => {
    setShowBulkQRModal(false);
    setSelectedProducts(new Set());
    setIsSelectMode(false);
    
    // Optional: Show success message
    console.log('QR codes generated and printed successfully!');
  };

  // Format currency
  const formatCurrency = (amount: string | number | undefined) => {
    if (amount === undefined || amount === null) return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '-';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if product is recently added (within last 7 days)
  const isRecentlyAdded = (createdAt: string | undefined) => {
    if (!createdAt) return false;
    const now = new Date();
    const created = new Date(createdAt);
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Get status badge type
  const getStatusBadgeType = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'In Use':
      case 'Checked Out':
        return 'primary';
      case 'Under Maintenance':
        return 'warning';
      case 'Retired':
        return 'gray';
      case 'Lost':
        return 'danger';
      default:
        return 'gray';
    }
  };

  // Calculate pagination info
  const paginationInfo = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  }, [currentPage, itemsPerPage, totalItems]);

  // Count recently added products
  const recentlyAddedCount = useMemo(() => {
    return products.filter(p => isRecentlyAdded(p.created_at)).length;
  }, [products]);

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-6">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your inventory products ({totalItems} total)
            {recentlyAddedCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {recentlyAddedCount} baru
              </span>
            )}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* QR Print Actions - Show when in select mode */}
          {isSelectMode && (
            <>
              <button
                onClick={handleClearSelection}
                className="btn bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md flex items-center"
              >
                <XIcon className="w-4 h-4 mr-2" />
                Cancel
              </button>
              
              {selectedProducts.size > 0 && (
                <button
                  onClick={handlePrintQRClick}
                  className="btn bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md flex items-center"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print QR ({selectedProducts.size})
                </button>
              )}
            </>
          )}

          {/* Normal Actions */}
          {!isSelectMode && (
            <>
              <button
                onClick={() => setIsSelectMode(true)}
                className="btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center"
                disabled={products.length === 0}
              >
                <QrCodeIcon className="w-4 h-4 mr-2" />
                Print QR Labels
              </button>
              
              <Link
                to="/products/new"
                className="btn bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
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

      {/* Search and filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 
                  text-gray-900 dark:text-gray-100 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 
                  focus:border-indigo-500 dark:focus:border-indigo-400 
                  placeholder-gray-400 dark:placeholder-gray-500
                  w-full sm:w-80 transition-colors duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Date Range Filter for New Products */}
          <select
            className="pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                  rounded-md focus:outline-none focus:ring-2 
                focus:ring-indigo-500 dark:focus:ring-indigo-400 
                  focus:border-indigo-500 dark:focus:border-indigo-400
                  transition-colors duration-200"
            value={filterDateRange}
            onChange={(e) => handleDateRangeFilterChange(e.target.value)}
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                  rounded-md focus:outline-none focus:ring-2 
                focus:ring-indigo-500 dark:focus:ring-indigo-400 
                  focus:border-indigo-500 dark:focus:border-indigo-400
                  transition-colors duration-200"
            value={filterStatus}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                  rounded-md bg-white dark:bg-gray-800 
                  text-gray-700 dark:text-gray-200 
                  hover:bg-gray-50 dark:hover:bg-gray-700 
                  flex items-center transition-colors duration-200"
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Select Mode Info */}
      {isSelectMode && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <QrCodeIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-blue-800 dark:text-blue-200">
                Select products to print QR labels. {selectedProducts.size} selected.
              </span>
            </div>
            <button
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium"
            >
              {selectedProducts.size === products.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {filters.search || filters.status ? 
                'Tidak ada produk yang ditemukan sesuai kriteria pencarian Anda.' :
                'Belum ada produk. Mulai dengan menambahkan produk pertama Anda.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {/* Select Column - Show in select mode */}
                  {isSelectMode && (
                    <th scope="col" className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === products.length && products.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </th>
                  )}
                  
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Produk
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kategori/Merek
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pembelian
                  </th>
                  {!isSelectMode && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {/* Select Column - Show in select mode */}
                    {isSelectMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.product_id)}
                          onChange={() => handleSelectProduct(product.product_id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                              {product.name}
                            </span>
                            {isRecentlyAdded(product.created_at) && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Baru
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {product.product_id}
                            {product.serial_number && <span> | SN: {product.serial_number}</span>}
                            {product.quantity && <span> | Qty: {product.quantity}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">{product.Category?.name || '-'}</div>
                      {product.brand && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.brand} {product.model && `/ ${product.model}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">{product.location || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        type={getStatusBadgeType(product.status)}
                        text={product.status}
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Kondisi: {product.condition}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">{formatCurrency(product.purchase_price)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(product.purchase_date || '')}</div>
                    </td>
                    {!isSelectMode && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/products/${product.product_id}`}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Lihat"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/products/edit/${product.product_id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Hapus"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && products.length > 0 && totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {paginationInfo.start} hingga {paginationInfo.end} dari {totalItems} produk
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* BulkQRGenerator Modal */}
      <BulkQRGenerator
        products={selectedProductsForQR}
        isOpen={showBulkQRModal}
        onClose={() => setShowBulkQRModal(false)}
        onSuccess={handleQRGeneratorSuccess}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductsList;