// src/pages/transactions/TransactionForm.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  Hash,
  FileText,
  Package,
  Search,
  ScanLine,
  AlertCircle,
  X
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

const CONDITION_OPTIONS = [
  'excellent',
  'good',
  'fair',
  'poor',
  'damaged',
  'need_repair'
] as const;

// Mock data
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

interface TransactionFormProps {
  mode: 'create' 
//   | 'edit'
  ;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Transaction>({
    transaction_type: 'check_out',
    first_person: '',
    second_person: '',
    location: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'open',
    items: []
  });

  const [items, setItems] = useState<TransactionItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadTransaction();
    } else if (mode === 'create') {
      // Generate reference number for new transaction
      const referenceNo = generateReferenceNumber();
      setFormData(prev => ({ ...prev, reference_no: referenceNo }));
    }
  }, [mode, id]);

  const generateReferenceNumber = (): string => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `TXN-${date}-${random}`;
  };

  const loadTransaction = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock transaction data for edit mode
      const mockTransaction: Transaction = {
        id: parseInt(id),
        transaction_type: 'check_out',
        reference_no: 'TXN-20241201-001',
        first_person: 'John Doe',
        second_person: 'Jane Smith',
        location: 'Office Building A',
        transaction_date: '2024-12-01',
        notes: 'Equipment checkout for project meeting',
        status: 'open',
        created_by: 'admin',
        items: [
          {
            id: 1,
            product_id: 'PROJ-001',
            product: mockProducts[0],
            quantity: 1,
            condition_before: 'excellent',
            condition_after: '',
            status: 'processed',
            notes: 'Projector for presentation'
          }
        ]
      };
      
      setFormData(mockTransaction);
      setItems(mockTransaction.items || []);
    } catch (error) {
      setError('Failed to load transaction');
      console.error('Failed to load transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_person.trim()) {
      errors.first_person = 'First person is required';
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!formData.transaction_date) {
      errors.transaction_date = 'Transaction date is required';
    }

    if (items.length === 0) {
      errors.items = 'At least one item is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof Transaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof TransactionItem, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleAddItem = (product: Product) => {
    const newItem: TransactionItem = {
      product_id: product.id,
      product,
      quantity: 1,
      condition_before: '',
      condition_after: '',
      status: 'processed',
      notes: ''
    };
    
    setItems(prev => [...prev, newItem]);
    setShowAddItem(false);
    setSearchProduct('');
    
    // Clear items validation error
    if (validationErrors.items) {
      setValidationErrors(prev => ({ ...prev, items: '' }));
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transactionData = { ...formData, items };
      
      if (mode === 'create') {
        // Create new transaction
        console.log('Creating transaction:', transactionData);
        navigate('/transactions');
      } else if (mode === 'edit' && id) {
        // Update existing transaction
        console.log('Updating transaction:', transactionData);
        navigate(`/transactions/${id}`);
      }
    } catch (error) {
      setError('Failed to save transaction');
      console.error('Failed to save transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.id.toLowerCase().includes(searchProduct.toLowerCase())
  );

  if (loading && mode === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 dark:border-blue-400"></div>
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
                onClick={() => navigate('/transactions')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === 'create' ? 'New Transaction' : 'Edit Transaction'}
              </h1>
              {formData.reference_no && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.reference_no}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/scanner')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <ScanLine className="h-4 w-4 mr-2" />
                Use Scanner
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction Details */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
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
                        value={formData.transaction_type}
                        onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      >
                        {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Hash className="inline h-4 w-4 mr-1" />
                        Reference Number
                      </label>
                      <input
                        type="text"
                        value={formData.reference_no || ''}
                        onChange={(e) => handleInputChange('reference_no', e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        First Person *
                      </label>
                      <input
                        type="text"
                        value={formData.first_person}
                        onChange={(e) => handleInputChange('first_person', e.target.value)}
                        placeholder="Enter person name"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.first_person ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {validationErrors.first_person && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.first_person}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Second Person
                      </label>
                      <input
                        type="text"
                        value={formData.second_person || ''}
                        onChange={(e) => handleInputChange('second_person', e.target.value)}
                        placeholder="Optional second person"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Enter location"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.location ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {validationErrors.location && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.location}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Transaction Date *
                      </label>
                      <input
                        type="date"
                        value={formData.transaction_date}
                        onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.transaction_date ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {validationErrors.transaction_date && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.transaction_date}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Notes
                      </label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={3}
                        placeholder="Additional notes..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Items */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6 border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Items</h2>
                    <button
                      type="button"
                      onClick={() => setShowAddItem(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </button>
                  </div>
                  {validationErrors.items && (
                    <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.items}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No items added yet</p>
                      <p className="text-gray-400 dark:text-gray-500 mb-6">Start by adding products to this transaction</p>
                      <button
                        type="button"
                        onClick={() => setShowAddItem(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {item.product?.name || `Product ${item.product_id}`}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {item.product_id}</p>
                                
                                <div className="mt-2">
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Condition Before
                                    </label>
                                    <select
                                      value={item.condition_before || ''}
                                      onChange={(e) => handleItemChange(index, 'condition_before', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    >
                                      <option value="">Select condition</option>
                                      {CONDITION_OPTIONS.map(condition => (
                                        <option key={condition} value={condition}>
                                          {condition.replace('_', ' ').toUpperCase()}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Condition After
                                    </label>
                                    <select
                                      value={item.condition_after || ''}
                                      onChange={(e) => handleItemChange(index, 'condition_after', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    >
                                      <option value="">Select condition</option>
                                      {CONDITION_OPTIONS.map(condition => (
                                        <option key={condition} value={condition}>
                                          {condition.replace('_', ' ').toUpperCase()}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Item Notes
                                </label>
                                <textarea
                                  value={item.notes || ''}
                                  onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                  rows={3}
                                  placeholder="Notes for this item..."
                                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="ml-4 p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Summary</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
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
                        formData.status === 'open' ? 'text-green-600 dark:text-green-400' :
                        formData.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : mode === 'create' ? 'Create Transaction' : 'Update Transaction'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/transactions')}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mt-6">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                        <p>{error}</p>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setError(null)}
                          className="text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 transition-colors duration-200"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Item</h3>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Product
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or barcode..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Product list */}
              <div className="max-h-64 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>No products found</p>
                    <p className="text-sm">Try searching with different keywords</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleAddItem(product)}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {product.id}</div>
                        {product.description && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{product.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/scanner')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <ScanLine className="h-4 w-4 mr-2" />
                  Use Scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionForm;