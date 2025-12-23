'use client';

/**
 * SearchFieldV5 - Select con búsqueda pill/chip
 * Valor seleccionado como chip/badge, estilo moderno
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SearchFieldV5Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SearchFieldV5: React.FC<SearchFieldV5Props> = ({
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
    <div className="space-y-2">
      {/* Label */}
      <div className="inline-flex items-center gap-1.5">
        <label className={`
          text-sm font-medium
          ${error ? 'text-red-600' : 'text-neutral-700'}
        `}>
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {field.helpText && (
          <HelpTooltip content={field.helpText} title={field.label} />
        )}
      </div>

      {/* Chip display or add button */}
      <div className="relative">
        {selectedOption ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              ${error ? 'bg-red-100 text-red-700' : 'bg-[#4654CD]/10 text-[#4654CD]'}
            `}
          >
            <span className="font-medium text-sm">{selectedOption.label}</span>
            <button
              type="button"
              onClick={handleClear}
              className={`
                w-5 h-5 rounded-full flex items-center justify-center cursor-pointer
                ${error ? 'hover:bg-red-200' : 'hover:bg-[#4654CD]/20'}
              `}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              border-2 border-dashed transition-colors cursor-pointer
              ${error ? 'border-red-400 text-red-600 hover:bg-red-50' : 'border-neutral-300 text-neutral-500 hover:border-[#4654CD] hover:text-[#4654CD]'}
            `}
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">{field.placeholder || 'Seleccionar'}</span>
          </button>
        )}

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full left-0 mt-2 min-w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Search input */}
              <div className="p-3 border-b border-neutral-100">
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-full">
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

              {/* Options as chips */}
              <div className="max-h-48 overflow-y-auto p-3">
                {filteredOptions.length === 0 ? (
                  <div className="py-6 text-center text-neutral-400 text-sm">
                    No se encontraron resultados
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`
                          px-3 py-1.5 text-sm rounded-full
                          transition-all cursor-pointer
                          ${value === option.value
                            ? 'bg-[#4654CD] text-white shadow-md'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-[#4654CD]/10 hover:text-[#4654CD]'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
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
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchFieldV5;
