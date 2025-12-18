'use client';

/**
 * CheckboxV1 - Checkbox estándar con colores de marca
 *
 * Checkbox custom con branding BaldeCash.
 */

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { CheckboxProps } from '../../../types/fields';

export const CheckboxV1: React.FC<CheckboxProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  error,
}) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className={`
          flex items-start gap-3 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Custom checkbox */}
        <div className="relative mt-0.5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => !disabled && onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`
              w-5 h-5 rounded-md border-2 transition-all duration-200
              flex items-center justify-center
              ${checked
                ? 'border-[#4654CD] bg-[#4654CD]'
                : error
                  ? 'border-[#ef4444] bg-white'
                  : 'border-neutral-300 bg-white hover:border-neutral-400'
              }
            `}
          >
            {checked && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-800">
            {label}
          </p>
          {description && (
            <p className="text-sm text-neutral-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </label>

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1 ml-8">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default CheckboxV1;
