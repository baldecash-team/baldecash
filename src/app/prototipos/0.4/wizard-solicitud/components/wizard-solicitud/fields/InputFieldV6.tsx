'use client';

/**
 * InputFieldV6 - Estilo Fintech Premium
 * Campo con diseño limpio inspirado en apps bancarias modernas
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { HelpCircle, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getLabel } from './labels';

interface InputFieldV6Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  labelVersion?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

export const InputFieldV6: React.FC<InputFieldV6Props> = ({
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

  const inputClasses = {
    inputWrapper: `bg-neutral-50 border-2 rounded-xl h-14 ${isFocused ? 'border-[#4654CD] bg-white' : 'border-transparent'} ${error ? 'border-red-400 bg-red-50/50' : ''} hover:bg-neutral-100 transition-all duration-200 shadow-none`,
    input: 'text-neutral-900 text-base placeholder:text-neutral-400',
    errorMessage: 'hidden',
  };

  const endContent = (
    <div className="flex items-center gap-2">
      {isLoading && (
        <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" />
      )}
      {hasValue && !error && !isLoading && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
      {field.helpText && (
        <button type="button" className="text-neutral-400 hover:text-[#4654CD] transition-colors" title={field.helpText}>
          <HelpCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  // V2 o default: Label flotante integrado (estilo fintech)
  if (labelVersion === 2 || labelVersion === 1) {
    const showFloatingLabel = isFocused || hasValue;
    return (
      <div className="relative">
        <motion.label
          className={`absolute left-3 pointer-events-none z-10 transition-colors duration-200
            ${showFloatingLabel ? 'text-xs font-medium' : 'text-sm font-normal'}
            ${isFocused ? 'text-[#4654CD]' : 'text-neutral-400'} ${error ? 'text-red-500' : ''}`}
          animate={{
            top: showFloatingLabel ? 6 : '50%',
            y: showFloatingLabel ? 0 : '-50%',
            fontSize: showFloatingLabel ? '11px' : '14px'
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}>
          {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
        </motion.label>
        <Input
          type={getInputType()}
          value={value || ''}
          placeholder=""
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          isInvalid={!!error}
          isDisabled={isLoading}
          size="lg"
          classNames={{
            ...inputClasses,
            inputWrapper: `${inputClasses.inputWrapper} pt-4`,
            input: `${inputClasses.input} mt-1`,
          }}
          endContent={endContent}
        />
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="text-red-500 text-xs mt-1.5 ml-1">{error}</motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (labelVersion === 5) {
    return (
      <div className="flex items-start gap-3">
        <LabelComponent field={field} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />
        <div className="flex-1 relative">
          <Input type={getInputType()} value={value || ''} placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
            isInvalid={!!error} isDisabled={isLoading} size="lg" classNames={inputClasses} endContent={endContent} />
          <AnimatePresence>
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs mt-1">{error}</motion.p>}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (labelVersion === 3) {
    return (
      <div className="relative">
        <Input type={getInputType()} value={value || ''} placeholder={`${field.label}${field.required ? ' *' : ''}`}
          onChange={(e) => onChange(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          isInvalid={!!error} isDisabled={isLoading} size="lg" classNames={inputClasses} endContent={endContent} />
        <AnimatePresence>
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs mt-1">{error}</motion.p>}
        </AnimatePresence>
      </div>
    );
  }

  // V4, V6: Label arriba
  return (
    <div className="space-y-2">
      <LabelComponent field={field} isFocused={isFocused} hasValue={hasValue} hasError={!!error} />
      <div className="relative">
        <Input type={getInputType()} value={value || ''} placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          isInvalid={!!error} isDisabled={isLoading} size="lg" classNames={inputClasses} endContent={endContent} />
        <AnimatePresence>
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs mt-1">{error}</motion.p>}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InputFieldV6;
