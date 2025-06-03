// src/components/forms/Checkbox.tsx
import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helpText?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, checked, onChange, error, helpText, className, ...props }, ref) => {
    return (
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className={`
              h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded
              ${error ? 'border-red-300' : ''}
              ${className || ''}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-description` : undefined}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={id} className="font-medium text-gray-700">
            {label}
          </label>
          
          {error && (
            <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
              {error}
            </p>
          )}
          {helpText && !error && (
            <p className="mt-1 text-sm text-gray-500" id={`${id}-description`}>
              {helpText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;