'use client';

/**
 * TextInputV3 - Fondo filled sin bordes (moderno)
 *
 * Estilo con fondo sólido y sin bordes visibles.
 * Look moderno y suave.
 */

import React, { useState } from 'react';
import { Check, AlertCircle, HelpCircle } from 'lucide-react';
import type { BaseInputProps } from '../../../types/fields';

interface TextInputV3Props extends BaseInputProps {
  type?: 'text' | 'email' | 'tel' | 'number';
}

export const TextInputV3: React.FC<TextInputV3Props> = ({
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

  const getBackgroundColor = () => {
    if (error) return 'bg-[#ef4444]/10';
    if (isValid && !error) return 'bg-[#22c55e]/10';
    if (isFocused) return 'bg-[#4654CD]/10';
    return 'bg-neutral-100';
  };

  const getRingColor = () => {
    if (error) return 'ring-[#ef4444]';
    if (isValid && !error) return 'ring-[#22c55e]';
    if (isFocused) return 'ring-[#4654CD]';
    return 'ring-transparent';
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

      {/* Filled input */}
      <div
        className={`
          flex items-center gap-2 px-4 py-3 rounded-xl
          transition-all duration-200
          ring-2 ${getRingColor()}
          ${getBackgroundColor()}
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

export default TextInputV3;
