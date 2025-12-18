'use client';

/**
 * RadioGroupV2 - Segmented control (tabs)
 *
 * Estilo moderno con botones segmentados tipo tabs.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { RadioGroupProps } from '../../../types/fields';

export const RadioGroupV2: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  required = false,
}) => {
  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-1 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
      </label>

      {/* Segmented control */}
      <div className="inline-flex p-1 bg-neutral-100 rounded-lg">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !option.disabled && onChange(option.value)}
            disabled={option.disabled}
            className={`
              flex-1 px-4 py-2 text-sm font-medium rounded-md
              transition-all duration-200 cursor-pointer
              ${value === option.value
                ? 'bg-[#4654CD] text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
              }
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {option.label}
          </button>
        ))}
        <input
          type="hidden"
          name={name}
          value={value}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default RadioGroupV2;
