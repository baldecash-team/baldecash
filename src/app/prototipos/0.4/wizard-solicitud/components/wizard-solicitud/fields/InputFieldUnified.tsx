'use client';

/**
 * InputFieldUnified - Componente unificado de Input con Label integrado
 * 6 versiones con diferentes estilos de label+input combinados
 *
 * V1: Label arriba clásico
 * V2: Material Design (label flotante animado)
 * V3: Label lateral izquierdo
 * V4: Label lateral con badge
 * V5: Label lateral compacto
 * V6: Label grande hero
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

interface InputFieldUnifiedProps {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  version?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

export const InputFieldUnified: React.FC<InputFieldUnifiedProps> = ({
  field,
  value,
  error,
  onChange,
  version = 1,
  isLoading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value && value.length > 0);

  const getInputType = () => {
    switch (field.type) {
      case 'email': return 'email';
      case 'tel': return 'tel';
      case 'number': return 'number';
      default: return 'text';
    }
  };

  // ============================================
  // V1: Label arriba clásico
  // ============================================
  if (version === 1) {
    return (
      <div className="space-y-1.5">
        {/* Label */}
        <label className={`
          inline-flex items-center gap-1.5 text-sm font-medium leading-none
          ${error ? 'text-red-600' : 'text-neutral-700'}
        `}>
          <span>{field.label}</span>
          {field.required ? (
            <span className="text-red-500 text-xs">*</span>
          ) : (
            <span className="text-neutral-400 text-xs font-normal">(opcional)</span>
          )}
          {field.helpText && (
            <span className="text-neutral-400 cursor-help" title={field.helpText}>
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </label>

        {/* Input */}
        <div className="relative">
          <input
            type={getInputType()}
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            className={`
              w-full px-3 py-2.5 rounded-lg text-sm text-neutral-800 transition-all duration-150
              bg-neutral-50 border outline-none
              placeholder:text-neutral-400
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-neutral-300 hover:border-neutral-400 focus:border-[#4654CD] focus:ring-2 focus:ring-[#4654CD]/20'
              }
            `}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" />
            </div>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );
  }

  // ============================================
  // V2: Material Design (label flotante animado)
  // ============================================
  if (version === 2) {
    const isFloating = isFocused || hasValue;

    return (
      <div className="relative pt-4">
        {/* Label flotante */}
        <motion.label
          initial={false}
          animate={{
            top: isFloating ? 0 : '50%',
            fontSize: isFloating ? '12px' : '14px',
            y: isFloating ? 0 : '-50%',
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`
            absolute left-3 pointer-events-none z-10 px-1 bg-white origin-left
            ${error ? 'text-red-500' : isFocused ? 'text-[#4654CD]' : 'text-neutral-500'}
          `}
        >
          {field.label}
          {field.required && <span className="text-red-400 ml-0.5">*</span>}
        </motion.label>

        {/* Input */}
        <div className="relative">
          <input
            type={getInputType()}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            className={`
              w-full px-3 py-3 rounded-lg text-sm text-neutral-800 transition-all duration-150
              bg-white border-2 outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500'
                : isFocused
                  ? 'border-[#4654CD]'
                  : 'border-neutral-300 hover:border-neutral-400'
              }
            `}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" />
            </div>
          )}
        </div>

        {/* Helper text / Error */}
        <AnimatePresence>
          {(error || field.description) && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`text-xs mt-1 ml-3 ${error ? 'text-red-500' : 'text-neutral-500'}`}
            >
              {error || field.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ============================================
  // V3: Label lateral izquierdo
  // ============================================
  if (version === 3) {
    return (
      <div className="flex items-start gap-4">
        {/* Label lateral */}
        <label className={`
          min-w-[120px] pt-2.5 text-sm font-medium text-right leading-none
          ${error ? 'text-red-600' : 'text-neutral-700'}
        `}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Input + Error */}
        <div className="flex-1">
          <div className="relative">
            <input
              type={getInputType()}
              value={value || ''}
              placeholder={field.placeholder}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              className={`
                w-full px-3 py-2.5 rounded-lg text-sm text-neutral-800 transition-all duration-150
                bg-neutral-50 border outline-none
                placeholder:text-neutral-400
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-neutral-300 hover:border-neutral-400 focus:border-[#4654CD] focus:ring-2 focus:ring-[#4654CD]/20'
                }
              `}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" />
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          {field.helpText && !error && (
            <p className="text-neutral-500 text-xs mt-1">{field.helpText}</p>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // V4: Label lateral con badge
  // ============================================
  if (version === 4) {
    return (
      <div className="flex items-start gap-4">
        {/* Label lateral con badge */}
        <div className="min-w-[140px] pt-2 flex flex-col items-end gap-1">
          <label className={`
            text-sm font-medium leading-none
            ${error ? 'text-red-600' : 'text-neutral-700'}
          `}>
            {field.label}
          </label>
          {field.required ? (
            <span className="text-[10px] px-1.5 py-0.5 bg-[#4654CD]/10 text-[#4654CD] rounded font-medium">
              Requerido
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-400 rounded font-medium">
              Opcional
            </span>
          )}
        </div>

        {/* Input + Estado */}
        <div className="flex-1">
          <div className="relative">
            <input
              type={getInputType()}
              value={value || ''}
              placeholder={field.placeholder}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              className={`
                w-full px-3 py-2.5 pr-10 rounded-lg text-sm text-neutral-800 transition-all duration-150
                bg-white border-2 outline-none
                placeholder:text-neutral-400
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error
                  ? 'border-red-500'
                  : hasValue && !isFocused
                    ? 'border-green-500'
                    : isFocused
                      ? 'border-[#4654CD]'
                      : 'border-neutral-200 hover:border-neutral-300'
                }
              `}
            />
            {/* Estado icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" />
              ) : error ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : hasValue ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : null}
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  // ============================================
  // V5: Label lateral compacto
  // ============================================
  if (version === 5) {
    return (
      <div className="flex items-center gap-3">
        {/* Label compacto */}
        <label className={`
          min-w-[100px] text-sm font-medium leading-none flex items-center gap-1
          ${error ? 'text-red-600' : 'text-neutral-600'}
        `}>
          {field.label}
          {field.required && <span className="text-red-500 text-xs">*</span>}
        </label>

        {/* Input inline */}
        <div className="flex-1 relative">
          <input
            type={getInputType()}
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            className={`
              w-full px-3 py-2 rounded-lg text-sm text-neutral-800 transition-all duration-150
              bg-neutral-100 border-0 outline-none
              placeholder:text-neutral-400
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:bg-white focus:ring-2 focus:ring-[#4654CD]/20
              ${error ? 'ring-2 ring-red-500/20 bg-red-50' : ''}
            `}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[#4654CD] animate-spin" />
            </div>
          )}
        </div>

        {/* Error inline */}
        {error && (
          <span className="text-red-500 text-xs whitespace-nowrap">{error}</span>
        )}
      </div>
    );
  }

  // ============================================
  // V6: Label grande hero
  // ============================================
  return (
    <div className="space-y-3">
      {/* Label grande */}
      <label className={`
        flex items-center gap-2 text-lg font-semibold leading-none transition-colors
        ${error ? 'text-red-600' : isFocused ? 'text-[#4654CD]' : 'text-neutral-800'}
      `}>
        <span>{field.label}</span>
        {field.required ? (
          <span className="text-red-500 text-sm">*</span>
        ) : (
          <span className="text-neutral-400 text-xs font-normal bg-neutral-100 px-2 py-0.5 rounded-full">
            Opcional
          </span>
        )}
      </label>

      {/* Descripcion */}
      {field.description && (
        <p className="text-sm text-neutral-500 -mt-1">{field.description}</p>
      )}

      {/* Input grande */}
      <div className="relative">
        <input
          type={getInputType()}
          value={value || ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          className={`
            w-full px-4 py-4 rounded-xl text-base text-neutral-800 transition-all duration-150
            bg-white border-2 outline-none
            placeholder:text-neutral-400
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
              : isFocused
                ? 'border-[#4654CD] ring-4 ring-[#4654CD]/10'
                : 'border-neutral-200 hover:border-neutral-300'
            }
          `}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-[#4654CD] animate-spin" />
          </div>
        )}
      </div>

      {/* Error / Help */}
      {error ? (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      ) : field.helpText ? (
        <p className="text-neutral-500 text-sm">{field.helpText}</p>
      ) : null}
    </div>
  );
};

// Versiones individuales exportadas para compatibilidad
export const InputFieldUnifiedV1: React.FC<Omit<InputFieldUnifiedProps, 'version'>> = (props) => (
  <InputFieldUnified {...props} version={1} />
);

export const InputFieldUnifiedV2: React.FC<Omit<InputFieldUnifiedProps, 'version'>> = (props) => (
  <InputFieldUnified {...props} version={2} />
);

export const InputFieldUnifiedV3: React.FC<Omit<InputFieldUnifiedProps, 'version'>> = (props) => (
  <InputFieldUnified {...props} version={3} />
);

export const InputFieldUnifiedV4: React.FC<Omit<InputFieldUnifiedProps, 'version'>> = (props) => (
  <InputFieldUnified {...props} version={4} />
);

export const InputFieldUnifiedV5: React.FC<Omit<InputFieldUnifiedProps, 'version'>> = (props) => (
  <InputFieldUnified {...props} version={5} />
);

export const InputFieldUnifiedV6: React.FC<Omit<InputFieldUnifiedProps, 'version'>> = (props) => (
  <InputFieldUnified {...props} version={6} />
);

// Helper para obtener versión
export const getInputFieldUnified = (version: 1 | 2 | 3 | 4 | 5 | 6) => {
  const versions = {
    1: InputFieldUnifiedV1,
    2: InputFieldUnifiedV2,
    3: InputFieldUnifiedV3,
    4: InputFieldUnifiedV4,
    5: InputFieldUnifiedV5,
    6: InputFieldUnifiedV6,
  };
  return versions[version];
};

export default InputFieldUnified;
