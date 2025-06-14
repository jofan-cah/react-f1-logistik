// src/pages/purchasing/PurchasingDetail.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package,
  Calendar,
  User,
  FileText,
  Hash,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { usePurchasingStore } from '../../store/usePurchasingStore';

const PurchasingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    currentReceipt,
    isLoading,
    error,
    fetchReceiptById,
    deleteReceipt,
    completeReceipt,
    cancelReceipt,
    clearReceiptDetail,
    clearError
  } = usePurchasingStore();

  useEffect(() => {
    if (id) {
      fetchReceiptById(parseInt(id));
    }
    
    return () => {
      clearReceiptDetail();
    };
  }, [id]);

  const handleDelete = async () => {
    if (!currentReceipt) return;
    
    if (window.confirm(`Are you sure you want to delete receipt ${currentReceipt.receipt_number}?`)) {
      try {
        await deleteReceipt(currentReceipt.id);
        alert('Receipt deleted successfully');
        navigate('/purchasing');
      } catch (error) {
        console.error('Error deleting receipt:', error);
      }
    }
  };

  const handleComplete = async () => {
    if (!currentReceipt) return;
    
    if (window.confirm('Are you sure you want to mark this receipt as completed?')) {
      try {
        await completeReceipt(currentReceipt.id);
        alert('Receipt marked as completed');
      } catch (error) {
        console.error('Error completing receipt:', error);
      }
    }
  };

  const handleCancel = async () => {
    if (!currentReceipt) return;
    
    if (window.confirm('Are you sure you want to cancel this receipt?')) {
      try {
        await cancelReceipt(currentReceipt.id);
        alert('Receipt cancelled');
      } catch (error) {
        console.error('Error cancelling receipt:', error);
      }
    }
  };

  // Status components
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'cancelled':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'completed':
          return <CheckCircle className="h-4 w-4" />;
        case 'pending':
          return <Clock className="h-4 w-4" />;
        case 'cancelled':
          return <XCircle className="h-4 w-4" />;
        default:
          return <AlertCircle className="h-4 w-4" />;
      }
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
        {getStatusIcon(status)}
        <span className="ml-2">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading receipt details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
            <Link
              to="/purchasing"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentReceipt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Receipt Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The receipt you're looking for doesn't exist.</p>
          <Link
            to="/purchasing"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to List
          </Link>
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
              <button
                onClick={() => navigate('/purchasing')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentReceipt.receipt_number}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Purchase Receipt Details
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {currentReceipt.status === 'pending' && (
                <>
                  <button
                    onClick={handleComplete}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
              
              {currentReceipt.status !== 'completed' && (
                <Link
                  to={`/purchasing/edit/${currentReceipt.id}`}
                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              )}
              
              {currentReceipt.status !== 'completed' && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Receipt Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Receipt Information</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Receipt Number</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentReceipt.receipt_number}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">PO Number</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentReceipt.po_number}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentReceipt.supplier?.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Receipt Date</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(currentReceipt.receipt_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      ${currentReceipt.total_amount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                    </div>
                    <StatusBadge status={currentReceipt.status} />
                  </div>
                </div>

                {currentReceipt.notes && (
                  <div className="mt-6">
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {currentReceipt.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Receipt Items</h2>
              </div>
              
              <div className="p-6">
                {currentReceipt.items && currentReceipt.items.length > 0 ? (
                  <div className="space-y-4">
                    {currentReceipt.items.map((item, index) => (
                      <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Item #{index + 1}
                          </h3>
                          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            ${item.total_price.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Category:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.category?.name || 'N/A'}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.quantity}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Unit Price:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              ${item.unit_price.toLocaleString()}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Condition:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.condition}
                            </p>
                          </div>
                        </div>

                        {item.serial_numbers && (
                          <div className="mt-3">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Serial Numbers:</span>
                            <p className="font-medium text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded mt-1">
                              {item.serial_numbers}
                            </p>
                          </div>
                        )}

                        {item.notes && (
                          <div className="mt-3">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Notes:</span>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No items in this receipt</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 sticky top-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Items Count:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentReceipt.items?.length || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Quantity:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentReceipt.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">Total Amount:</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      ${currentReceipt.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Created: {new Date(currentReceipt.created_at).toLocaleString()}</p>
                    <p>Updated: {new Date(currentReceipt.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasingDetail;