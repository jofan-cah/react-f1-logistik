
// src/components/ui/PageLoadingSpinner.tsx
import React from 'react';

interface PageLoadingSpinnerProps {
  label?: string;
}

const PageLoadingSpinner: React.FC<PageLoadingSpinnerProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <div className="w-12 h-12 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">{label}</p>
    </div>
  );
};

export default PageLoadingSpinner;