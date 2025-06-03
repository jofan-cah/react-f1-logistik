// src/components/tables/RecentTransactionsTable.tsx
import React from 'react';

interface Transaction {
  id: number;
  type: string;
  reference_no: string;
  first_person: string;
  second_person: string;
  location: string;
  date: string;
  status: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
  }>;
}

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'check_out':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'check_in':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'maintenance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'repair':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No recent transactions found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Transaction
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Items
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.reference_no}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {transaction.first_person} → {transaction.second_person}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-400">
                    {transaction.location}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                  {transaction.type.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-900 dark:text-white">
                  {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                </div>
                {transaction.items.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-300 truncate max-w-32">
                    {transaction.items[0].product_name}
                    {transaction.items.length > 1 && ` +${transaction.items.length - 1} more`}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                {formatDate(transaction.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactionsTable;
