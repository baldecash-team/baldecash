'use client';

/**
 * SelectCardsV4 - Toggle Buttons estilo iOS/Apple
 * Botones con fondo deslizante animado - muy compacto y elegante
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
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
  labelVersion = 1,
  helpVersion = 1,
}) => {
  const options = field.options || [];
  const LabelComponent = getLabel(labelVersion);
  const HelpTooltip = getHelpTooltip(helpVersion);

  const toggleContent = (
    <>
      {/* Toggle container with sliding background */}
      <div
        className={`
          inline-flex p-1 rounded-xl bg-neutral-100 border
          ${error ? 'border-red-300' : 'border-neutral-200'}
        `}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                relative px-5 py-2 text-sm font-medium rounded-lg cursor-pointer
                transition-colors duration-200 z-10
                ${isSelected ? 'text-white' : 'text-neutral-600 hover:text-neutral-800'}
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId={`toggle-bg-${field.name}`}
                  className="absolute inset-0 bg-[#4654CD] rounded-lg shadow-sm"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative">{option.label}</span>
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
        <div className="flex-1">{toggleContent}</div>
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
      {toggleContent}
    </div>
  );
};

export default SelectCardsV4;
