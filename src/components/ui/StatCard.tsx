// src/components/ui/StatCard.tsx
import React from 'react';
import { BoxIcon, CategoryIcon, TransactionIcon, AlertIcon } from './Icons';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => {
  // Map icon string to component
  const renderIcon = () => {
    switch (icon) {
      case 'BoxIcon':
        return <BoxIcon className="h-6 w-6" />;
      case 'CategoryIcon':
        return <CategoryIcon className="h-6 w-6" />;
      case 'TransactionIcon':
        return <TransactionIcon className="h-6 w-6" />;
      case 'AlertIcon':
        return <AlertIcon className="h-6 w-6" />;
      default:
        return <BoxIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${
          isPositive 
            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
        }`}>
          {renderIcon()}
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </p>
            <p className={`ml-2 text-sm font-medium ${
              isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {change}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;