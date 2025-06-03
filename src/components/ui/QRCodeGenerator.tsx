// src/components/ui/QRCodeGenerator.tsx
import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  productId?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 200,
  productId 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current, 
        value, 
        {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }, 
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [value, size]);
  
  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} />
      {productId && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500">
            Scan to view product
          </p>
          <p className="text-xs text-gray-900 font-medium">
            ID: {productId}
          </p>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;