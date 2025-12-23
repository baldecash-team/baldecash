'use client';

/**
 * SelectCardsV1 - Radio buttons tradicionales mejorados
 * Opciones con radio buttons en cards bien contenidas y UI mejorado
 */

import React from 'react';
import { Check, Circle } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SelectCardsV1Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SelectCardsV1: React.FC<SelectCardsV1Props> = ({
  field,
  value,
  error,
  onChange,
  helpVersion = 1,
}) => {
  const options = field.options || [];
  const HelpTooltip = getHelpTooltip(helpVersion);

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
        <span>{field.label}</span>
        {field.required ? (
          <span className="text-[10px] px-1.5 py-0.5 bg-[#4654CD]/10 text-[#4654CD] rounded font-medium leading-none">
            Requerido
          </span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-400 rounded font-medium leading-none">
            Opcional
          </span>
        )}
        {field.helpText && (
          <HelpTooltip content={field.helpText} title={field.label} />
        )}
      </label>

      {/* Radio Group - Custom implementation for better UI */}
      <div className="space-y-2" role="radiogroup" aria-labelledby={`${field.name}-label`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                border bg-neutral-50 min-h-[40px]
                ${isSelected
                  ? 'border-[#4654CD] bg-[#4654CD]/5 ring-1 ring-[#4654CD]/20'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                }
                ${error ? 'border-red-300' : ''}
              `}
            >
              {/* Radio indicator */}
              <div className={`
                w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200
                ${isSelected
                  ? 'bg-[#4654CD]'
                  : 'border-2 border-neutral-300'
                }
              `}>
                {isSelected ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <Circle className="w-3 h-3 text-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className={`
                  block font-medium transition-colors
                  ${isSelected ? 'text-[#4654CD]' : 'text-neutral-800'}
                `}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="block text-sm text-neutral-500 mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>

            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectCardsV1;
