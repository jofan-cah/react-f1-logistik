// src/pages/transactions/TransactionDetail.tsx

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
  QrCode
} from 'lucide-react';

// Types
interface Transaction {
  id?: number;
  transaction_type: 'check_out' | 'check_in' | 'maintenance' | 'lost' | 'repair' | 'return';
  reference_no?: string;
  first_person: string;
  second_person?: string;
  location: string;
  transaction_date: string;
  notes?: string;
  status: 'open' | 'closed' | 'pending';
  created_by?: string;
  created_at?: string;
  items?: TransactionItem[];
}

interface TransactionItem {
  id?: number;
  product_id: string;
  product?: Product;
  quantity: number;
  condition_before?: string;
  condition_after?: string;
  status: 'processed' | 'pending' | 'returned' | 'lost';
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  serial_number?: string;
  barcode?: string;
  qr_data?: string;
  status?: string;
}

// Constants
const TRANSACTION_TYPE_LABELS: Record<Transaction['transaction_type'], string> = {
  check_out: 'Check Out',
  check_in: 'Check In',
  maintenance: 'Maintenance',
  lost: 'Lost',
  repair: 'Repair',
  return: 'Return'
};

const TRANSACTION_STATUS_LABELS: Record<Transaction['status'], string> = {
  open: 'Open',
  closed: 'Closed',
  pending: 'Pending'
};

const ITEM_STATUS_LABELS: Record<TransactionItem['status'], string> = {
  processed: 'Processed',
  pending: 'Pending',
  returned: 'Returned',
  lost: 'Lost'
};

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
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ width: size, height: size }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <img 
        src={qrCodeUrl} 
        alt="Transaction QR Code" 
        className="border border-gray-200 rounded-lg"
        style={{ width: size, height: size }}
      />
      <div className="flex space-x-2">
        <button
          onClick={handlePrint}
          className="flex items-center px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Printer className="h-3 w-3 mr-1" />
          Print
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </button>
      </div>
    </div>
  );
};

// Mock transaction data
const mockTransaction: Transaction = {
  id: 1,
  transaction_type: 'check_out',
  reference_no: 'TXN-OUT-20241201-001',
  first_person: 'John Doe',
  second_person: 'Jane Smith',
  location: 'Office Building A',
  transaction_date: '2024-12-01T10:30:00Z',
  notes: 'Equipment checkout for project meeting. This equipment will be used for the quarterly presentation to stakeholders. Please ensure all items are returned in good condition.',
  status: 'open',
  created_by: 'admin',
  created_at: '2024-12-01T10:30:00Z',
  items: [
    {
      id: 1,
      product_id: 'PROJ-001',
      product: {
        id: 'PROJ-001',
        name: 'Projector Epson EB-X41',
        description: 'High resolution projector for presentations',
        serial_number: 'EP2024001',
        barcode: '123456789012',
        qr_data: 'PROJ-001',
        status: 'checked_out'
      },
      quantity: 1,
      condition_before: 'excellent',
      condition_after: '',
      status: 'processed',
      notes: 'Projector for quarterly presentation'
    },
    {
      id: 2,
      product_id: 'LAP-002',
      product: {
        id: 'LAP-002',
        name: 'Laptop Dell XPS 13',
        description: 'Business laptop for office work',
        serial_number: 'DL2024002',
        barcode: '123456789013',
        qr_data: 'LAP-002',
        status: 'checked_out'
      },
      quantity: 1,
      condition_before: 'good',
      condition_after: '',
      status: 'processed',
      notes: 'Laptop for demo purposes'
    },
    {
      id: 3,
      product_id: 'CAM-003',
      product: {
        id: 'CAM-003',
        name: 'Digital Camera Canon EOS',
        description: 'Professional DSLR camera',
        serial_number: 'CN2024003',
        barcode: '123456789014',
        qr_data: 'CAM-003',
        status: 'checked_out'
      },
      quantity: 1,
      condition_before: 'excellent',
      condition_after: '',
      status: 'processed',
      notes: 'For event documentation'
    }
  ]
};

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (id === '1' || !id) {
        setTransaction(mockTransaction);
      } else {
        // Generate transaction for other IDs
        setTransaction({
          ...mockTransaction,
          id: parseInt(id),
          reference_no: `TXN-${id.padStart(3, '0')}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
          first_person: `Person ${id}`,
          location: `Location ${id}`
        });
      }
    } catch (error) {
      setError('Failed to load transaction');
      console.error('Failed to load transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/transactions');
    } catch (error) {
      setError('Failed to delete transaction');
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleStatusChange = async (action: 'close' | 'reopen') => {
    if (!id || !transaction) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedStatus = action === 'close' ? 'closed' : 'open';
      setTransaction({ ...transaction, status: updatedStatus });
      setShowActionMenu(false);
    } catch (error) {
      setError(`Failed to ${action} transaction`);
      console.error(`Failed to ${action} transaction:`, error);
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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'check_out':
        return 'bg-blue-100 text-blue-800';
      case 'check_in':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'repair':
        return 'bg-red-100 text-red-800';
      case 'lost':
        return 'bg-gray-100 text-gray-800';
      case 'return':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'returned':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'lost':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button
            onClick={() => navigate('/transactions')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">Transaction not found</div>
          <button
            onClick={() => navigate('/transactions')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  const totalItems = transaction.items?.length || 0;
  const totalQuantity = transaction.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Generate QR data
  const qrData = JSON.stringify({
    id: transaction.id,
    type: transaction.transaction_type,
    reference: transaction.reference_no,
    person: transaction.first_person,
    date: transaction.transaction_date
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/transactions')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Transaction Details</h1>
              <span className="text-sm text-gray-500">
                {transaction.reference_no || `#${transaction.id}`}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/transactions/${id}/edit`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                {showActionMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      {transaction.status === 'open' ? (
                        <button
                          onClick={() => handleStatusChange('close')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <CheckCircle className="inline h-4 w-4 mr-2" />
                          Close Transaction
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange('reopen')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <XCircle className="inline h-4 w-4 mr-2" />
                          Reopen Transaction
                        </button>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
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
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {TRANSACTION_TYPE_LABELS[transaction.transaction_type]}
                    </h2>
                    <p className="text-sm text-gray-500">
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
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">First Person</p>
                        <p className="text-sm text-gray-600">{transaction.first_person}</p>
                      </div>
                    </div>

                    {transaction.second_person && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Second Person</p>
                          <p className="text-sm text-gray-600">{transaction.second_person}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{transaction.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Transaction Date</p>
                        <p className="text-sm text-gray-600">{formatDate(transaction.transaction_date)}</p>
                      </div>
                    </div>

                    {transaction.reference_no && (
                      <div className="flex items-start space-x-3">
                        <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Reference Number</p>
                          <p className="text-sm text-gray-600">{transaction.reference_no}</p>
                        </div>
                      </div>
                    )}

                    {transaction.created_by && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Created By</p>
                          <p className="text-sm text-gray-600">{transaction.created_by}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {transaction.notes && (
                  <div className="mt-6">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Notes</p>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                          {transaction.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Items */}
            <div className="mt-6 bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Transaction Items</h3>
                  <div className="text-sm text-gray-500">
                    {totalItems} items ({totalQuantity} total quantity)
                  </div>
                </div>

                {!transaction.items || transaction.items.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No items in this transaction</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Condition
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transaction.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.product?.name || 'Unknown Product'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {item.product_id}
                                </div>
                                {item.product?.serial_number && (
                                  <div className="text-xs text-gray-400">
                                    S/N: {item.product.serial_number}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs">
                                {item.condition_before && (
                                  <div className="mb-1">
                                    <span className="text-gray-500">Before:</span>{' '}
                                    <span className="text-gray-900">
                                      {item.condition_before.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {item.condition_after && (
                                  <div>
                                    <span className="text-gray-500">After:</span>{' '}
                                    <span className="text-gray-900">
                                      {item.condition_after.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {!item.condition_before && !item.condition_after && (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getItemStatusIcon(item.status)}
                                <span className="ml-2 text-sm text-gray-900">
                                  {ITEM_STATUS_LABELS[item.status]}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 max-w-xs">
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
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Transaction QR Code</h2>
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
                  <p className="text-xs text-gray-500">
                    Scan this QR code to quickly access transaction details
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Summary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Items:</span>
                    <span className="text-sm font-medium text-gray-900">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Quantity:</span>
                    <span className="text-sm font-medium text-gray-900">{totalQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {transaction.created_at ? formatDate(transaction.created_at) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/transactions/${id}/edit`)}
                    className="w-full flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Transaction
                  </button>
                  
                  {transaction.status === 'open' ? (
                    <button
                      onClick={() => handleStatusChange('close')}
                      className="w-full flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Close Transaction
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('reopen')}
                      className="w-full flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reopen Transaction
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate('/scanner')}
                    className="w-full flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Use Scanner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Transaction</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this transaction? 
                  All items and data will be permanently removed. This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
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