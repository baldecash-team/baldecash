'use client';

/**
 * InputFieldV3 - Minimalista con linea inferior punteada
 * Campo clean con solo linea punteada inferior
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';

interface InputFieldV3Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

export const InputFieldV3: React.FC<InputFieldV3Props> = ({
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
    inputWrapper: 'bg-transparent border-0 border-b border-dashed border-neutral-300 rounded-none hover:border-neutral-400 focus-within:border-[#4654CD] focus-within:border-solid data-[invalid=true]:border-red-500 shadow-none py-1',
    input: 'text-neutral-800 placeholder:text-neutral-400 text-lg',
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

export default InputFieldV3;
