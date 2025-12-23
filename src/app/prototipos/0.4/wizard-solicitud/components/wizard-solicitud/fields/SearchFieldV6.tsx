'use client';

/**
 * SearchFieldV6 - Select con búsqueda card/modal
 * Abre en modal fullscreen en mobile, card grande en desktop
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, ChevronRight } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';
import { getHelpTooltip } from './HelpTooltip';

interface SearchFieldV6Props {
  field: FieldConfig;
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
  helpVersion?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SearchFieldV6: React.FC<SearchFieldV6Props> = ({
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

  const HelpTooltip = getHelpTooltip(helpVersion);

  return (
    <div className="space-y-1.5">
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

      {/* Card-style button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`
          w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left
          flex items-center justify-between gap-3
          ${error ? 'border-red-500 bg-red-50/50' : ''}
          ${!error && value ? 'border-[#4654CD]/30 bg-[#4654CD]/5' : ''}
          ${!error && !value ? 'border-neutral-200 hover:border-neutral-300 bg-white' : ''}
        `}
      >
        <div className="flex-1 min-w-0">
          {selectedOption ? (
            <>
              <p className="text-neutral-800 font-medium truncate">{selectedOption.label}</p>
              <p className="text-xs text-[#4654CD] mt-0.5">Toca para cambiar</p>
            </>
          ) : (
            <>
              <p className="text-neutral-400">{field.placeholder || 'Seleccionar opción'}</p>
              <p className="text-xs text-neutral-400 mt-0.5">Toca para buscar</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {value && !error && <Check className="w-5 h-5 text-[#22c55e]" />}
          <ChevronRight className="w-5 h-5 text-neutral-400" />
        </div>
      </button>

      {/* Modal/Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed z-50 inset-x-0 bottom-0 md:inset-x-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full"
            >
              <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[80vh] md:max-h-[70vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                  <h3 className="font-semibold text-neutral-800">{field.label}</h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4 text-neutral-600" />
                  </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3 px-4 py-3 bg-neutral-100 rounded-xl">
                    <Search className="w-5 h-5 text-neutral-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent text-base outline-none text-neutral-700 placeholder:text-neutral-400"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3 h-3 text-neutral-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options list */}
                <div className="flex-1 overflow-y-auto p-2">
                  {filteredOptions.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No se encontraron resultados</p>
                      <p className="text-sm mt-1">Intenta con otro término</p>
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`
                          w-full px-4 py-3 text-left rounded-xl mb-1
                          transition-colors cursor-pointer flex items-center justify-between
                          ${value === option.value
                            ? 'bg-[#4654CD] text-white'
                            : 'text-neutral-700 hover:bg-neutral-100'
                          }
                        `}
                      >
                        <span className="font-medium">{option.label}</span>
                        {value === option.value && <Check className="w-5 h-5" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

export default SearchFieldV6;
