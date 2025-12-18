'use client';

/**
 * RadioGroupV1 - Radio buttons tradicionales
 *
 * Estilo clásico con radio buttons circulares.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { RadioGroupProps } from '../../../types/fields';

export const RadioGroupV1: React.FC<RadioGroupProps> = ({
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

      {/* Radio options */}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-3 p-3 rounded-lg cursor-pointer
              transition-all duration-200
              ${value === option.value
                ? 'bg-[#4654CD]/5 border-2 border-[#4654CD]'
                : 'bg-white border-2 border-neutral-200 hover:border-neutral-300'
              }
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {/* Custom radio */}
            <div className="relative mt-0.5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => !option.disabled && onChange(option.value)}
                disabled={option.disabled}
                className="sr-only"
              />
              <div
                className={`
                  w-5 h-5 rounded-full border-2 transition-all duration-200
                  flex items-center justify-center
                  ${value === option.value
                    ? 'border-[#4654CD] bg-[#4654CD]'
                    : 'border-neutral-300 bg-white'
                  }
                `}
              >
                {value === option.value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className={`
                font-medium
                ${value === option.value ? 'text-[#4654CD]' : 'text-neutral-800'}
              `}>
                {option.label}
              </p>
              {option.description && (
                <p className="text-sm text-neutral-500 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
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

export default RadioGroupV1;
