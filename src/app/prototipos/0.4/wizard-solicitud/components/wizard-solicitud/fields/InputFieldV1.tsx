'use client';

/**
 * InputFieldV1 - Bordes completos clasico + Label arriba clasico
 * Campo de texto con bordes visibles y label siempre visible arriba
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface InputFieldV1Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

// Label V1 integrado: Label arriba (siempre visible) - Clásico y accesible
const Label: React.FC<{ field: FieldConfig; hasError?: boolean }> = ({ field, hasError }) => (
  <label className={`
    inline-flex items-center gap-1.5 text-sm font-medium flex-wrap leading-none
    ${hasError ? 'text-red-600' : 'text-neutral-700'}
  `}>
    <span>{field.label}</span>
    {field.required ? (
      <span className="text-red-500 text-xs">*</span>
    ) : (
      <span className="text-neutral-400 text-xs font-normal">(opcional)</span>
    )}
  </label>
);

export const InputFieldV1: React.FC<InputFieldV1Props> = ({
  field,
  value,
  error,
  onChange,
  helpVersion = 1,
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

  const HelpTooltip = getHelpTooltip(helpVersion);

  return (
    <div className="space-y-1.5">
      <div className="inline-flex items-center gap-1.5">
        <Label field={field} hasError={!!error} />
        {field.helpText && (
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
