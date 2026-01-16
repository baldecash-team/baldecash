'use client';

/**
 * TextInput - Estilo 0.3 con bordes completos
 * Label arriba, input con bordes redondeados
 */

import React, { useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import { Check, AlertCircle, Info } from 'lucide-react';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date';
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  inputMode?: 'text' | 'tel' | 'numeric' | 'email' | 'decimal' | 'search' | 'url' | 'none';
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  maxLength,
  inputMode: inputModeProp,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const showError = !!error;
  const showSuccess = success && !error && value;

  const getInputMode = () => {
    // Si se pasa inputMode como prop, usarlo
    if (inputModeProp) return inputModeProp;
    // Si no, inferir del type
    switch (type) {
      case 'tel':
        return 'tel';
      case 'number':
        return 'numeric';
      case 'email':
        return 'email';
      default:
        return 'text';
    }
  };

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444]';
    if (showSuccess) return 'border-[#22c55e]';
    if (isFocused) return 'border-[#4654CD]';
    return 'border-neutral-300';
  };

  return (
    <div id={id} className="space-y-1.5">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && (
          <Tooltip
            trigger="press"
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

      {/* Input */}
      <div
        className={`
          flex items-center gap-2 h-11 px-3
          rounded-lg border-2 transition-all duration-200 bg-white
          ${getBorderColor()}
          ${disabled ? 'opacity-50 bg-neutral-50' : ''}
        `}
      >
        <input
          name={id}
          type={type}
          inputMode={getInputMode()}
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
          className={`
            flex-1 bg-transparent outline-none text-base text-neutral-800
            placeholder:text-neutral-400
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            // Override browser autofill background
            WebkitBoxShadow: '0 0 0 1000px white inset',
            WebkitTextFillColor: '#262626',
          }}
        />

        {/* Status icons */}
        {showSuccess && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
        {showError && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
      </div>

      {/* Error message & Character counter - same line */}
      {(error || maxLength) && (
        <div className="flex items-center justify-between gap-2">
          {error ? (
            <p className="text-sm text-[#ef4444] flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          ) : (
            <span />
          )}
          {maxLength && (
            <p className="text-xs text-neutral-400 flex-shrink-0">
              {value.length}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TextInput;
