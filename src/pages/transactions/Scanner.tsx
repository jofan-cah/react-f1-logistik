// src/pages/transactions/Scanner.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Scan, 
  Square, 
  ShoppingCart,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  FileText,
  Save,
  ArrowLeft,
  Trash2,
  Package,
  Minus
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
  items: TransactionItem[];
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
  barcode?: string;
  qr_data?: string;
  status?: string;
}

interface ScanResult {
  type: 'QR' | 'BARCODE';
  data: string;
  product?: Product;
  error?: string;
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

// Mock products database
const mockProducts: Product[] = [
  {
    id: 'PROJ-001',
    name: 'Projector Epson EB-X41',
    description: 'High resolution projector for presentations',
    barcode: '123456789012',
    qr_data: 'PROJ-001',
    status: 'available'
  },
  {
    id: 'LAP-002',
    name: 'Laptop Dell XPS 13',
    description: 'Business laptop for office work',
    barcode: '123456789013',
    qr_data: 'LAP-002',
    status: 'available'
  },
  {
    id: 'DRILL-005',
    name: 'Electric Drill',
    description: 'Heavy duty electric drill',
    barcode: '123456789014',
    qr_data: 'DRILL-005',
    status: 'available'
  },
  {
    id: 'CAM-003',
    name: 'Digital Camera Canon',
    description: 'Professional DSLR camera',
    barcode: '123456789015',
    qr_data: 'CAM-003',
    status: 'available'
  },
  {
    id: 'TAB-004',
    name: 'iPad Pro 12.9 inch',
    description: 'Professional tablet for design work',
    barcode: '123456789016',
    qr_data: 'TAB-004',
    status: 'available'
  }
];

// Mock scanner component with dark mode support
const BarcodeScanner: React.FC<{
  onScan: (data: string, type: 'QR' | 'BARCODE') => void;
  mode: 'QR' | 'BARCODE' | 'BOTH';
  className?: string;
}> = ({ onScan, mode, className }) => {
  const [isScanning, setIsScanning] = useState(false);

  const simulateScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    setTimeout(() => {
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      const scanType = Math.random() > 0.5 ? 'QR' : 'BARCODE';
      const scanData = scanType === 'QR' ? randomProduct.qr_data || randomProduct.id : randomProduct.barcode || randomProduct.id;
      
      onScan(scanData, scanType);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className={`bg-gray-900 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center border dark:border-gray-600 ${className}`}>
      <div className="text-white dark:text-gray-200 text-center">
        {isScanning ? (
          <div className="animate-pulse">
            <div className="w-16 h-16 border-4 border-white dark:border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white dark:text-gray-200">Scanning...</p>
          </div>
        ) : (
          <div>
            <Scan className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-400 dark:text-gray-500 mb-4">Point camera at {mode.toLowerCase()}</p>
            <button
              onClick={simulateScan}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              Simulate Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  
  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scanMode, setScanMode] = useState<'QR' | 'BARCODE' | 'BOTH'>('BOTH');
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  
  // Transaction state
  const [currentTransaction, setCurrentTransaction] = useState<Transaction>({
    transaction_type: 'check_out',
    reference_no: generateReferenceNumber(),
    first_person: '',
    location: '',
    transaction_date: new Date().toISOString().split('T')[0],
    status: 'open',
    items: []
  });
  
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  function generateReferenceNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `TXN-${date}-${random}`;
  }

  const handleScanResult = (data: string, type: 'QR' | 'BARCODE') => {
    // Find product by scan data
    const product = mockProducts.find(p => 
      p.qr_data === data || p.barcode === data || p.id === data
    );

    if (product) {
      // Check if item already exists in transaction
      const existingItemIndex = currentTransaction.items.findIndex(
        item => item.product_id === product.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...currentTransaction.items];
        updatedItems[existingItemIndex].quantity += 1;
        
        setCurrentTransaction(prev => ({
          ...prev,
          items: updatedItems
        }));

        setScanFeedback(`Quantity updated for "${product.name}"`);
      } else {
        // Add new item
        const newItem: TransactionItem = {
          product_id: product.id,
          product,
          quantity: 1,
          condition_before: '',
          condition_after: '',
          status: 'processed',
          notes: ''
        };

        setCurrentTransaction(prev => ({
          ...prev,
          items: [...prev.items, newItem]
        }));

        setScanFeedback(`Added "${product.name}" to transaction`);
      }
    } else {
      const errorMessage = 'Product not found';
      setScanFeedback(errorMessage);
    }

    // Clear feedback after 3 seconds
    setTimeout(() => setScanFeedback(null), 3000);
  };

  const handleRemoveItem = (index: number) => {
    setCurrentTransaction(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }

    setCurrentTransaction(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, quantity } : item
      )
    }));
  };

  const handleSaveTransaction = async () => {
    if (!currentTransaction.first_person || !currentTransaction.location || currentTransaction.items.length === 0) {
      setScanFeedback('Please fill in required fields and add at least one item');
      setTimeout(() => setScanFeedback(null), 3000);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving transaction:', currentTransaction);
      setScanFeedback('Transaction saved successfully!');
      
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (error) {
      setScanFeedback('Failed to save transaction');
      setTimeout(() => setScanFeedback(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = currentTransaction.items.length;
  const totalQuantity = currentTransaction.items.reduce((sum, item) => sum + item.quantity, 0);

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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Scanner Mode</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentTransaction.reference_no}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                {showForm ? 'Hide' : 'Show'} Form
              </button>
              
              <button
                onClick={() => setScannerActive(!scannerActive)}
                className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors duration-200 ${
                  scannerActive
                    ? 'border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                }`}
              >
                {scannerActive ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Scanner
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Start Scanner
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Feedback */}
      {scanFeedback && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`flex items-center px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            scanFeedback.includes('error') || scanFeedback.includes('Failed')
              ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
              : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
          }`}>
            {scanFeedback.includes('error') || scanFeedback.includes('Failed') ? (
              <AlertCircle className="h-5 w-5 mr-2" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2" />
            )}
            {scanFeedback}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Scanner</h2>
              </div>
              
              <div className="p-6">
                {/* Scanner Mode Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scanner Mode
                  </label>
                  <div className="flex space-x-2">
                    {(['QR', 'BARCODE', 'BOTH'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setScanMode(mode)}
                        className={`px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                          scanMode === mode
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scanner Component */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  {scannerActive ? (
                    <BarcodeScanner
                      onScan={handleScanResult}
                      mode={scanMode}
                      className="w-full h-64"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                      <Scan className="h-12 w-12 mb-3" />
                      <p className="text-sm">Click "Start Scanner" to begin scanning</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mt-6">
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
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`text-sm font-medium ${
                      currentTransaction.status === 'open' ? 'text-green-600 dark:text-green-400' :
                      currentTransaction.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {currentTransaction.status.charAt(0).toUpperCase() + currentTransaction.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleSaveTransaction}
                    disabled={loading || totalItems === 0 || !currentTransaction.first_person || !currentTransaction.location}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Transaction'}
                  </button>
                  
                  <button
                    onClick={() => navigate('/transactions/new')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Use Form
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="lg:col-span-2">
            {/* Transaction Form (Collapsible) */}
            {showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Details</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transaction Type *
                      </label>
                      <select
                        value={currentTransaction.transaction_type}
                        onChange={(e) => setCurrentTransaction(prev => ({ 
                          ...prev, 
                          transaction_type: e.target.value as Transaction['transaction_type']
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      >
                        {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        value={currentTransaction.reference_no || ''}
                        onChange={(e) => setCurrentTransaction(prev => ({ 
                          ...prev, 
                          reference_no: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Auto-generated if empty"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        First Person *
                      </label>
                      <input
                        type="text"
                        value={currentTransaction.first_person}
                        onChange={(e) => setCurrentTransaction(prev => ({ 
                          ...prev, 
                          first_person: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Enter person name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Second Person
                      </label>
                      <input
                        type="text"
                        value={currentTransaction.second_person || ''}
                        onChange={(e) => setCurrentTransaction(prev => ({ 
                          ...prev, 
                          second_person: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Optional second person"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Location *
                      </label>
                      <input
                        type="text"
                        value={currentTransaction.location}
                        onChange={(e) => setCurrentTransaction(prev => ({ 
                          ...prev, 
                          location: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Enter location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        value={currentTransaction.transaction_date}
                        onChange={(e) => setCurrentTransaction(prev => ({ 
                          ...prev, 
                          transaction_date: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={currentTransaction.notes || ''}
                        onChange={(e) => setCurrentTransaction(prev => ({ 
                          ...prev, 
                          notes: e.target.value 
                        }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scanned Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Scanned Items</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {totalItems} items, {totalQuantity} total quantity
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {!currentTransaction.items || currentTransaction.items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No items scanned yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Start scanning products to add them to this transaction</p>
                    {!scannerActive && (
                      <button
                        onClick={() => setScannerActive(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                      >
                        <Scan className="h-4 w-4 mr-2" />
                        Start Scanner
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentTransaction.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.product?.name || `Product ${item.product_id}`}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {item.product_id}</p>
                                {item.product?.description && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {item.product.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              
                              <span className="min-w-[3rem] text-center text-sm font-medium text-gray-900 dark:text-white">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Remove Item Button */}
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Item Status and Notes */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Status
                            </label>
                            <select
                              value={item.status}
                              onChange={(e) => {
                                const updatedItems = [...currentTransaction.items];
                                updatedItems[index].status = e.target.value as TransactionItem['status'];
                                setCurrentTransaction(prev => ({
                                  ...prev,
                                  items: updatedItems
                                }));
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="processed">Processed</option>
                              <option value="pending">Pending</option>
                              <option value="returned">Returned</option>
                              <option value="lost">Lost</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Item Notes
                            </label>
                            <input
                              type="text"
                              value={item.notes || ''}
                              onChange={(e) => {
                                const updatedItems = [...currentTransaction.items];
                                updatedItems[index].notes = e.target.value;
                                setCurrentTransaction(prev => ({
                                  ...prev,
                                  items: updatedItems
                                }));
                              }}
                              placeholder="Add notes for this item..."
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          {/* Condition Fields for maintenance/repair transactions */}
                          {(currentTransaction.transaction_type === 'maintenance' || 
                            currentTransaction.transaction_type === 'repair') && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Condition Before
                                </label>
                                <input
                                  type="text"
                                  value={item.condition_before || ''}
                                  onChange={(e) => {
                                    const updatedItems = [...currentTransaction.items];
                                    updatedItems[index].condition_before = e.target.value;
                                    setCurrentTransaction(prev => ({
                                      ...prev,
                                      items: updatedItems
                                    }));
                                  }}
                                  placeholder="Describe condition before..."
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Condition After
                                </label>
                                <input
                                  type="text"
                                  value={item.condition_after || ''}
                                  onChange={(e) => {
                                    const updatedItems = [...currentTransaction.items];
                                    updatedItems[index].condition_after = e.target.value;
                                    setCurrentTransaction(prev => ({
                                      ...prev,
                                      items: updatedItems
                                    }));
                                  }}
                                  placeholder="Describe condition after..."
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;