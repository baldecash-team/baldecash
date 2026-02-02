'use client';

import React, { useState } from 'react';
import { Select, SelectItem, Chip } from '@nextui-org/react';
import { BrandFilterProps } from '../../../../types/catalog';
import { X } from 'lucide-react';

/**
 * BrandFilterV5 - Dropdown con Logos
 * Select con logos en opciones
 * Compacto, muestra seleccion como chips debajo
 */
export const BrandFilterV5: React.FC<BrandFilterProps> = ({
  options,
  selected,
  onChange,
  showCounts = true,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (brand: string) => {
    setImageErrors((prev) => ({ ...prev, [brand]: true }));
  };

  const handleRemove = (brand: string) => {
    onChange(selected.filter((b) => b !== brand));
  };

  return (
    <div className="space-y-3">
      <Select
        aria-label="Seleccionar marcas"
        placeholder="Selecciona marcas..."
        selectionMode="multiple"
        selectedKeys={new Set(selected)}
        onSelectionChange={(keys) => {
          onChange(Array.from(keys) as string[]);
        }}
        classNames={{
          base: 'w-full',
          trigger: 'min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
          value: 'text-sm text-neutral-700',
          popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
          listbox: 'p-1 bg-white',
          listboxWrapper: 'max-h-[300px] bg-white',
          innerWrapper: 'pr-8',
          selectorIcon: 'right-3',
        }}
        popoverProps={{
          classNames: {
            base: 'bg-white',
            content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
          },
        }}
        renderValue={() => (
          <span className="text-sm text-neutral-500">
            {selected.length === 0
              ? 'Selecciona marcas...'
              : `${selected.length} marca${selected.length > 1 ? 's' : ''} seleccionada${selected.length > 1 ? 's' : ''}`}
          </span>
        )}
      >
        {options.map((option) => {
          const hasError = imageErrors[option.value];

          return (
            <SelectItem
              key={option.value}
              textValue={option.label}
              classNames={{
                base: `px-3 py-2 rounded-md cursor-pointer transition-colors
                  data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
                  data-[selected=true]:bg-[#4654CD]/20`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-5 flex items-center justify-center flex-shrink-0">
                  {option.logo && !hasError ? (
                    <img
                      src={option.logo}
                      alt={option.label}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                      onError={() => handleImageError(option.value)}
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-neutral-400">
                      {option.label.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-neutral-700 flex-1">{option.label}</span>
                {showCounts && (
                  <span className="text-xs text-neutral-400">({option.count})</span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </Select>

      {/* Selected brands as chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((brand) => {
            const option = options.find((o) => o.value === brand);
            if (!option) return null;

            return (
              <Chip
                key={brand}
                size="sm"
                radius="sm"
                variant="flat"
                onClose={() => handleRemove(brand)}
                classNames={{
                  base: 'bg-[#4654CD]/10 px-2 py-1 h-auto cursor-pointer hover:bg-[#4654CD]/20 transition-colors',
                  content: 'text-[#4654CD] text-xs font-medium',
                  closeButton: 'text-[#4654CD] hover:text-[#4654CD]/70 ml-1',
                }}
                endContent={<X className="w-3 h-3" />}
              >
                {option.label}
              </Chip>
            );
          })}
        </div>
      )}
    </div>
  );
};
