'use client';

/**
 * RadioGroupV3 - Cards clickeables
 *
 * Estilo visual con cards destacadas.
 * Ideal para opciones con descripción.
 */

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { RadioGroupProps } from '../../../types/fields';

export const RadioGroupV3: React.FC<RadioGroupProps> = ({
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

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !option.disabled && onChange(option.value)}
            disabled={option.disabled}
            className={`
              relative p-4 rounded-xl text-left
              transition-all duration-200 cursor-pointer
              ${value === option.value
                ? 'bg-[#4654CD] text-white shadow-md'
                : 'bg-white border-2 border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-sm'
              }
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {/* Check icon for selected */}
            {value === option.value && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="pr-8">
              <p className={`
                font-semibold text-base
                ${value === option.value ? 'text-white' : 'text-neutral-800'}
              `}>
                {option.label}
              </p>
              {option.description && (
                <p className={`
                  text-sm mt-1
                  ${value === option.value ? 'text-white/80' : 'text-neutral-500'}
                `}>
                  {option.description}
                </p>
              )}
            </div>

            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => {}}
              className="sr-only"
            />
          </button>
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

export default RadioGroupV3;
