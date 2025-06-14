// src/pages/transactions/CheckIn.tsx - Updated
import React from 'react';
import { ArrowLeftCircle, ArrowLeft, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';

const CheckIn: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Custom Header untuk Check In */}
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
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ArrowLeftCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Check In Assets
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Return checked out assets to inventory
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/scanner?type=check_in')}
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
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-start">
            <ArrowLeftCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Check In Guidelines</h3>
              <div className="mt-1 text-sm text-green-700 dark:text-green-400">
                <ul className="list-disc list-inside space-y-1">
                  <li>Only <strong>"Checked Out"</strong> or <strong>"In Use"</strong> assets can be returned</li>
                  <li>Inspect and record current condition of returned items</li>
                  <li>Note any damage or issues found during return</li>
                  <li>Confirm return location and person responsible</li>
                  <li>Update asset status back to "Available" after successful check-in</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Form */}
      <TransactionForm 
        mode="create" 
        defaultTransactionType="check_in"
        hideTransactionTypeSelector={true}
      />
    </div>
  );
};

export default CheckIn;