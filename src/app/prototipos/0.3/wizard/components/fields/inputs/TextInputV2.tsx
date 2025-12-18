'use client';

/**
 * TextInputV2 - Línea inferior (Material Design)
 *
 * Estilo minimalista con solo borde inferior.
 * Inspirado en Material Design.
 */

import React, { useState } from 'react';
import { Check, AlertCircle, HelpCircle } from 'lucide-react';
import type { BaseInputProps } from '../../../types/fields';

interface TextInputV2Props extends BaseInputProps {
  type?: 'text' | 'email' | 'tel' | 'number';
}

export const TextInputV2: React.FC<TextInputV2Props> = ({
  id,
  name,
  label,
  placeholder,
  helpText,
  required = false,
  error,
  isValid,
  value,
  onChange,
  onBlur,
  disabled = false,
  maxLength,
  type = 'text',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputMode = () => {
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
    if (error) return 'border-[#ef4444]';
    if (isValid && !error) return 'border-[#22c55e]';
    if (isFocused) return 'border-[#4654CD]';
    return 'border-neutral-300';
  };

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label htmlFor={id} className="flex items-center gap-1 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {helpText && (
          <button
            type="button"
            className="text-neutral-400 hover:text-[#4654CD] transition-colors cursor-pointer"
            title={helpText}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </label>

      {/* Input with underline style */}
      <div className="relative">
        <div
          className={`
            flex items-center gap-2 py-2 px-1
            border-b-2 transition-all duration-200
            ${getBorderColor()}
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          <input
            id={id}
            name={name}
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
          />

          {/* Status icons */}
          {isValid && !error && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
          {error && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
        </div>

        {/* Animated underline */}
        <div
          className={`
            absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#4654CD]
            transition-all duration-300 ease-out
            ${isFocused && !error ? 'w-full' : 'w-0'}
          `}
        />
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

export default TextInputV2;
