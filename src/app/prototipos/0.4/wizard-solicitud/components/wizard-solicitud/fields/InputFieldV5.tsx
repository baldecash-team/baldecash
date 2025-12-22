'use client';

/**
 * InputFieldV5 - Label inline (al lado del input)
 * Campo con label a la izquierda y efecto glassmorphism
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface InputFieldV5Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

// Label V5 integrado: Label izquierda (inline) - Formularios compactos
const Label: React.FC<{ field: FieldConfig; hasError?: boolean }> = ({ field, hasError }) => (
  <label className={`
    inline-flex items-center gap-1.5 text-sm font-medium min-w-[120px] shrink-0 leading-none pt-2
    ${hasError ? 'text-red-600' : 'text-neutral-600'}
  `}>
    <span>{field.label}</span>
    {field.required ? (
      <span className="text-red-500 text-xs">*</span>
    ) : (
      <span className="text-neutral-400 text-xs font-normal">(opc.)</span>
    )}
  </label>
);

export const InputFieldV5: React.FC<InputFieldV5Props> = ({
  field,
  value,
  error,
  onChange,
  isLoading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

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
    <div className="flex items-start gap-3">
      <Label field={field} hasError={!!error} />
      <div className="flex-1">
        <Input
          type={getInputType()}
          value={value || ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          isInvalid={!!error}
          errorMessage={error}
          isDisabled={isLoading}
          endContent={endContent}
          size="lg"
          classNames={{
            inputWrapper: 'bg-white/60 backdrop-blur-sm border border-neutral-200/80 rounded-2xl hover:bg-white hover:border-neutral-300 focus-within:bg-white focus-within:border-[#4654CD] focus-within:ring-4 focus-within:ring-[#4654CD]/10 data-[invalid=true]:border-red-400 data-[invalid=true]:ring-4 data-[invalid=true]:ring-red-500/10 transition-all duration-200 shadow-none',
            input: 'text-neutral-800 placeholder:text-neutral-400',
            errorMessage: 'text-red-500 text-xs mt-1.5',
          }}
        />
      </div>
    </div>
  );
};

export default InputFieldV5;
