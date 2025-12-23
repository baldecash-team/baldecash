'use client';

/**
 * SelectCardsV6 - Button Group compacto con bordes unidos
 * Botones pegados estilo button group - muy compacto
 */

import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const options = field.options || [];
  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);

  const buttonGroupContent = (
    <>
      {/* Button group container */}
      <div
        className={`
          inline-flex rounded-lg overflow-hidden border
          ${error ? 'border-red-300' : 'border-neutral-200'}
        `}
      >
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const isFirst = index === 0;
          const isLast = index === options.length - 1;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                relative px-5 py-2.5 text-sm font-medium cursor-pointer
                transition-all duration-200
                ${!isFirst ? 'border-l border-neutral-200' : ''}
                ${isSelected
                  ? 'bg-[#4654CD] text-white z-10'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }
                ${isFirst ? 'rounded-l-lg' : ''}
                ${isLast ? 'rounded-r-lg' : ''}
              `}
            >
              <span className="inline-flex items-center gap-1.5">
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </motion.span>
                )}
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
    </>
  );

  // V5: Horizontal layout
  if (labelVersion === 5) {
    return (
      <div className="flex items-start gap-3">
        <LabelComponent field={field} hasError={!!error} />
        <div className="flex-1">{buttonGroupContent}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <LabelComponent field={field} hasError={!!error} />
        {field.helpText && <HelpTooltip content={field.helpText} title={field.label} />}
      </div>
      {buttonGroupContent}
    </div>
  );
};

export default SelectCardsV6;
