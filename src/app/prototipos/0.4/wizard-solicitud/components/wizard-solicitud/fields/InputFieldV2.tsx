'use client';

/**
 * InputFieldV2 - Material Design con label flotante animado
 * Campo con linea inferior y label que flota al escribir
 */

import React, { useState } from 'react';
import { Input } from '@nextui-org/react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      {/* Label V2: Label flotante animado (Material Design) */}
      <motion.label
        className={`
          absolute left-3 pointer-events-none z-10 transition-colors duration-200
          ${isFloating ? 'text-xs font-medium' : 'text-sm font-normal'}
          ${error ? 'text-red-500' : isFocused ? 'text-[#4654CD]' : 'text-neutral-400'}
        `}
        animate={{
          top: isFloating ? 0 : '50%',
          y: isFloating ? 0 : '-50%',
          fontSize: isFloating ? '11px' : '14px'
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
        {!field.required && isFloating && <span className="text-neutral-300 ml-1 text-[10px]">(opcional)</span>}
      </motion.label>
      <Input
        type={getInputType()}
        value={value || ''}
        placeholder={isFloating ? field.placeholder : ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        isInvalid={!!error}
        isDisabled={isLoading}
        endContent={endContent}
        classNames={{
          inputWrapper: 'bg-transparent border-0 border-b-2 border-neutral-300 rounded-none hover:border-[#4654CD] focus-within:border-[#4654CD] data-[invalid=true]:border-red-500 pt-2 shadow-none',
          input: 'text-neutral-800',
          errorMessage: 'hidden',
        }}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-500 text-xs mt-1.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InputFieldV2;
