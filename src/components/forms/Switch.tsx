// src/components/forms/Switch.tsx
import React, { useState } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  size = 'md',
  disabled = false
}) => {
  // Get size based on prop
  const getSwitchSize = () => {
    switch (size) {
      case 'sm':
        return {
          switch: 'h-5 w-9',
          translate: 'translate-x-4',
          dot: 'h-3 w-3'
        };
      case 'md':
      default:
        return {
          switch: 'h-6 w-11',
          translate: 'translate-x-5',
          dot: 'h-4 w-4'
        };
    }
  };

  const sizeClasses = getSwitchSize();

  return (
    <HeadlessSwitch.Group>
      <div className="flex items-center">
        {label && (
          <HeadlessSwitch.Label className="mr-3 text-sm font-medium text-gray-700">
            {label}
          </HeadlessSwitch.Label>
        )}
        <HeadlessSwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            ${checked ? 'bg-indigo-600' : 'bg-gray-200'} 
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            relative inline-flex flex-shrink-0 rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
            focus:ring-indigo-500 focus:ring-offset-2 ${sizeClasses.switch}
          `}
        >
          <span
            className={`
              ${checked ? sizeClasses.translate : 'translate-x-0'} 
              pointer-events-none inline-block rounded-full bg-white shadow transform 
              ring-0 transition duration-200 ease-in-out ${sizeClasses.dot}
            `}
            style={{ margin: '2px' }}
          />
        </HeadlessSwitch>
      </div>
    </HeadlessSwitch.Group>
  );
};

export default Switch;