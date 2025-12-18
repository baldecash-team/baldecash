'use client';

/**
 * SelectDropdown - Select dropdown personalizado
 *
 * Basado en NextUI Select con estilos de marca.
 */

import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { AlertCircle, Check, HelpCircle } from 'lucide-react';
import type { SelectProps } from '../../../types/fields';

export const SelectDropdown: React.FC<SelectProps> = ({
  id,
  name,
  label,
  placeholder = 'Selecciona una opción',
  helpText,
  required = false,
  error,
  isValid,
  value,
  onChange,
  options,
  disabled = false,
}) => {
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

      {/* Select */}
      <Select
        id={id}
        name={name}
        aria-label={label}
        placeholder={placeholder}
        selectedKeys={value ? [value] : []}
        onChange={(e) => onChange(e.target.value)}
        isDisabled={disabled}
        classNames={{
          base: 'w-full',
          trigger: `
            h-11 min-h-11 bg-white border-2 transition-all cursor-pointer
            ${error ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
            ${isValid && !error ? 'border-[#22c55e]' : ''}
            ${!error && !isValid ? 'border-neutral-300 hover:border-neutral-400 data-[focus=true]:border-[#4654CD]' : ''}
          `,
          value: 'text-sm text-neutral-700',
          popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
          listbox: 'p-1 bg-white',
          listboxWrapper: 'max-h-[300px] bg-white',
        }}
        popoverProps={{
          classNames: {
            base: 'bg-white',
            content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
          },
        }}
        endContent={
          <>
            {isValid && !error && <Check className="w-5 h-5 text-[#22c55e]" />}
            {error && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
          </>
        }
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            isDisabled={option.disabled}
            classNames={{
              base: 'px-3 py-2 rounded-md text-sm text-neutral-700 data-[hover=true]:bg-[#4654CD]/10 data-[hover=true]:text-[#4654CD] data-[selectable=true]:focus:bg-[#4654CD]/10 data-[selected=true]:bg-[#4654CD] data-[selected=true]:text-white cursor-pointer',
            }}
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>

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

export default SelectDropdown;
