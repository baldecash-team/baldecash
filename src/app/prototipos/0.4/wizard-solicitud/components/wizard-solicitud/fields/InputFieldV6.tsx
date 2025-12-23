'use client';

/**
 * InputFieldV6 - Fintech Premium con label flotante animado
 * Campo con diseño limpio inspirado en apps bancarias modernas
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { HelpCircle, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface InputFieldV6Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export const InputFieldV6: React.FC<InputFieldV6Props> = ({
  field,
  value,
  error,
  onChange,
  isLoading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value && value.length > 0);
  const showFloatingLabel = isFocused || hasValue;

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
    inputWrapper: `bg-neutral-50 border-2 rounded-xl h-14 ${isFocused ? 'border-[#4654CD] bg-white shadow-lg shadow-[#4654CD]/10' : 'border-transparent shadow-sm'} ${error ? 'border-red-400 bg-red-50/50' : ''} hover:bg-neutral-100 hover:shadow-md transition-all duration-200`,
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

  // Label V6 integrado: Label flotante animado estilo fintech
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
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
        {!field.required && showFloatingLabel && <span className="text-neutral-300 ml-1 text-[10px]">(opcional)</span>}
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
};

export default InputFieldV6;
