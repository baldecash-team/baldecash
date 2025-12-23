'use client';

/**
 * SearchFieldV2 - Select con búsqueda underline minimal
 * Estilo minimalista con línea inferior y búsqueda integrada
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, ChevronDown, X } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SearchFieldV2Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SearchFieldV2: React.FC<SearchFieldV2Props> = ({
  field,
  value,
  error,
  onChange,
  helpVersion = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
    <div className="space-y-1">
      {/* Label */}
      <div className="inline-flex items-center gap-1.5">
        <label className={`
          text-xs font-medium uppercase tracking-wider
          ${error ? 'text-red-600' : isFocused || isOpen ? 'text-[#4654CD]' : 'text-neutral-500'}
          transition-colors
        `}>
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {field.helpText && (
          <HelpTooltip content={field.helpText} title={field.label} />
        )}
      </div>

      {/* Select button with underline */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full h-10 px-0 pb-2 flex items-center justify-between gap-2
            border-b-2 transition-all cursor-pointer text-left bg-transparent
            ${error ? 'border-red-500' : ''}
            ${isOpen || isFocused ? 'border-[#4654CD]' : ''}
            ${!error && !isOpen && !isFocused ? 'border-neutral-300 hover:border-neutral-400' : ''}
          `}
        >
          <span className={`text-base ${selectedOption ? 'text-neutral-800' : 'text-neutral-400'}`}>
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
                className="w-5 h-5 rounded-full hover:bg-neutral-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3 text-neutral-500" />
              </button>
            )}
            {value && !error && <Check className="w-4 h-4 text-[#22c55e]" />}
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden"
            >
              {/* Search input */}
              <div className="p-3 border-b border-neutral-100">
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none text-neutral-700 placeholder:text-neutral-400"
                  />
                </div>
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
                        w-full px-3 py-2.5 text-left text-sm rounded-lg
                        transition-colors cursor-pointer
                        ${value === option.value
                          ? 'bg-[#4654CD] text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default SearchFieldV2;
