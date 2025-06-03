import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft, Package, Building2, Tag, MapPin, Calendar, DollarSign, FileText, AlertCircle, CheckCircle, Truck, Wrench } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProductStore } from '../../store/useProductStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSupplierStore } from '../../store/useSupplierStore';
import { CreateProductRequest, UpdateProductRequest } from '../../types/product.types';

// Form data interface - FIXED: TAMBAH product_id
interface ProductFormData {
  product_id: string;  // TAMBAH INI
  name: string;
  category_id: string;
  brand: string;
  model: string;
  serial_number: string;
  origin: string;
  supplier_id: string;
  po_number: string;
  description: string;
  location: string;
  status: string;
  condition: string;
  quantity: string;
  purchase_date: string;
  purchase_price: string;
  warranty_expiry: string;
  last_maintenance_date: string;
  next_maintenance_date: string;
  ticketing_id: string;
  is_linked_to_ticketing: boolean;
  notes: string;
}

// Static options
const statusOptions = [
  { value: 'Available', label: 'Available', icon: CheckCircle, color: 'text-green-600' },
  { value: 'In Use', label: 'In Use', icon: Package, color: 'text-blue-600' },
  { value: 'Under Maintenance', label: 'Under Maintenance', icon: Wrench, color: 'text-yellow-600' },
  { value: 'Retired', label: 'Retired', icon: AlertCircle, color: 'text-gray-600' },
  { value: 'Lost', label: 'Lost', icon: AlertCircle, color: 'text-red-600' },
];

const conditionOptions = [
  { value: 'New', label: 'New', color: 'text-green-600' },
  { value: 'Good', label: 'Good', color: 'text-blue-600' },
  { value: 'Fair', label: 'Fair', color: 'text-yellow-600' },
  { value: 'Poor', label: 'Poor', color: 'text-red-600' },
];

const locationOptions = [
  { value: 'Main Office', label: 'Main Office' },
  { value: 'Branch A', label: 'Branch A' },
  { value: 'Data Center', label: 'Data Center' },
  { value: 'Remote Office', label: 'Remote Office' },
  { value: 'Warehouse', label: 'Warehouse' },
  { value: 'Storage Room', label: 'Storage Room' },
];

const originOptions = [
  { value: 'Local', label: 'Local' },
  { value: 'Import', label: 'Import' }
];

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { darkMode } = useTheme();
  const isEdit = Boolean(id && id !== 'create');

  // Get supplier_id from URL params if creating new product
  const preselectedSupplierId = searchParams.get('supplier_id');

  // Zustand stores
  const {
    currentProduct,
    isLoading: productLoading,
    error: productError,
    getProductById,
    createProduct,
    updateProduct,
    clearError: clearProductError,
    clearCurrentProduct
  } = useProductStore();

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

  // Local state
  const [productId, setProductId] = useState<string>('');
  
  // FIXED: Initial state dengan product_id
  const [formData, setFormData] = useState<ProductFormData>({
    product_id: '', // SEKARANG ADA DI INTERFACE
    name: '',
    category_id: '',
    brand: '',
    model: '',
    serial_number: '',
    origin: '',
    supplier_id: preselectedSupplierId || '',
    po_number: '',
    description: '',
    location: '',
    status: 'Available',
    condition: 'New',
    quantity: '1',
    purchase_date: '',
    purchase_price: '',
    warranty_expiry: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    ticketing_id: '',
    is_linked_to_ticketing: false,
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchCategories();
    fetchSuppliers();

    // Cleanup when component unmounts
    return () => {
      clearCurrentProduct();
      clearProductError();
    };
  }, [fetchCategories, fetchSuppliers, clearCurrentProduct, clearProductError]);

  // FIXED: Generate product ID for new products dan update formData
  useEffect(() => {
    if (!isEdit) {
      const newId = `PRD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      setProductId(newId);
      // UPDATE FORM DATA JUGA
      setFormData(prev => ({ ...prev, product_id: newId }));
    }
  }, [isEdit]);

  // Load product data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      getProductById(id);
    }
  }, [isEdit, id, getProductById]);

  // FIXED: Populate form when product data is loaded
  useEffect(() => {
    if (currentProduct && isEdit) {
      setProductId(currentProduct.product_id);
      
      setFormData({
        product_id: currentProduct.product_id, // SEKARANG BISA DITAMBAH
        name: currentProduct.name,
        category_id: currentProduct.category_id.toString(),
        brand: currentProduct.brand || '',
        model: currentProduct.model || '',
        serial_number: currentProduct.serial_number || '',
        origin: currentProduct.origin || '',
        supplier_id: currentProduct.supplier_id?.toString() || '',
        po_number: currentProduct.po_number || '',
        description: currentProduct.description || '',
        location: currentProduct.location || '',
        status: currentProduct.status,
        condition: currentProduct.condition,
        quantity: currentProduct.quantity.toString(),
        purchase_date: currentProduct.purchase_date || '',
        purchase_price: currentProduct.purchase_price?.toString() || '',
        warranty_expiry: currentProduct.warranty_expiry || '',
        last_maintenance_date: currentProduct.last_maintenance_date || '',
        next_maintenance_date: currentProduct.next_maintenance_date || '',
        ticketing_id: currentProduct.ticketing_id || '',
        is_linked_to_ticketing: currentProduct.is_linked_to_ticketing,
        notes: currentProduct.notes || ''
      });
    }
  }, [currentProduct, isEdit]);

  const validate = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Nama produk wajib diisi';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Kategori wajib dipilih';
    }

    if (!formData.status) {
      newErrors.status = 'Status wajib dipilih';
    }

    if (!formData.condition) {
      newErrors.condition = 'Kondisi wajib dipilih';
    }

    // Quantity validation
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      newErrors.quantity = 'Jumlah harus berupa angka positif';
    }

    // Price validation
    if (formData.purchase_price) {
      const price = parseFloat(formData.purchase_price);
      if (isNaN(price) || price < 0) {
        newErrors.purchase_price = 'Harga harus berupa angka positif';
      }
    }

    // Ticketing validation
    if (formData.is_linked_to_ticketing && !formData.ticketing_id.trim()) {
      newErrors.ticketing_id = 'Ticketing ID wajib diisi jika terhubung ke sistem tiket';
    }

    // Date validations
    if (formData.warranty_expiry && formData.purchase_date) {
      const purchaseDate = new Date(formData.purchase_date);
      const warrantyDate = new Date(formData.warranty_expiry);
      if (warrantyDate <= purchaseDate) {
        newErrors.warranty_expiry = 'Tanggal berakhir garansi harus setelah tanggal pembelian';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FIXED: handleSubmit dengan product_id
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    clearProductError();
    
    try {
      let success = false;

      // Debug: Log data yang akan dikirim
      console.log('Form Data:', formData);
      console.log('Product ID:', productId);

      if (isEdit && id) {
        // Update existing product
        const updateData: UpdateProductRequest = {
          product_id: formData.product_id || productId, // GUNAKAN DARI FORM DATA
          name: formData.name.trim(),
          category_id: parseInt(formData.category_id),
          brand: formData.brand.trim() || undefined,
          model: formData.model.trim() || undefined,
          serial_number: formData.serial_number.trim() || undefined,
          origin: formData.origin || undefined,
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : undefined,
          po_number: formData.po_number.trim() || undefined,
          description: formData.description.trim() || undefined,
          location: formData.location || undefined,
          status: formData.status,
          condition: formData.condition,
          quantity: parseInt(formData.quantity),
          purchase_date: formData.purchase_date || undefined,
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
          warranty_expiry: formData.warranty_expiry || undefined,
          last_maintenance_date: formData.last_maintenance_date || undefined,
          next_maintenance_date: formData.next_maintenance_date || undefined,
          ticketing_id: formData.ticketing_id.trim() || undefined,
          is_linked_to_ticketing: formData.is_linked_to_ticketing,
          notes: formData.notes.trim() || undefined
        };
        
        console.log('Updating with data:', updateData);
        success = await updateProduct(id, updateData);
      } else {
        // Create new product
        const createData: CreateProductRequest = {
          product_id: formData.product_id || productId, // FIXED: TAMBAH PRODUCT_ID
          name: formData.name.trim(),
          category_id: parseInt(formData.category_id),
          brand: formData.brand.trim() || undefined,
          model: formData.model.trim() || undefined,
          serial_number: formData.serial_number.trim() || undefined,
          origin: formData.origin || undefined,
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : undefined,
          po_number: formData.po_number.trim() || undefined,
          description: formData.description.trim() || undefined,
          location: formData.location || undefined,
          status: formData.status,
          condition: formData.condition,
          quantity: parseInt(formData.quantity),
          purchase_date: formData.purchase_date || undefined,
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
          warranty_expiry: formData.warranty_expiry || undefined,
          last_maintenance_date: formData.last_maintenance_date || undefined,
          next_maintenance_date: formData.next_maintenance_date || undefined,
          ticketing_id: formData.ticketing_id.trim() || undefined,
          is_linked_to_ticketing: formData.is_linked_to_ticketing,
          notes: formData.notes.trim() || undefined
        };
        
        console.log('Creating with data:', createData);
        success = await createProduct(createData);
      }

      if (success) {
        navigate('/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCancel = () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan? Perubahan yang belum disimpan akan hilang.')) {
      navigate('/products');
    }
  };

  // Format price input
  const formatPriceInput = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    return numericValue;
  };

  // Convert data to select options
  const categoryOptions = [
    { value: '', label: 'Pilih Kategori' },
    ...categories.map(category => ({
      value: category.id.toString(),
      label: category.name
    }))
  ];

  const supplierOptions = [
    { value: '', label: 'Pilih Supplier' },
    ...suppliers.map(supplier => ({
      value: supplier.id.toString(),
      label: supplier.name
    }))
  ];

  // Loading state
  const isLoading = productLoading || categoriesLoading || suppliersLoading;

  if (isLoading && !currentProduct) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isEdit ? 'Memuat data produk...' : 'Memuat form...'}
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className={`
              flex items-center text-sm mb-4 transition-colors
              ${darkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Produk
          </button>
          
          <div className="flex items-center space-x-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'}
            `}>
              <Package className={`w-6 h-6 ${darkMode ? 'text-indigo-200' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {isEdit 
                  ? 'Perbarui informasi dan detail produk' 
                  : 'Tambahkan produk baru ke dalam inventori'}
              </p>
              {(formData.product_id || productId) && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ID: {formData.product_id || productId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {productError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{productError}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearProductError}
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className={`rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Informasi Dasar
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Detail utama produk dan identifikasi
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Product Name & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Nama Produk *
                      </label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Masukkan nama produk"
                          className={`
                            w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                            ${errors.name
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : darkMode
                                ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                            }
                            focus:outline-none focus:ring-2
                          `}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Kategori *
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.category_id}
                          onChange={(e) => handleInputChange('category_id', e.target.value)}
                          disabled={categoriesLoading}
                          className={`
                            w-full pl-10 pr-4 py-3 rounded-lg border transition-colors appearance-none
                            ${errors.category_id
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : darkMode
                                ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                            }
                            focus:outline-none focus:ring-2
                          `}
                        >
                          {categoryOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.category_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                      )}
                    </div>
                  </div>

                  {/* Brand & Model */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Brand/Merek
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="Contoh: Dell, HP, Lenovo"
                        className={`
                          w-full px-4 py-3 rounded-lg border transition-colors
                          ${darkMode
                            ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Model/Tipe
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        placeholder="Contoh: ThinkPad X1, Inspiron 15"
                        className={`
                          w-full px-4 py-3 rounded-lg border transition-colors
                          ${darkMode
                            ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      />
                    </div>
                  </div>

                  {/* Serial Number & Origin */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Nomor Seri
                      </label>
                      <input
                        type="text"
                        value={formData.serial_number}
                        onChange={(e) => handleInputChange('serial_number', e.target.value)}
                        placeholder="Nomor seri produk"
                        className={`
                          w-full px-4 py-3 rounded-lg border transition-colors
                          ${darkMode
                            ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Asal Produk
                      </label>
                      <select
                        value={formData.origin}
                        onChange={(e) => handleInputChange('origin', e.target.value)}
                        className={`
                          w-full px-4 py-3 rounded-lg border transition-colors appearance-none
                          ${darkMode
                            ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      >
                        <option value="">Pilih Asal Produk</option>
                        {originOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Deskripsi
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        placeholder="Deskripsi produk, spesifikasi, atau keterangan lainnya"
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-lg border transition-colors resize-none
                          ${darkMode
                            ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Information */}
              <div className={`rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Informasi Pembelian
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Detail pembelian dan vendor
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Supplier & PO Number */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Supplier
                      </label>
                      <div className="relative">
                        <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.supplier_id}
                          onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                          disabled={suppliersLoading}
                          className={`
                            w-full pl-10 pr-4 py-3 rounded-lg border transition-colors appearance-none
                            ${darkMode
                              ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                            }
                            focus:outline-none focus:ring-2
                          `}
                        >
                          {supplierOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Nomor PO
                      </label>
                      <input
                        type="text"
                        value={formData.po_number}
                        onChange={(e) => handleInputChange('po_number', e.target.value)}
                        placeholder="Purchase Order Number"
                        className={`
                          w-full px-4 py-3 rounded-lg border transition-colors
                          ${darkMode
                            ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      />
                    </div>
                  </div>

                  {/* Purchase Date & Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Tanggal Pembelian
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={formData.purchase_date}
                          onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                          className={`
                            w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                            ${darkMode
                              ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                            }
                            focus:outline-none focus:ring-2
                          `}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Harga Pembelian
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.purchase_price}
                          onChange={(e) => handleInputChange('purchase_price', formatPriceInput(e.target.value))}
                          placeholder="0"
                          className={`
                            w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                            ${errors.purchase_price
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : darkMode
                                ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                            }
                            focus:outline-none focus:ring-2
                          `}
                        />
                      </div>
                      {errors.purchase_price && (
                        <p className="mt-1 text-sm text-red-600">{errors.purchase_price}</p>
                      )}
                      <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Masukkan angka saja (tanpa Rp atau titik)
                      </p>
                    </div>
                  </div>

                  {/* Warranty & Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Berakhir Garansi
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={formData.warranty_expiry}
                          onChange={(e) => handleInputChange('warranty_expiry', e.target.value)}
                          className={`
                            w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                            ${errors.warranty_expiry
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : darkMode
                                ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                            }
                            focus:outline-none focus:ring-2
                          `}
                        />
                      </div>
                      {errors.warranty_expiry && (
                        <p className="mt-1 text-sm text-red-600">{errors.warranty_expiry}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Jumlah *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        className={`
                          w-full px-4 py-3 rounded-lg border transition-colors
                          ${errors.quantity
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : darkMode
                              ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Maintenance */}
              <div className={`rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Status & Pemeliharaan
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Status saat ini dan jadwal pemeliharaan
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Status & Condition */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className={`
                          w-full px-4 py-3 rounded-lg border transition-colors appearance-none
                          ${errors.status
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : darkMode
                              ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.status && (
                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Kondisi *
                      </label>
                      <select
                        value={formData.condition}
                        onChange={(e) => handleInputChange('condition', e.target.value)}
                        className={`
                          w-full px-4 py-3 rounded-lg border transition-colors appearance-none
                          ${errors.condition
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : darkMode
                              ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      >
                        {conditionOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.condition && (
                        <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Lokasi
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-lg border transition-colors appearance-none
                          ${darkMode
                            ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      >
                        <option value="">Pilih Lokasi</option>
                        {locationOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Maintenance Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Pemeliharaan Terakhir
                      </label>
                      <div className="relative">
                        <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={formData.last_maintenance_date}
                          onChange={(e) => handleInputChange('last_maintenance_date', e.target.value)}
                          className={`
                            w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                            ${darkMode
                              ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                            }
                            focus:outline-none focus:ring-2
                          `}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Pemeliharaan Berikutnya
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={formData.next_maintenance_date}
                          onChange={(e) => handleInputChange('next_maintenance_date', e.target.value)}
                          className={`
                            w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                            ${darkMode
                              ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white'
                              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900'
                            }
                            focus:outline-none focus:ring-2
                          `}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ticketing Integration */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="is_linked_to_ticketing"
                        checked={formData.is_linked_to_ticketing}
                        onChange={(e) => handleInputChange('is_linked_to_ticketing', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="is_linked_to_ticketing" className={`text-sm font-medium ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Terhubung dengan sistem tiket
                      </label>
                    </div>
                    
                    {formData.is_linked_to_ticketing && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          darkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          ID Sistem Tiket *
                        </label>
                        <input
                          type="text"
                          value={formData.ticketing_id}
                          onChange={(e) => handleInputChange('ticketing_id', e.target.value)}
                          placeholder="Masukkan ID sistem tiket"
                          className={`
                            w-full px-4 py-3 rounded-lg border transition-colors
                            ${errors.ticketing_id
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : darkMode
                                ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                            }
                            focus:outline-none focus:ring-2
                          `}
                        />
                        {errors.ticketing_id && (
                          <p className="mt-1 text-sm text-red-600">{errors.ticketing_id}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Catatan
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={4}
                        placeholder="Catatan tambahan tentang produk ini..."
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-lg border transition-colors resize-none
                          ${darkMode
                            ? 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500'
                          }
                          focus:outline-none focus:ring-2
                        `}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="space-y-6">
              {/* Product ID Display */}
              {(formData.product_id || productId) && (
                <div className={`rounded-xl border shadow-sm ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-6">
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ID Produk
                    </h3>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-lg font-mono font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {formData.product_id || productId}
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {isEdit ? 'ID produk saat ini' : 'ID produk yang akan dibuat'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Summary */}
              <div className={`rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Ringkasan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Nama Produk:
                      </span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formData.name || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Kategori:
                      </span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {categories.find(c => c.id.toString() === formData.category_id)?.name || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Status:
                      </span>
                      <span className={`text-sm font-medium ${
                        statusOptions.find(s => s.value === formData.status)?.color || (darkMode ? 'text-white' : 'text-gray-900')
                      }`}>
                        {formData.status || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Kondisi:
                      </span>
                      <span className={`text-sm font-medium ${
                        conditionOptions.find(c => c.value === formData.condition)?.color || (darkMode ? 'text-white' : 'text-gray-900')
                      }`}>
                        {formData.condition || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Jumlah:
                      </span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formData.quantity || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className={`rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-6 space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors
                      bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEdit ? 'Perbarui Produk' : 'Simpan Produk'}
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className={`
                      w-full px-6 py-3 text-sm font-medium rounded-lg transition-colors
                      ${darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                      }
                      disabled:cursor-not-allowed
                    `}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;