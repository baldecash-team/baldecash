'use client';

/**
 * SelectInput - Estilo 0.3 con búsqueda
 * Dropdown con bordes redondeados y búsqueda
 */

import React, { useState, useMemo } from 'react';
import { Search, Check, AlertCircle, ChevronDown, X } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';

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
  onChange: (value: string, selectedLabel?: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  /** Callback for remote search (lazy loading). If provided, disables local filtering. */
  onSearch?: (searchTerm: string) => void;
  /** Whether remote search is in progress */
  isSearching?: boolean;
  /** Minimum characters required before searching (for lazy loading) */
  minSearchLength?: number;
  /** Message to show when user hasn't typed enough characters */
  searchPrompt?: string;
  /** Saved label from localStorage (for lazy-loaded fields after refresh) */
  savedLabel?: string;
  /** Smaller height variant for tight layouts (h-9 instead of h-11) */
  small?: boolean;
  /** Suppress error text below the field (border stays red) */
  hideErrorText?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  options,
  placeholder = 'Selecciona una opción',
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  searchable = true,
  onSearch,
  isSearching = false,
  minSearchLength = 0,
  searchPrompt,
  savedLabel,
  small = false,
  hideErrorText = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const showError = !!error;
  const showSuccess = success && !error && value;

  // Determine if we're using remote search
  const isRemoteSearch = !!onSearch;

  // For remote search, use options directly (they come from API)
  // For local search, filter the options
  const filteredOptions = useMemo(() => {
    if (isRemoteSearch) {
      // Remote search: options are already filtered by API
      return options;
    }
    // Local search: filter options by search term
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, isRemoteSearch]);

  // Check if user needs to type more characters for remote search
  const needsMoreChars = isRemoteSearch && minSearchLength > 0 && searchTerm.length < minSearchLength;

  const selectedOption = options.find((opt) => opt.value === value);
  // Use savedLabel as fallback when options aren't loaded (lazy search after refresh)
  const displayLabel = selectedOption?.label || savedLabel;

  const handleSelect = (optionValue: string) => {
    // Find the selected option to get its label
    const selected = options.find((opt) => opt.value === optionValue);
    onChange(optionValue, selected?.label);
    setIsOpen(false);
    setSearchTerm('');
    onBlur?.();
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444] bg-[#ef4444]/5';
    if (showSuccess) return 'border-[#22c55e] bg-[var(--surface,#fff)]';
    if (isOpen) return 'border-[var(--color-primary)] bg-[var(--surface,#fff)]';
    return 'border-[var(--border-strong,#d1d5db)] hover:border-neutral-400 bg-[var(--surface,#fff)]';
  };

  return (
    <div id={id} className={small ? 'space-y-1' : 'space-y-1.5'}>
      {/* Label */}
      <label className={`flex items-center gap-1.5 font-medium text-[var(--text,#374151)] ${small ? 'text-xs' : 'text-sm'}`}>
        {label}
        {!required && <span className="text-[var(--text-faint,#9ca3af)] text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-[var(--text-muted,#6b7280)]">{helpText}</p>
      )}

      {/* Select trigger */}
      <div className="relative">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          onClick={() => {
            if (disabled) return;
            const willOpen = !isOpen;
            setIsOpen(willOpen);
            if (willOpen) onFocus?.();
            else onBlur?.();
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            } else if (e.key === 'Escape' && isOpen) {
              e.preventDefault();
              setIsOpen(false);
              onBlur?.();
            }
          }}
          className={`
            w-full px-3 flex items-center justify-between gap-2
            rounded-lg border-2 transition-all cursor-pointer text-left
            ${small ? 'h-9' : 'h-11'}
            ${getBorderColor()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className={displayLabel ? 'text-[var(--text-strong,#1f2937)]' : 'text-[var(--text-faint,#9ca3af)]'}>
            {displayLabel || placeholder}
          </span>

          <div className="flex items-center gap-1">
            {value && !disabled && options.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="w-5 h-5 rounded-full hover:bg-[var(--surface-2,#e5e7eb)] flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3 text-[var(--text-muted,#6b7280)]" />
              </button>
            )}
            {showSuccess && <Check className="w-5 h-5 text-[#22c55e]" />}
            {showError && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
            <ChevronDown className={`w-5 h-5 text-[var(--text-faint,#9ca3af)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            id={`${id}-listbox`}
            role="listbox"
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--surface,#fff)] border border-[var(--border-soft,#e5e7eb)] rounded-lg shadow-lg overflow-hidden"
          >
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-[var(--border-soft,#f3f4f6)]">
                <div className="flex items-center gap-2 h-9 px-3 bg-[var(--surface-bg,#fafafa)] rounded-md">
                  <Search className="w-4 h-4 text-[var(--text-faint,#9ca3af)]" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={minSearchLength > 0 ? `Escribe al menos ${minSearchLength} letras...` : 'Buscar...'}
                    value={searchTerm}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setSearchTerm(newValue);
                      // For remote search, call onSearch when user types enough characters
                      if (onSearch && newValue.length >= minSearchLength) {
                        onSearch(newValue);
                      }
                    }}
                    style={{ fontSize: '16px' }}
                    className="flex-1 bg-transparent outline-none text-[var(--text-strong,#1f2937)] placeholder:text-[var(--text-faint,#9ca3af)]"
                  />
                  {isSearching && (
                    <div className="w-4 h-4 border-2 border-[var(--border-strong,#d1d5db)] border-t-neutral-600 rounded-full animate-spin" />
                  )}
                </div>
              </div>
            )}

            {/* Options list — extra pb on mobile so the last options stay
                visible above the iOS virtual keyboard when it is open. */}
            <div className="max-h-[min(15rem,50vh)] overflow-y-auto p-1 pb-16 sm:pb-1 overscroll-contain">
              {needsMoreChars ? (
                <div className="py-8 text-center text-[var(--text-faint,#9ca3af)] text-sm">
                  {searchPrompt || `Escribe al menos ${minSearchLength} caracteres para buscar`}
                </div>
              ) : isSearching ? (
                <div className="py-8 text-center text-[var(--text-faint,#9ca3af)] text-sm flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--border-strong,#d1d5db)] border-t-neutral-600 rounded-full animate-spin" />
                  Buscando...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-[var(--text-faint,#9ca3af)] text-sm">
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
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--text,#374151)] hover:bg-[rgba(var(--color-primary-rgb),0.1)] hover:text-[var(--color-primary)]'
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

      {/* Click outside to close - z-30 keeps it below navbar (z-50) and product bar (z-40),
          so those elements remain interactive even when the dropdown is open. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsOpen(false);
            onBlur?.();
          }}
          aria-hidden="true"
        />
      )}

      {/* Error message - always reserve space for alignment in multi-column grids */}
      {!hideErrorText && (
        <div className="min-h-[20px]">
          {error && (
            <p className="text-sm text-[#ef4444] flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectInput;
