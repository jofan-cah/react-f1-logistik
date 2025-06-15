// src/pages/purchasing/PurchasingForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2,
  Package,
  Calendar,
  FileText,
  User,
  Hash,
  AlertCircle
} from 'lucide-react';
import { usePurchasingStore } from '../../store/usePurchasingStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSupplierStore } from '../../store/useSupplierStore';
import { CreatePurchaseReceiptRequest, UpdatePurchaseReceiptRequest } from '../../types/purchasing.types';

interface PurchasingFormProps {
  mode: 'create' | 'edit';
}

interface ItemInput {
  id: string; // temporary ID untuk tracking
  category_id: string;
  serial_number: string;
  quantity: number;
  keterangan: string; // ok/pcs/dll
}

const PurchasingForm: React.FC<PurchasingFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const {
    currentReceipt,
    isLoading,
    error,
    fetchReceiptById,
    createReceipt,
    updateReceipt,
    clearReceiptDetail,
    clearError
  } = usePurchasingStore();

  // Get real data from API
  const {
    categories,
    isLoading: categoriesLoading,
    fetchCategories
  } = useCategoryStore();
  
  const {
    suppliers,
    isLoading: suppliersLoading,
    fetchSuppliers
  } = useSupplierStore();

  // Form state
  const [formData, setFormData] = useState({
    supplier_id: '',
    po_number: '',
    receipt_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [items, setItems] = useState<ItemInput[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // State untuk bulk add
  const [bulkItemCount, setBulkItemCount] = useState<number>(1);

  // Generate unique ID untuk item baru
  const generateItemId = () => {
    return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Load categories dan suppliers saat component mount
  useEffect(() => {
    const loadData = async () => {
      console.log('Loading categories and suppliers...');
      try {
        await Promise.all([
          fetchCategories(),
          fetchSuppliers()
        ]);
        console.log('Categories loaded:', categories.length);
        console.log('Suppliers loaded:', suppliers.length);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [fetchCategories, fetchSuppliers]);

  // Debug log untuk melihat data yang loaded
  useEffect(() => {
    console.log('Categories updated:', categories);
    console.log('Suppliers updated:', suppliers);
  }, [categories, suppliers]);

  // Load data untuk edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchReceiptById(parseInt(id));
    }
    
    return () => {
      clearReceiptDetail();
    };
  }, [mode, id, fetchReceiptById, clearReceiptDetail]);

  // Populate form dengan data dari store untuk edit mode
  useEffect(() => {
    if (currentReceipt && mode === 'edit') {
      setFormData({
        supplier_id: currentReceipt.supplier_id.toString(),
        po_number: currentReceipt.po_number,
        receipt_date: currentReceipt.receipt_date.split('T')[0],
        notes: currentReceipt.notes || ''
      });

      // Convert items dari receipt ke format ItemInput
      if (currentReceipt.items) {
        const convertedItems: ItemInput[] = currentReceipt.items.map(item => ({
          id: generateItemId(),
          category_id: item.category_id.toString(),
          serial_number: item.serial_numbers || '',
          quantity: item.quantity,
          keterangan: item.notes || 'pcs'
        }));
        setItems(convertedItems);
      }
    }
  }, [currentReceipt, mode]);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Add bulk items berdasarkan jumlah yang diinput
  const addBulkItems = () => {
    const count = Math.max(1, Math.min(1000, bulkItemCount)); // Batasi maksimal 50 item
    const newItems: ItemInput[] = [];
    
    for (let i = 0; i < count; i++) {
      newItems.push({
        id: generateItemId(),
        category_id: '',
        serial_number: '',
        quantity: 1,
        keterangan: 'pcs'
      });
    }
    
    setItems(prev => [...prev, ...newItems]);
    setBulkItemCount(1); // Reset ke 1 setelah add
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Update item
  const updateItem = (itemId: string, field: keyof ItemInput, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  // Clear all items
  const clearAllItems = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua barang?')) {
      setItems([]);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.supplier_id) {
      errors.supplier_id = 'Supplier is required';
    }

    if (!formData.po_number.trim()) {
      errors.po_number = 'PO Number is required';
    }

    if (!formData.receipt_date) {
      errors.receipt_date = 'Receipt date is required';
    }

    if (items.length === 0) {
      errors.items = 'At least one item is required';
    }

    // Validate each item
    items.forEach((item, index) => {
      if (!item.category_id) {
        errors[`item_${index}_category`] = `Item ${index + 1}: Category is required`;
      }
      if (!item.serial_number.trim()) {
        errors[`item_${index}_serial`] = `Item ${index + 1}: Serial number is required`;
      }
      if (item.quantity <= 0) {
        errors[`item_${index}_quantity`] = `Item ${index + 1}: Quantity must be greater than 0`;
      }
      if (!item.keterangan.trim()) {
        errors[`item_${index}_keterangan`] = `Item ${index + 1}: Keterangan is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        const createData: CreatePurchaseReceiptRequest = {
          po_number: formData.po_number,
          supplier_id: parseInt(formData.supplier_id),
          receipt_date: formData.receipt_date,
          status: 'completed',
          notes: formData.notes || undefined,
          items: items.map(item => ({
            category_id: parseInt(item.category_id),
            quantity: item.quantity,
            unit_price: 0, // Default price
            serial_numbers: item.serial_number,
            condition: 'New',
            notes: item.keterangan,
            generate_products: true // Selalu generate products
          }))
        };
        
        await createReceipt(createData);
        alert('Purchase receipt created successfully! Products have been generated.');
        navigate('/purchasing');
      } else if (mode === 'edit' && id) {
        const updateData: UpdatePurchaseReceiptRequest = {
          po_number: formData.po_number,
          supplier_id: parseInt(formData.supplier_id),
          receipt_date: formData.receipt_date,
          notes: formData.notes || undefined
        };
        
        await updateReceipt(parseInt(id), updateData);
        alert('Purchase receipt updated successfully!');
        navigate(`/purchasing/${id}`);
      }
    } catch (error) {
      console.error('Error saving receipt:', error);
    }
  };

  if (isLoading && mode === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading receipt data...</p>
        </div>
      </div>
    );
  }

  // Loading state untuk data dependencies
  if (categoriesLoading || suppliersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading categories and suppliers...</p>
        </div>
      </div>
    );
  }

  // Error state jika categories atau suppliers kosong
  if (categories.length === 0 || suppliers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Data Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {categories.length === 0 && suppliers.length === 0 
              ? 'Categories and suppliers are required to create purchase receipts.'
              : categories.length === 0 
                ? 'Categories are required to create purchase receipts.'
                : 'Suppliers are required to create purchase receipts.'
            }
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Retry Loading
            </button>
            <button
              onClick={() => navigate('/purchasing')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to List
            </button>
          </div>
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === 'create' ? 'Barang Masuk - Purchase Receipt' : 'Edit Purchase Receipt'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          {/* Header Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Informasi Purchase Receipt</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Supplier *
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      validationErrors.supplier_id ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Pilih Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.supplier_id && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.supplier_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Nomor PO *
                  </label>
                  <input
                    type="text"
                    value={formData.po_number}
                    onChange={(e) => handleInputChange('po_number', e.target.value)}
                    placeholder="Masukkan nomor PO"
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      validationErrors.po_number ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {validationErrors.po_number && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.po_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Tanggal Receipt *
                  </label>
                  <input
                    type="date"
                    value={formData.receipt_date}
                    onChange={(e) => handleInputChange('receipt_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      validationErrors.receipt_date ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {validationErrors.receipt_date && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.receipt_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Catatan tambahan (opsional)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Daftar Barang Masuk
                </h2>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllItems}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm underline"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>
              
              {/* Bulk Add Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Hash className="inline h-4 w-4 mr-1" />
                      Jumlah Barang yang Akan Ditambahkan
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={bulkItemCount}
                        onChange={(e) => setBulkItemCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                        placeholder="1"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">barang</span>
                      <button
                        type="button"
                        onClick={addBulkItems}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah {bulkItemCount} Barang
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Masukkan jumlah form barang yang ingin ditambahkan (maksimal 50)
                    </p>
                  </div>
                </div>
              </div>
              
              {validationErrors.items && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.items}</p>
              )}
            </div>
            
            <div className="p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Belum ada barang yang ditambahkan</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Gunakan form di atas untuk menambahkan barang
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total: <span className="font-semibold">{items.length}</span> barang, 
                      <span className="font-semibold ml-1">{items.reduce((sum, item) => sum + item.quantity, 0)}</span> item
                    </p>
                  </div>
                  
                  {items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white">
                          Barang #{index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                          title="Hapus barang"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Kategori *
                          </label>
                          <select
                            value={item.category_id}
                            onChange={(e) => updateItem(item.id, 'category_id', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm ${
                              validationErrors[`item_${index}_category`] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="">Pilih Kategori</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name} {category.code ? `(${category.code})` : ''}
                              </option>
                            ))}
                          </select>
                          {validationErrors[`item_${index}_category`] && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors[`item_${index}_category`]}</p>
                          )}
                        </div>

                        {/* Serial Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Serial Number *
                          </label>
                          <input
                            type="text"
                            value={item.serial_number}
                            onChange={(e) => updateItem(item.id, 'serial_number', e.target.value)}
                            placeholder="SN/Kode Barang"
                            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm ${
                              validationErrors[`item_${index}_serial`] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {validationErrors[`item_${index}_serial`] && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors[`item_${index}_serial`]}</p>
                          )}
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Qty *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm ${
                              validationErrors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {validationErrors[`item_${index}_quantity`] && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors[`item_${index}_quantity`]}</p>
                          )}
                        </div>

                        {/* Keterangan */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Keterangan *
                          </label>
                          <input
                            type="text"
                            value={item.keterangan}
                            onChange={(e) => updateItem(item.id, 'keterangan', e.target.value)}
                            placeholder="ok/pcs/unit/dll"
                            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm ${
                              validationErrors[`item_${index}_keterangan`] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {validationErrors[`item_${index}_keterangan`] && (
                            <p className="mt-1 text-xs text-red-600">{validationErrors[`item_${index}_keterangan`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/purchasing')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            
            <button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Menyimpan...' : mode === 'create' ? 'Simpan & Generate Products' : 'Update Receipt'}
            </button>
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium">Ringkasan:</p>
                  <p>Total {items.length} kategori barang, {items.reduce((sum, item) => sum + item.quantity, 0)} item akan dimasukkan ke inventory.</p>
                  <p>Setiap item akan di-generate menjadi product individual dengan barcode.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PurchasingForm;