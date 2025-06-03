// src/components/QRCodeWithLibrary.tsx
// Install: npm install qrcode @types/qrcode

import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Download, 
  Printer, 
  Settings, 
  Plus,
  Minus,
  Copy,
  Share2,
  AlertCircle
} from 'lucide-react';

interface QRCodeWithLibraryProps {
  value: string;
  size?: number;
  productId: string;
  productName?: string;
  product?: any; // Untuk cek apakah sudah ada qr_data dari backend
}

interface QRSettings {
  size: number;
  backgroundColor: string;
  foregroundColor: string;
  margin: number;
  quality: 'L' | 'M' | 'Q' | 'H';
  labelSize: 'custom1x3' | 'small' | 'medium' | 'large';
}

const QRCodeWithLibrary: React.FC<QRCodeWithLibraryProps> = ({ 
  value, 
  size = 180, 
  productId, 
  productName,
  product 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string>('');
  const [isGenerated, setIsGenerated] = useState(false);
  
  const [qrSettings, setQRSettings] = useState<QRSettings>({
    size: size,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    margin: 4,
    quality: 'M',
    labelSize: 'medium'
  });

  // FIXED: Optimize QR data to prevent "too big" error
  const getOptimizedQRData = (): string => {
    try {
      // Jika value terlalu panjang, potong atau buat versi sederhana
      if (value.length > 2000) {
        console.warn('QR data too long, using simplified version');
        
        // Jika value adalah URL panjang, ambil bagian penting saja
        if (value.startsWith('http')) {
          const url = new URL(value);
          return `${url.origin}/products/${productId}`;
        }
        
        // Jika value adalah JSON, ambil ID saja
        if (value.startsWith('{') || value.startsWith('[')) {
          return productId;
        }
        
        // Fallback: gunakan product ID saja
        return productId;
      }
      
      return value;
    } catch (error) {
      console.error('Error optimizing QR data:', error);
      return productId; // Fallback ke product ID
    }
  };

  // FIXED: Check if backend already provides QR data
  const useExistingQRData = (): boolean => {
    if (product?.qr_data && typeof product.qr_data === 'string') {
      try {
        // Jika backend sudah kasih base64 image, gunakan itu
        setQrDataURL(product.qr_data);
        setIsGenerated(true);
        return true;
      } catch (error) {
        console.error('Error using existing QR data:', error);
        return false;
      }
    }
    return false;
  };

  // Generate QR Code using qrcode library
  const generateQRCode = async () => {
    try {
      setError('');
      
      // Cek dulu apakah backend sudah kasih QR data
      if (useExistingQRData()) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      // FIXED: Gunakan data yang sudah dioptimasi
      const optimizedData = getOptimizedQRData();
      
      console.log('Generating QR with data:', optimizedData);
      console.log('Data length:', optimizedData.length);

      // FIXED: Tambah error handling dan validasi ukuran data
      if (optimizedData.length > 3000) {
        throw new Error('Data still too large for QR code. Using product ID instead.');
      }

      // Generate QR code dengan data yang sudah dioptimasi
      await QRCode.toCanvas(canvas, optimizedData, {
        width: qrSettings.size,
        margin: qrSettings.margin,
        color: {
          dark: qrSettings.foregroundColor,
          light: qrSettings.backgroundColor,
        },
        errorCorrectionLevel: qrSettings.quality,
      });

      // Get data URL for other uses
      const dataURL = canvas.toDataURL('image/png');
      setQrDataURL(dataURL);
      setIsGenerated(true);

    } catch (error: any) {
      console.error('Error generating QR code:', error);
      setError(error.message || 'Failed to generate QR code');
      
      // FIXED: Fallback dengan data minimal
      try {
        console.log('Attempting fallback with product ID only');
        const canvas = canvasRef.current;
        if (!canvas) return;

        await QRCode.toCanvas(canvas, productId, {
          width: qrSettings.size,
          margin: qrSettings.margin,
          color: {
            dark: qrSettings.foregroundColor,
            light: qrSettings.backgroundColor,
          },
          errorCorrectionLevel: 'M', // Use medium quality for fallback
        });

        const dataURL = canvas.toDataURL('image/png');
        setQrDataURL(dataURL);
        setIsGenerated(true);
        setError('Using simplified QR code (Product ID only)');
      } catch (fallbackError) {
        console.error('Fallback QR generation failed:', fallbackError);
        setError('Failed to generate QR code. Please try again.');
      }
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [qrSettings, value, product]);

  const handleDownload = (format: 'png' | 'svg' | 'pdf' = 'png') => {
    if (!isGenerated) {
      alert('Please wait for QR code to be generated');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas && !qrDataURL) return;

    const link = document.createElement('a');
    link.download = `qr-code-${productId}.${format}`;
    
    if (format === 'png') {
      if (qrDataURL) {
        link.href = qrDataURL;
      } else if (canvas) {
        link.href = canvas.toDataURL('image/png');
      }
    } else if (format === 'svg') {
      // Convert to SVG (simplified)
      const optimizedData = getOptimizedQRData();
      QRCode.toString(optimizedData, { 
        type: 'svg',
        width: qrSettings.size,
        color: {
          dark: qrSettings.foregroundColor,
          light: qrSettings.backgroundColor,
        }
      }).then(svg => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(blob);
        link.click();
      }).catch(error => {
        console.error('Error generating SVG:', error);
        alert('Failed to generate SVG. Please try PNG format.');
      });
      return;
    }
    
    link.click();
  };

  const handlePrint = (type: 'single' | 'bulk' | 'label' = 'single') => {
    if (!isGenerated) {
      alert('Please wait for QR code to be generated');
      return;
    }

    const imageData = qrDataURL || (canvasRef.current?.toDataURL());
    if (!imageData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get label dimensions based on size setting
    const getLabelDimensions = () => {
      switch (qrSettings.labelSize) {
        case 'custom1x3':
          return { 
            qrSize: '30px', 
            containerWidth: '113px', // 3cm
            containerHeight: '38px', // 1cm
            padding: '2px', 
            fontSize: { title: '8px', id: '7px', company: '5px', date: '4px' },
            layout: 'compact' // special layout for tiny size
          };
        case 'small':
          return { qrSize: '60px', containerWidth: '250px', padding: '5px', fontSize: { title: '12px', id: '10px', company: '8px', date: '7px' } };
        case 'large':
          return { qrSize: '140px', containerWidth: '500px', padding: '20px', fontSize: { title: '18px', id: '16px', company: '14px', date: '12px' } };
        default: // medium
          return { qrSize: '100px', containerWidth: '400px', padding: '15px', fontSize: { title: '16px', id: '14px', company: '12px', date: '10px' } };
      }
    };

    const dimensions = getLabelDimensions();

    let content = '';
    
    if (type === 'single') {
      content = `
        <div class="qr-container">
          <img src="${imageData}" alt="QR Code" class="qr-image" />
          <div class="product-info">
            <strong>Product ID: ${productId}</strong>
          </div>
        </div>
      `;
    } else if (type === 'bulk') {
      // Calculate optimal grid for A4 paper (210mm x 297mm)
      const getOptimalGrid = () => {
        switch (qrSettings.labelSize) {
          case 'custom1x3':
            // A4: 210mm width / 30mm (3cm + gap) = ~7 cols, 297mm height / 12mm (1cm + gap) = ~25 rows
            return { cols: 7, rows: 25, totalItems: 175 };
          case 'small':
            // 60px labels: ~5 cols x 12 rows = 60 items
            return { cols: 5, rows: 12, totalItems: 60 };
          case 'large':
            // 140px labels: ~3 cols x 6 rows = 18 items
            return { cols: 3, rows: 6, totalItems: 18 };
          default: // medium
            // 100px labels: ~4 cols x 8 rows = 32 items
            return { cols: 4, rows: 8, totalItems: 32 };
        }
      };

      const grid = getOptimalGrid();
      
      const qrItems = Array(grid.totalItems).fill(0).map((_, i) => `
        <div class="qr-item" style="
          border: 1px solid #ddd; 
          padding: ${dimensions.padding}; 
          border-radius: 2px;
          display: flex;
          align-items: center;
          ${dimensions.containerHeight ? `height: ${dimensions.containerHeight};` : ''}
          ${dimensions.layout === 'compact' ? 'justify-content: flex-start;' : 'flex-direction: column; text-align: center;'}
          box-sizing: border-box;
        ">
          <img src="${imageData}" alt="QR Code" style="
            width: ${dimensions.qrSize}; 
            height: ${dimensions.qrSize};
            ${dimensions.layout === 'compact' ? 'margin-right: 2px;' : 'margin-bottom: 2px;'}
            flex-shrink: 0;
          " />
          <div class="item-info" style="
            font-size: ${dimensions.fontSize.id};
            ${dimensions.layout === 'compact' ? 'line-height: 1; overflow: hidden; white-space: nowrap;' : ''}
            font-weight: bold;
          ">
            ${productId}
          </div>
        </div>
      `).join('');
      
      content = `
        <div class="bulk-header" style="text-align: center; margin-bottom: 10px; font-size: 14px; font-weight: bold;">
          QR Code Bulk Print - ${productId} (${grid.totalItems} labels)
        </div>
        <div class="qr-grid" style="
          display: grid; 
          grid-template-columns: repeat(${grid.cols}, 1fr); 
          gap: ${dimensions.layout === 'compact' ? '2px' : '3px'}; 
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          page-break-inside: avoid;
        ">${qrItems}</div>
      `;
    } else if (type === 'label') {
      content = `
        <div class="label-container">
          <div class="label-item" style="max-width: ${dimensions.containerWidth}; ${dimensions.containerHeight ? `height: ${dimensions.containerHeight};` : ''} padding: ${dimensions.padding};">
            <img src="${imageData}" alt="QR Code" class="label-qr" style="width: ${dimensions.qrSize}; height: ${dimensions.qrSize};" />
            <div class="label-info" style="${dimensions.layout === 'compact' ? 'margin-left: 3px;' : ''}">
              <div class="label-id" style="font-size: ${dimensions.fontSize.id};">ID: ${productId}</div>
              ${dimensions.layout !== 'compact' ? `<div class="label-company" style="font-size: ${dimensions.fontSize.company};">FiberOne </div>` : ''}
              ${dimensions.layout !== 'compact' ? `<div class="label-date" style="font-size: ${dimensions.fontSize.date};">Generated: ${new Date().toLocaleDateString('id-ID')}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Print - ${productId}</title>
          <style>
            body {
              margin: 0;
              padding: 5mm;
              font-family: 'Arial', sans-serif;
              background: white;
              box-sizing: border-box;
            }
            
            .qr-container {
              text-align: center;
              border: 2px dashed #007bff;
              padding: 30px;
              border-radius: 12px;
              max-width: 300px;
              margin: 0 auto;
              background: #f8f9fa;
            }
            .qr-image {
              max-width: 100%;
              height: auto;
              border: 1px solid #dee2e6;
              border-radius: 8px;
            }
            .product-info {
              margin-top: 15px;
              font-size: 14px;
              color: #495057;
              line-height: 1.5;
            }
            
            .qr-grid {
              display: grid;
              gap: 15px;
              max-width: 210mm;
              margin: 0 auto;
            }
            .qr-item {
              text-align: center;
              border: 1px solid #ddd;
              padding: 10px;
              border-radius: 8px;
              box-sizing: border-box;
            }
            .qr-item img {
              display: block;
              margin: 0 auto;
            }
            .item-info {
              margin-top: 5px;
              word-wrap: break-word;
            }
            
            .label-container {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .label-item {
              display: flex;
              align-items: center;
              border: 2px solid #007bff;
              border-radius: 8px;
              background: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              box-sizing: border-box;
            }
            .label-qr {
              margin-right: 20px;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              flex-shrink: 0;
            }
            .label-info {
              flex: 1;
            }
            .label-id {
              color: #007bff;
              font-weight: 600;
              margin-bottom: 5px;
            }
            .label-company {
              color: #6c757d;
              margin-bottom: 3px;
            }
            .label-date {
              color: #adb5bd;
            }
            
            @media print {
              body { margin: 0; padding: 3mm; }
              .qr-container { border: 1px solid #000; }
              .qr-grid { 
                gap: 1px; 
                page-break-inside: avoid;
                width: 100% !important;
                max-width: none !important;
              }
              .qr-item { 
                border: 0.5px solid #000; 
                page-break-inside: avoid; 
                margin: 0;
              }
              .label-item { border: 1px solid #000; }
              .label-container { min-height: auto; }
              .bulk-header { font-size: 12px; margin-bottom: 5px; }
              @page {
                size: A4;
                margin: 3mm;
              }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const copyToClipboard = async () => {
    try {
      if (!isGenerated) {
        alert('Please wait for QR code to be generated');
        return;
      }

      const canvas = canvasRef.current;
      const imageData = qrDataURL || (canvas?.toDataURL());
      
      if (!imageData) return;

      if (canvas) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('QR Code copied to clipboard!');
          }
        });
      } else {
        // Fallback: copy data URL
        await navigator.clipboard.writeText(imageData);
        alert('QR Code data URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy QR code');
    }
  };

  const shareQRCode = async () => {
    if (!isGenerated) {
      alert('Please wait for QR code to be generated');
      return;
    }

    if (navigator.share) {
      try {
        const canvas = canvasRef.current;
        const imageData = qrDataURL || (canvas?.toDataURL());
        
        if (!imageData) return;

        if (canvas) {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `qr-code-${productId}.png`, { type: 'image/png' });
              await navigator.share({
                title: `QR Code - ${productId}`,
                text: `QR Code untuk ${productId}`,
                files: [file]
              });
            }
          });
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy link
      await copyToClipboard();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">QR Code Generator</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Customization Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Size Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size: {qrSettings.size}px
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQRSettings(prev => ({ ...prev, size: Math.max(100, prev.size - 20) }))}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    value={qrSettings.size}
                    onChange={(e) => setQRSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setQRSettings(prev => ({ ...prev, size: Math.min(500, prev.size + 20) }))}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality
                </label>
                <select
                  value={qrSettings.quality}
                  onChange={(e) => setQRSettings(prev => ({ ...prev, quality: e.target.value as 'L' | 'M' | 'Q' | 'H' }))}
                  className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Margin: {qrSettings.margin}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={qrSettings.margin}
                  onChange={(e) => setQRSettings(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Colors
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">QR Code</label>
                    <input
                      type="color"
                      value={qrSettings.foregroundColor}
                      onChange={(e) => setQRSettings(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Background</label>
                    <input
                      type="color"
                      value={qrSettings.backgroundColor}
                      onChange={(e) => setQRSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Label Print Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label Print Size
                </label>
                <select
                  value={qrSettings.labelSize}
                  onChange={(e) => setQRSettings(prev => ({ ...prev, labelSize: e.target.value as 'custom1x3' | 'small' | 'medium' | 'large' }))}
                  className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="custom1x3">Mini Label (1cm x 3cm)</option>
                  <option value="small">Small (60px QR)</option>
                  <option value="medium">Medium (100px QR)</option>
                  <option value="large">Large (140px QR)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Display */}
        <div className="flex flex-col items-center">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-6 bg-white dark:bg-gray-700/20">
            {/* FIXED: Show existing QR or canvas */}
            {product?.qr_data && !showSettings ? (
              <img 
                src={product.qr_data} 
                alt="Product QR Code"
                className="max-w-full h-auto shadow-sm"
                style={{ maxWidth: qrSettings.size, maxHeight: qrSettings.size }}
              />
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto shadow-sm"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePrint('single')}
                disabled={!isGenerated}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Single
              </button>
              
              <button
                onClick={() => handleDownload('png')}
                disabled={!isGenerated}
                className="flex items-center justify-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePrint('bulk')}
                disabled={!isGenerated}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-3 h-3 mr-1" />
                Bulk Print
              </button>
              
              <button
                onClick={() => handlePrint('label')}
                disabled={!isGenerated}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-3 h-3 mr-1" />
                Label Print
              </button>
              
              <button
                onClick={() => handleDownload('svg')}
                disabled={!isGenerated}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3 h-3 mr-1" />
                SVG
              </button>
            </div>

            {/* Share Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!isGenerated}
                className="flex items-center justify-center px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-md text-sm text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </button>
              
              <button
                onClick={shareQRCode}
                disabled={!isGenerated}
                className="flex items-center justify-center px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md text-sm text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Product ID: <span className="font-semibold text-gray-900 dark:text-white">{productId}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Quality: {qrSettings.quality} • Size: {qrSettings.size}px
            </p>
            {product?.qr_data && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ Using pre-generated QR code from backend
              </p>
            )}
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
              <span>🏢</span>
              <span>FiberOne - Asset Management System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeWithLibrary;