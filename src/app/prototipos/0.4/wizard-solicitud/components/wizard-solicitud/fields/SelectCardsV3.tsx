'use client';

/**
 * SelectCardsV3 - Cards clickeables (C1.13 = V3)
 * Para opciones mutuamente excluyentes cuando son 6 o menos
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SelectCardsV3Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SelectCardsV3: React.FC<SelectCardsV3Props> = ({
  field,
  value,
  error,
  onChange,
  helpVersion = 1,
}) => {
  const HelpTooltip = getHelpTooltip(helpVersion);
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        <span>{field.label}</span>
        {field.required && <span className="text-red-500">*</span>}
        {field.helpText && (
          <HelpTooltip content={field.helpText} title={field.label} />
        )}
      </label>

      {/* Cards grid */}
      <div className={`grid gap-2 ${
        (field.options?.length || 0) <= 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-3'
      }`}>
        {field.options?.map((option) => {
          const isSelected = value === option.value;

          return (
            <Card
              key={option.value}
              isPressable
              onPress={() => onChange(option.value)}
              className={`
                border-2 transition-all cursor-pointer
                ${isSelected
                  ? 'border-[#4654CD] bg-[#4654CD]/5 shadow-sm'
                  : 'border-neutral-200 hover:border-neutral-300'
                }
              `}
            >
              <CardBody className="p-3 flex flex-row items-center gap-3">
                {/* Icon */}
                {option.icon && (
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isSelected ? 'bg-[#4654CD] text-white' : 'bg-neutral-100 text-neutral-500'}
                  `}>
                    {getIcon(option.icon)}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${isSelected ? 'text-[#4654CD]' : 'text-neutral-800'}`}>
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-xs text-neutral-500 truncate">
                      {option.description}
                    </p>
                  )}
                </div>

                {/* Check */}
                {isSelected && (
                  <div className="w-5 h-5 bg-[#4654CD] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default SelectCardsV3;
