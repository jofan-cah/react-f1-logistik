// src/components/forms/DatePickerInput.tsx
import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface DatePickerInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}

const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  ({ label, error, required, helpText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          type="date"
          className={`
            block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
            ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${className || ''}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-description` : undefined}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="mt-2 text-sm text-gray-500" id={`${props.id}-description`}>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

DatePickerInput.displayName = 'DatePickerInput';

export default DatePickerInput;