import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon,
  CalendarIcon
} from '../../components/ui/Icons';
import QRCodeWithLibrary from '../../components/QRCodeWithLibrary';
import Badge from '../../components/ui/Badge';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import TabsComponent from '../../components/ui/TabsComponent';
import TransactionHistoryTable from '../../components/tables/TransactionHistoryTable';
import ProductStockTab from '../../components/ProductStockTab'; // NEW IMPORT
import { useProductStore } from '../../store/useProductStore';
import { Product } from '../../types/product.types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Zustand store
  const {
    currentProduct,
    isLoading,
    error,
    getProductById,
    deleteProduct,
    clearError,
    clearCurrentProduct
  } = useProductStore();

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load product data
  useEffect(() => {
    if (id) {
      getProductById(id);
    }

    // Cleanup when component unmounts
    return () => {
      clearCurrentProduct();
      clearError();
    };
  }, [id, getProductById, clearCurrentProduct, clearError]);

  // Handle print QR code event
  useEffect(() => {
    const handlePrintQR = (event: CustomEvent) => {
      console.log('Print QR triggered for:', event.detail);
    };

    window.addEventListener('printQR', handlePrintQR as EventListener);
    
    return () => {
      window.removeEventListener('printQR', handlePrintQR as EventListener);
    };
  }, []);

  // Handle product deletion
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!currentProduct?.product_id) return;

    setIsDeleting(true);
    try {
      const success = await deleteProduct(currentProduct.product_id);
      if (success) {
        setShowDeleteModal(false);
        navigate('/products');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: string | number | undefined) => {
    if (amount === undefined || amount === null || amount === '') return '-';
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return '-';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numericAmount);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge type
  const getStatusBadgeType = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'success';
      case 'in use':
        return 'primary';
      case 'under maintenance':
        return 'warning';
      case 'retired':
        return 'gray';
      case 'lost':
        return 'danger';
      default:
        return 'gray';
    }
  };

  // Get condition badge type
  const getConditionBadgeType = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new':
        return 'success';
      case 'good':
        return 'primary';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'danger';
      default:
        return 'gray';
    }
  };

  // Calculate days until warranty expiry
  const getDaysUntilWarrantyExpiry = (expiryDate: string | undefined) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Get category and supplier names from relations or fallback
  const getCategoryName = (product: Product) => {
    return product.Category?.name || product.categoryName || '-';
  };

  const getSupplierName = (product: Product) => {
    return product.Supplier?.name || product.supplierName || '-';
  };

  // UPDATED: Tabs configuration with new Stock tab
  const tabs = [
    { id: 'details', label: 'Details' },
   
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'transactions', label: 'Transaction History' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-white shadow-md rounded-lg p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentProduct) {
    return (
      <div className="w-full">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go back to products
          </Link>
        </div>
      </div>
    );
  }

  // Product not found
  if (!currentProduct) {
    return (
      <div className="w-full">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <p className="text-gray-500">Product not found</p>
          <Link
            to="/products"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
          >
            Go back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/products')}
              className="mr-4 text-gray-500 p-2 rounded-md hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Product Details
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentProduct.product_id}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/products/edit/${id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Product Info */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <TabsComponent
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Product Information
                      </h2>
                      <div className="flex items-center space-x-2">
                        <Badge
                          type={getStatusBadgeType(currentProduct.status)}
                          text={currentProduct.status}
                        />
                        <Badge
                          type={getConditionBadgeType(currentProduct.condition)}
                          text={currentProduct.condition}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Product ID
                        </h3>
                        <p className="mt-1 text-base text-gray-900">
                          {currentProduct.product_id}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Name
                        </h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          {currentProduct.name}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Category
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {getCategoryName(currentProduct)}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Quantity
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {currentProduct.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Brand
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {currentProduct.brand || '-'}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Model
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {currentProduct.model || '-'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Serial Number
                        </h3>
                        <p className="mt-1 text-base text-gray-900">
                          {currentProduct.serial_number || '-'}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Location
                        </h3>
                        <p className="mt-1 text-base text-gray-900">
                          {currentProduct.location || '-'}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Description
                        </h3>
                        <p className="mt-1 text-base text-gray-900 whitespace-pre-line">
                          {currentProduct.description || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Purchase Details
                    </h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Purchase Date
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {formatDate(currentProduct.purchase_date)}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Purchase Price
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {formatCurrency(currentProduct.purchase_price)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Supplier
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {getSupplierName(currentProduct)}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            PO Number
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {currentProduct.po_number || '-'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Origin
                        </h3>
                        <p className="mt-1 text-base text-gray-900">
                          {currentProduct.origin || '-'}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Warranty Expiry
                        </h3>
                        <div className="mt-1 flex items-center">
                          <p className="text-base text-gray-900">
                            {formatDate(currentProduct.warranty_expiry)}
                          </p>
                          {currentProduct.warranty_expiry && (
                            <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                              getDaysUntilWarrantyExpiry(currentProduct.warranty_expiry)! > 90
                                ? 'bg-green-100 text-green-800'
                                : getDaysUntilWarrantyExpiry(currentProduct.warranty_expiry)! > 30
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {getDaysUntilWarrantyExpiry(currentProduct.warranty_expiry)! > 0
                                ? `${getDaysUntilWarrantyExpiry(currentProduct.warranty_expiry)} days left`
                                : 'Expired'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-sm font-medium text-gray-500">
                          Notes
                        </h3>
                        <p className="mt-1 text-base text-gray-900 whitespace-pre-line">
                          {currentProduct.notes || '-'}
                        </p>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">
                              Created At
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {new Date(currentProduct.created_at).toLocaleString('id-ID')}
                            </p>
                          </div>

                          <div className="text-right">
                            <h3 className="text-sm font-medium text-gray-500">
                              Last Updated
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {new Date(currentProduct.updated_at).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

         

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Maintenance Information
                    </h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Last Maintenance
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {formatDate(currentProduct.last_maintenance_date)}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Next Scheduled Maintenance
                          </h3>
                          <p className="mt-1 text-base text-gray-900">
                            {formatDate(currentProduct.next_maintenance_date)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Ticketing
                        </h3>
                        {currentProduct.is_linked_to_ticketing ? (
                          <div className="mt-1">
                            <p className="text-base text-gray-900">
                              Linked to Ticketing System
                            </p>
                            {currentProduct.ticketing_id && (
                              <p className="text-sm text-gray-500">
                                Ticketing ID: {currentProduct.ticketing_id}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1 text-base text-gray-900">
                            Not linked to Ticketing System
                          </p>
                        )}
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Schedule Maintenance
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Maintenance History
                    </h2>

                    <div className="border border-gray-200 rounded-md">
                      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No maintenance records found
                      </div>
                      <div className="p-4 text-center text-gray-500">
                        <p>No maintenance history records available for this product.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === 'transactions' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Transaction History
                </h2>

                <TransactionHistoryTable productId={currentProduct.product_id} />
              </div>
            )}
          </div>
        </div>

        {/* Right column - Image and QR Code */}
        <div>
          {/* Product Image */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Product Image</h2>
            </div>
            <div className="p-6 flex justify-center">
              <div className="w-full h-60 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">QR Code</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <QRCodeWithLibrary
                  value={currentProduct.qr_data || JSON.stringify({
                    id: currentProduct.product_id,
                    name: currentProduct.name,
                    serial: currentProduct.serial_number || 'N/A',
                    company: "FiberOne Solutions",
                    category: getCategoryName(currentProduct),
                    location: currentProduct.location || 'N/A'
                  })}
                  size={200}
                  productId={currentProduct.product_id}
                  productName={currentProduct.name}
                />

                <div className="flex space-x-2 w-full">
                  <button
                    onClick={() => {
                      const printEvent = new CustomEvent('printQR', {
                        detail: {
                          productId: currentProduct.product_id,
                          productName: currentProduct.name
                        }
                      });
                      window.dispatchEvent(printEvent);
                    }}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <QrCodeIcon className="w-4 h-4 mr-2" />
                    Print QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${currentProduct?.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductDetail;