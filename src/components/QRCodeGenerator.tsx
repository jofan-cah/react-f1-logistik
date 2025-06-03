// src/components/QRCodeGenerator.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Printer, 
  Settings, 
  X,
  Plus,
  Minus,
  Type,
  Palette
} from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  productId: string;
  productName?: string;
}

interface QRSettings {
  size: number;
  showLabel: boolean;
  labelText: string;
  labelPosition: 'top' | 'bottom';
  backgroundColor: string;
  foregroundColor: string;
  margin: number;
  logoUrl?: string;
  showLogo: boolean;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 180, 
  productId, 
  productName 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [qrSettings, setQRSettings] = useState<QRSettings>({
    size: size,
    showLabel: true,
    labelText: productName || productId,
    labelPosition: 'bottom',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    margin: 4,
    showLogo: false
  });

  // Generate QR Code using a simple implementation
  const generateQRCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // For demo purposes, we'll create a simple QR pattern
    // In production, you'd use a proper QR code library like qrcode.js
    const qrSize = qrSettings.size;
    const margin = qrSettings.margin * 4;
    
    canvas.width = qrSize + margin * 2;
    canvas.height = qrSize + margin * 2 + (qrSettings.showLabel ? 40 : 0);

    // Clear canvas
    ctx.fillStyle = qrSettings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR pattern (simplified for demo)
    ctx.fillStyle = qrSettings.foregroundColor;
    const moduleSize = qrSize / 25; // Assuming 25x25 modules
    
    // Generate a simple pattern based on the value
    const pattern = generatePattern(value, 25);
    
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        if (pattern[row][col]) {
          ctx.fillRect(
            margin + col * moduleSize,
            margin + row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }

    // Add logo if enabled
    if (qrSettings.showLogo && qrSettings.logoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const logoSize = qrSize * 0.2;
        const logoX = margin + (qrSize - logoSize) / 2;
        const logoY = margin + (qrSize - logoSize) / 2;
        
        // Draw white background for logo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
        
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
      };
      img.src = qrSettings.logoUrl;
    }

    // Add label
    if (qrSettings.showLabel && qrSettings.labelText) {
      ctx.fillStyle = qrSettings.foregroundColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      const labelY = qrSettings.labelPosition === 'top' ? 20 : canvas.height - 10;
      ctx.fillText(qrSettings.labelText, canvas.width / 2, labelY);
    }
  };

  // Simple pattern generator (replace with actual QR code library)
  const generatePattern = (data: string, size: number): boolean[][] => {
    const pattern: boolean[][] = [];
    let hash = 0;
    
    // Create a simple hash from the data
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
    }
    
    // Generate pattern based on hash
    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        // Create finder patterns (corners)
        if ((i < 9 && j < 9) || (i < 9 && j >= size - 9) || (i >= size - 9 && j < 9)) {
          pattern[i][j] = (i % 2 === 0 && j % 2 === 0) || 
                          (i === 0 || i === 8 || j === 0 || j === 8) ||
                          (i >= 2 && i <= 6 && j >= 2 && j <= 6);
        } else {
          // Random pattern based on hash and position
          pattern[i][j] = ((hash + i * size + j) % 3) === 0;
        }
      }
    }
    
    return pattern;
  };

  useEffect(() => {
    generateQRCode();
  }, [qrSettings, value]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `qr-code-${productId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${productId}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .qr-container {
              text-align: center;
              border: 2px dashed #ccc;
              padding: 20px;
              border-radius: 8px;
            }
            .qr-image {
              max-width: 100%;
              height: auto;
            }
            .product-info {
              margin-top: 10px;
              font-size: 14px;
              color: #666;
            }
            .company-info {
              margin-top: 20px;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${imageData}" alt="QR Code" class="qr-image" />
           
          </div>
          <div class="company-info">
            <div>FiberOne </div>
            <div>Generated on ${new Date().toLocaleDateString('id-ID')}</div>
          </div>
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

  const handleBulkPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    
    // Create a grid of QR codes for bulk printing
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - Bulk Print</title>
          <style>
            body {
              margin: 0;
              padding: 10px;
              font-family: Arial, sans-serif;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              max-width: 210mm;
            }
            .qr-item {
              text-align: center;
              border: 1px dashed #ccc;
              padding: 10px;
              border-radius: 4px;
              break-inside: avoid;
            }
            .qr-image {
              width: 120px;
              height: auto;
            }
            .product-info {
              margin-top: 5px;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .grid { gap: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${Array(9).fill(0).map((_, i) => `
              <div class="qr-item">
                <img src="${imageData}" alt="QR Code" class="qr-image" />
             
              </div>
            `).join('')}
          </div>
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

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">QR Code</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Size Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size: {qrSettings.size}px
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQRSettings(prev => ({ ...prev, size: Math.max(100, prev.size - 20) }))}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="range"
                    min="100"
                    max="400"
                    value={qrSettings.size}
                    onChange={(e) => setQRSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setQRSettings(prev => ({ ...prev, size: Math.min(400, prev.size + 20) }))}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Label Settings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Label
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={qrSettings.showLabel}
                      onChange={(e) => setQRSettings(prev => ({ ...prev, showLabel: e.target.checked }))}
                      className="mr-1"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Show</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={qrSettings.labelText}
                  onChange={(e) => setQRSettings(prev => ({ ...prev, labelText: e.target.value }))}
                  disabled={!qrSettings.showLabel}
                  className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="Enter label text"
                />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Colors
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Foreground</label>
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

              {/* Label Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label Position
                </label>
                <select
                  value={qrSettings.labelPosition}
                  onChange={(e) => setQRSettings(prev => ({ ...prev, labelPosition: e.target.value as 'top' | 'bottom' }))}
                  disabled={!qrSettings.showLabel}
                  className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Display */}
        <div className="flex flex-col items-center">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="w-full space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Single
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </button>
            </div>
            
            <button
              onClick={handleBulkPrint}
              className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 dark:border-blue-600 rounded-md text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Bulk (9 codes)
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              QR Code for: <span className="font-medium">{productId}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              FiberOne  - Asset Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;