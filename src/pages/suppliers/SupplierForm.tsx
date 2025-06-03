import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Building, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSupplierStore } from '../../store/useSupplierStore';
import { CreateSupplierRequest, UpdateSupplierRequest } from '../../types/supplier.types';

// Form data interface
interface SupplierFormData {
  name: string;
  address: string;
  contact_person: string;
  phone: string;
  email: string;
  notes: string;
}

const SupplierForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { darkMode } = useTheme();
  const isEdit = Boolean(id);

  // Zustand store
  const {
    currentSupplier,
    isLoading,
    error,
    getSupplierById,
    createSupplier,
    updateSupplier,
    clearError,
    clearCurrentSupplier
  } = useSupplierStore();

  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    address: '',
    contact_person: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<SupplierFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data for editing
  useEffect(() => {
    if (isEdit && id) {
      const supplierId = parseInt(id);
      if (!isNaN(supplierId)) {
        getSupplierById(supplierId);
      }
    }

    // Cleanup when component unmounts
    return () => {
      clearCurrentSupplier();
      clearError();
    };
  }, [isEdit, id, getSupplierById, clearCurrentSupplier, clearError]);

  // Populate form when supplier data is loaded
  useEffect(() => {
    if (currentSupplier && isEdit) {
      setFormData({
        name: currentSupplier.name || '',
        address: currentSupplier.address || '',
        contact_person: currentSupplier.contact_person || '',
        phone: currentSupplier.phone || '',
        email: currentSupplier.email || '',
        notes: currentSupplier.notes || ''
      });
    }
  }, [currentSupplier, isEdit]);

  const validate = (): boolean => {
    const newErrors: Partial<SupplierFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nama supplier wajib diisi';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama supplier minimal 2 karakter';
    }

    // Email validation
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Phone validation
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }

    // Contact person validation
    if (formData.contact_person && formData.contact_person.trim().length < 2) {
      newErrors.contact_person = 'Nama kontak minimal 2 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[\d\-\(\)\s]+$/;
    return phoneRegex.test(phone) && phone.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    clearError();
    
    try {
      let success = false;

      if (isEdit && id) {
        // Update existing supplier
        const updateData: UpdateSupplierRequest = {
          name: formData.name.trim(),
          address: formData.address.trim() || undefined,
          contact_person: formData.contact_person.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          notes: formData.notes.trim() || undefined
        };
        success = await updateSupplier(parseInt(id), updateData);
      } else {
        // Create new supplier
        const createData: CreateSupplierRequest = {
          name: formData.name.trim(),
          address: formData.address.trim(),
          contact_person: formData.contact_person.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          notes: formData.notes.trim()
        };
        success = await createSupplier(createData);
      }

      if (success) {
        navigate('/suppliers');
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SupplierFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCancel = () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan? Perubahan yang belum disimpan akan hilang.')) {
      navigate('/suppliers');
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Memuat data supplier...
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
      <div className="max-w-3xl mx-auto px-4 py-6">
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
            Kembali ke Daftar Supplier
          </button>
          
          <div className="flex items-center space-x-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}
            `}>
              <Building className={`w-6 h-6 ${darkMode ? 'text-blue-200' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isEdit ? 'Edit Supplier' : 'Tambah Supplier Baru'}
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {isEdit 
                  ? 'Perbarui informasi dan detail kontak supplier' 
                  : 'Tambahkan supplier baru ke dalam jaringan Anda'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
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

        {/* Form */}
        <div className={`
          rounded-xl border shadow-sm
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <form onSubmit={handleSubmit} className="p-8">
            {/* Basic Information Section */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Informasi Dasar
              </h3>
              
              <div className="space-y-6">
                {/* Supplier Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Nama Supplier *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Masukkan nama supplier"
                      className={`
                        w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                        ${errors.name
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : darkMode
                            ? 'border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500'
                        }
                        focus:outline-none focus:ring-2
                      `}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Alamat
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      placeholder="Masukkan alamat lengkap supplier"
                      className={`
                        w-full pl-10 pr-4 py-3 rounded-lg border transition-colors resize-none
                        ${darkMode
                          ? 'border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500'
                        }
                        focus:outline-none focus:ring-2
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="mb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Informasi Kontak
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Person */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Nama Kontak
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
                      placeholder="Nama person yang dapat dihubungi"
                      className={`
                        w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                        ${errors.contact_person
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : darkMode
                            ? 'border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500'
                        }
                        focus:outline-none focus:ring-2
                      `}
                    />
                  </div>
                  {errors.contact_person && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_person}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="021-1234567"
                      className={`
                        w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                        ${errors.phone
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : darkMode
                            ? 'border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500'
                        }
                        focus:outline-none focus:ring-2
                      `}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="supplier@example.com"
                    className={`
                      w-full pl-10 pr-4 py-3 rounded-lg border transition-colors
                      ${errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : darkMode
                          ? 'border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500'
                      }
                      focus:outline-none focus:ring-2
                    `}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Informasi Tambahan
              </h3>
              
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
                    placeholder="Catatan tambahan tentang supplier ini..."
                    className={`
                      w-full pl-10 pr-4 py-3 rounded-lg border transition-colors resize-none
                      ${darkMode
                        ? 'border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500'
                      }
                      focus:outline-none focus:ring-2
                    `}
                  />
                </div>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Opsional: Tambahkan catatan seperti spesialisasi, jam operasional, atau syarat khusus
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className={`
                  px-6 py-3 text-sm font-medium rounded-lg transition-colors
                  ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  inline-flex items-center px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors
                  bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
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
                    {isEdit ? 'Perbarui Supplier' : 'Simpan Supplier'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierForm;