// src/components/ui/IllustrationSVG.tsx
import React from 'react';

interface IllustrationSVGProps {
  className?: string;
}

const IllustrationSVG: React.FC<IllustrationSVGProps> = ({ className = 'w-full h-full' }) => {
  return (
    <svg className={className} viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="800" height="600" fill="url(#grad1)" />
      
      {/* Abstract Design Elements */}
      <circle cx="400" cy="300" r="150" fill="#EEF2FF" fillOpacity="0.1" />
      <circle cx="400" cy="300" r="100" fill="#EEF2FF" fillOpacity="0.2" />
      <circle cx="400" cy="300" r="50" fill="#EEF2FF" fillOpacity="0.4" />
      
      {/* Design Elements */}
      <g transform="translate(200, 200)">
        <rect x="0" y="0" width="30" height="200" rx="15" fill="#EEF2FF" fillOpacity="0.3" />
        <rect x="50" y="50" width="30" height="150" rx="15" fill="#EEF2FF" fillOpacity="0.3" />
        <rect x="100" y="100" width="30" height="100" rx="15" fill="#EEF2FF" fillOpacity="0.3" />
        <rect x="150" y="150" width="30" height="50" rx="15" fill="#EEF2FF" fillOpacity="0.3" />
      </g>
      
      {/* Barcode Graphics */}
      <g transform="translate(400, 200)">
        <rect x="0" y="0" width="10" height="100" fill="white" fillOpacity="0.7" />
        <rect x="20" y="0" width="5" height="100" fill="white" fillOpacity="0.7" />
        <rect x="35" y="0" width="15" height="100" fill="white" fillOpacity="0.7" />
        <rect x="60" y="0" width="2" height="100" fill="white" fillOpacity="0.7" />
        <rect x="70" y="0" width="10" height="100" fill="white" fillOpacity="0.7" />
        <rect x="90" y="0" width="20" height="100" fill="white" fillOpacity="0.7" />
        <rect x="120" y="0" width="5" height="100" fill="white" fillOpacity="0.7" />
        <rect x="135" y="0" width="10" height="100" fill="white" fillOpacity="0.7" />
        <rect x="155" y="0" width="15" height="100" fill="white" fillOpacity="0.7" />
      </g>
      
      {/* QR Code-like Element */}
      <g transform="translate(450, 350)">
        <rect x="0" y="0" width="100" height="100" fill="white" fillOpacity="0.4" />
        <g fill="white" fillOpacity="0.9">
          <rect x="10" y="10" width="20" height="20" />
          <rect x="70" y="10" width="20" height="20" />
          <rect x="10" y="70" width="20" height="20" />
          
          <rect x="40" y="10" width="10" height="10" />
          <rect x="40" y="30" width="10" height="10" />
          <rect x="50" y="40" width="10" height="10" />
          <rect x="70" y="40" width="10" height="10" />
          <rect x="40" y="50" width="10" height="10" />
          <rect x="60" y="50" width="10" height="10" />
          <rect x="40" y="70" width="10" height="10" />
          <rect x="50" y="80" width="10" height="10" />
          <rect x="70" y="70" width="10" height="10" />
        </g>
      </g>
    </svg>
  );
};

export default IllustrationSVG;