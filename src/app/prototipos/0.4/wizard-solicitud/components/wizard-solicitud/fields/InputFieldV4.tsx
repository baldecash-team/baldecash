'use client';

/**
 * InputFieldV4 - Filled moderno con badge
 * Campo con fondo gris, esquinas redondeadas y label con badge inline
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface InputFieldV4Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

// Label V4 integrado: Label con badge inline - Moderno
const Label: React.FC<{ field: FieldConfig; hasError?: boolean }> = ({ field, hasError }) => (
  <label className={`
    inline-flex items-center gap-2 text-sm font-medium leading-none
    ${hasError ? 'text-red-600' : 'text-neutral-600'}
  `}>
    <span>{field.label}</span>
    {field.required ? (
      <span className="text-[10px] px-1.5 py-0.5 bg-[#4654CD]/10 text-[#4654CD] rounded font-medium leading-none">
        Requerido
      </span>
    ) : (
      <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-400 rounded font-medium leading-none">
        Opcional
      </span>
    )}
  </label>
);

export const InputFieldV4: React.FC<InputFieldV4Props> = ({
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
    <div className="space-y-1.5">
      <Label field={field} hasError={!!error} />
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
        classNames={{
          inputWrapper: 'bg-neutral-100 border-0 rounded-xl hover:bg-neutral-200/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4654CD] data-[invalid=true]:ring-2 data-[invalid=true]:ring-red-500 shadow-none',
          input: 'text-neutral-800 placeholder:text-neutral-400',
          errorMessage: 'text-red-500 text-xs mt-1',
        }}
      />
    </div>
  );
};

export default InputFieldV4;
