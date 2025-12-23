'use client';

/**
 * SelectCardsV4 - Cards con iconos grandes
 * Cards prominentes con iconos destacados
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SelectCardsV4Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SelectCardsV4: React.FC<SelectCardsV4Props> = ({
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
    return Icon ? <Icon className="w-8 h-8" /> : null;
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        <span>{field.label}</span>
        {field.required && <span className="text-red-500">*</span>}
        {field.helpText && (
          <HelpTooltip content={field.helpText} title={field.label} />
        )}
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {field.options?.map((option) => {
          const isSelected = value === option.value;
          return (
            <Card
              key={option.value}
              isPressable
              onPress={() => onChange(option.value)}
              className={`
                border-2 transition-all cursor-pointer relative
                ${isSelected
                  ? 'border-[#4654CD] bg-[#4654CD]/5 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
                }
              `}
            >
              <CardBody className="p-4 flex flex-col items-center text-center gap-3">
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#4654CD] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center
                  ${isSelected ? 'bg-[#4654CD] text-white' : 'bg-neutral-100 text-neutral-500'}
                `}>
                  {getIcon(option.icon) || <div className="w-8 h-8 bg-neutral-200 rounded" />}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${isSelected ? 'text-[#4654CD]' : 'text-neutral-800'}`}>
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-xs text-neutral-500 mt-0.5">{option.description}</p>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SelectCardsV4;
