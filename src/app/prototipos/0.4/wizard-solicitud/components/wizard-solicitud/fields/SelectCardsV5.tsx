'use client';

/**
 * SelectCardsV5 - Radio dots minimalistas inline
 * Opciones con radio visual compacto en linea horizontal
 */

import React from 'react';
import { motion } from 'framer-motion';
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
  const options = field.options || [];
  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);

  const radioContent = (
    <>
      {/* Radio group inline */}
      <div className="flex flex-wrap gap-4">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                inline-flex items-center gap-2.5 py-1.5 cursor-pointer
                transition-colors duration-200 group
              `}
            >
              {/* Radio dot */}
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${isSelected
                    ? 'border-[#4654CD] bg-[#4654CD]'
                    : 'border-neutral-300 group-hover:border-[#4654CD]/50'
                  }
                  ${error ? 'border-red-300' : ''}
                `}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-sm font-medium transition-colors
                  ${isSelected ? 'text-[#4654CD]' : 'text-neutral-600 group-hover:text-neutral-800'}
                `}
              >
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
        <div className="flex-1">{radioContent}</div>
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
      {radioContent}
    </div>
  );
};

export default SelectCardsV5;
