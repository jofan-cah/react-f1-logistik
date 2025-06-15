// src/pages/transactions/TransactionForm.tsx - Check-in & Check-out Ticket Selection
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Plus,
  Trash2,
  User,
  MapPin,
  Hash,
  FileText,
  Package,
  Search,
  ScanLine,
  AlertCircle,
  X,
  RefreshCw,
  Ticket
} from 'lucide-react';
import { useTransactionStore } from '../../store/useTransactionStore';
import {
  Transaction,
  CreateTransactionRequest,
  CreateTransactionItemRequest,
  TRANSACTION_TYPE_LABELS,
  CONDITION_OPTIONS
} from '../../types/transaction.types';
import { productService } from '../../services/productService';
import { Product } from '../../types/product.types';

// Service untuk mengambil data ticket aktif
const ticketService = {
  getActiveTickets: async (): Promise<string[]> => {
    try {
      const response = await fetch('https://befast.fiberone.net.id/api/tickets/active-ids');
      if (!response.ok) {
        throw new Error('Failed to fetch active tickets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active tickets:', error);
      return [];
    }
  },
  
  // NEW: Service untuk mengambil tickets yang sedang digunakan oleh produk tertentu
  getProductTickets: async (productIds: string[]): Promise<{ [productId: string]: string }> => {
    try {
      const response = await fetch('https://befast.fiberone.net.id/api/products/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: productIds })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch product tickets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching product tickets:', error);
      return {};
    }
  }
};

interface TransactionFormProps {
  mode: 'create' | 'edit';
  defaultTransactionType?: string;
  hideTransactionTypeSelector?: boolean;
  requiredNotes?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  mode,
  defaultTransactionType,
  hideTransactionTypeSelector = false,
  requiredNotes = false
}) => {
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
    transaction_type: defaultTransactionType || 'check_out',
    first_person: '',
    second_person: '',
    location: '',
    notes: '',
    status: 'open',
    items: []
  });

  const [items, setItems] = useState<CreateTransactionItemRequest[]>([]);
  
  // MODIFIED: Ticket selection untuk check-out dan check-in
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  
  // NEW: Untuk check-in, kita track ticket yang sedang digunakan produk
  const [productTickets, setProductTickets] = useState<{ [productId: string]: string }>({});
  
  const [showAddItem, setShowAddItem] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Ticket state
  const [activeTickets, setActiveTickets] = useState<string[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadTransaction();
    } else if (mode === 'create') {
      const referenceNo = generateReferenceNumber();
      setFormData(prev => ({ ...prev, reference_no: referenceNo }));
    }

    loadProducts();
    
    // MODIFIED: Load tickets untuk checkout dan check-in
    if (['check_out', 'check_in'].includes(formData.transaction_type || '')) {
      loadActiveTickets();
    }

    return () => {
      clearCurrentTransaction();
    };
  }, [mode, id]);

  // Load active tickets
  const loadActiveTickets = async () => {
    setLoadingTickets(true);
    setTicketError(null);

    try {
      console.log('🎫 Loading active tickets...');
      const tickets = await ticketService.getActiveTickets();
      setActiveTickets(tickets);
      console.log('✅ Active tickets loaded:', tickets.length);
    } catch (error: any) {
      console.error('❌ Failed to load active tickets:', error);
      setTicketError('Failed to load active tickets');
      setActiveTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  // NEW: Load product tickets untuk check-in
  const loadProductTickets = async (productIds: string[]) => {
    if (productIds.length === 0) return;
    
    try {
      console.log('🎫 Loading product tickets for check-in...');
      const tickets = await ticketService.getProductTickets(productIds);
      setProductTickets(tickets);
      console.log('✅ Product tickets loaded:', tickets);
    } catch (error: any) {
      console.error('❌ Failed to load product tickets:', error);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);

    try {
      let statusFilter: string | undefined;

      if (formData.transaction_type === 'check_in') {
        statusFilter = 'Checked Out';
      } else if (formData.transaction_type === 'check_out') {
        statusFilter = 'Available';
      }

      const response = await productService.getProducts(1, 100, statusFilter ? {
        status: statusFilter
      } : {});

      if (response.success && response.data) {
        setProducts(response.data.products);
        console.log(`✅ Products loaded for ${formData.transaction_type}:`, response.data.products.length);
      } else {
        throw new Error(response.message || 'Failed to load products');
      }

    } catch (error: any) {
      console.error('❌ Failed to load products:', error);
      setProductError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (formData.transaction_type) {
      loadProducts();
      
      // MODIFIED: Load tickets untuk checkout dan check-in
      if (['check_out', 'check_in'].includes(formData.transaction_type)) {
        loadActiveTickets();
      } else {
        // Clear ticket selection jika bukan checkout/check-in
        setSelectedTicket('');
        setProductTickets({});
      }
    }
  }, [formData.transaction_type]);

  // NEW: Effect untuk load product tickets saat items berubah pada check-in
  useEffect(() => {
    if (formData.transaction_type === 'check_in' && items.length > 0) {
      const productIds = items.map(item => item.product_id);
      loadProductTickets(productIds);
    }
  }, [items, formData.transaction_type]);

  useEffect(() => {
    if (currentTransaction && mode === 'edit') {
      setFormData({
        transaction_type: currentTransaction.transaction_type,
        reference_no: currentTransaction.reference_no,
        first_person: currentTransaction.first_person,
        second_person: currentTransaction.second_person,
        location: currentTransaction.location,
        notes: currentTransaction.notes,
        status: currentTransaction.status,
        items: []
      });

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

      // MODIFIED: Set ticket berdasarkan transaction type
      if (transactionItems.length > 0) {
        const firstProductWithTicket = transactionItems.find(item => item.product?.ticketing_id);
        if (firstProductWithTicket?.product?.ticketing_id) {
          setSelectedTicket(firstProductWithTicket.product.ticketing_id);
        }
      }
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

    if ((requiredNotes || formData.transaction_type === 'repair' || formData.transaction_type === 'lost')
      && !formData.notes?.trim()) {
      errors.notes = `Notes are required for ${TRANSACTION_TYPE_LABELS[formData.transaction_type as keyof typeof TRANSACTION_TYPE_LABELS]}`;
    }

    if (items.length === 0) {
      errors.items = 'At least one item is required';
    }

    // MODIFIED: Validasi ticket untuk checkout dan check-in
    if (['check_out', 'check_in'].includes(formData.transaction_type || '')) {
      const hasProductsRequiringTicket = items.some(item => {
        const product = getProductById(item.product_id);
        return product?.is_linked_to_ticketing;
      });

      if (hasProductsRequiringTicket && !selectedTicket) {
        errors.selectedTicket = `Ticket selection is required for products with ticket integration`;
      }
    }

    items.forEach((item, index) => {
      if (!item.product_id) {
        errors[`item_${index}_product`] = 'Product is required';
      }
      if (item.quantity === undefined || item.quantity === null) {
        errors[`item_${index}_quantity`] = 'Quantity is required';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTransactionRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof CreateTransactionItemRequest, value: any) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));

    const errorKey = `item_${index}_${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Handle ticket selection
  const handleTicketSelection = (ticketId: string) => {
    setSelectedTicket(ticketId);
    
    // Clear validation error
    if (validationErrors.selectedTicket) {
      setValidationErrors(prev => ({ ...prev, selectedTicket: '' }));
    }
  };

  const handleAddItem = (product: Product) => {
    if (formData.transaction_type === 'check_in' && !['Checked Out', 'In Use'].includes(product.status)) {
      setProductError(`For Check In: only "Checked Out" or "In Use" products can be selected. "${product.brand} ${product.model}" is ${product.status}`);
      return;
    }

    if (formData.transaction_type === 'check_out' && product.status !== 'Available') {
      setProductError(`For Check Out: only "Available" products can be selected. "${product.brand} ${product.model}" is ${product.status}`);
      return;
    }

    const isAlreadyAdded = items.some(item => item.product_id === product.product_id);
    if (isAlreadyAdded) {
      setProductError(`Product "${product.brand} ${product.model}" is already added to this transaction`);
      return;
    }

    const newItem: CreateTransactionItemRequest = {
      product_id: product.product_id,
      quantity: 1,
      condition_before: product.condition || 'Good',
      condition_after: formData.transaction_type === 'lost' ? 'Poor' : '',
      status: 'processed',
      notes: ''
    };

    setItems(prev => [...prev, newItem]);
    setShowAddItem(false);
    setSearchProduct('');
    setProductError(null);

    if (validationErrors.items) {
      setValidationErrors(prev => ({ ...prev, items: '' }));
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        // MODIFIED: Enhanced create data dengan ticket untuk check-out dan check-in
        const createData: CreateTransactionRequest & { selected_ticket?: string } = {
          transaction_type: formData.transaction_type!,
          reference_no: formData.reference_no,
          first_person: formData.first_person!,
          second_person: formData.second_person,
          location: formData.location!,
          notes: formData.notes,
          status: formData.status,
          items: items,
          // MODIFIED: Kirim ticket untuk semua transaction type yang support ticket
          ...(selectedTicket && ['check_out', 'check_in'].includes(formData.transaction_type!) && { selected_ticket: selectedTicket })
        };

        console.log('🚀 Submitting transaction with ticket:', {
          transaction_type: createData.transaction_type,
          items_count: createData.items.length,
          selected_ticket: createData.selected_ticket
        });

        const success = await createTransaction(createData);

        if (success) {
          navigate('/transactions');
        }
      } else if (mode === 'edit' && id && currentTransaction) {
        const updateData = {
          reference_no: formData.reference_no,
          first_person: formData.first_person!,
          second_person: formData.second_person,
          location: formData.location!,
          notes: formData.notes,
          status: formData.status
        };

        const success = await updateTransaction(parseInt(id), updateData);

        if (success) {
          navigate(`/transactions/${id}`);
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

  const handleSearchProducts = async (query: string) => {
    if (!query.trim()) {
      await loadProducts();
      return;
    }

    setLoadingProducts(true);
    try {
      let statusFilter: string | undefined;

      if (formData.transaction_type === 'check_in') {
        statusFilter = 'Checked Out';
      } else if (formData.transaction_type === 'check_out') {
        statusFilter = 'Available';
      }

      const response = await productService.getProducts(1, 50, {
        search: query,
        ...(statusFilter && { status: statusFilter })
      });

      if (response.success && response.data) {
        setProducts(response.data.products);
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
  
  // MODIFIED: Check berapa produk yang require ticket untuk semua transaction type
  const productsRequiringTicket = items.filter(item => {
    const product = getProductById(item.product_id);
    return product?.is_linked_to_ticketing;
  }).length;

  const filteredProducts = products.filter(product =>
    product.product_id.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.model?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.serial_number?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  // NEW: Helper function untuk mendapatkan ticket context berdasarkan transaction type
  const getTicketContextMessage = () => {
    if (formData.transaction_type === 'check_out') {
      return "This ticket will be assigned to all products that require ticket integration";
    } else if (formData.transaction_type === 'check_in') {
      return "Select the ticket to return these products to";
    }
    return "";
  };

  if (isLoading && mode === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-32 w-32 animate-spin text-blue-500 dark:text-blue-400 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transaction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 mr-2" />
                <span className="text-red-800 dark:text-red-300">{error}</span>
              </div>
              <button onClick={clearError} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

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
                    {!hideTransactionTypeSelector && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Transaction Type *
                        </label>
                        <select
                          value={formData.transaction_type}
                          onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.transaction_type ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                          {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        {validationErrors.transaction_type && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.transaction_type}</p>
                        )}
                      </div>
                    )}

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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.first_person ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.location ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                      {validationErrors.location && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.location}</p>
                      )}
                    </div>

                    {/* MODIFIED: Ticket Selection untuk Check-out dan Check-in */}
                    {['check_out', 'check_in'].includes(formData.transaction_type || '') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Ticket className="inline h-4 w-4 mr-1" />
                          {formData.transaction_type === 'check_out' ? 'Assign to Ticket' : 'Return to Ticket'} 
                          {productsRequiringTicket > 0 && <span className="text-red-500"> *</span>}
                        </label>
                        <select
                          value={selectedTicket}
                          onChange={(e) => handleTicketSelection(e.target.value)}
                          disabled={loadingTickets}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.selectedTicket ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                          <option value="">
                            {loadingTickets ? 'Loading tickets...' : 'Select a ticket...'}
                          </option>
                          {activeTickets.map(ticketId => (
                            <option key={ticketId} value={ticketId}>
                              {ticketId}
                            </option>
                          ))}
                        </select>
                        {validationErrors.selectedTicket && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.selectedTicket}</p>
                        )}
                        {ticketError && (
                          <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                            ⚠️ {ticketError}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {getTicketContextMessage()}
                        </p>
                        
                        {/* NEW: Show current product tickets untuk check-in */}
                        {formData.transaction_type === 'check_in' && Object.keys(productTickets).length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                              Current product tickets:
                            </p>
                            <div className="space-y-1">
                              {Object.entries(productTickets).map(([productId, ticketId]) => (
                                <div key={productId} className="text-xs text-blue-700 dark:text-blue-400">
                                  {productId}: <span className="font-mono">{ticketId}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Notes {requiredNotes && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={requiredNotes ? 4 : 3}
                        placeholder={
                          requiredNotes
                            ? formData.transaction_type === 'repair'
                              ? "Describe the issue, symptoms, and required repairs..."
                              : formData.transaction_type === 'lost'
                                ? "Explain the circumstances of loss, last known location, and responsible person..."
                                : "Additional notes..."
                            : "Additional notes..."
                        }
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.notes ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                      {validationErrors.notes && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Items */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6 border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">Items</h2>
                      {['check_out', 'check_in'].includes(formData.transaction_type || '') && selectedTicket && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          <Ticket className="inline h-3 w-3 mr-1" />
                          {formData.transaction_type === 'check_out' ? 'Assigning to ticket:' : 'Returning to ticket:'} 
                          <span className="font-mono ml-1">{selectedTicket}</span>
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddItem(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600"
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
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item, index) => {
                        const product = getProductById(item.product_id);
                        const requiresTicket = product?.is_linked_to_ticketing;
                        const currentTicket = productTickets[item.product_id];
                        
                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Product Info */}
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {product?.brand && product?.model ? `${product.brand} ${product.model}` : `Product ${item.product_id}`}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {item.product_id}</p>
                                    {product && (
                                      <div className="mt-1 space-y-1">
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                          Status: <span className={`font-medium ${product.status === 'Available' ? 'text-green-600 dark:text-green-400' :
                                            product.status === 'Checked Out' ? 'text-red-600 dark:text-red-400' :
                                              'text-orange-600 dark:text-orange-400'
                                            }`}>{product.status}</span>
                                        </div>
                                        {/* MODIFIED: Enhanced ticket integration indicator */}
                                        {requiresTicket && (
                                          <div className="flex items-center text-xs">
                                            <Ticket className="h-3 w-3 mr-1" />
                                            {formData.transaction_type === 'check_out' && selectedTicket ? (
                                              <span className="text-blue-600 dark:text-blue-400">
                                                Will be assigned to: 
                                                <span className="ml-1 font-mono bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                                                  {selectedTicket}
                                                </span>
                                              </span>
                                            ) : formData.transaction_type === 'check_in' && currentTicket ? (
                                              <span className="text-green-600 dark:text-green-400">
                                                Currently assigned to: 
                                                <span className="ml-1 font-mono bg-green-100 dark:bg-green-900/30 px-1 rounded">
                                                  {currentTicket}
                                                </span>
                                                {selectedTicket && selectedTicket !== currentTicket && (
                                                  <span className="block mt-1 text-orange-600 dark:text-orange-400">
                                                    → Will be moved to: 
                                                    <span className="ml-1 font-mono bg-orange-100 dark:bg-orange-900/30 px-1 rounded">
                                                      {selectedTicket}
                                                    </span>
                                                  </span>
                                                )}
                                              </span>
                                            ) : (
                                              <span className="text-orange-600 dark:text-orange-400">
                                                Requires ticket assignment
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div className="mt-2">
                                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Quantity *
                                      </label>
                                      <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => {
                                          const newQuantity = parseInt(e.target.value) || 0;
                                          handleItemChange(index, 'quantity', newQuantity);
                                        }}
                                        className={`w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors[`item_${index}_quantity`] ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}`}
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

                                  {/* Conditions */}
                                  <div>
                                    <div className="space-y-2">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          Condition Before
                                        </label>
                                        <select
                                          value={item.condition_before || ''}
                                          onChange={(e) => handleItemChange(index, 'condition_before', e.target.value)}
                                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                                  {/* Notes */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Item Notes
                                    </label>
                                    <textarea
                                      value={item.notes || ''}
                                      onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                      rows={3}
                                      placeholder="Notes for this item..."
                                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="ml-4 p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
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
                    
                    {/* MODIFIED: Ticket Summary untuk Check-out dan Check-in */}
                    {['check_out', 'check_in'].includes(formData.transaction_type || '') && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Require Tickets:</span>
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            {productsRequiringTicket}
                          </span>
                        </div>
                        {selectedTicket && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formData.transaction_type === 'check_out' ? 'Assign to:' : 'Return to:'}
                            </span>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 font-mono">
                              {selectedTicket}
                            </span>
                          </div>
                        )}
                        
                        {/* NEW: Show current tickets summary untuk check-in */}
                        {formData.transaction_type === 'check_in' && Object.keys(productTickets).length > 0 && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Current Tickets:</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {Object.keys(productTickets).length} items
                              </span>
                            </div>
                            <div className="space-y-1">
                              {Object.entries(productTickets).slice(0, 3).map(([productId, ticketId]) => (
                                <div key={productId} className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{ticketId}</span>
                                </div>
                              ))}
                              {Object.keys(productTickets).length > 3 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  +{Object.keys(productTickets).length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                      <span className={`text-sm font-medium ${formData.status === 'open' ? 'text-green-600 dark:text-green-400' :
                        formData.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                        {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {TRANSACTION_TYPE_LABELS[formData.transaction_type as keyof typeof TRANSACTION_TYPE_LABELS]}
                          </span>
                          {formData.transaction_type && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {formData.transaction_type === 'check_in' ? 'Return items' :
                                formData.transaction_type === 'check_out' ? 'Borrow items' :
                                  'Transfer/Other'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* MODIFIED: Active Tickets Summary untuk Check-out dan Check-in */}
                    {['check_out', 'check_in'].includes(formData.transaction_type || '') && activeTickets.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Ticket className="inline h-4 w-4 mr-1" />
                            Available Tickets
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {activeTickets.length} total
                          </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                          <div className="space-y-1">
                            {activeTickets.slice(0, 5).map(ticketId => (
                              <div 
                                key={ticketId} 
                                className={`text-xs font-mono px-2 py-1 rounded cursor-pointer transition-colors ${
                                  selectedTicket === ticketId 
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                onClick={() => handleTicketSelection(ticketId)}
                              >
                                {ticketId}
                              </div>
                            ))}
                            {activeTickets.length > 5 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                +{activeTickets.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      type="button"
                      onClick={() => navigate('/transactions')}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* MODIFIED: Add Item Modal dengan Enhanced Ticket Integration Info */}
      {showAddItem && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Item</h3>
                  <div className="space-y-1 mt-1">
                    {formData.transaction_type && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.transaction_type === 'check_in'
                          ? 'Showing only "Checked Out" items'
                          : formData.transaction_type === 'check_out'
                            ? 'Showing only "Available" items'
                            : 'Showing all items'}
                      </p>
                    )}
                    {['check_out', 'check_in'].includes(formData.transaction_type || '') && selectedTicket && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        <Ticket className="inline h-3 w-3 mr-1" />
                        {formData.transaction_type === 'check_out' ? 'Assigning to:' : 'Returning to:'} 
                        <span className="font-mono ml-1">{selectedTicket}</span>
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
                    onChange={(e) => setSearchProduct(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchProducts(searchProduct);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
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
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map(product => {
                      const isAlreadyAdded = items.some(item => item.product_id === product.product_id);
                      let cannotSelect = isAlreadyAdded;
                      let reason = '';

                      if (formData.transaction_type === 'check_in') {
                        if (product.status !== 'Checked Out') {
                          cannotSelect = true;
                          reason = `Check In requires "Checked Out" status`;
                        }
                      } else if (formData.transaction_type === 'check_out') {
                        if (product.status !== 'Available') {
                          cannotSelect = true;
                          reason = `Check Out requires "Available" status`;
                        }
                        if (product.quantity <= 0) {
                          cannotSelect = true;
                          reason = 'Out of stock';
                        }
                      }

                      if (isAlreadyAdded) {
                        reason = 'Already added';
                      }

                      return (
                        <div
                          key={product.product_id}
                          onClick={() => !cannotSelect && handleAddItem(product)}
                          className={`p-3 border rounded-lg transition-colors ${cannotSelect
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed opacity-60'
                            : 'border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {product.brand && product.model ? `${product.brand} ${product.model}` : product.product_id}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {product.product_id}</div>

                              {/* MODIFIED: Enhanced ticket integration indicator */}
                              {product.is_linked_to_ticketing && (
                                <div className="flex items-center mt-1 text-xs">
                                  <Ticket className="h-3 w-3 mr-1" />
                                  {formData.transaction_type === 'check_out' ? (
                                    <span className="text-blue-600 dark:text-blue-400">
                                      Will use selected ticket
                                    </span>
                                  ) : formData.transaction_type === 'check_in' ? (
                                    <span className="text-green-600 dark:text-green-400">
                                      Has current ticket assignment
                                    </span>
                                  ) : (
                                    <span className="text-purple-600 dark:text-purple-400">
                                      Ticket-enabled
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center space-x-4 mt-1">
                                <div className={`text-xs font-medium ${product.status === 'Available' ? 'text-green-600 dark:text-green-400' :
                                  product.status === 'Checked Out' ? 'text-red-600 dark:text-red-400' :
                                    'text-orange-600 dark:text-orange-400'
                                  }`}>
                                  Status: {product.status}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  Condition: {product.condition}
                                </div>
                                <div className={`text-xs font-medium ${product.quantity <= 0 ? 'text-red-600 dark:text-red-400' :
                                  product.quantity === 1 ? 'text-orange-600 dark:text-orange-400' :
                                    'text-green-600 dark:text-green-400'
                                  }`}>
                                  Qty: {product.quantity}
                                </div>
                              </div>

                              {cannotSelect && reason && (
                                <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                                  {reason}
                                </div>
                              )}
                            </div>

                            <div className="ml-2 flex flex-col gap-1">
                              {isAlreadyAdded && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  Added
                                </span>
                              )}
                              {product.is_linked_to_ticketing && ['check_out', 'check_in'].includes(formData.transaction_type || '') && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                  <Ticket className="h-3 w-3 mr-1" />
                                  Ticket
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
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/scanner')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600"
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