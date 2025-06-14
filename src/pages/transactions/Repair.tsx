// src/pages/transactions/Repair.tsx - Updated
import React from 'react';
import { Wrench, ArrowLeft, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';

const Repair: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Custom Header untuk Repair */}
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
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Repair & Maintenance
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Report assets needing repair or maintenance work
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/scanner?type=repair')}
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
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
          <div className="flex items-start">
            <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300">Repair & Maintenance Guidelines</h3>
              <div className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                <ul className="list-disc list-inside space-y-1">
                  <li>Select assets requiring repair, maintenance, or servicing</li>
                  <li><strong>Detailed issue description required:</strong> Explain symptoms and problems</li>
                  <li>Record current condition before sending for repair</li>
                  <li>Specify repair location, workshop, or service center</li>
                  <li>Include urgency level and expected completion date if known</li>
                  <li>Asset status will be updated to "Repair" or "Under Maintenance"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Form */}
      <TransactionForm 
        mode="create" 
        defaultTransactionType="repair"
        hideTransactionTypeSelector={true}
        requiredNotes={true}
      />
    </div>
  );
};

export default Repair;