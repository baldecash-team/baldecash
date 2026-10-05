'use client';

/**
 * TermSelect - Selector de plazo compacto inline
 * Usa el mismo estilo visual que SelectInput pero sin label, sin búsqueda,
 * diseñado para uso inline en barras de producto.
 */

import React, { useState, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getTermUnit } from './etiquetaDePlazo';

export { getTermUnit };

interface TermSelectProps {
  value: number;
  options: number[];
  onChange: (term: number) => void;
  /** Visual size variant */
  size?: 'sm' | 'md';
  /** Warning state (e.g., terms need unification) */
  warning?: boolean;
  /** Placeholder when no value is selected */
  placeholder?: string;
  /** Payment frequency to pluralize the label: 'semanal' | 'quincenal' | 'mensual' */
  frequency?: string;
  /**
   * Rótulo por term, para cuando el número no se explica solo.
   *
   * Con la inicial fraccionada el `term` son las cuotas, y el plazo que la
   * persona vive es `cuotas + armadas`: el rótulo dice «17 semanas · 4 armadas»
   * donde el valor es 13. Sin entrada para un term se usa `${term} ${unidad}`,
   * que es lo que ve todo el catálogo.
   */
  labels?: Map<number, string>;
}

export const TermSelect: React.FC<TermSelectProps> = ({
  value,
  options,
  onChange,
  size = 'md',
  warning = false,
  placeholder,
  frequency,
  labels,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback((term: number) => {
    onChange(term);
    setIsOpen(false);
  }, [onChange]);

  const etiqueta = (term: number) => labels?.get(term) ?? `${term} ${getTermUnit(term, frequency)}`;

  const displayLabel = value ? etiqueta(value) : placeholder || 'Seleccionar';
  const hasValue = !!value;

  const sizeClasses = size === 'sm'
    ? 'h-7 px-2 text-xs gap-1'
    : 'h-8 px-3 text-sm gap-1.5';

  const getBorderColor = () => {
    if (warning) return 'border-amber-300';
    if (isOpen) return 'border-[var(--color-primary)]';
    return 'border-neutral-300 hover:border-neutral-400';
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center justify-between rounded-lg border-2 bg-white
            transition-all cursor-pointer
            ${sizeClasses}
            ${getBorderColor()}
          `}
        >
          <span className={hasValue ? 'text-neutral-800' : 'text-neutral-400'}>
            {displayLabel}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 top-full right-0 mt-1 min-w-[140px] whitespace-nowrap bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
            <div className="p-1">
              {options.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSelect(term)}
                  className={`
                    w-full px-3 py-2 text-left text-sm rounded-md
                    transition-colors cursor-pointer flex items-center justify-between
                    ${value === term
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-neutral-700 hover:bg-[rgba(var(--color-primary-rgb),0.1)] hover:text-[var(--color-primary)]'
                    }
                  `}
                >
                  <span>{etiqueta(term)}</span>
                  {value === term && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default TermSelect;
