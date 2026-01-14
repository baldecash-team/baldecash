'use client';

/**
 * TextArea - Estilo 0.3 con bordes completos
 * Label arriba, textarea con bordes redondeados
 */

import React, { useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import { Check, AlertCircle, Info } from 'lucide-react';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const showError = !!error;
  const showSuccess = success && !error && value;

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444]';
    if (showSuccess) return 'border-[#22c55e]';
    if (isFocused) return 'border-[#4654CD]';
    return 'border-neutral-300';
  };

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
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

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Textarea */}
      <div
        className={`
          relative rounded-lg border-2 transition-all duration-200 bg-white overflow-hidden
          ${getBorderColor()}
          ${disabled ? 'opacity-50 bg-neutral-50' : ''}
        `}
      >
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className={`
            w-full p-3 bg-transparent outline-none text-base text-neutral-800
            placeholder:text-neutral-400 resize-none
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            // Override browser autofill background
            WebkitBoxShadow: '0 0 0 1000px white inset',
            WebkitTextFillColor: '#262626',
          }}
        />

        {/* Status icons */}
        <div className="absolute top-3 right-3">
          {showSuccess && <Check className="w-5 h-5 text-[#22c55e]" />}
          {showError && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
        </div>
      </div>

      {/* Character counter */}
      {maxLength && (
        <p className="text-xs text-neutral-400 text-right">
          {value.length}/{maxLength}
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

export default TextArea;
