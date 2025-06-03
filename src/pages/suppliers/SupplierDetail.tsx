import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  Package,
  Calendar,
  Building,
  Download,
  Printer
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSupplierStore } from '../../store/useSupplierStore';
import { Supplier } from '../../types/supplier.types';

// QR Code Generator Component
const QRCodeGenerator: React.FC<{ 
  value: string; 
  size?: number; 
  supplierId?: number;
  darkMode?: boolean;
}> = ({ value, size = 150, supplierId, darkMode = false }) => {
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
      link.download = `supplier-${supplierId}-qr.png`;
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
            <title>Supplier QR Code</title>
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
              <div class="qr-title">Supplier QR Code</div>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <div class="qr-info">Supplier ID: ${supplierId}</div>
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
        className={`flex items-center justify-center rounded-lg ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}
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
        alt="Supplier QR Code" 
        className={`border rounded-lg ${
          darkMode ? 'border-gray-600' : 'border-gray-200'
        }`}
        style={{ width: size, height: size }}
      />
      <div className="flex space-x-2">
        <button
          onClick={handlePrint}
          className="flex items-center px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <Printer className="h-3 w-3 mr-1" />
          Print
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </button>
      </div>
    </div>
  );
};

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Zustand store
  const {
    currentSupplier,
    isLoading,
    error,
    getSupplierById,
    deleteSupplier,
    clearError,
    clearCurrentSupplier
  } = useSupplierStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
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
  }, [id, getSupplierById, clearCurrentSupplier, clearError]);

  const handleDelete = async () => {
    if (!currentSupplier) return;

    setIsDeleting(true);
    try {
      const success = await deleteSupplier(currentSupplier.id);
      if (success) {
        setShowDeleteModal(false);
        navigate('/suppliers');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error && !currentSupplier) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Supplier Not Found
          </h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>
            {error}
          </p>
          <button
            onClick={() => navigate('/suppliers')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Suppliers
          </button>
        </div>
      </div>
    );
  }

  // Supplier not found
  if (!currentSupplier) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`text-xl mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Supplier tidak ditemukan
          </div>
          <button
            onClick={() => navigate('/suppliers')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Kembali ke Daftar Supplier
          </button>
        </div>
      </div>
    );
  }

  // Generate QR data
  const qrData = JSON.stringify({
    id: currentSupplier.id,
    name: currentSupplier.name,
    contact: currentSupplier.contact_person,
    phone: currentSupplier.phone,
    email: currentSupplier.email,
    company: "FiberOne Solutions"
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/suppliers')}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Detail Supplier
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ID: {currentSupplier.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/suppliers/edit/${id}`)}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors ${
                  darkMode 
                    ? 'border-red-600 text-red-400 bg-gray-800 hover:bg-red-900/20' 
                    : 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                }`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
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
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informasi Supplier */}
          <div className="lg:col-span-2">
            <div className={`shadow rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {currentSupplier.name}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ID: {currentSupplier.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentSupplier.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className={`h-5 w-5 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          Alamat
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {currentSupplier.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentSupplier.contact_person && (
                    <div className="flex items-start space-x-3">
                      <User className={`h-5 w-5 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          Contact Person
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {currentSupplier.contact_person}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentSupplier.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className={`h-5 w-5 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          Telepon
                        </p>
                        <a
                          href={`tel:${currentSupplier.phone}`}
                          className={`text-sm transition-colors ${
                            darkMode 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          {currentSupplier.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {currentSupplier.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className={`h-5 w-5 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          Email
                        </p>
                        <a
                          href={`mailto:${currentSupplier.email}`}
                          className={`text-sm transition-colors break-all ${
                            darkMode 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          {currentSupplier.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {currentSupplier.notes && (
                  <div className="mt-6">
                    <div className="flex items-start space-x-3">
                      <FileText className={`h-5 w-5 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          Catatan
                        </p>
                        <p className={`text-sm mt-1 whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {currentSupplier.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Placeholder untuk daftar produk - bisa ditambahkan kemudian */}
            <div className={`mt-8 shadow rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Produk dari Supplier
                  </h3>
                </div>

                <div className="text-center py-12">
                  <Package className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Feature untuk menampilkan produk dari supplier akan segera hadir
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - QR Code and Info */}
          <div className="lg:col-span-1">
            {/* QR Code */}
            <div className={`shadow rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`p-6 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Supplier QR Code
                </h2>
              </div>
              <div className="p-6">
                <div className="flex justify-center">
                  <QRCodeGenerator
                    value={qrData}
                    size={180}
                    supplierId={currentSupplier.id}
                    darkMode={darkMode}
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Scan QR code ini untuk akses cepat informasi supplier
                  </p>
                </div>
              </div>
            </div>

            {/* Informasi Tambahan */}
            <div className={`shadow rounded-lg mt-6 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Informasi Tambahan
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        Dibuat
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDate(currentSupplier.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        Terakhir Diperbarui
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDate(currentSupplier.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`mt-6 shadow rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Aksi Cepat
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/suppliers/edit/${id}`)}
                    className={`w-full flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Supplier
                  </button>
                  
                  <button
                    onClick={() => navigate(`/products/create?supplier_id=${id}`)}
                    className={`w-full flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Tambah Produk
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className={`text-lg font-medium mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Hapus Supplier
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Apakah Anda yakin ingin menghapus supplier "{currentSupplier.name}"? 
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className={`px-4 py-2 border rounded-md transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' 
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menghapus...
                    </>
                  ) : (
                    'Hapus'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDetail;