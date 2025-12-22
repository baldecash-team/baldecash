'use client';

/**
 * InputFieldV1 - Bordes completos clasico
 * Campo de texto con bordes visibles
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';
import { getHelpTooltip } from './HelpTooltip';

interface InputFieldV1Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

export const InputFieldV1: React.FC<InputFieldV1Props> = ({
  field,
  value,
  error,
  onChange,
  labelVersion = 1,
  helpVersion = 1,
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

  // V5: Label a la izquierda (inline)
  if (labelVersion === 5) {
    return (
      <div className="flex items-start gap-3">
        <LabelComponent field={field} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />
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
            classNames={{
              inputWrapper: 'bg-neutral-50 border border-neutral-300 hover:border-[#4654CD] focus-within:border-[#4654CD] data-[invalid=true]:border-red-500 shadow-none',
              input: 'text-neutral-800',
              errorMessage: 'text-red-500 text-xs mt-1',
            }}
          />
        </div>
      </div>
    );
  }

  // V2: Label flotante (requiere posicion relativa)
  if (labelVersion === 2) {
    return (
      <div className="relative pt-2">
        <LabelComponent field={field} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />
        <Input
          type={getInputType()}
          value={value || ''}
          placeholder={isFocused || hasValue ? field.placeholder : ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          isInvalid={!!error}
          errorMessage={error}
          isDisabled={isLoading}
          endContent={endContent}
          classNames={{
            inputWrapper: 'bg-neutral-50 border border-neutral-300 hover:border-[#4654CD] focus-within:border-[#4654CD] data-[invalid=true]:border-red-500 pt-3 shadow-none',
            input: 'text-neutral-800',
            errorMessage: 'text-red-500 text-xs mt-1',
          }}
        />
      </div>
    );
  }

  // V3: Solo placeholder (sin label)
  if (labelVersion === 3) {
    return (
      <Input
        type={getInputType()}
        value={value || ''}
        placeholder={`${field.label}${field.required ? ' *' : ''}`}
        onChange={(e) => onChange(e.target.value)}
        isInvalid={!!error}
        errorMessage={error}
        isDisabled={isLoading}
        endContent={endContent}
        classNames={{
          inputWrapper: 'bg-neutral-50 border border-neutral-300 hover:border-[#4654CD] focus-within:border-[#4654CD] data-[invalid=true]:border-red-500 shadow-none',
          input: 'text-neutral-800',
          errorMessage: 'text-red-500 text-xs mt-1',
        }}
      />
    );
  }

  const HelpTooltip = getHelpTooltip(helpVersion);

  // V1, V4, V6: Label arriba (default)
  return (
    <div className="space-y-1.5">
      <div className="inline-flex items-center gap-1.5">
        <LabelComponent field={field} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />
        {field.helpText && labelVersion !== 4 && (
          <HelpTooltip content={field.helpText} title={field.label} />
        )}
      </div>
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
          inputWrapper: 'bg-neutral-50 border border-neutral-300 hover:border-[#4654CD] focus-within:border-[#4654CD] data-[invalid=true]:border-red-500 shadow-none',
          input: 'text-neutral-800',
          errorMessage: 'text-red-500 text-xs mt-1',
        }}
      />
    </div>
  );
};

export default InputFieldV1;
