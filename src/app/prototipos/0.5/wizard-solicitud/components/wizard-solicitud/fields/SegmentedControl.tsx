'use client';

/**
 * SegmentedControl - Toggle buttons estilo iOS/Apple
 * Usado para campos con 2-3 opciones mutuamente excluyentes
 * Botones con fondo deslizante animado
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@nextui-org/react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
}) => {
  const showSuccess = success && !error && !!value;
  return (
    <div id={id} className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && (
          <Tooltip
            content={
              <div className="max-w-xs p-2">
                <p className="font-semibold text-neutral-800">{tooltip.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{tooltip.description}</p>
                {tooltip.recommendation && (
                  <p className="text-xs text-[#4654CD] mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {tooltip.recommendation}
                  </p>
                )}
              </div>
            }
            classNames={{
              content: 'bg-white shadow-lg border border-neutral-200',
            }}
          >
            <span className="inline-flex">
              <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] cursor-help transition-colors" />
            </span>
          </Tooltip>
        )}
      </label>

      {/* Segmented Control */}
      <div
        className={`
          flex w-full p-1 rounded-xl bg-neutral-100 border
          ${error ? 'border-red-300' : showSuccess ? 'border-green-400' : 'border-neutral-200'}
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (option.disabled || disabled) return;
                // Toggle: si ya está seleccionado, limpiar
                if (value === option.value) {
                  onChange('');
                } else {
                  onChange(option.value);
                }
              }}
              disabled={option.disabled || disabled}
              className={`
                relative flex-1 py-2.5 text-sm font-medium rounded-lg cursor-pointer
                transition-colors duration-200 z-10
                ${isSelected ? 'text-[#4654CD]' : 'text-neutral-600 hover:text-neutral-800'}
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId={`segmented-bg-${id}`}
                  className="absolute inset-0 bg-[#4654CD]/15 rounded-lg"
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

      {/* Help text */}
      {helpText && !error && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Success message */}
      {showSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Seleccionado
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default SegmentedControl;
