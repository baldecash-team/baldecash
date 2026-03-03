'use client';

/**
 * RadioGroup - Estilo 0.3 Cards clickeables
 * Cards con selección visual destacada
 */

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
}) => {
  const showError = !!error;
  const showSuccess = success && !error && !!value;

  return (
    <div id={id} className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>

      {/* Cards grid */}
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (option.disabled || disabled) return;
              // Toggle: si ya está seleccionado, limpiar
              if (value === option.value) {
                onChange('');
              } else {
                onChange(option.value);
              }
            }}
            disabled={option.disabled || disabled}
            className={`
              relative w-full p-4 rounded-xl text-left
              transition-all duration-200 cursor-pointer border-2
              ${value === option.value
                ? 'bg-[rgba(var(--color-primary-rgb),0.05)] border-[var(--color-primary)]'
                : 'bg-white border-neutral-200 hover:border-[rgba(var(--color-primary-rgb),0.5)] hover:shadow-sm'
              }
              ${(option.disabled || disabled) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {/* Content */}
            <div>
              <p className={`
                font-medium text-base
                ${value === option.value ? 'text-[var(--color-primary)]' : 'text-neutral-800'}
              `}>
                {option.label}
              </p>
              {option.description && (
                <p className={`
                  text-sm mt-0.5
                  ${value === option.value ? 'text-[rgba(var(--color-primary-rgb),0.7)]' : 'text-neutral-500'}
                `}>
                  {option.description}
                </p>
              )}
            </div>

            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => {}}
              className="sr-only"
            />
          </button>
        ))}
      </div>

      {/* Success message */}
      {showSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Seleccionado
        </p>
      )}

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

export default RadioGroup;
