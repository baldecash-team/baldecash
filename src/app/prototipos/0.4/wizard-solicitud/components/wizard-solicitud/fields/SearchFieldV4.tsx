'use client';

/**
 * SearchFieldV4 - Select con búsqueda inline/compacto
 * Layout horizontal con búsqueda inline, ideal para filtros
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SearchFieldV4Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SearchFieldV4: React.FC<SearchFieldV4Props> = ({
  field,
  value,
  error,
  onChange,
  helpVersion = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const HelpTooltip = getHelpTooltip(helpVersion);

  return (
    <div className="flex items-start gap-3">
      {/* Label inline */}
      <div className="flex items-center gap-1.5 h-10 shrink-0">
        <label className={`
          text-sm font-medium whitespace-nowrap
          ${error ? 'text-red-600' : 'text-neutral-700'}
        `}>
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {field.helpText && (
          <HelpTooltip content={field.helpText} title={field.label} />
        )}
      </div>

      {/* Search/Select area */}
      <div className="relative flex-1">
        <div
          className={`
            flex items-center gap-2 h-10 px-3 rounded-lg border cursor-text
            transition-all
            ${error ? 'border-red-500 bg-red-50/50' : ''}
            ${isOpen ? 'border-[#4654CD] bg-white ring-2 ring-[#4654CD]/10' : ''}
            ${!error && !isOpen ? 'border-neutral-300 hover:border-neutral-400 bg-white' : ''}
          `}
          onClick={() => setIsOpen(true)}
        >
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />

          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              placeholder={selectedOption?.label || field.placeholder || 'Buscar...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-neutral-700 placeholder:text-neutral-400"
            />
          ) : (
            <span className={`flex-1 text-sm ${selectedOption ? 'text-neutral-800' : 'text-neutral-400'}`}>
              {selectedOption?.label || field.placeholder || 'Buscar...'}
            </span>
          )}

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
          </div>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden"
            >
              {/* Options list */}
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredOptions.length === 0 ? (
                  <div className="py-6 text-center text-neutral-400 text-sm">
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
        <p className="text-red-500 text-xs mt-1 ml-auto">{error}</p>
      )}
    </div>
  );
};

export default SearchFieldV4;
