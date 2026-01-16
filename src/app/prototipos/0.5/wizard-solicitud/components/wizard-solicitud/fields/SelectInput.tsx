'use client';

/**
 * SelectInput - Estilo 0.3 con búsqueda
 * Dropdown con bordes redondeados y búsqueda
 */

import React, { useState, useMemo } from 'react';
import { Tooltip } from '@nextui-org/react';
import { Search, Check, AlertCircle, Info, ChevronDown, X } from 'lucide-react';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const showError = !!error;
  const showSuccess = success && !error && value;

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

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444] bg-[#ef4444]/5';
    if (showSuccess) return 'border-[#22c55e] bg-white';
    if (isOpen) return 'border-[#4654CD] bg-white';
    return 'border-neutral-300 hover:border-neutral-400 bg-white';
  };

  return (
    <div id={id} className="space-y-1.5">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && (
          <Tooltip
            trigger="press"
            content={
              <div className="max-w-xs p-2">
                <p className="font-semibold text-neutral-800">{tooltip.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{tooltip.description}</p>
                {tooltip.recommendation && (
                  <p className="text-xs text-[#4654CD] mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {tooltip.recommendation}
                  </p>
                )}
              </div>
            }
            classNames={{
              content: 'bg-white shadow-lg border border-neutral-200',
            }}
          >
            <span className="inline-flex">
              <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] cursor-help transition-colors" />
            </span>
          </Tooltip>
        )}
      </label>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Select trigger */}
      <div className="relative">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={`
            w-full h-11 px-3 flex items-center justify-between gap-2
            rounded-lg border-2 transition-all cursor-pointer text-left
            ${getBorderColor()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className={selectedOption ? 'text-neutral-800' : 'text-neutral-400'}>
            {selectedOption?.label || placeholder}
          </span>

          <div className="flex items-center gap-1">
            {value && !disabled && (
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
            {showSuccess && <Check className="w-5 h-5 text-[#22c55e]" />}
            {showError && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
            <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-neutral-100">
                <div className="flex items-center gap-2 h-9 px-3 bg-neutral-50 rounded-md">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ fontSize: '16px' }}
                    className="flex-1 bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
                  />
                </div>
              </div>
            )}

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
                    {option.label}
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

export default SelectInput;
