'use client';

/**
 * SelectCardsV2 - Segmented control (tabs) mejorado
 * Opciones en formato de tabs/segmentos con scroll horizontal - UI mejorado
 */

import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SelectCardsV2Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SelectCardsV2: React.FC<SelectCardsV2Props> = ({
  field,
  value,
  error,
  onChange,
  helpVersion = 1,
}) => {
  const options = field.options || [];
  const hasMany = options.length > 4;
  const HelpTooltip = getHelpTooltip(helpVersion);

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        <span>{field.label}</span>
        {field.required && <span className="text-red-500">*</span>}
        {field.helpText && (
          <HelpTooltip content={field.helpText} title={field.label} />
        )}
      </label>

      {/* Segmented Control Container - with overflow hidden to contain elements */}
      <div
        className={`
          bg-neutral-100 p-1.5 rounded-xl border border-neutral-200 overflow-hidden
          ${hasMany ? 'overflow-x-auto scrollbar-hide' : ''}
          ${error ? 'border-red-300' : ''}
        `}
      >
        <div className={`relative flex ${hasMany ? 'w-max min-w-full' : ''} gap-1`}>
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`
                  relative flex-1 min-w-[80px] py-2.5 px-4 text-sm font-medium rounded-lg
                  transition-colors duration-150 whitespace-nowrap z-10
                  ${isSelected
                    ? 'text-[#4654CD]'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200/50'
                  }
                `}
              >
                {isSelected && (
                  <motion.div
                    layoutId={`segment-${field.name}`}
                    className="absolute inset-0 bg-white rounded-lg border border-neutral-200 shadow-sm -z-10"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-1.5">
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected description if any */}
      {value && options.find(o => o.value === value)?.description && (
        <p className="text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-100">
          {options.find(o => o.value === value)?.description}
        </p>
      )}

      {/* Scroll hint for many options */}
      {hasMany && (
        <p className="text-xs text-neutral-400 text-center flex items-center justify-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-neutral-300 rounded" />
          Desliza para ver mas opciones
          <span className="inline-block w-4 h-0.5 bg-neutral-300 rounded" />
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectCardsV2;
