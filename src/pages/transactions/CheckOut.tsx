// src/pages/transactions/CheckOut.tsx - Updated
import React from 'react';
import { ArrowRightCircle, ArrowLeft, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';

const CheckOut: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Custom Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/transactions')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ArrowRightCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Check Out Assets
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Issue available assets to staff members
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/scanner?type=check_out')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <ScanLine className="h-4 w-4 mr-2" />
                Use Scanner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <ArrowRightCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Check Out Guidelines</h3>
              <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                <ul className="list-disc list-inside space-y-1">
                  <li>Only <strong>"Available"</strong> assets can be checked out</li>
                  <li>Specify the person receiving the asset</li>
                  <li>Set the location where asset will be used</li>
                  <li>Record condition before checkout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionForm 
        mode="create" 
        defaultTransactionType="check_out"
        hideTransactionTypeSelector={true}
      />
    </div>
  );
};

export default CheckOut;