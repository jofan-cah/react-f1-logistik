import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft, Package, Building2, Tag, MapPin, Calendar, DollarSign, FileText, AlertCircle, CheckCircle, Truck, Wrench, Upload, X, Image } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProductStore } from '../../store/useProductStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSupplierStore } from '../../store/useSupplierStore';
import { CreateProductRequest, UpdateProductRequest } from '../../types/product.types';

// Form data interface - UPDATED: Removed name field (not in backend), simplified fields
interface ProductFormData {
  product_id: string;
  category_id: string;
  brand: string;
  model: string;
  serial_number: string;
  origin: string;
  supplier_id: string;
  po_number: string;
  description: string;
  location: string;
  img_product: string;
  status: string;
  condition: string;
  quantity: string;
  purchase_date: string;
  purchase_price: string;
  warranty_expiry: string;
  last_maintenance_date: string;
  next_maintenance_date: string;
  notes: string;
}

// Static options - UPDATED: Match backend status values
const statusOptions = [
  { value: 'Available', label: 'Available', icon: CheckCircle, color: 'text-green-600' },
  { value: 'In Use', label: 'In Use', icon: Package, color: 'text-blue-600' },
  { value: 'Maintenance', label: 'Maintenance', icon: Wrench, color: 'text-yellow-600' },
  { value: 'Damaged', label: 'Damaged', icon: AlertCircle, color: 'text-red-600' },
  { value: 'Disposed', label: 'Disposed', icon: AlertCircle, color: 'text-gray-600' },
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

  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>('');

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

  // UPDATED: Initial state removed name and ticketing fields (not in backend)
  const [formData, setFormData] = useState<ProductFormData>({
    product_id: '',
    category_id: '',
    brand: '',
    model: '',
    serial_number: '',
    origin: '',
    supplier_id: preselectedSupplierId || '',
    po_number: '',
    description: '',
    location: '',
    img_product: '',
    status: 'Available',
    condition: 'New',
    quantity: '1',
    purchase_date: '',
    purchase_price: '',
    warranty_expiry: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError('');

    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageError('');
    handleInputChange('img_product', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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

  // Load product data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      getProductById(id);
    }
  }, [isEdit, id, getProductById]);

  // UPDATED: Populate form when product data is loaded - match backend fields
  useEffect(() => {
    if (currentProduct && isEdit) {
      setFormData({
        product_id: currentProduct.product_id,
        category_id: currentProduct.category_id.toString(),
        brand: currentProduct.brand || '',
        model: currentProduct.model || '',
        serial_number: currentProduct.serial_number || '',
        origin: currentProduct.origin || '',
        supplier_id: currentProduct.supplier_id?.toString() || '',
        po_number: currentProduct.po_number || '',
        description: currentProduct.description || '',
        location: currentProduct.location || '',
        img_product: currentProduct.img_product || '',
        status: currentProduct.status,
        condition: currentProduct.condition,
        quantity: currentProduct.quantity?.toString() || '1',
        purchase_date: currentProduct.purchase_date || '',
        purchase_price: currentProduct.purchase_price?.toString() || '',
        warranty_expiry: currentProduct.warranty_expiry || '',
        last_maintenance_date: currentProduct.last_maintenance_date || '',
        next_maintenance_date: currentProduct.next_maintenance_date || '',
        notes: currentProduct.notes || ''
      });

      // Set image preview if exists
      if (currentProduct.img_product) {
        setImagePreview(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/products/${currentProduct.img_product}`);
      }
    }
  }, [currentProduct, isEdit]);

  const validate = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    // Required fields - UPDATED: Only validate fields that exist in backend
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

  // UPDATED: Handle submit - match backend API structure
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    clearProductError();

    try {
      let success = false;
      let finalFormData = { ...formData };

      // Upload image first if there's a new file
      if (imageFile) {
        try {
          const uploadedFilename = await useProductStore.getState().uploadProductImage(imageFile);
          if (uploadedFilename) {
            finalFormData.img_product = uploadedFilename;
          } else {
            throw new Error('Upload gambar gagal - tidak ada filename');
          }
        } catch (uploadError) {
          throw new Error(`Upload gambar gagal: ${uploadError.message}`);
        }
      }

      // Prepare data for API - UPDATED: Match backend controller expectations
      if (isEdit && id) {
        const updateData: UpdateProductRequest = {
          brand: finalFormData.brand.trim() || undefined,
          model: finalFormData.model.trim() || undefined,
          serial_number: finalFormData.serial_number.trim() || undefined,
          origin: finalFormData.origin || undefined,
          supplier_id: finalFormData.supplier_id ? parseInt(finalFormData.supplier_id) : undefined,
          po_number: finalFormData.po_number.trim() || undefined,
          description: finalFormData.description.trim() || undefined,
          location: finalFormData.location || undefined,
          img_product: finalFormData.img_product || undefined,
          status: finalFormData.status as any,
          condition: finalFormData.condition as any,
          quantity: parseInt(finalFormData.quantity),
          purchase_date: finalFormData.purchase_date || undefined,
          purchase_price: finalFormData.purchase_price ? parseFloat(finalFormData.purchase_price) : undefined,
          warranty_expiry: finalFormData.warranty_expiry || undefined,
          last_maintenance_date: finalFormData.last_maintenance_date || undefined,
          next_maintenance_date: finalFormData.next_maintenance_date || undefined,
          notes: finalFormData.notes.trim() || undefined
        };

        success = await updateProduct(id, updateData);

      } else {
        const createData: CreateProductRequest = {
          product_id: finalFormData.product_id || undefined, // Let backend generate if empty
          category_id: parseInt(finalFormData.category_id),
          brand: finalFormData.brand.trim() || undefined,
          model: finalFormData.model.trim() || undefined,
          serial_number: finalFormData.serial_number.trim() || undefined,
          origin: finalFormData.origin || undefined,
          supplier_id: finalFormData.supplier_id ? parseInt(finalFormData.supplier_id) : undefined,
          po_number: finalFormData.po_number.trim() || undefined,
          description: finalFormData.description.trim() || undefined,
          location: finalFormData.location || undefined,
          img_product: finalFormData.img_product || undefined,
          status: finalFormData.status as any,
          condition: finalFormData.condition as any,
          quantity: parseInt(finalFormData.quantity),
          purchase_date: finalFormData.purchase_date || undefined,
          purchase_price: finalFormData.purchase_price ? parseFloat(finalFormData.purchase_price) : undefined,
          warranty_expiry: finalFormData.warranty_expiry || undefined,
          notes: finalFormData.notes.trim() || undefined
        };

        success = await createProduct(createData);
      }

      if (success) {
        navigate('/products');
      } else {
        throw new Error('Gagal menyimpan data produk');
      }

    } catch (error) {
      console.error('Submit error:', error);
      if (error.message.includes('Upload gambar gagal')) {
        setImageError(error.message);
      }
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className={`flex items-center text-sm mb-4 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Produk
        </button>

        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {isEdit ? 'Perbarui informasi produk' : 'Tambahkan produk baru ke inventori'}
        </p>
      </div>

      {/* Error Message */}
      {productError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{productError}</p>
            </div>
            <button
              onClick={clearProductError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Informasi Dasar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product ID */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Product ID
              </label>
              <input
                type="text"
                value={formData.product_id}
                onChange={(e) => handleInputChange('product_id', e.target.value)}
                placeholder="Kosongkan untuk auto-generate"
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Kategori *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.category_id ? 'border-red-500' : ''}`}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Contoh: Dell, HP, Lenovo"
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Model */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Model/tipe produk"
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Nomor Seri
              </label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => handleInputChange('serial_number', e.target.value)}
                placeholder="Serial number"
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Origin */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Asal Produk
              </label>
              <select
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="">Pilih Asal</option>
                {originOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="Deskripsi produk..."
              className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
            />
          </div>
        </div>

        {/* Purchase Info Card */}
        <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Informasi Pembelian
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Supplier
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                {supplierOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* PO Number */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Nomor PO
              </label>
              <input
                type="text"
                value={formData.po_number}
                onChange={(e) => handleInputChange('po_number', e.target.value)}
                placeholder="Purchase Order Number"
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Tanggal Pembelian
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Harga Pembelian
              </label>
              <input
                type="text"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange('purchase_price', formatPriceInput(e.target.value))}
                placeholder="0"
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.purchase_price ? 'border-red-500' : ''}`}
              />
              {errors.purchase_price && (
                <p className="mt-1 text-sm text-red-600">{errors.purchase_price}</p>
              )}
            </div>

            {/* Warranty */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Berakhir Garansi
              </label>
              <input
                type="date"
                value={formData.warranty_expiry}
                onChange={(e) => handleInputChange('warranty_expiry', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.warranty_expiry ? 'border-red-500' : ''}`}
              />
              {errors.warranty_expiry && (
                <p className="mt-1 text-sm text-red-600">{errors.warranty_expiry}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Jumlah *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.quantity ? 'border-red-500' : ''}`}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status & Location Card */}
        <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Status & Lokasi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.status ? 'border-red-500' : ''}`}
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

            {/* Condition */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Kondisi *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.condition ? 'border-red-500' : ''}`}
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

            {/* Location */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Lokasi
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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
        </div>

        {/* Image Upload Card */}
        <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gambar Produk
          </h3>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Image preview or upload area */}
          <div className={`border-2 border-dashed rounded-lg p-4 text-center ${imagePreview ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs max-h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Image className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Click to upload image
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={triggerFileInput}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400"
            >
              <Upload className="w-4 h-4 mr-2" />
              {imagePreview ? 'Change Image' : 'Select Image'}
            </button>
          </div>

          {imageError && (
            <p className="mt-2 text-sm text-red-600 text-center">{imageError}</p>
          )}
        </div>

        {/* Maintenance Dates Card */}
        <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Jadwal Maintenance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Last Maintenance */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Maintenance Terakhir
              </label>
              <input
                type="date"
                value={formData.last_maintenance_date}
                onChange={(e) => handleInputChange('last_maintenance_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Next Maintenance */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Maintenance Berikutnya
              </label>
              <input
                type="date"
                value={formData.next_maintenance_date}
                onChange={(e) => handleInputChange('next_maintenance_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Catatan
          </h3>

          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            placeholder="Catatan tambahan tentang produk ini..."
            className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Produk' : 'Simpan Produk'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg border ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  </div>
);
}
export default ProductForm;