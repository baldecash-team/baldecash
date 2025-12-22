'use client';

/**
 * InputFieldV4 - Filled moderno con bordes redondeados
 * Campo con fondo gris y esquinas suaves
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';

interface InputFieldV4Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

export const InputFieldV4: React.FC<InputFieldV4Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  isLoading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value && value.length > 0);
  const LabelComponent = getLabel(labelVersion);

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

  const inputClasses = {
    inputWrapper: 'bg-neutral-100 border-0 rounded-xl hover:bg-neutral-200/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4654CD] data-[invalid=true]:ring-2 data-[invalid=true]:ring-red-500 shadow-none',
    input: 'text-neutral-800 placeholder:text-neutral-400',
    errorMessage: 'text-red-500 text-xs mt-1',
  };

  if (labelVersion === 5) {
    return (
      <div className="flex items-start gap-3">
        <LabelComponent field={field} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />
        <div className="flex-1">
          <Input type={getInputType()} value={value || ''} placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
            isInvalid={!!error} errorMessage={error} isDisabled={isLoading} endContent={endContent} classNames={inputClasses} />
        </div>
      </div>
    );
  }

  if (labelVersion === 2) {
    return (
      <div className="relative pt-2">
        <LabelComponent field={field} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />
        <Input type={getInputType()} value={value || ''} placeholder={isFocused || hasValue ? field.placeholder : ''}
          onChange={(e) => onChange(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          isInvalid={!!error} errorMessage={error} isDisabled={isLoading} endContent={endContent} classNames={{...inputClasses, inputWrapper: inputClasses.inputWrapper + ' pt-3'}} />
      </div>
    );
  }

  if (labelVersion === 3) {
    return (
      <Input type={getInputType()} value={value || ''} placeholder={`${field.label}${field.required ? ' *' : ''}`}
        onChange={(e) => onChange(e.target.value)} isInvalid={!!error} errorMessage={error} isDisabled={isLoading} endContent={endContent} classNames={inputClasses} />
    );
  }

  return (
    <div className="space-y-1.5">
      <LabelComponent field={field} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />
      <Input type={getInputType()} value={value || ''} placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
        isInvalid={!!error} errorMessage={error} isDisabled={isLoading} endContent={endContent} classNames={inputClasses} />
    </div>
  );
};

export default InputFieldV4;
