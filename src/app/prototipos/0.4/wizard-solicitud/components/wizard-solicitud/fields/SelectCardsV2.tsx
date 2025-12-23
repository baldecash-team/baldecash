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
  labelVersion = 1,
  helpVersion = 1,
}) => {
  const options = field.options || [];
  const hasMany = options.length > 5;
  const HelpTooltip = getHelpTooltip(helpVersion);

  const cardsContent = (
    <>
      {/* Segmented Control Container - with overflow hidden to contain elements */}
      <div
        className={`
          bg-neutral-100 p-1.5 rounded-xl border border-neutral-200 overflow-hidden
          ${error ? 'border-red-300' : ''}
        `}
      >
        {/* Grid layout: 5 per row for 5+ options, otherwise flex row */}
        <div className={`relative ${hasMany ? 'grid grid-cols-5 gap-1' : 'flex flex-wrap gap-1'}`}>
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`
                  relative ${hasMany ? '' : 'flex-1 min-w-[80px]'} py-2.5 px-3 text-sm font-medium rounded-lg
                  transition-colors duration-150 whitespace-nowrap z-10 cursor-pointer text-center
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
        <p className="text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-100 mt-2">
          {options.find(o => o.value === value)?.description}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1 mt-2">
          <span className="w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
    </>
  );

  // V5: Horizontal layout with label on left
  if (labelVersion === 5) {
    return (
      <div className="flex items-start gap-3">
        <label className="inline-flex items-center gap-2 text-sm font-medium min-w-[120px] shrink-0 leading-none pt-2 text-neutral-600">
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
        </label>
        <div className="flex-1">
          {cardsContent}
        </div>
      </div>
    );
  }

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

      {cardsContent}
    </div>
  );
};

export default SelectCardsV2;
