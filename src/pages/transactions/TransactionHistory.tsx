// src/pages/transactions/TransactionHistory.tsx
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Filter, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  RefreshCw,
  Calendar,
  User,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../../store/useTransactionStore';
import { Transaction, TRANSACTION_TYPE_LABELS } from '../../types/transaction.types';

const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const { 
    transactions, 
    isLoading, 
    error, 
    fetchTransactions, 
    deleteTransaction,
    closeTransaction,
    reopenTransaction 
  } = useTransactionStore();
  
  const [filters, setFilters] = useState({
    transaction_type: '',
    status: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // UI state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState<number | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [filters, currentPage, itemsPerPage]);

  const loadTransactions = async () => {
    const queryParams = {
      page: currentPage,
      limit: itemsPerPage,
      ...filters
    };
    await fetchTransactions(queryParams);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDeleteTransaction = async (id: number) => {
    const success = await deleteTransaction(id);
    if (success) {
      setShowDeleteConfirm(null);
      loadTransactions(); // Refresh list
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'open' | 'closed') => {
    setStatusChangeLoading(id);
    
    try {
      let success = false;
      
      if (newStatus === 'closed') {
        success = await closeTransaction(id);
      } else {
        success = await reopenTransaction(id);
      }
      
      if (success) {
        loadTransactions(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to change status:', error);
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'open':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <XCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeConfig = {
      check_out: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      check_in: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      repair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      maintenance: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      transfer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig[type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {TRANSACTION_TYPE_LABELS[type as keyof typeof TRANSACTION_TYPE_LABELS] || type}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Transaction History
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View all asset transactions and their status
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/transactions/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </button>
              <button
                onClick={() => navigate('/scanner')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Scanner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
            <div className="flex-1"></div>
            <button
              onClick={loadTransactions}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filters.transaction_type}
                onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="check_out">Check Out</option>
                <option value="check_in">Check In</option>
                <option value="repair">Repair</option>
                <option value="lost">Lost</option>
                <option value="maintenance">Maintenance</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Reference, person, location..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Transactions ({totalItems})
              </h2>
              <div className="flex items-center space-x-3">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
                <button
                  onClick={() => {/* Implement export */}}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                <button
                  onClick={loadTransactions}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No transactions found</p>
                <p className="text-gray-400 dark:text-gray-500 mb-6">
                  {Object.values(filters).some(v => v) ? 'Try adjusting your filters' : 'Start by creating your first transaction'}
                </p>
                <button
                  onClick={() => navigate('/transactions/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Transaction
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reference / Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Person / Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.reference_no || `#${transaction.id}`}
                            </span>
                          </div>
                          <div className="mt-1">
                            {getTransactionTypeBadge(transaction.transaction_type)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {transaction.first_person}
                              </div>
                              {transaction.second_person && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  & {transaction.second_person}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {transaction.location}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <span>
                            {transaction.items?.length || transaction.TransactionItems?.length || 0} items
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div>{formatDate(transaction.transaction_date || transaction.created_at || '')}</div>
                            {transaction.updated_at !== transaction.created_at && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Updated: {formatDate(transaction.updated_at || '')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/transactions/${transaction.id}`)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          {/* Status toggle buttons
                          {transaction.status === 'open' && (
                            <button
                              onClick={() => handleStatusChange(transaction.id!, 'closed')}
                              disabled={statusChangeLoading === transaction.id}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 disabled:opacity-50"
                              title="Close Transaction"
                            >
                              {statusChangeLoading === transaction.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          
                          {transaction.status === 'closed' && (
                            <button
                              onClick={() => handleStatusChange(transaction.id!, 'open')}
                              disabled={statusChangeLoading === transaction.id}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                              title="Reopen Transaction"
                            >
                              {statusChangeLoading === transaction.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={() => setShowDeleteConfirm(transaction.id!)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-50 dark:bg-blue-900/50 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

     
    </div>
  );
};

export default TransactionHistory;