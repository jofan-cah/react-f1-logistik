
// src/components/tables/LowStockTable.tsx
import React from 'react';

interface LowStockItem {
  product_id: string;
  name: string;
  current_stock: number;
  min_stock: number;
  category: string;
}

interface LowStockTableProps {
  lowStockItems: LowStockItem[];
}

const LowStockTable: React.FC<LowStockTableProps> = ({ lowStockItems }) => {
  const getStockStatusColor = (current: number, min: number) => {
    const percentage = (current / min) * 100;
    if (percentage <= 25) return 'text-red-600 dark:text-red-400';
    if (percentage <= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getStockLevel = (current: number, min: number) => {
    const percentage = (current / min) * 100;
    if (percentage <= 25) return 'Critical';
    if (percentage <= 50) return 'Very Low';
    return 'Low';
  };

  if (!lowStockItems || lowStockItems.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 dark:text-green-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">All items are well stocked!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Current Stock
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Min Stock
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {lowStockItems.map((item) => (
            <tr key={item.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {item.product_id}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-400">
                    {item.category}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`text-sm font-medium ${getStockStatusColor(item.current_stock, item.min_stock)}`}>
                  {item.current_stock}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                {item.min_stock}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  getStockLevel(item.current_stock, item.min_stock) === 'Critical' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    : getStockLevel(item.current_stock, item.min_stock) === 'Very Low'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                }`}>
                  {getStockLevel(item.current_stock, item.min_stock)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LowStockTable;