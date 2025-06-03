// src/components/ui/Logo.tsx
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md',
  variant = 'default'
}) => {
  // Map size to pixel dimensions
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };
  
  // Text color based on variant
  const textColor = variant === 'default' ? 'text-white' : 'text-white';
  
  return (
    <div className="flex items-center">
      {/* Icon part */}
      <div className={`${textColor} ${sizeMap[size]}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 5h16v14H4V5zm1 2v10h14V7H5zm2 2h10v2H7V9zm0 4h10v2H7v-2z" />
          <path d="M9 14h6v2H9z" />
          <rect x="8" y="11" width="8" height="1" />
        </svg>
      </div>
      
      {/* Text part - only show for md and larger */}
      {size !== 'sm' && (
        <div className={`ml-2 ${textColor} font-bold`}>
          <div className={size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-xl' : 'text-lg'}>
            ISP BARCODE
          </div>
          {(size === 'lg' || size === 'xl') && (
            <div className="text-xs uppercase tracking-widest mt-0.5">
              Inventory System
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;