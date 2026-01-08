'use client';

/**
 * RadioGroup - Estilo 0.3 Cards clickeables
 * Cards con selección visual destacada
 */

import React from 'react';
import { Tooltip } from '@nextui-org/react';
import { AlertCircle, Info } from 'lucide-react';

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
  helpText,
  tooltip,
  disabled = false,
  required = true,
}) => {
  const showError = !!error;

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && (
          <Tooltip
            content={
              <div className="max-w-xs p-2">
                <p className="font-semibold text-neutral-800">{tooltip.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{tooltip.description}</p>
                {tooltip.recommendation && (
                  <p className="text-xs text-[#4654CD] mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {tooltip.recommendation}
                  </p>
                )}
              </div>
            }
            classNames={{
              content: 'bg-white shadow-lg border border-neutral-200',
            }}
          >
            <span className="inline-flex">
              <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] cursor-help transition-colors" />
            </span>
          </Tooltip>
        )}
      </label>

      {/* Cards grid */}
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !option.disabled && !disabled && onChange(option.value)}
            disabled={option.disabled || disabled}
            className={`
              relative w-full p-4 rounded-xl text-left
              transition-all duration-200 cursor-pointer
              ${value === option.value
                ? 'bg-[#4654CD] text-white shadow-md'
                : 'bg-white border-2 border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-sm'
              }
              ${(option.disabled || disabled) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {/* Radio circle */}
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  transition-all duration-200
                  ${value === option.value
                    ? 'border-white bg-white'
                    : 'border-neutral-300'
                  }
                `}
              >
                {value === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4654CD]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={`
                  font-medium text-base
                  ${value === option.value ? 'text-white' : 'text-neutral-800'}
                `}>
                  {option.label}
                </p>
                {option.description && (
                  <p className={`
                    text-sm mt-0.5
                    ${value === option.value ? 'text-white/80' : 'text-neutral-500'}
                  `}>
                    {option.description}
                  </p>
                )}
              </div>
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
