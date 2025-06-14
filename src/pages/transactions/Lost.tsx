// src/pages/transactions/Lost.tsx - Updated
import React from 'react';
import { AlertTriangle, ArrowLeft, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';

const Lost: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Custom Header untuk Lost */}
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
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Report Lost Assets
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Record assets that are lost, missing, or stolen
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/scanner?type=lost')}
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Lost Asset Reporting Guidelines</h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-400">
                <ul className="list-disc list-inside space-y-1">
                  <li>Select assets that are confirmed lost, missing, or stolen</li>
                  <li><strong>Detailed explanation required:</strong> Describe circumstances of loss in notes</li>
                  <li>Identify the last person responsible for the asset</li>
                  <li>Record the last known location where asset was seen</li>
                  <li>Include date and time when loss was discovered</li>
                  <li>Asset status will be automatically updated to "Lost"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Form */}
      <TransactionForm 
        mode="create" 
        defaultTransactionType="lost"
        hideTransactionTypeSelector={true}
        requiredNotes={true}
      />
    </div>
  );
};

export default Lost;