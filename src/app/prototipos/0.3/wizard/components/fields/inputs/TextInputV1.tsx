'use client';

/**
 * TextInputV1 - Bordes completos (clásico)
 *
 * Estilo tradicional con bordes visibles en todos los lados.
 * Feedback visual con colores de marca.
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Check, AlertCircle, HelpCircle } from 'lucide-react';
import type { BaseInputProps } from '../../../types/fields';

interface TextInputV1Props extends BaseInputProps {
  type?: 'text' | 'email' | 'tel' | 'number';
}

export const TextInputV1: React.FC<TextInputV1Props> = ({
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

      {/* Input */}
      <div className="relative">
        <Input
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
          classNames={{
            base: 'w-full',
            input: 'text-base text-neutral-800',
            inputWrapper: `
              border-2 rounded-lg transition-all duration-200 bg-white
              ${error ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
              ${isValid && !error ? 'border-[#22c55e]' : ''}
              ${isFocused && !error && !isValid ? 'border-[#4654CD]' : ''}
              ${!isFocused && !error && !isValid ? 'border-neutral-300 hover:border-neutral-400' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `,
          }}
          endContent={
            <div className="flex items-center gap-2">
              {isValid && !error && <Check className="w-5 h-5 text-[#22c55e]" />}
              {error && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
            </div>
          }
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

export default TextInputV1;
