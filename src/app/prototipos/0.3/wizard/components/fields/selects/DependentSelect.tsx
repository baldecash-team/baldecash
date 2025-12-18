'use client';

/**
 * DependentSelect - Select que depende de otro campo
 *
 * Para selects en cascada como Universidad → Carrera.
 * Muestra loading mientras carga opciones del padre.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@nextui-org/react';
import { Search, AlertCircle, Check, HelpCircle, ChevronDown, X, Loader2 } from 'lucide-react';
import type { FieldOption } from '../../../types/fields';

export interface DependentSelectProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  // Dependent select specific
  parentValue: string;
  parentLabel?: string;
  loadOptions: (parentValue: string) => Promise<FieldOption[]>;
  searchable?: boolean;
}

export const DependentSelect: React.FC<DependentSelectProps> = ({
  id,
  label,
  placeholder = 'Selecciona...',
  helpText,
  required = false,
  error,
  isValid,
  value,
  onChange,
  disabled = false,
  parentValue,
  parentLabel = 'el campo anterior',
  loadOptions,
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load options when parent value changes
  useEffect(() => {
    if (!parentValue) {
      setOptions([]);
      onChange('');
      return;
    }

    const fetchOptions = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const newOptions = await loadOptions(parentValue);
        setOptions(newOptions);
        // Clear current value if it's not in new options
        if (value && !newOptions.find((opt) => opt.value === value)) {
          onChange('');
        }
      } catch {
        setLoadError('Error al cargar opciones');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [parentValue, loadOptions]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const isDisabled = disabled || !parentValue;
  const placeholderText = !parentValue
    ? `Primero selecciona ${parentLabel}`
    : loading
      ? 'Cargando...'
      : placeholder;

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label htmlFor={id} className="flex items-center gap-1 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {helpText && (
          <button
            type="button"
            className="text-neutral-400 hover:text-[#4654CD] transition-colors cursor-pointer"
            title={helpText}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </label>

      {/* Select button */}
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => !isDisabled && !loading && setIsOpen(!isOpen)}
          disabled={isDisabled}
          className={`
            w-full h-11 px-3 flex items-center justify-between gap-2
            rounded-lg border-2 transition-all text-left
            ${error ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
            ${isValid && !error ? 'border-[#22c55e] bg-white' : ''}
            ${isOpen ? 'border-[#4654CD] bg-white' : ''}
            ${!error && !isValid && !isOpen ? 'border-neutral-300 hover:border-neutral-400 bg-white' : ''}
            ${isDisabled ? 'opacity-50 cursor-not-allowed bg-neutral-50' : 'cursor-pointer'}
          `}
        >
          <span className={selectedOption ? 'text-neutral-800' : 'text-neutral-400'}>
            {selectedOption?.label || placeholderText}
          </span>

          <div className="flex items-center gap-1">
            {loading && <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />}
            {value && !isDisabled && !loading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="w-5 h-5 rounded-full hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3 text-neutral-500" />
              </button>
            )}
            {isValid && !error && <Check className="w-5 h-5 text-[#22c55e]" />}
            {error && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
            <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-neutral-100">
                <Input
                  autoFocus
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<Search className="w-4 h-4 text-neutral-400" />}
                  classNames={{
                    input: 'text-sm',
                    inputWrapper: 'h-9 min-h-9 bg-neutral-50 border-0',
                  }}
                />
              </div>
            )}

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto p-1">
              {loading ? (
                <div className="py-8 text-center text-neutral-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Cargando opciones...</span>
                </div>
              ) : loadError ? (
                <div className="py-8 text-center text-[#ef4444]">
                  {loadError}
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-neutral-400">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-3 py-2 text-left text-sm rounded-md
                      transition-colors cursor-pointer
                      ${value === option.value
                        ? 'bg-[#4654CD] text-white'
                        : 'text-neutral-700 hover:bg-[#4654CD]/10 hover:text-[#4654CD]'
                      }
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon && <span>{option.icon}</span>}
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="block text-xs opacity-70 mt-0.5">
                        {option.description}
                      </span>
                    )}
                  </button>
                ))
              )}
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

export default DependentSelect;
