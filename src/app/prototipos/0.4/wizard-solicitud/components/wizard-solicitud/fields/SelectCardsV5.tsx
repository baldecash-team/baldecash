'use client';

/**
 * SelectCardsV5 - Lista con checkmarks
 * Lista vertical con checkmarks al seleccionar
 */

import React from 'react';
import { Check, Circle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface SelectCardsV5Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SelectCardsV5: React.FC<SelectCardsV5Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  helpVersion = 1,
}) => {
  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const cardsContent = (
    <div className="space-y-2">
        {field.options?.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? 'border-[#4654CD] bg-[#4654CD]/5'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }
              `}
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                ${isSelected ? 'bg-[#4654CD] text-white' : 'border-2 border-neutral-300'}
              `}>
                {isSelected ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4 text-transparent" />}
              </div>

              {option.icon && (
                <div className={`text-neutral-500 ${isSelected ? 'text-[#4654CD]' : ''}`}>
                  {getIcon(option.icon)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${isSelected ? 'text-[#4654CD]' : 'text-neutral-800'}`}>
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-xs text-neutral-500">{option.description}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
  );

  // V5/V6: Layout horizontal con label a la izquierda
  if (labelVersion === 5 || labelVersion === 6) {
    return (
      <div className="flex items-start gap-3">
        <LabelComponent field={field} hasError={!!error} />
        <div className="flex-1">
          {cardsContent}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  // V3: Minimal label
  if (labelVersion === 3) {
    return (
      <div className="space-y-2">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {cardsContent}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Default: Label arriba
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <LabelComponent field={field} hasError={!!error} />
        {field.helpText && <HelpTooltip content={field.helpText} title={field.label} />}
      </div>
      {cardsContent}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SelectCardsV5;
