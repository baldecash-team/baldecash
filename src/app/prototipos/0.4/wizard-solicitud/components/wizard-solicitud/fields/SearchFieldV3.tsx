'use client';

/**
 * SearchFieldV3 - Select con búsqueda floating label
 * Label flotante que se anima al seleccionar, estilo Material Design
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, ChevronDown, X } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SearchFieldV3Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SearchFieldV3: React.FC<SearchFieldV3Props> = ({
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
  const hasValue = !!value || isOpen;

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
    <div className="relative">
      {/* Select button with floating label */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full h-14 px-4 pt-4 pb-2 flex items-center justify-between gap-2
            rounded-xl border transition-all cursor-pointer text-left
            ${error ? 'border-red-500 bg-red-50/50' : ''}
            ${isOpen ? 'border-[#4654CD] bg-white ring-2 ring-[#4654CD]/10' : ''}
            ${!error && !isOpen ? 'border-neutral-200 hover:border-neutral-300 bg-neutral-50' : ''}
          `}
        >
          {/* Floating label */}
          <motion.label
            className={`
              absolute left-4 pointer-events-none origin-left z-10
              ${error ? 'text-red-600' : isOpen ? 'text-[#4654CD]' : 'text-neutral-500'}
            `}
            initial={false}
            animate={{
              top: hasValue ? '8px' : '50%',
              y: hasValue ? 0 : '-50%',
              scale: hasValue ? 0.75 : 1,
            }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </motion.label>

          <span className={`text-base pt-2 flex-1 ${selectedOption ? 'text-neutral-800' : 'text-transparent'}`}>
            {selectedOption?.label || 'placeholder'}
          </span>

          <div className="flex items-center gap-1 pt-2">
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="w-6 h-6 rounded-full hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            )}
            {value && !error && <Check className="w-5 h-5 text-[#22c55e]" />}
            <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Help tooltip */}
        {field.helpText && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <HelpTooltip content={field.helpText} title={field.label} />
          </div>
        )}

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden"
            >
              {/* Search input */}
              <div className="p-3 border-b border-neutral-100">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
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
              <div className="max-h-60 overflow-y-auto p-2">
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
                        w-full px-3 py-2.5 text-left text-sm rounded-lg mb-0.5
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
        <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>
      )}
    </div>
  );
};

export default SearchFieldV3;
