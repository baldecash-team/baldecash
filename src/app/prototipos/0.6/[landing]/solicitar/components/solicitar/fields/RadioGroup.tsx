'use client';

/**
 * RadioGroup - Estilo 0.3 Cards clickeables
 * Cards con selección visual destacada
 */

import React, { useRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';
import {
  useCamposV2,
  ETIQUETA_V2,
  MarcaOpcionalV2,
  ErrorCampoV2,
} from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options: RadioOption[];
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  options,
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
}) => {
  const showError = !!error;
  const showSuccess = success && !error && !!value;
  // Diseño 2 (BAL-4960): mismas tarjetas, otro vestido.
  const v2 = useCamposV2();

  const errorId = `${id}-error`;
  const tarjetasRef = useRef<Array<HTMLButtonElement | null>>([]);

  // Toggle: si ya está seleccionado, limpiar. Igual en los dos diseños.
  const elegir = (option: RadioOption) => {
    if (option.disabled || disabled) return;
    onFocus?.();
    if (value === option.value) {
      onChange('');
    } else {
      onChange(option.value);
    }
    onBlur?.();
  };

  // Diseño 2 (BAL-4964): flechas como un grupo de radios nativo — mueven el
  // foco Y eligen la tarjeta vecina habilitada (envuelve). Mismo patrón que
  // `SegmentedControl`.
  const moverConFlechas = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const avanza = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const retrocede = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    // Home/End: primera y última tarjeta habilitada.
    const alInicio = e.key === 'Home';
    const alFinal = e.key === 'End';
    if (!avanza && !retrocede && !alInicio && !alFinal) return;
    e.preventDefault();
    const habilitadas = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled && !disabled);
    if (habilitadas.length === 0) return;
    const posActual = habilitadas.findIndex(({ i }) => i === index);
    const siguientePos = alInicio
      ? 0
      : alFinal
        ? habilitadas.length - 1
        : (posActual + (avanza ? 1 : -1) + habilitadas.length) % habilitadas.length;
    const siguiente = habilitadas[siguientePos];
    if (options[siguiente.i].value !== value) elegir(options[siguiente.i]);
    tarjetasRef.current[siguiente.i]?.focus();
  };

  // Diseño 2: `role="radiogroup"` con tarjetas `role="radio"` y roving
  // tabindex (Tab entra al elegido —o a la primera— y sale del grupo). Sin el
  // <input type="radio"> anidado en el <button> (HTML inválido). Diseño 1
  // conserva su markup de siempre más abajo.
  if (v2) {
    const tabbable = options.findIndex((o) => o.value === value && !o.disabled);
    const primeraHabilitada = options.findIndex((o) => !o.disabled);
    const indiceTabbable = tabbable >= 0 ? tabbable : primeraHabilitada;
    return (
      <div id={id} className="flex flex-col gap-2.5">
        <span id={`${id}-label`} className={ETIQUETA_V2}>
          {label}
          {!required && <MarcaOpcionalV2 />}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </span>
        <div
          role="radiogroup"
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className="space-y-2"
        >
          {options.map((option, index) => {
            const elegida = value === option.value;
            return (
              <button
                key={option.value}
                ref={(el) => {
                  tarjetasRef.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={elegida}
                tabIndex={index === indiceTabbable ? 0 : -1}
                onClick={() => elegir(option)}
                onKeyDown={(e) => moverConFlechas(e, index)}
                disabled={option.disabled || disabled}
                className={`
                  relative w-full p-4 rounded-xl text-left
                  transition-all duration-200 cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2
                  ${elegida
                    ? 'bg-[rgba(var(--color-primary-rgb),0.12)] border-[1.5px] border-[var(--color-primary)]'
                    : `bg-white border-[1.5px] ${showError ? 'border-[#C2410C]' : 'border-[#C9CEF0]'} hover:border-[var(--color-primary)]`}
                  ${(option.disabled || disabled) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className="block min-w-0">
                  <span className={`block font-medium text-sm sm:text-base break-words ${elegida ? 'text-[color-mix(in_srgb,var(--color-primary)_80%,black)]' : 'text-[#1E2230]'}`}>
                    {option.label}
                  </span>
                  {option.description && (
                    <span className={`block text-xs sm:text-sm mt-0.5 break-words ${elegida ? 'text-[color-mix(in_srgb,var(--color-primary)_80%,black)]/80' : 'text-[#5B6275]'}`}>
                      {option.description}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {error && <ErrorCampoV2 id={errorId}>{error}</ErrorCampoV2>}
      </div>
    );
  }

  // Diseño 1: el markup de siempre, idéntico al de `main`.
  return (
    <div id={id} className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>

      {/* Cards grid */}
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (option.disabled || disabled) return;
              onFocus?.();
              // Toggle: si ya está seleccionado, limpiar
              if (value === option.value) {
                onChange('');
              } else {
                onChange(option.value);
              }
              onBlur?.();
            }}
            disabled={option.disabled || disabled}
            className={`
              relative w-full p-4 rounded-xl text-left
              transition-all duration-200 cursor-pointer border-2
              ${value === option.value
                ? 'bg-[rgba(var(--color-primary-rgb),0.05)] border-[var(--color-primary)]'
                : 'bg-white border-neutral-200 hover:border-[rgba(var(--color-primary-rgb),0.5)] hover:shadow-sm'
              }
              ${(option.disabled || disabled) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {/* Content */}
            <div className="min-w-0">
              <p className={`
                font-medium text-sm sm:text-base break-words
                ${value === option.value ? 'text-[var(--color-primary)]' : 'text-neutral-800'}
              `}>
                {option.label}
              </p>
              {option.description && (
                <p className={`
                  text-xs sm:text-sm mt-0.5 break-words
                  ${value === option.value ? 'text-[rgba(var(--color-primary-rgb),0.7)]' : 'text-neutral-500'}
                `}>
                  {option.description}
                </p>
              )}
            </div>

            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => {}}
              className="sr-only"
            />
          </button>
        ))}
      </div>

      {/* Success message */}
      {showSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Seleccionado
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default RadioGroup;
