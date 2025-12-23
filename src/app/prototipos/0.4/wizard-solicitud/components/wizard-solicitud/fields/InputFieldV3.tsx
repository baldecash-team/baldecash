'use client';

/**
 * InputFieldV3 - Minimalista solo placeholder
 * Campo clean con linea punteada inferior, sin label externo
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface InputFieldV3Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export const InputFieldV3: React.FC<InputFieldV3Props> = ({
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

  // Label V3 integrado en placeholder
  const placeholder = `${field.label}${field.required ? ' *' : ''}`;

  return (
    <Input
      type={getInputType()}
      value={value || ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      isInvalid={!!error}
      errorMessage={error}
      isDisabled={isLoading}
      endContent={endContent}
      classNames={{
        inputWrapper: `bg-transparent border-0 border-b border-dashed border-neutral-300 rounded-none hover:border-neutral-400 focus-within:border-[#4654CD] focus-within:border-solid data-[invalid=true]:border-red-500 shadow-none py-1 ${isFocused ? 'border-solid' : ''}`,
        input: 'text-neutral-800 placeholder:text-neutral-400 text-lg',
        errorMessage: 'text-red-500 text-xs mt-1',
      }}
    />
  );
};

export default InputFieldV3;
