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
  X,
  RefreshCw
} from 'lucide-react';
import { useTransactionStore } from '../../store/useTransactionStore';
import {
  Transaction,
  CreateTransactionRequest,
  CreateTransactionItemRequest,
  TRANSACTION_TYPE_LABELS
} from '../../types/transaction.types';
import { productService } from '../../services/productService';
import { Product } from '../../types/product.types';

const CONDITION_OPTIONS = [
  'excellent',
  'good',
  'fair',
  'poor'
] as const;

interface TransactionFormProps {
  mode: 'create' | 'edit';
}

const TransactionForm: React.FC<TransactionFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const {
    currentTransaction,
    isLoading,
    error,
    getTransactionById,
    createTransaction,
    updateTransaction,
    clearCurrentTransaction,
    clearError
  } = useTransactionStore();
  
  const [formData, setFormData] = useState<Partial<CreateTransactionRequest>>({
    transaction_type: 'check_out',
    first_person: '',
    second_person: '',
    location: '',
    notes: '',
    status: 'open',
    items: []
  });

  const [items, setItems] = useState<CreateTransactionItemRequest[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Product state - INI YANG DITAMBAHKAN
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadTransaction();
    } else if (mode === 'create') {
      // Generate reference number for new transaction
      const referenceNo = generateReferenceNumber();
      setFormData(prev => ({ ...prev, reference_no: referenceNo }));
    }

    // Load products when component mounts - INI YANG DITAMBAHKAN
    loadProducts();

    return () => {
      clearCurrentTransaction();
    };
  }, [mode, id]);

  // INI FUNCTION BARU UNTUK LOAD PRODUCTS DARI API REAL
  const loadProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    
    try {
      console.log('🔄 Loading products from API...');
      
      // Gunakan product service yang sudah ada dengan filter Available
      const response = await productService.getProducts(1, 100, {
        status: 'Available'
      });
      
      if (response.success && response.data) {
        // Filter lebih ketat - hanya products yang benar-benar bisa dipilih
        const availableProducts = response.data.products.filter(product => 
          product.status === 'Available' && 
          product.quantity > 0 // Pastikan ada stock
        );
        
        setProducts(availableProducts);
        console.log('✅ Available products loaded:', availableProducts.length);
        console.log('📦 Products with stock > 0:', availableProducts.filter(p => p.quantity > 0).length);
      } else {
        throw new Error(response.message || 'Failed to load products');
      }
      
    } catch (error: any) {
      console.error('❌ Failed to load products:', error);
      setProductError('Failed to load products. Please try again.');
      
      // Fallback: tidak ada mock data, tampilkan error
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    // Populate form when currentTransaction is loaded (edit mode)
    if (currentTransaction && mode === 'edit') {
      console.log('📝 Populating form with transaction data:', currentTransaction);
      
      setFormData({
        transaction_type: currentTransaction.transaction_type,
        reference_no: currentTransaction.reference_no,
        first_person: currentTransaction.first_person,
        second_person: currentTransaction.second_person,
        location: currentTransaction.location,
        notes: currentTransaction.notes,
        status: currentTransaction.status,
        items: [] // Will be populated separately
      });

      // Populate items
      const transactionItems = currentTransaction.items || currentTransaction.TransactionItems || [];
      const formattedItems: CreateTransactionItemRequest[] = transactionItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        condition_before: item.condition_before,
        condition_after: item.condition_after,
        status: item.status,
        notes: item.notes
      }));
      
      setItems(formattedItems);
    }
  }, [currentTransaction, mode]);

  const generateReferenceNumber = (): string => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `TXN-${date}-${random}`;
  };

  const loadTransaction = async () => {
    if (!id) return;

    const transactionId = parseInt(id);
    if (isNaN(transactionId)) {
      console.error('Invalid transaction ID:', id);
      navigate('/transactions');
      return;
    }

    console.log('🔄 Loading transaction for edit:', transactionId);
    
    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      console.error('Transaction not found:', transactionId);
      navigate('/transactions');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_person?.trim()) {
      errors.first_person = 'First person is required';
    }

    if (!formData.location?.trim()) {
      errors.location = 'Location is required';
    }

    if (!formData.transaction_type) {
      errors.transaction_type = 'Transaction type is required';
    }

    if (items.length === 0) {
      errors.items = 'At least one item is required';
    }

    // Validate each item
    items.forEach((item, index) => {
      if (!item.product_id) {
        errors[`item_${index}_product`] = 'Product is required';
      }
      if (!item.quantity || item.quantity < 1) {
        errors[`item_${index}_quantity`] = 'Quantity must be at least 1';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTransactionRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof CreateTransactionItemRequest, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));

    // Clear validation errors for this item
    const errorKey = `item_${index}_${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleAddItem = (product: Product) => {
    // Double check availability before adding
    if (product.status !== 'Available') {
      setProductError(`Product "${product.name}" is not available (Status: ${product.status})`);
      return;
    }
    
    if (product.quantity <= 0) {
      setProductError(`Product "${product.name}" is out of stock`);
      return;
    }
    
    // Check if already added
    const isAlreadyAdded = items.some(item => item.product_id === product.product_id);
    if (isAlreadyAdded) {
      setProductError(`Product "${product.name}" is already added to this transaction`);
      return;
    }
    
    const newItem: CreateTransactionItemRequest = {
      product_id: product.product_id, // Sesuai dengan API
      quantity: 1,
      condition_before: product.condition || 'good',
      condition_after: '',
      status: 'processed',
      notes: ''
    };
    
    setItems(prev => [...prev, newItem]);
    setShowAddItem(false);
    setSearchProduct('');
    
    // Clear errors
    setProductError(null);
    if (validationErrors.items) {
      setValidationErrors(prev => ({ ...prev, items: '' }));
    }
    
    console.log(`✅ Added product: ${product.name} (ID: ${product.product_id})`);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📝 Form data:', formData);
    console.log('📦 Items:', items);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed:', validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        console.log('📤 Creating new transaction');
        
        const createData: CreateTransactionRequest = {
          transaction_type: formData.transaction_type!,
          reference_no: formData.reference_no,
          first_person: formData.first_person!,
          second_person: formData.second_person,
          location: formData.location!,
          notes: formData.notes,
          status: formData.status,
          items: items
        };
        
        const success = await createTransaction(createData);
        
        if (success) {
          console.log('✅ Transaction created successfully');
          navigate('/transactions');
        } else {
          console.log('❌ Transaction creation failed');
        }
      } else if (mode === 'edit' && id && currentTransaction) {
        console.log('📤 Updating transaction');
        
        const updateData = {
          reference_no: formData.reference_no,
          first_person: formData.first_person!,
          second_person: formData.second_person,
          location: formData.location!,
          notes: formData.notes,
          status: formData.status
          // Note: Items update might need separate endpoint
        };
        
        const success = await updateTransaction(parseInt(id), updateData);
        
        if (success) {
          console.log('✅ Transaction updated successfully');
          navigate(`/transactions/${id}`);
        } else {
          console.log('❌ Transaction update failed');
        }
      }
    } catch (error) {
      console.error('❌ Failed to save transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.product_id === productId);
  };

  // Search products dari API
  const handleSearchProducts = async (query: string) => {
    if (!query.trim()) {
      // Jika search kosong, load semua available products
      await loadProducts();
      return;
    }

    setLoadingProducts(true);
    try {
      console.log('🔍 Searching products:', query);
      
      // Gunakan product service yang sudah ada dengan search filter
      const response = await productService.getProducts(1, 50, {
        search: query,
        status: 'Available'
      });
      
      if (response.success && response.data) {
        setProducts(response.data.products);
        console.log('✅ Search results:', response.data.products.length);
      }
    } catch (error: any) {
      console.error('❌ Search failed:', error);
      setProductError('Search failed. Please try again.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.product_id.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.model?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.serial_number?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  if (isLoading && mode === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <RefreshCw className="h-32 w-32 animate-spin text-blue-500 dark:text-blue-400 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transaction...</p>
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
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 mr-2" />
                <span className="text-red-800 dark:text-red-300">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div onSubmit={handleSubmit}>
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
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.transaction_type ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      {validationErrors.transaction_type && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.transaction_type}</p>
                      )}
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
                        value={formData.first_person || ''}
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
                        value={formData.location || ''}
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
                      {items.map((item, index) => {
                        const product = getProductById(item.product_id);
                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {product?.name || `Product ${item.product_id}`}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {item.product_id}</p>
                                  
                                  <div className="mt-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Quantity *
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max={product?.quantity || 999} // Limit berdasarkan stock yang tersedia
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value) || 1;
                                        const maxQuantity = product?.quantity || 999;
                                        
                                        if (newQuantity > maxQuantity) {
                                          // Show warning jika melebihi stock
                                          console.warn(`Quantity cannot exceed available stock (${maxQuantity})`);
                                          return;
                                        }
                                        
                                        handleItemChange(index, 'quantity', newQuantity);
                                      }}
                                      className={`w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                                        validationErrors[`item_${index}_quantity`] ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                      }`}
                                    />
                                    {validationErrors[`item_${index}_quantity`] && (
                                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors[`item_${index}_quantity`]}</p>
                                    )}
                                    {product && (
                                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Available: {product.quantity}
                                      </p>
                                    )}
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
                        );
                      })}
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
                        {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isLoading}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {mode === 'create' ? 'Create Transaction' : 'Update Transaction'}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => navigate('/transactions')}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                    placeholder="Search by name, ID, brand, model, or serial..."
                    value={searchProduct}
                    onChange={(e) => {
                      setSearchProduct(e.target.value);
                      // Real-time search dengan debounce bisa ditambahkan di sini
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchProducts(searchProduct);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Product list */}
              <div className="max-h-64 overflow-y-auto">
                {loadingProducts ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
                    <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
                  </div>
                ) : productError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-red-600 dark:text-red-400">{productError}</p>
                    <button
                      onClick={loadProducts}
                      className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>No products found</p>
                    <p className="text-sm">
                      {searchProduct ? 'Try searching with different keywords' : 'No available products'}
                    </p>
                    {!searchProduct && (
                      <button
                        onClick={loadProducts}
                        className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Refresh Products
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map(product => {
                      // Check if product is already added
                      const isAlreadyAdded = items.some(item => item.product_id === product.product_id);
                      
                      // Check if product is available for transaction
                      const isUnavailable = product.status !== 'Available' || 
                                           (product.quantity <= 0) ||
                                           (product.status === 'Checked Out') ||
                                           (product.status === 'Maintenance') ||
                                           (product.status === 'Repair') ||
                                           (product.status === 'Lost');
                      
                      // Check if quantity is 1 and status is not Available
                      const isSingleItemNotAvailable = product.quantity === 1 && product.status !== 'Available';
                      
                      const cannotSelect = isAlreadyAdded || isUnavailable || isSingleItemNotAvailable;
                      
                      return (
                        <div
                          key={product.product_id}
                          onClick={() => !cannotSelect && handleAddItem(product)}
                          className={`p-3 border rounded-lg transition-colors duration-200 ${
                            cannotSelect
                              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed opacity-60'
                              : 'border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {product.product_id}</div>
                              
                              {/* Product details dari API real */}
                              {product.brand && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">Brand: {product.brand}</div>
                              )}
                              {product.model && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">Model: {product.model}</div>
                              )}
                              {product.serial_number && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">S/N: {product.serial_number}</div>
                              )}
                              {product.description && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{product.description}</div>
                              )}
                              
                              <div className="flex items-center space-x-4 mt-1">
                                <div className={`text-xs font-medium ${
                                  product.status === 'Available' ? 'text-green-600 dark:text-green-400' :
                                  product.status === 'Checked Out' ? 'text-red-600 dark:text-red-400' :
                                  product.status === 'Maintenance' ? 'text-orange-600 dark:text-orange-400' :
                                  product.status === 'Repair' ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-gray-600 dark:text-gray-400'
                                }`}>
                                  Status: {product.status}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  Condition: {product.condition}
                                </div>
                                <div className={`text-xs font-medium ${
                                  product.quantity <= 0 ? 'text-red-600 dark:text-red-400' :
                                  product.quantity === 1 ? 'text-orange-600 dark:text-orange-400' :
                                  'text-green-600 dark:text-green-400'
                                }`}>
                                  Qty: {product.quantity}
                                </div>
                                {product.location && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Location: {product.location}
                                  </div>
                                )}
                              </div>
                              
                              {/* Warning messages */}
                              {isUnavailable && !isAlreadyAdded && (
                                <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                                  {product.status !== 'Available' ? `Not available - ${product.status}` :
                                   product.quantity <= 0 ? 'Out of stock' :
                                   'Cannot be selected'}
                                </div>
                              )}
                            </div>
                            
                            {/* Product Image */}
                            {product.img_product && (
                              <div className="ml-3">
                                <img 
                                  src={productService.getImageUrl(product.img_product)} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                                  onError={(e) => {
                                    // Hide image if failed to load
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Status badges */}
                            <div className="ml-2 flex flex-col gap-1">
                              {isAlreadyAdded && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  Added
                                </span>
                              )}
                              {product.status !== 'Available' && !isAlreadyAdded && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  {product.status}
                                </span>
                              )}
                              {product.quantity <= 0 && !isAlreadyAdded && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  No Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                {/* <button
                  onClick={() => handleSearchProducts(searchProduct)}
                  disabled={loadingProducts}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
                >
                  {loadingProducts ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search API
                    </>
                  )}
                </button> */}
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