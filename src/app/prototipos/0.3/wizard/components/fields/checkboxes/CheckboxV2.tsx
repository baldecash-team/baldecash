'use client';

/**
 * CheckboxV2 - Checkbox custom con branding destacado
 *
 * Versión más visual con fondo y borde de color de marca.
 * Toda la fila es clickeable.
 */

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { CheckboxProps } from '../../../types/fields';

export const CheckboxV2: React.FC<CheckboxProps> = ({
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
          flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer
          ${checked
            ? 'border-[#4654CD] bg-[#4654CD]/5'
            : error
              ? 'border-[#ef4444] bg-[#ef4444]/5'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Custom checkbox */}
        <div className="relative mt-0.5 flex-shrink-0">
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
                  : 'border-neutral-300 bg-white'
              }
            `}
          >
            {checked && (
              <Check className="w-3.5 h-3.5 text-white transition-opacity" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${checked ? 'text-[#4654CD]' : 'text-neutral-800'}`}>
            {label}
          </p>
          {description && (
            <p className="text-sm text-neutral-500 mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Selected indicator */}
        {checked && (
          <div className="flex-shrink-0">
            <Check className="w-5 h-5 text-[#4654CD]" />
          </div>
        )}
      </label>

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1 ml-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default CheckboxV2;
