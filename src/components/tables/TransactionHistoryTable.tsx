// src/components/tables/TransactionHistoryTable.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

interface Transaction {
  id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  previous_quantity: number;
  current_quantity: number;
  reference: string;
  reference_type: 'purchase' | 'transfer' | 'use' | 'return' | 'adjustment';
  notes: string;
  created_by: string;
  created_at: string;
}

interface TransactionHistoryTableProps {
  productId: string;
}

const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({ productId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch transaction history
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        {
          id: 'TRX-10001',
          product_id: productId,
          type: 'in',
          quantity: 1,
          previous_quantity: 0,
          current_quantity: 1,
          reference: 'PO-5001',
          reference_type: 'purchase',
          notes: 'Initial purchase',
          created_by: 'Admin User',
          created_at: '2023-05-15T10:30:00'
        },
        {
          id: 'TRX-10045',
          product_id: productId,
          type: 'out',
          quantity: 1,
          previous_quantity: 1,
          current_quantity: 0,
          reference: 'REQ-2001',
          reference_type: 'use',
          notes: 'Assigned to IT department',
          created_by: 'John Doe',
          created_at: '2023-06-10T14:15:00'
        },
        {
          id: 'TRX-10098',
          product_id: productId,
          type: 'in',
          quantity: 1,
          previous_quantity: 0,
          current_quantity: 1,
          reference: 'RET-503',
          reference_type: 'return',
          notes: 'Returned from IT department',
          created_by: 'Jane Smith',
          created_at: '2023-12-05T09:45:00'
        }
      ];
      
      setTransactions(mockTransactions);
      setLoading(false);
    }, 800);
  }, [productId]);
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get transaction type badge
  const getTransactionTypeBadge = (type: 'in' | 'out') => {
    return type === 'in' ? (
      <Badge type="success" text="Stock In" />
    ) : (
      <Badge type="danger" text="Stock Out" />
    );
  };
  
  // Get reference type badge
  const getReferenceTypeBadge = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Badge type="primary" text="Purchase" />;
      case 'transfer':
        return <Badge type="info" text="Transfer" />;
      case 'use':
        return <Badge type="warning" text="Use" />;
      case 'return':
        return <Badge type="success" text="Return" />;
      case 'adjustment':
        return <Badge type="gray" text="Adjustment" />;
      default:
        return <Badge type="gray" text={type} />;
    }
  };

  return (
    <div>
      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No transaction history found for this product.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.notes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTransactionTypeBadge(transaction.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.previous_quantity} → {transaction.current_quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.reference}
                    </div>
                    <div className="mt-1">
                      {getReferenceTypeBadge(transaction.reference_type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.created_by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryTable;