'use client';

/**
 * SearchFieldV6 - Select con búsqueda estilo Fintech Premium
 * Mismo estilo que InputFieldV6 + modal fullscreen en mobile
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, ChevronDown, HelpCircle } from 'lucide-react';
import type { FieldConfig } from '../../../types/wizard-solicitud';

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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const options = field.options || [];
  const hasValue = Boolean(value);
  const showFloatingLabel = isFocused || hasValue || isOpen;

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
    setIsFocused(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsFocused(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFocused(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Floating Label - igual que InputFieldV6 */}
      <motion.label
        className={`absolute left-3 pointer-events-none z-10 transition-colors duration-200
          ${showFloatingLabel ? 'text-xs font-medium' : 'text-sm font-normal'}
          ${isFocused || isOpen ? 'text-[#4654CD]' : 'text-neutral-400'}
          ${error ? 'text-red-500' : ''}`}
        animate={{
          top: showFloatingLabel ? 6 : '50%',
          y: showFloatingLabel ? 0 : '-50%',
          fontSize: showFloatingLabel ? '11px' : '14px'
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
        {!field.required && showFloatingLabel && <span className="text-neutral-300 ml-1 text-[10px]">(opcional)</span>}
      </motion.label>

      {/* Input-style button - igual que InputFieldV6 */}
      <button
        type="button"
        onClick={handleOpen}
        onFocus={() => setIsFocused(true)}
        onBlur={() => !isOpen && setIsFocused(false)}
        className={`
          w-full h-14 px-3 pt-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left
          flex items-center justify-between gap-2
          ${isFocused || isOpen ? 'border-[#4654CD] bg-white shadow-lg shadow-[#4654CD]/10' : 'border-transparent shadow-sm'}
          ${error ? 'border-red-400 bg-red-50/50' : ''}
          ${!isFocused && !isOpen && !error ? 'bg-neutral-50 hover:bg-neutral-100 hover:shadow-md' : ''}
        `}
      >
        <span className={`text-base mt-1 truncate ${selectedOption ? 'text-neutral-900' : 'text-transparent'}`}>
          {selectedOption?.label || '.'}
        </span>

        <div className="flex items-center gap-2">
          {hasValue && !error && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
          {field.helpText && (
            <button type="button" className="text-neutral-400 hover:text-[#4654CD] transition-colors" title={field.helpText}>
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Error message - igual que InputFieldV6 */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-500 text-xs mt-1.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

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
              onClick={handleClose}
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
                    onClick={handleClose}
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
    </div>
  );
};

export default SearchFieldV6;
