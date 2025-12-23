'use client';

/**
 * SelectCardsV3 - Pills/Chips compactos inline
 * Opciones en formato de pills horizontales - muy compacto
 */

import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
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
  labelVersion = 1,
  helpVersion = 1,
}) => {
  const options = field.options || [];
  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);

  const pillsContent = (
    <>
      {/* Pills container */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              whileTap={{ scale: 0.95 }}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 cursor-pointer border
                ${isSelected
                  ? 'bg-[#4654CD] text-white border-[#4654CD] shadow-md shadow-[#4654CD]/25'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#4654CD]/50 hover:bg-[#4654CD]/5'
                }
                ${error ? 'border-red-300' : ''}
              `}
            >
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center"
                >
                  <Check className="w-3.5 h-3.5" />
                </motion.span>
              )}
              {option.label}
            </motion.button>
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
        <div className="flex-1">{pillsContent}</div>
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
      {pillsContent}
    </div>
  );
};

export default SelectCardsV3;
