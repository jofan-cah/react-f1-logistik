
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  MapPin, 
  Calendar, 
  Hash,
  FileText,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Download,
  Printer,
  QrCode,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useTransactionStore } from '../../store/useTransactionStore';
import {
  Transaction,
  TransactionItem,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_STATUS_LABELS
} from '../../types/transaction.types';

// QR Code Generator Component
const QRCodeGenerator: React.FC<{ 
  value: string; 
  size?: number; 
  transactionId?: number;
}> = ({ value, size = 150, transactionId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code using a QR code API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
    setQrCodeUrl(qrApiUrl);
  }, [value, size]);

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `transaction-${transactionId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Transaction QR Code</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                text-align: center; 
                font-family: Arial, sans-serif; 
              }
              .qr-container { 
                display: inline-block; 
                padding: 20px; 
                border: 1px solid #ccc; 
                border-radius: 8px; 
              }
              .qr-title { 
                margin-bottom: 15px; 
                font-size: 18px; 
                font-weight: bold; 
              }
              .qr-info { 
                margin-top: 15px; 
                font-size: 12px; 
                color: #666; 
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">Transaction QR Code</div>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <div class="qr-info">Transaction ID: ${transactionId}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!qrCodeUrl) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg"
        style={{ width: size, height: size }}
      >
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <img 
        src={qrCodeUrl} 
        alt="Transaction QR Code" 
        className="border border-gray-200 dark:border-gray-600 rounded-lg"
        style={{ width: size, height: size }}
      />
      <div className="flex space-x-2">
        <button
          onClick={handlePrint}
          className="flex items-center px-3 py-1 text-xs bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
        >
          <Printer className="h-3 w-3 mr-1" />
          Print
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center px-3 py-1 text-xs bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-500 transition-colors duration-200"
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </button>
      </div>
    </div>
  );
};

const ITEM_STATUS_LABELS: Record<TransactionItem['status'], string> = {
  processed: 'Processed',
  pending: 'Pending',
  returned: 'Returned'
};

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    currentTransaction,
    transactionItems,
    isLoading,
    error,
    getTransactionById,
    fetchTransactionItems,
    deleteTransaction,
    closeTransaction,
    reopenTransaction,
    clearCurrentTransaction,
    clearError
  } = useTransactionStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTransactionData();
    }

    return () => {
      clearCurrentTransaction();
    };
  }, [id]);

  const loadTransactionData = async () => {
    if (!id) return;

    const transactionId = parseInt(id);
    if (isNaN(transactionId)) {
      console.error('Invalid transaction ID:', id);
      navigate('/transactions');
      return;
    }

    console.log('🔄 Loading transaction data for ID:', transactionId);
    
    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      console.error('Transaction not found:', transactionId);
      navigate('/transactions');
      return;
    }

    // Load transaction items
    await fetchTransactionItems(transactionId);
  };

  const handleDelete = async () => {
    if (!currentTransaction?.id) return;
    
    console.log('🗑️ Deleting transaction:', currentTransaction.id);
    
    const success = await deleteTransaction(currentTransaction.id);
    if (success) {
      navigate('/transactions');
    }
  };

  const handleStatusChange = async (action: 'close' | 'reopen') => {
    if (!currentTransaction?.id) return;
    
    console.log('🔄 Changing status:', action);
    setStatusChangeLoading(true);
    setShowActionMenu(false);
    
    try {
      let success = false;
      
      if (action === 'close') {
        success = await closeTransaction(currentTransaction.id);
      } else {
        success = await reopenTransaction(currentTransaction.id);
      }
      
      if (success) {
        console.log('✅ Status changed successfully');
        // Reload transaction data to get updated info
        await loadTransactionData();
      }
    } catch (error) {
      console.error('❌ Failed to change status:', error);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: Transaction['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'closed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getTypeBadgeColor = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'check_out':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'check_in':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'maintenance':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      case 'repair':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'lost':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      case 'return':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
      case 'returned':
        return <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <RefreshCw className="h-32 w-32 animate-spin text-blue-500 dark:text-blue-400 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={() => {
                clearError();
                loadTransactionData();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Back to Transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTransaction) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Transaction not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested transaction could not be found.</p>
          <button
            onClick={() => navigate('/transactions')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  const transaction = currentTransaction;
  const items = transaction.items || transaction.TransactionItems || transactionItems || [];
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Generate QR data
  const qrData = JSON.stringify({
    id: transaction.id,
    type: transaction.transaction_type,
    reference: transaction.reference_no,
    person: transaction.first_person,
    date: transaction.transaction_date
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/transactions')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction Details</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {transaction.reference_no || `#${transaction.id}`}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/transactions/${id}/edit`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  disabled={statusChangeLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                >
                  {statusChangeLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </button>
                
                {showActionMenu && !statusChangeLoading && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 z-10">
                    <div className="py-1">
                      {transaction.status === 'open' ? (
                        <button
                          onClick={() => handleStatusChange('close')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          <CheckCircle className="inline h-4 w-4 mr-2" />
                          Close Transaction
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange('reopen')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          <XCircle className="inline h-4 w-4 mr-2" />
                          Reopen Transaction
                        </button>
                      )}
                      <hr className="my-1 border-gray-200 dark:border-gray-600" />
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <Trash2 className="inline h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Transaction Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {TRANSACTION_TYPE_LABELS[transaction.transaction_type]}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.reference_no || `#${transaction.id}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeBadgeColor(transaction.transaction_type)}`}>
                      {TRANSACTION_TYPE_LABELS[transaction.transaction_type]}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                      {TRANSACTION_STATUS_LABELS[transaction.status]}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">First Person</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.first_person}</p>
                      </div>
                    </div>

                    {transaction.second_person && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Second Person</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.second_person}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Transaction Date</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(transaction.transaction_date || transaction.created_at || '')}
                        </p>
                      </div>
                    </div>

                    {transaction.reference_no && (
                      <div className="flex items-start space-x-3">
                        <Hash className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Reference Number</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.reference_no}</p>
                        </div>
                      </div>
                    )}

                    {transaction.created_by && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Created By</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.created_by}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {transaction.notes && (
                  <div className="mt-6">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Notes</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                          {transaction.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Items */}
            <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Items</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {totalItems} items ({totalQuantity} total quantity)
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No items in this transaction</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Condition
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.Product?.name || 'Unknown Product'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {item.product_id}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{item.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs">
                                {item.condition_before && (
                                  <div className="mb-1">
                                    <span className="text-gray-500 dark:text-gray-400">Before:</span>{' '}
                                    <span className="text-gray-900 dark:text-white">
                                      {item.condition_before.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {item.condition_after && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">After:</span>{' '}
                                    <span className="text-gray-900 dark:text-white">
                                      {item.condition_after.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {!item.condition_before && !item.condition_after && (
                                  <span className="text-gray-400 dark:text-gray-500">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getItemStatusIcon(item.status)}
                                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                  {ITEM_STATUS_LABELS[item.status] || item.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                                {item.notes || '-'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - QR Code and Summary */}
          <div className="lg:col-span-1">
            {/* QR Code */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transaction QR Code</h2>
              </div>
              <div className="p-6">
                <div className="flex justify-center">
                  <QRCodeGenerator
                    value={qrData}
                    size={180}
                    transactionId={transaction.id}
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Scan this QR code to quickly access transaction details
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 mt-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Summary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Items:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Quantity:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{totalQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.created_at ? formatDate(transaction.created_at) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                      {TRANSACTION_STATUS_LABELS[transaction.status]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 mt-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/transactions/${id}/edit`)}
                    className="w-full flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Transaction
                  </button>
                  
                  {transaction.status === 'open' ? (
                    <button
                      onClick={() => handleStatusChange('close')}
                      disabled={statusChangeLoading}
                      className="w-full flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                    >
                      {statusChangeLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Close Transaction
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('reopen')}
                      disabled={statusChangeLoading}
                      className="w-full flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                    >
                      {statusChangeLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reopen Transaction
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate('/scanner')}
                    className="w-full flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Use Scanner
                  </button>
{/*                   
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Transaction
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">Delete Transaction</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this transaction? 
                  All items and data will be permanently removed. This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-colors duration-200"
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

export default TransactionDetail;