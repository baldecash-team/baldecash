'use client';

/**
 * SearchFieldV1 - Select con búsqueda clásico
 * Basado en 0.3, dropdown con input de búsqueda integrado
 */

import React, { useState, useMemo } from 'react';
import { Input } from '@nextui-org/react';
import { Search, Check, ChevronDown, X } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SearchFieldV1Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SearchFieldV1: React.FC<SearchFieldV1Props> = ({
  field,
  value,
  error,
  onChange,
  helpVersion = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const options = field.options || [];

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

  const HelpTooltip = getHelpTooltip(helpVersion);

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <div className="inline-flex items-center gap-1.5">
        <label className={`
          inline-flex items-center gap-2 text-sm font-medium flex-wrap leading-none
          ${error ? 'text-red-600' : 'text-neutral-700'}
        `}>
          <span>{field.label}</span>
          {field.required ? (
            <span className="text-[10px] px-1.5 py-0.5 bg-[#4654CD]/10 text-[#4654CD] rounded font-medium leading-none">
              Requerido
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-400 rounded font-medium leading-none">
              Opcional
            </span>
          )}
        </label>
        {field.helpText && (
          <HelpTooltip content={field.helpText} title={field.label} />
        )}
      </div>

      {/* Select trigger */}
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={`
            w-full h-11 px-3 flex items-center justify-between gap-2
            rounded-lg border transition-all cursor-pointer text-left
            ${error ? 'border-red-500 bg-red-50' : ''}
            ${isOpen ? 'border-[#4654CD] bg-white ring-2 ring-[#4654CD]/20' : ''}
            ${!error && !isOpen ? 'border-neutral-300 hover:border-neutral-400 bg-neutral-50' : ''}
          `}
        >
          <span className={selectedOption ? 'text-neutral-800' : 'text-neutral-400'}>
            {selectedOption?.label || field.placeholder || 'Seleccionar...'}
          </span>

          <div className="flex items-center gap-1">
            {value && (
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
            {value && !error && <Check className="w-4 h-4 text-[#22c55e]" />}
            <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-neutral-100">
              <Input
                autoFocus
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search className="w-4 h-4 text-neutral-400 mr-1" />}
                classNames={{
                  input: 'text-sm outline-none',
                  innerWrapper: 'bg-transparent',
                  inputWrapper: 'h-9 min-h-9 bg-neutral-50 border-0 shadow-none data-[hover=true]:bg-neutral-50 data-[focus-visible=true]:ring-0',
                }}
              />
            </div>

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-sm">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-3 py-2 text-left text-sm rounded-md
                      transition-colors cursor-pointer
                      ${value === option.value
                        ? 'bg-[#4654CD] text-white'
                        : 'text-neutral-700 hover:bg-[#4654CD]/10 hover:text-[#4654CD]'
                      }
                    `}
                  >
                    {option.label}
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
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchFieldV1;
