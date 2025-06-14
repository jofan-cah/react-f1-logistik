// src/pages/transactions/Scanner.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  QrCode, 
  Scan, 
  Square, 
  Plus,
  X,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  FileText,
  Save,
  ArrowLeft,
  Trash2,
  Package,
  Minus,
  Camera,
  RefreshCw,
  RotateCcw,
  ArrowRightCircle,
  ArrowLeftCircle,
  Wrench,
  AlertTriangle
} from 'lucide-react';

// Import ZXing library
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat } from '@zxing/library';

// Import types dan services yang sudah ada
import { useProductStore } from '../../store/useProductStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { 
  CreateTransactionRequest, 
  CreateTransactionItemRequest,
  Transaction,
  TRANSACTION_TYPE_LABELS,
  VALID_TRANSACTION_TYPES,
  CONDITION_OPTIONS
} from '../../types/transaction.types';
import { Product } from '../../types/product.types';

// Enhanced interfaces untuk scanner
interface ScanResult {
  type: 'QR' | 'BARCODE';
  data: string;
  format: string;
  product?: Product;
  error?: string;
  timestamp: number;
}

interface ScannerTransactionItem {
  id: string; // Local ID untuk tracking
  product_id: string;
  product?: Product;
  quantity: number;
  condition_before?: typeof CONDITION_OPTIONS[number];
  condition_after?: typeof CONDITION_OPTIONS[number];
  status: 'processed' | 'pending';
  notes?: string;
}

interface ScannerTransaction {
  transaction_type: Transaction['transaction_type'];
  reference_no: string;
  first_person: string;
  second_person?: string;
  location: string;
  transaction_date?: string;
  notes?: string;
  status: Transaction['status'];
  items: ScannerTransactionItem[];
}

// Real-time Camera Scanner Component dengan ZXing
const RealTimeScanner: React.FC<{
  onScan: (data: string, type: 'QR' | 'BARCODE', format: string) => void;
  mode: 'QR' | 'BARCODE' | 'BOTH';
  active: boolean;
  className?: string;
}> = ({ onScan, mode, active, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastScan, setLastScan] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef<boolean>(false);
  const lastScanTimeRef = useRef<number>(0);

  // Initialize scanner when active
  useEffect(() => {
    if (active && !isInitialized) {
      initializeScanner();
    } else if (!active && isInitialized) {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [active]);

  const initializeScanner = async () => {
    try {
      setError('');
      console.log('🎥 Initializing ZXing scanner...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      codeReaderRef.current = new BrowserMultiFormatReader();
      codeReaderRef.current.timeBetweenScansMillis = 1000;
      
      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      setDevices(videoInputDevices);
      console.log('📱 Available cameras:', videoInputDevices.map((d, i) => `${i}: ${d.label || d.deviceId}`));

      const backCameraIndex = videoInputDevices.findIndex(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment') ||
        device.label.toLowerCase().includes('rear')
      );
      
      const selectedIndex = backCameraIndex >= 0 ? backCameraIndex : 0;
      setCurrentDeviceIndex(selectedIndex);

      console.log('📷 Selected camera:', videoInputDevices[selectedIndex].label || `Camera ${selectedIndex}`);

      await startScanning(videoInputDevices[selectedIndex].deviceId);
      
    } catch (err: any) {
      console.error('❌ Scanner initialization error:', err);
      setError(`Camera initialization failed: ${err.message}`);
      setIsScanning(false);
    }
  };

  const startScanning = async (deviceId: string) => {
    if (!codeReaderRef.current || !videoRef.current) {
      console.error('❌ Code reader or video element not available');
      return;
    }

    try {
      setIsScanning(true);
      scanningRef.current = true;
      console.log('🚀 Starting scan with device:', deviceId);
      
      codeReaderRef.current.reset();
      
      await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result && scanningRef.current) {
            const scannedText = result.getText();
            const format = result.getBarcodeFormat();
            const formatString = BarcodeFormat[format];
            
            const now = Date.now();
            if (scannedText === lastScan && (now - lastScanTimeRef.current) < 2000) {
              return;
            }

            console.log('🔍 SCAN DETECTED:', { 
              text: scannedText, 
              format: formatString,
              length: scannedText.length 
            });
            
            setLastScan(scannedText);
            lastScanTimeRef.current = now;
            
            const scanType: 'QR' | 'BARCODE' = formatString.includes('QR') ? 'QR' : 'BARCODE';
            
            if (mode === 'BOTH' || mode === scanType) {
              onScan(scannedText, scanType, formatString);
              flashFeedback();
            }
            
            setTimeout(() => {
              setLastScan('');
              lastScanTimeRef.current = 0;
            }, 2000);
          }
          
          if (error && !(error instanceof NotFoundException)) {
            if (error.message && !error.message.includes('No MultiFormat Readers')) {
              console.warn('⚠️ Scan error:', error.message);
            }
          }
        }
      );

      setIsInitialized(true);
      console.log('✅ Scanner started successfully');
      
    } catch (err: any) {
      console.error('❌ Start scanning error:', err);
      setError(`Failed to start scanning: ${err.message}`);
      setIsScanning(false);
      scanningRef.current = false;
    }
  };

  const flashFeedback = () => {
    if (videoRef.current) {
      videoRef.current.style.filter = 'brightness(1.5)';
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.style.filter = 'none';
        }
      }, 200);
    }
  };

  const stopScanner = () => {
    try {
      scanningRef.current = false;
      
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      
      setIsInitialized(false);
      setIsScanning(false);
      console.log('🛑 Scanner stopped');
      
    } catch (err) {
      console.error('❌ Stop scanner error:', err);
    }
  };

  const switchCamera = async () => {
    if (!devices.length || devices.length < 2) return;
    
    try {
      console.log('🔄 Switching camera...');
      
      scanningRef.current = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      
      const nextIndex = (currentDeviceIndex + 1) % devices.length;
      setCurrentDeviceIndex(nextIndex);
      
      console.log('📷 Switching to:', devices[nextIndex].label || `Camera ${nextIndex}`);
      
      setTimeout(async () => {
        await startScanning(devices[nextIndex].deviceId);
      }, 500);
      
    } catch (err: any) {
      console.error('❌ Camera switch error:', err);
      setError(`Failed to switch camera: ${err.message}`);
    }
  };

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg flex flex-col items-center justify-center p-6 ${className}`}>
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-700 dark:text-red-300 text-center text-sm mb-4 max-w-xs">{error}</p>
        <div className="flex space-x-3">
          <button
            onClick={initializeScanner}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
          <button
            onClick={() => setError('')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg bg-black ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover transition-all duration-200"
        playsInline
        muted
        autoPlay
        style={{ 
          width: '100%', 
          height: '100%',
          objectFit: 'cover'
        }}
      />
      
      {!isInitialized && active && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center">
          <div className="text-center text-white">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <p className="text-lg font-medium mb-2">Initializing Camera</p>
            <p className="text-sm opacity-75">Please allow camera access</p>
          </div>
        </div>
      )}
      
      {isInitialized && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-72 h-72 relative">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-400 rounded-tl-lg animate-pulse"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-400 rounded-tr-lg animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-400 rounded-bl-lg animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-400 rounded-br-lg animate-pulse"></div>
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center bg-black bg-opacity-70 rounded-lg p-4 backdrop-blur-sm">
                  <Scan className={`h-8 w-8 mx-auto mb-3 ${isScanning ? 'animate-pulse text-green-400' : 'text-white'}`} />
                  <p className="text-lg font-semibold mb-1">
                    Scan {mode === 'BOTH' ? 'Any Code' : mode}
                  </p>
                  <p className="text-sm opacity-75">
                    {isScanning ? 'Scanning active...' : 'Point camera at code'}
                  </p>
                  {lastScan && (
                    <p className="text-xs mt-2 text-green-400 font-mono">
                      Last: {lastScan.substring(0, 20)}...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-black bg-opacity-70 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-white text-sm font-medium">{mode} Mode</span>
              </div>
              <div className="text-xs text-gray-300 mt-1">
                Camera: {devices[currentDeviceIndex]?.label?.substring(0, 20) || 'Unknown'}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="bg-black bg-opacity-70 text-white p-3 rounded-lg hover:bg-opacity-90 transition-all backdrop-blur-sm"
                  title="Switch Camera"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className="bg-black bg-opacity-70 rounded-lg px-6 py-3 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-4 text-white text-sm">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>{isScanning ? 'Scanning...' : 'Ready'}</span>
                </div>
                {devices.length > 1 && (
                  <div className="text-xs opacity-75">
                    Cam {currentDeviceIndex + 1}/{devices.length}
                  </div>
                )}
              </div>
            </div>
          </div>

          {lastScan && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 animate-ping pointer-events-none"></div>
          )}
        </>
      )}
    </div>
  );
};

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Store hooks yang sudah disesuaikan
  const { 
    products, 
    isLoading: productsLoading, 
    fetchProducts,
    searchProducts 
  } = useProductStore();
  
  const { 
    createTransaction, 
    isCreating: transactionLoading,
    error: transactionError,
    clearError
  } = useTransactionStore();

  function generateReferenceNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `SCN-${date}-${random}`;
  }

  // Get transaction type from URL params or default to check_out
  const getTransactionTypeFromParams = (): Transaction['transaction_type'] => {
    const type = searchParams.get('type');
    console.log('🔍 URL parameter type:', type);
    console.log('🔍 Valid transaction types:', VALID_TRANSACTION_TYPES);
    
    if (type && VALID_TRANSACTION_TYPES.includes(type as Transaction['transaction_type'])) {
      console.log('✅ Using transaction type from URL:', type);
      return type as Transaction['transaction_type'];
    }
    
    console.log('⚠️ Invalid or missing type parameter, defaulting to check_out');
    return 'check_out'; // default
  };
  
  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scanMode, setScanMode] = useState<'QR' | 'BARCODE' | 'BOTH'>('BOTH');
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  // Transaction state - disesuaikan dengan URL params
  const [currentTransaction, setCurrentTransaction] = useState<ScannerTransaction>(() => {
    const initialType = getTransactionTypeFromParams();
    console.log('🚀 Initializing scanner with transaction type:', initialType);
    return {
      transaction_type: initialType,
      reference_no: generateReferenceNumber(),
      first_person: '',
      location: '',
      status: 'open',
      items: []
    };
  });
  
  const [showForm, setShowForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load products on component mount
  useEffect(() => {
    console.log('🚀 Scanner component mounted');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Search params:', Object.fromEntries(searchParams));
    loadProducts();
  }, []);

  // Update transaction type when URL params change
  useEffect(() => {
    console.log('🔄 URL params changed, current searchParams:', Object.fromEntries(searchParams));
    const newType = getTransactionTypeFromParams();
    console.log('🎯 New transaction type determined:', newType);
    console.log('🔄 Current transaction type:', currentTransaction.transaction_type);
    
    if (newType !== currentTransaction.transaction_type) {
      console.log('✅ Updating transaction type from', currentTransaction.transaction_type, 'to', newType);
      setCurrentTransaction(prev => ({
        ...prev,
        transaction_type: newType,
        reference_no: generateReferenceNumber(),
        items: [] // Reset items when changing type
      }));
      setScanHistory([]);
    } else {
      console.log('⏭️ Transaction type unchanged, skipping update');
    }
  }, [searchParams]);

  // Clear transaction error when component mounts
  useEffect(() => {
    if (transactionError) {
      clearError();
    }
  }, []);

  const loadProducts = async () => {
    try {
      await fetchProducts(1, 1000);
    } catch (error) {
      console.error('Failed to load products:', error);
      setScanFeedback('❌ Failed to load products database');
      setTimeout(() => setScanFeedback(null), 3000);
    }
  };

  const extractProductIdFromData = (data: string): string => {
    console.log('🔍 Raw scan data:', data);
    
    // URL pattern untuk localhost:5173/products/CAB004
    if (data.includes('localhost') || data.includes('http') || data.includes('/products/')) {
      const urlPattern = /\/products\/([A-Za-z0-9-_]+)/;
      const match = data.match(urlPattern);
      if (match && match[1]) {
        console.log('📱 Extracted product ID from URL:', match[1]);
        return match[1];
      }
    }
    
    // JSON format
    try {
      const parsed = JSON.parse(data);
      if (parsed.id) {
        console.log('📋 Extracted ID from JSON:', parsed.id);
        return parsed.id;
      }
      if (parsed.product_id) {
        console.log('📋 Extracted product_id from JSON:', parsed.product_id);
        return parsed.product_id;
      }
    } catch (e) {
      // Not JSON, continue
    }
    
    // Direct product ID
    if (data.match(/^[A-Za-z0-9-_]+$/)) {
      console.log('🏷️ Direct product ID:', data);
      return data;
    }
    
    // Extract alphanumeric code
    const codePattern = /([A-Za-z0-9-_]{3,})/;
    const codeMatch = data.match(codePattern);
    if (codeMatch && codeMatch[1]) {
      console.log('🔤 Extracted code:', codeMatch[1]);
      return codeMatch[1];
    }
    
    console.log('❓ Using raw data as product ID:', data);
    return data;
  };

  const findProductByCode = async (rawData: string): Promise<Product | null> => {
    const productId = extractProductIdFromData(rawData);
    console.log('🔍 Searching for product with ID:', productId);
    
    // Search in loaded products
    let product = products.find(p => 
      p.product_id === productId ||
      p.product_id.toLowerCase() === productId.toLowerCase() ||
      p.serial_number === productId ||
      p.qr_data === productId ||
      p.qr_data === rawData
    );

    console.log('📦 Product found in loaded products:', product?.product_id || 'none');

    // Search via API if not found
    if (!product) {
      try {
        console.log('🔍 Searching via API...');
        const searchResults = await searchProducts(productId);
        if (searchResults.length > 0) {
          product = searchResults[0];
          console.log('📦 Product found via search:', product.product_id);
        } else if (productId !== rawData) {
          const searchResults2 = await searchProducts(rawData);
          if (searchResults2.length > 0) {
            product = searchResults2[0];
            console.log('📦 Product found via raw data search:', product.product_id);
          }
        }
      } catch (error) {
        console.error('❌ Search failed:', error);
      }
    }

    return product || null;
  };

  const handleScanResult = async (data: string, type: 'QR' | 'BARCODE', format: string) => {
    console.log('🔍 Scan result received:', { data, type, format });

    const scanResult: ScanResult = {
      type,
      data,
      format,
      timestamp: Date.now()
    };

    setScanHistory(prev => [scanResult, ...prev.slice(0, 9)]);

    const productId = extractProductIdFromData(data);
    setScanFeedback(`🔍 Processing: ${productId}...`);

    try {
      const product = await findProductByCode(data);
      console.log('📦 Final product result:', product?.product_id || 'not found');
      
      if (product) {
        scanResult.product = product;
        
        // Check compatibility dengan transaction type
        const canAdd = checkProductCompatibility(product, currentTransaction.transaction_type);
        console.log('✅ Compatibility check:', canAdd);
        
        if (!canAdd.allowed) {
          scanResult.error = canAdd.reason;
          setScanFeedback(`❌ ${canAdd.reason}`);
          setTimeout(() => setScanFeedback(null), 4000);
          return;
        }

        // Check if item already exists
        const existingItemIndex = currentTransaction.items.findIndex(
          item => item.product_id === product.product_id
        );

        if (existingItemIndex >= 0) {
          // Update quantity
          const updatedItems = [...currentTransaction.items];
          updatedItems[existingItemIndex].quantity += 1;
          
          setCurrentTransaction(prev => ({
            ...prev,
            items: updatedItems
          }));

          setScanFeedback(`✅ Quantity updated: ${product.name || product.product_id} (${updatedItems[existingItemIndex].quantity})`);
        } else {
          // Add new item - disesuaikan dengan structure yang benar
          const newItem: ScannerTransactionItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            product_id: product.product_id,
            product,
            quantity: 1,
            condition_before: (product.condition as typeof CONDITION_OPTIONS[number]) || 'Good',
            condition_after: currentTransaction.transaction_type === 'lost' ? 'Poor' : undefined,
            status: 'processed',
            notes: ''
          };

          setCurrentTransaction(prev => ({
            ...prev,
            items: [...prev.items, newItem]
          }));

          setScanFeedback(`✅ Added: ${product.name || product.product_id}`);
        }
      } else {
        scanResult.error = `Product not found: ${productId}`;
        setScanFeedback(`❌ Product "${productId}" not found in database`);
        console.log('❌ Product not found for:', { rawData: data, extractedId: productId });
      }
    } catch (error) {
      console.error('❌ Scan processing error:', error);
      scanResult.error = 'Processing error';
      setScanFeedback(`❌ Error processing scan: ${productId}`);
    }

    setScanHistory(prev => [scanResult, ...prev.slice(1, 10)]);
    setTimeout(() => setScanFeedback(null), 4000);
  };

  const checkProductCompatibility = (product: Product, transactionType: Transaction['transaction_type']) => {
    switch (transactionType) {
      case 'check_out':
        if (product.status !== 'Available') {
          return {
            allowed: false,
            reason: `Product is ${product.status}, not Available for checkout`
          };
        }
        break;
      case 'check_in':
        if (!['Checked Out', 'In Use'].includes(product.status || '')) {
          return {
            allowed: false,
            reason: `Product is ${product.status}, not checked out`
          };
        }
        break;
      case 'maintenance':
      case 'repair':
        if (['Lost', 'Disposed'].includes(product.status || '')) {
          return {
            allowed: false,
            reason: `Cannot perform ${transactionType} on ${product.status} item`
          };
        }
        break;
      case 'lost':
        if (product.status === 'Lost') {
          return {
            allowed: false,
            reason: `Product is already marked as Lost`
          };
        }
        break;
    }
    
    return { allowed: true };
  };

  const handleRemoveItem = (id: string) => {
    setCurrentTransaction(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleUpdateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    setCurrentTransaction(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    }));
  };

  const validateTransaction = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentTransaction.first_person.trim()) {
      errors.first_person = 'First person is required';
    }

    if (!currentTransaction.location.trim()) {
      errors.location = 'Location is required';
    }

    // Required notes untuk repair dan lost
    if ((currentTransaction.transaction_type === 'repair' || currentTransaction.transaction_type === 'lost')
      && !currentTransaction.notes?.trim()) {
      errors.notes = `Notes are required for ${TRANSACTION_TYPE_LABELS[currentTransaction.transaction_type]}`;
    }

    if (currentTransaction.items.length === 0) {
      errors.items = 'At least one item is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTransaction = async () => {
    if (!validateTransaction()) {
      setScanFeedback('❌ Please fill in required fields');
      setTimeout(() => setScanFeedback(null), 3000);
      return;
    }

    try {
      // Convert ke format yang diharapkan backend - sesuai dengan types
      const transactionData: CreateTransactionRequest = {
        transaction_type: currentTransaction.transaction_type,
        reference_no: currentTransaction.reference_no,
        first_person: currentTransaction.first_person,
        second_person: currentTransaction.second_person,
        location: currentTransaction.location,
        transaction_date: new Date().toISOString(),
        notes: currentTransaction.notes,
        status: currentTransaction.status,
        items: currentTransaction.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          condition_before: item.condition_before,
          condition_after: item.condition_after,
          status: item.status,
          notes: item.notes || ''
        }))
      };

      console.log('💾 Saving transaction:', transactionData);

      const success = await createTransaction(transactionData);
      
      if (success) {
        setScanFeedback('✅ Transaction saved successfully!');
        setTimeout(() => {
          navigate('/transactions');
        }, 2000);
      } else {
        const errorMsg = transactionError || 'Failed to save transaction';
        setScanFeedback(`❌ ${errorMsg}`);
        setTimeout(() => setScanFeedback(null), 3000);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error saving transaction';
      setScanFeedback(`❌ ${errorMsg}`);
      setTimeout(() => setScanFeedback(null), 3000);
    }
  };

  const resetTransaction = () => {
    setCurrentTransaction({
      transaction_type: getTransactionTypeFromParams(),
      reference_no: generateReferenceNumber(),
      first_person: '',
      location: '',
      status: 'open',
      items: []
    });
    setScanHistory([]);
    setValidationErrors({});
    clearError();
  };

  // Get transaction type configuration
  const getTransactionConfig = () => {
    const type = currentTransaction.transaction_type;
    console.log('🎨 Getting config for transaction type:', type);
    
    const configs = {
      check_out: {
        icon: ArrowRightCircle,
        title: 'Check Out Scanner',
        subtitle: 'Scan assets to check out to staff',
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        guidelines: 'Only "Available" assets can be checked out'
      },
      check_in: {
        icon: ArrowLeftCircle,
        title: 'Check In Scanner',
        subtitle: 'Scan assets to return to inventory',
        color: 'blue',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        guidelines: 'Only "Checked Out" or "In Use" assets can be returned'
      },
      repair: {
        icon: Wrench,
        title: 'Repair Scanner',
        subtitle: 'Scan assets needing repair or maintenance',
        color: 'orange',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        guidelines: 'Assets requiring repair or maintenance work'
      },
      lost: {
        icon: AlertTriangle,
        title: 'Lost Asset Scanner',
        subtitle: 'Scan assets to report as lost or missing',
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        guidelines: 'Report assets that are lost, missing, or stolen'
      }
    };
    
    const config = configs[type] || configs.check_out;
    console.log('🎨 Using config:', config.title);
    return config;
  };

  const config = getTransactionConfig();
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
              <div className={`p-2 ${config.bgColor} rounded-lg`}>
                <config.icon className={`h-6 w-6 ${config.iconColor}`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {config.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {config.subtitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentTransaction.reference_no}
              </span>
              
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                {showForm ? 'Hide' : 'Show'} Form
              </button>

              <button
                onClick={resetTransaction}
                className="inline-flex items-center px-3 py-2 border border-orange-300 dark:border-orange-600 shadow-sm text-sm font-medium rounded-md text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
              
              <button
                onClick={() => setScannerActive(!scannerActive)}
                className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md transition-colors duration-200 ${
                  scannerActive
                    ? 'border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                }`}
              >
                {scannerActive ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Scanner
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`${config.bgColor} border border-${config.color}-200 dark:border-${config.color}-700 rounded-lg p-4`}>
          <div className="flex items-start">
            <config.icon className={`h-5 w-5 ${config.iconColor} mt-0.5 mr-3`} />
            <div>
              <h3 className={`text-sm font-medium text-${config.color}-800 dark:text-${config.color}-300`}>
                {TRANSACTION_TYPE_LABELS[currentTransaction.transaction_type]} Guidelines
              </h3>
              <div className={`mt-1 text-sm text-${config.color}-700 dark:text-${config.color}-400`}>
                <p>{config.guidelines}</p>
                {currentTransaction.transaction_type === 'repair' && (
                  <p className="mt-1 font-medium">⚠️ Detailed notes required describing the issue</p>
                )}
                {currentTransaction.transaction_type === 'lost' && (
                  <p className="mt-1 font-medium">⚠️ Detailed notes required explaining circumstances</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Feedback */}
      {scanFeedback && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className={`flex items-center px-6 py-3 rounded-lg shadow-lg border max-w-md ${
            scanFeedback.includes('❌')
              ? 'bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700'
              : scanFeedback.includes('✅') 
              ? 'bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
              : 'bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
          }`}>
            <span className="text-sm font-medium">{scanFeedback}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Real-time Scanner */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">QR/Barcode Scanner</h2>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${scannerActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {scannerActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
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

                {/* Real-time Scanner Component */}
                <div className="aspect-square w-full">
                  <RealTimeScanner
                    onScan={handleScanResult}
                    mode={scanMode}
                    active={scannerActive}
                    className="w-full h-full"
                  />
                </div>

                {/* Instructions */}
                <div className={`mt-4 p-3 ${config.bgColor} rounded-lg`}>
                  <p className={`text-xs ${config.iconColor}`}>
                    <strong>Tip:</strong> Hold your phone steady and point at the QR code. 
                    Scanner supports URLs like "localhost:5173/products/CAB004".
                  </p>
                </div>
              </div>
            </div>

            {/* Scan History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Scans</h2>
                  {scanHistory.length > 0 && (
                    <button
                      onClick={() => setScanHistory([])}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {scanHistory.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                    No scans yet. Try scanning a QR code!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scanHistory.map((scan, index) => (
                      <div key={index} className={`flex flex-col p-3 rounded-lg border text-xs ${
                        scan.error 
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                          : scan.product
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <div className="font-medium flex items-center space-x-2">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                scan.type === 'QR' ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'
                              }`}>
                                {scan.type}
                              </span>
                              <span className="font-mono text-xs">
                                {scan.data.length > 40 ? `${scan.data.substring(0, 40)}...` : scan.data}
                              </span>
                            </div>
                            <div className="text-xs opacity-75 mt-1">
                              Format: {scan.format}
                            </div>
                            {scan.product && (
                              <div className="text-xs mt-1">
                                <span className="font-medium">{scan.product.name || scan.product.product_id}</span>
                                {scan.product.status && (
                                  <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                                    scan.product.status === 'Available' ? 'bg-green-100 text-green-800' :
                                    scan.product.status === 'Checked Out' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {scan.product.status}
                                  </span>
                                )}
                              </div>
                            )}
                            {scan.error && (
                              <div className="text-xs mt-1 font-medium">
                                {scan.error}
                              </div>
                            )}
                          </div>
                          <div className="text-xs opacity-60 ml-2 flex-shrink-0">
                            {new Date(scan.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Transaction Type:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {TRANSACTION_TYPE_LABELS[currentTransaction.transaction_type]}
                    </span>
                  </div>
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
                    disabled={transactionLoading || totalItems === 0 || !currentTransaction.first_person || !currentTransaction.location}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {transactionLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Transaction
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => navigate('/transactions/new')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Use Manual Form
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Form (Collapsible) */}
            {showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Details</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transaction Type
                      </label>
                      <input
                        type="text"
                        value={TRANSACTION_TYPE_LABELS[currentTransaction.transaction_type]}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Transaction type is set from the URL parameter
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        value={currentTransaction.reference_no}
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
                        onChange={(e) => {
                          setCurrentTransaction(prev => ({ 
                            ...prev, 
                            first_person: e.target.value 
                          }));
                          if (validationErrors.first_person) {
                            setValidationErrors(prev => ({ ...prev, first_person: '' }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.first_person ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter person name"
                      />
                      {validationErrors.first_person && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.first_person}</p>
                      )}
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
                        onChange={(e) => {
                          setCurrentTransaction(prev => ({ 
                            ...prev, 
                            location: e.target.value 
                          }));
                          if (validationErrors.location) {
                            setValidationErrors(prev => ({ ...prev, location: '' }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.location ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter location"
                      />
                      {validationErrors.location && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        disabled
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Notes {(currentTransaction.transaction_type === 'repair' || currentTransaction.transaction_type === 'lost') && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={currentTransaction.notes || ''}
                        onChange={(e) => {
                          setCurrentTransaction(prev => ({ 
                            ...prev, 
                            notes: e.target.value 
                          }));
                          if (validationErrors.notes) {
                            setValidationErrors(prev => ({ ...prev, notes: '' }));
                          }
                        }}
                        rows={currentTransaction.transaction_type === 'repair' || currentTransaction.transaction_type === 'lost' ? 4 : 3}
                        placeholder={
                          currentTransaction.transaction_type === 'repair'
                            ? "Describe the issue, symptoms, and required repairs..."
                            : currentTransaction.transaction_type === 'lost'
                              ? "Explain the circumstances of loss, last known location, and responsible person..."
                              : "Additional notes..."
                        }
                        className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          validationErrors.notes ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {validationErrors.notes && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.notes}</p>
                      )}
                      {(currentTransaction.transaction_type === 'repair' || currentTransaction.transaction_type === 'lost') && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {currentTransaction.transaction_type === 'repair' && "Detail description helps maintenance team understand the issue"}
                          {currentTransaction.transaction_type === 'lost' && "Complete information helps with asset recovery and accountability"}
                        </p>
                      )}
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
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {totalItems} items, {totalQuantity} total quantity
                    </span>
                    {validationErrors.items && (
                      <span className="text-sm text-red-600">{validationErrors.items}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {currentTransaction.items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <QrCode className="h-20 w-20 text-gray-300 dark:text-gray-600 mb-6" />
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Ready to scan {TRANSACTION_TYPE_LABELS[currentTransaction.transaction_type].toLowerCase()} items!</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-md text-center">
                        {config.guidelines}
                        <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                          localhost:5173/products/CAB004
                        </code>
                      </p>
                      {!scannerActive && (
                        <button
                          onClick={() => setScannerActive(true)}
                          className="inline-flex items-center px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-lg"
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          Start Scanner
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentTransaction.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {item.product?.img_product ? (
                                  <img
                                    src={`${import.meta.env.VITE_API_URL}/uploads/products/${item.product.img_product}`}
                                    alt={item.product.name || item.product_id}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <Package className={`w-12 h-12 p-2 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-lg ${item.product?.img_product ? 'hidden' : ''}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.product?.name || `Product ${item.product_id}`}
                                </h4>
                                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-mono">ID: {item.product_id}</span>
                                  {item.product?.brand && <span>Brand: {item.product.brand}</span>}
                                  {item.product?.status && (
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      item.product.status === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                      item.product.status === 'Checked Out' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    }`}>
                                      {item.product.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 ml-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                              <button
                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors duration-200"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              
                              <span className="min-w-[2rem] text-center text-sm font-medium text-gray-900 dark:text-white px-2">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors duration-200"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Remove Item Button */}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Status
                            </label>
                            <select
                              value={item.status}
                              onChange={(e) => {
                                setCurrentTransaction(prev => ({
                                  ...prev,
                                  items: prev.items.map(i =>
                                    i.id === item.id ? { ...i, status: e.target.value as 'processed' | 'pending' } : i
                                  )
                                }));
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="processed">Processed</option>
                              <option value="pending">Pending</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Condition Before
                            </label>
                            <select
                              value={item.condition_before || 'Good'}
                              onChange={(e) => {
                                setCurrentTransaction(prev => ({
                                  ...prev,
                                  items: prev.items.map(i =>
                                    i.id === item.id ? { ...i, condition_before: e.target.value as typeof CONDITION_OPTIONS[number] } : i
                                  )
                                }));
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {CONDITION_OPTIONS.map(condition => (
                                <option key={condition} value={condition}>{condition}</option>
                              ))}
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
                                setCurrentTransaction(prev => ({
                                  ...prev,
                                  items: prev.items.map(i =>
                                    i.id === item.id ? { ...i, notes: e.target.value } : i
                                  )
                                }));
                              }}
                              placeholder="Add notes..."
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          {/* Show condition after for maintenance/repair */}
                          {(currentTransaction.transaction_type === 'maintenance' || 
                            currentTransaction.transaction_type === 'repair') && (
                            <div className="md:col-span-3">
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Condition After {TRANSACTION_TYPE_LABELS[currentTransaction.transaction_type]}
                              </label>
                              <select
                                value={item.condition_after || ''}
                                onChange={(e) => {
                                  setCurrentTransaction(prev => ({
                                    ...prev,
                                    items: prev.items.map(i =>
                                      i.id === item.id ? { ...i, condition_after: e.target.value as typeof CONDITION_OPTIONS[number] } : i
                                    )
                                  }));
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select condition after {currentTransaction.transaction_type}</option>
                                {CONDITION_OPTIONS.map(condition => (
                                  <option key={condition} value={condition}>{condition}</option>
                                ))}
                              </select>
                            </div>
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

      {/* Error Display */}
      {transactionError && (
        <div className="fixed bottom-4 right-4 max-w-md z-50">
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Transaction Error
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {transactionError}
                </p>
              </div>
              <button
                onClick={clearError}
                className="ml-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;