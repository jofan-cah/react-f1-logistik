// src/components/transactions/TransactionFormWrapper.tsx
import React from 'react';
import TransactionForm from '../../pages/transactions/TransactionForm';

interface TransactionFormWrapperProps {
  mode: 'create' | 'edit';
  defaultTransactionType?: string;
  hideTransactionTypeSelector?: boolean;
  requiredNotes?: boolean;
}

const TransactionFormWrapper: React.FC<TransactionFormWrapperProps> = (props) => {
  // This wrapper will pass enhanced props to existing TransactionForm
  // You'll need to modify TransactionForm to accept these new props
  return <TransactionForm {...props} />;
};

export default TransactionFormWrapper;