'use client';

/**
 * SelectCardsV6 - Grid de opciones compacto
 * Grid cuadrado minimalista
 */

import React from 'react';
import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface SelectCardsV6Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SelectCardsV6: React.FC<SelectCardsV6Props> = ({
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
    return Icon ? <Icon className="w-6 h-6" /> : null;
  };

  const optionsCount = field.options?.length || 0;
  const gridCols = optionsCount <= 2 ? 'grid-cols-2' : optionsCount <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-6';

  const gridContent = (
    <div className={`grid ${gridCols} gap-2`}>
        {field.options?.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                aspect-square flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all relative
                ${isSelected
                  ? 'bg-[#4654CD] text-white shadow-lg shadow-[#4654CD]/20'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[#4654CD]" />
                </div>
              )}
              {option.icon && getIcon(option.icon)}
              <span className="text-xs font-medium text-center leading-tight">{option.label}</span>
            </button>
          );
        })}
      </div>
  );

  // V5: Layout horizontal con label a la izquierda
  if (labelVersion === 5) {
    return (
      <div className="flex items-start gap-3">
        <LabelComponent field={field} hasError={!!error} />
        <div className="flex-1">
          {gridContent}
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
        {gridContent}
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
      {gridContent}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SelectCardsV6;
