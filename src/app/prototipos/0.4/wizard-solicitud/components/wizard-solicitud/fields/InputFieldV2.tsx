'use client';

/**
 * InputFieldV2 - Material Design con label flotante
 * Campo con linea inferior y label que flota al escribir
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface InputFieldV2Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export const InputFieldV2: React.FC<InputFieldV2Props> = ({
  field,
  value,
  error,
  onChange,
  isLoading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value && value.length > 0);
  const isFloating = isFocused || hasValue;

  const getInputType = () => {
    switch (field.type) {
      case 'email': return 'email';
      case 'tel': return 'tel';
      case 'number': return 'number';
      case 'date': return 'date';
      default: return 'text';
    }
  };

  const endContent = isLoading ? (
    <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" />
  ) : undefined;

  return (
    <div className="relative pt-4">
      {/* Label V2 integrado: Label flotante (Material Design) */}
      <label className={`
        absolute left-3 transition-all duration-200 pointer-events-none z-10
        ${isFloating
          ? 'top-0 text-xs font-medium'
          : 'top-1/2 text-sm font-normal'
        }
        ${error ? 'text-red-500' : isFocused ? 'text-[#4654CD]' : 'text-neutral-400'}
      `}>
        <span className="inline-flex items-center gap-1">
          {field.label}
          {field.required && <span className="text-red-400">*</span>}
          {!field.required && isFloating && <span className="text-neutral-300 text-[10px]">(opcional)</span>}
        </span>
      </label>
      <Input
        type={getInputType()}
        value={value || ''}
        placeholder={isFloating ? field.placeholder : ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        isInvalid={!!error}
        errorMessage={error}
        isDisabled={isLoading}
        endContent={endContent}
        classNames={{
          inputWrapper: 'bg-transparent border-0 border-b-2 border-neutral-300 rounded-none hover:border-[#4654CD] focus-within:border-[#4654CD] data-[invalid=true]:border-red-500 pt-2 shadow-none',
          input: 'text-neutral-800',
          errorMessage: 'text-red-500 text-xs mt-1',
        }}
      />
    </div>
  );
};

export default InputFieldV2;
