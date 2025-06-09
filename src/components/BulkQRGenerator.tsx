// src/components/BulkQRGenerator.tsx
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
  AlertCircle,
  X,
  CheckCircle
} from 'lucide-react';
import { Product } from '../types/product.types';

interface BulkQRGeneratorProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface QRSettings {
  size: number;
  backgroundColor: string;
  foregroundColor: string;
  margin: number;
  quality: 'L' | 'M' | 'Q' | 'H';
  labelSize: 'custom1x3' | 'small' | 'medium' | 'large';
  printLayout: 'grid' | 'list' | 'labels';
}

interface GeneratedQR {
  product: Product;
  dataURL: string;
  error?: string;
}

const BulkQRGenerator: React.FC<BulkQRGeneratorProps> = ({ 
  products, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [qrSettings, setQRSettings] = useState<QRSettings>({
    size: 120,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    margin: 2,
    quality: 'M',
    labelSize: 'medium',
    printLayout: 'grid'
  });

  // Generate QR data for a product
  const getQRData = (product: Product): string => {
    try {
      // Gunakan format yang sama dengan component asli
      const qrData = {
        id: product.product_id,
        name: product.name,
        category: product.Category?.name,
        location: product.location,
        status: product.status,
        url: `${window.location.origin}/products/${product.product_id}`
      };
      
      const dataString = JSON.stringify(qrData);
      
      // Jika terlalu panjang, gunakan URL sederhana
      if (dataString.length > 2000) {
        return `${window.location.origin}/products/${product.product_id}`;
      }
      
      return dataString;
    } catch (error) {
      console.error('Error creating QR data:', error);
      return product.product_id; // Fallback
    }
  };

  // Generate single QR code
  const generateSingleQR = async (product: Product): Promise<GeneratedQR> => {
    try {
      // Check if product already has QR data from backend
      if (product.qr_data && typeof product.qr_data === 'string') {
        return {
          product,
          dataURL: product.qr_data
        };
      }

      const qrData = getQRData(product);
      
      // Create canvas for this QR
      const canvas = document.createElement('canvas');
      
      await QRCode.toCanvas(canvas, qrData, {
        width: qrSettings.size,
        margin: qrSettings.margin,
        color: {
          dark: qrSettings.foregroundColor,
          light: qrSettings.backgroundColor,
        },
        errorCorrectionLevel: qrSettings.quality,
      });

      const dataURL = canvas.toDataURL('image/png');
      
      return {
        product,
        dataURL
      };
    } catch (error: any) {
      console.error(`Error generating QR for ${product.product_id}:`, error);
      
      // Try fallback with just product ID
      try {
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, product.product_id, {
          width: qrSettings.size,
          margin: qrSettings.margin,
          color: {
            dark: qrSettings.foregroundColor,
            light: qrSettings.backgroundColor,
          },
          errorCorrectionLevel: 'M',
        });

        const dataURL = canvas.toDataURL('image/png');
        
        return {
          product,
          dataURL,
          error: 'Using simplified QR (Product ID only)'
        };
      } catch (fallbackError) {
        return {
          product,
          dataURL: '',
          error: `Failed to generate QR: ${error.message}`
        };
      }
    }
  };

  // Generate all QR codes
  const generateAllQRs = async () => {
    setIsGenerating(true);
    setProgress(0);
    setErrors([]);
    setGeneratedQRs([]);

    const results: GeneratedQR[] = [];
    const errorList: string[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        const qrResult = await generateSingleQR(product);
        results.push(qrResult);
        
        if (qrResult.error) {
          errorList.push(`${product.product_id}: ${qrResult.error}`);
        }
      } catch (error: any) {
        errorList.push(`${product.product_id}: ${error.message}`);
        results.push({
          product,
          dataURL: '',
          error: error.message
        });
      }
      
      setProgress(((i + 1) / products.length) * 100);
      
      // Small delay to prevent blocking UI
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    setGeneratedQRs(results);
    setErrors(errorList);
    setIsGenerating(false);
  };

  // Auto-generate when products change
  useEffect(() => {
    if (isOpen && products.length > 0) {
      generateAllQRs();
    }
  }, [isOpen, products, qrSettings]);

  // Print all QR codes
  const handleBulkPrint = () => {
    if (generatedQRs.length === 0) {
      alert('No QR codes generated yet');
      return;
    }

    setIsPrinting(true);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setIsPrinting(false);
      return;
    }

    // Get layout settings
    const getLayoutSettings = () => {
      switch (qrSettings.labelSize) {
        case 'custom1x3':
          return { 
            qrSize: '25px', 
            containerWidth: '100px',
            containerHeight: '35px',
            padding: '2px', 
            fontSize: { title: '7px', id: '6px' },
            cols: 8, rows: 28
          };
        case 'small':
          return { 
            qrSize: '50px', 
            containerWidth: '180px',
            containerHeight: '80px',
            padding: '8px', 
            fontSize: { title: '10px', id: '9px' },
            cols: 4, rows: 12
          };
        case 'large':
          return { 
            qrSize: '100px', 
            containerWidth: '300px',
            containerHeight: '140px',
            padding: '15px', 
            fontSize: { title: '14px', id: '12px' },
            cols: 2, rows: 6
          };
        default: // medium
          return { 
            qrSize: '70px', 
            containerWidth: '220px',
            containerHeight: '100px',
            padding: '10px', 
            fontSize: { title: '12px', id: '10px' },
            cols: 3, rows: 9
          };
      }
    };

    const layout = getLayoutSettings();

    // Generate print content based on layout
    let content = '';
    
    if (qrSettings.printLayout === 'grid') {
      const qrItems = generatedQRs.map(qr => `
        <div class="qr-item" style="
          width: ${layout.containerWidth};
          height: ${layout.containerHeight};
          border: 1px solid #ddd; 
          padding: ${layout.padding}; 
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          page-break-inside: avoid;
        ">
          ${qr.dataURL ? `
            <img src="${qr.dataURL}" alt="QR Code" style="
              width: ${layout.qrSize}; 
              height: ${layout.qrSize};
              flex-shrink: 0;
            " />
          ` : `
            <div style="
              width: ${layout.qrSize}; 
              height: ${layout.qrSize};
              background: #f0f0f0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #999;
            ">ERROR</div>
          `}
          
          <div class="item-info" style="
            margin-left: 8px;
            flex: 1;
            overflow: hidden;
          ">
            <div style="
              font-size: ${layout.fontSize.title};
              font-weight: bold;
              color: #333;
              line-height: 1.2;
              margin-bottom: 2px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            ">${qr.product.name}</div>
            
            <div style="
              font-size: ${layout.fontSize.id};
              color: #666;
              font-family: monospace;
              margin-bottom: 1px;
            ">ID: ${qr.product.product_id}</div>
            
            ${qr.product.location ? `
              <div style="
                font-size: ${layout.fontSize.id};
                color: #888;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              ">📍 ${qr.product.location}</div>
            ` : ''}
            
            ${qr.product.quantity ? `
              <div style="
                font-size: ${layout.fontSize.id};
                color: #888;
              ">Qty: ${qr.product.quantity}</div>
            ` : ''}
          </div>
        </div>
      `).join('');
      
      content = `
        <div class="print-header" style="text-align: center; margin-bottom: 15px; page-break-after: avoid;">
          <h2 style="margin: 0; font-size: 16px; color: #333;">QR Code Labels</h2>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">
            Generated: ${new Date().toLocaleDateString('id-ID')} | Total: ${generatedQRs.length} items
          </p>
        </div>
        
        <div class="qr-grid" style="
          display: grid; 
          grid-template-columns: repeat(${layout.cols}, 1fr); 
          gap: 3px; 
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
        ">${qrItems}</div>
      `;
    } else if (qrSettings.printLayout === 'list') {
      const qrItems = generatedQRs.map((qr, index) => `
        <div class="qr-row" style="
          display: flex;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #eee;
          page-break-inside: avoid;
        ">
          <div style="margin-right: 15px; font-weight: bold; color: #666; width: 30px;">
            ${index + 1}.
          </div>
          
          ${qr.dataURL ? `
            <img src="${qr.dataURL}" alt="QR Code" style="
              width: 60px; 
              height: 60px;
              margin-right: 15px;
              border: 1px solid #ddd;
            " />
          ` : `
            <div style="
              width: 60px; 
              height: 60px;
              background: #f0f0f0;
              margin-right: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #999;
              border: 1px solid #ddd;
            ">ERROR</div>
          `}
          
          <div style="flex: 1;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 3px;">
              ${qr.product.name}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 2px;">
              Product ID: ${qr.product.product_id}
            </div>
            <div style="font-size: 11px; color: #888;">
              ${qr.product.Category?.name || 'No Category'} • 
              ${qr.product.location || 'No Location'} • 
              Status: ${qr.product.status}
              ${qr.product.quantity ? ` • Qty: ${qr.product.quantity}` : ''}
            </div>
          </div>
        </div>
      `).join('');
      
      content = `
        <div class="print-header" style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">Product QR Codes List</h2>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">
            Generated: ${new Date().toLocaleDateString('id-ID')} | Total: ${generatedQRs.length} items
          </p>
        </div>
        
        <div class="qr-list">${qrItems}</div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - Bulk Print</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 10mm;
              font-family: 'Arial', sans-serif;
              background: white;
              font-size: 12px;
              line-height: 1.4;
            }
            
            .qr-grid {
              display: grid;
              gap: 3px;
              max-width: 210mm;
              margin: 0 auto;
            }
            
            .qr-item {
              border: 1px solid #ddd;
              border-radius: 4px;
              background: white;
              overflow: hidden;
            }
            
            .qr-row {
              min-height: 70px;
            }
            
            .print-header {
              margin-bottom: 15px;
            }
            
            @media print {
              body { 
                margin: 0; 
                padding: 5mm; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .qr-grid { 
                gap: 1px; 
                width: 100% !important;
                max-width: none !important;
              }
              
              .qr-item { 
                border: 0.5px solid #000; 
                page-break-inside: avoid; 
                margin: 0;
              }
              
              .qr-row {
                page-break-inside: avoid;
                border-bottom: 0.5px solid #ccc;
              }
              
              .print-header { 
                page-break-after: avoid;
                margin-bottom: 10px;
              }
              
              @page {
                size: A4;
                margin: 5mm;
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
                ${onSuccess ? 'window.opener.postMessage("print-success", "*");' : ''}
                setTimeout(() => window.close(), 1000);
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setIsPrinting(false);
  };

  // Download all QRs as ZIP (simplified - just download first one for demo)
  const handleBulkDownload = async () => {
    if (generatedQRs.length === 0) return;
    
    // For demo, download first QR. In production, you'd create a ZIP file
    const firstQR = generatedQRs[0];
    if (firstQR.dataURL) {
      const link = document.createElement('a');
      link.download = `qr-codes-bulk-${Date.now()}.png`;
      link.href = firstQR.dataURL;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-[90%] max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Bulk QR Code Generator
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Settings Panel */}
        <div className="mb-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showSettings ? 'Hide Settings' : 'Show Settings'}
          </button>

          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* QR Size */}
                <div>
                  <label className="block text-sm font-medium mb-2">QR Size: {qrSettings.size}px</label>
                  <input
                    type="range"
                    min="80"
                    max="200"
                    value={qrSettings.size}
                    onChange={(e) => setQRSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Label Size */}
                <div>
                  <label className="block text-sm font-medium mb-2">Label Size</label>
                  <select
                    value={qrSettings.labelSize}
                    onChange={(e) => setQRSettings(prev => ({ ...prev, labelSize: e.target.value as any }))}
                    className="w-full px-3 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                  >
                    <option value="custom1x3">Mini (1x3cm)</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {/* Print Layout */}
                <div>
                  <label className="block text-sm font-medium mb-2">Print Layout</label>
                  <select
                    value={qrSettings.printLayout}
                    onChange={(e) => setQRSettings(prev => ({ ...prev, printLayout: e.target.value as any }))}
                    className="w-full px-3 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                  >
                    <option value="grid">Grid Layout</option>
                    <option value="list">List Layout</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        {isGenerating && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Generating QR codes...
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Some QR codes had issues:
                </h4>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="font-mono">{error}</div>
                  ))}
                  {errors.length > 5 && (
                    <div className="text-xs">... and {errors.length - 5} more</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {generatedQRs.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Generated {generatedQRs.filter(qr => qr.dataURL).length} of {generatedQRs.length} QR codes successfully
              </span>
            </div>
          </div>
        )}

        {/* Preview Grid */}
        {generatedQRs.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-4">Preview ({generatedQRs.length} items)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
              {generatedQRs.map((qr, index) => (
                <div key={qr.product.product_id} className="text-center">
                  {qr.dataURL ? (
                    <img 
                      src={qr.dataURL} 
                      alt={`QR for ${qr.product.product_id}`}
                      className="w-16 h-16 mx-auto mb-2 border rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-2 border rounded bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <span className="text-red-500 text-xs">Error</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {qr.product.product_id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          
          <button
            onClick={handleBulkDownload}
            disabled={generatedQRs.length === 0 || isGenerating}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          
          <button
            onClick={handleBulkPrint}
            disabled={generatedQRs.length === 0 || isGenerating || isPrinting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isPrinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Printing...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Print All ({generatedQRs.filter(qr => qr.dataURL).length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkQRGenerator;