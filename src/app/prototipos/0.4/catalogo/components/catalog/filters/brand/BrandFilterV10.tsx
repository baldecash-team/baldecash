'use client';

/**
 * BrandFilterV10 - Search + Grid
 *
 * Input de busqueda + grid filtrable de logos
 * Para cuando hay muchas marcas
 */

import React, { useState, useMemo } from 'react';
import { Input } from '@nextui-org/react';
import { Search, Check, X } from 'lucide-react';
import { FilterOption } from '../../../../types/catalog';

interface BrandFilterV10Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

const BrandLogo: React.FC<{ logo?: string; label: string }> = ({ logo, label }) => {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return (
      <span className="text-xs font-semibold text-neutral-600 text-center">
        {label}
      </span>
    );
  }

  return (
    <img
      src={logo}
      alt={label}
      className="w-10 h-6 object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export const BrandFilterV10: React.FC<BrandFilterV10Props> = ({
  options,
  selected,
  onChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
    setSearchQuery('');
  };

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  return (
    <div className="space-y-3">
      {/* Search input */}
      <Input
        placeholder="Buscar marca..."
        value={searchQuery}
        onValueChange={setSearchQuery}
        startContent={<Search className="w-4 h-4 text-neutral-400" />}
        endContent={
          searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="cursor-pointer hover:bg-neutral-100 rounded p-0.5"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          )
        }
        classNames={{
          base: 'w-full',
          inputWrapper: 'bg-neutral-50 border border-neutral-200 hover:border-[#4654CD]/50 focus-within:border-[#4654CD] h-10',
          input: 'text-sm',
        }}
      />

      {/* Selected count and clear */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between py-2 px-3 bg-[#4654CD]/5 rounded-lg">
          <span className="text-sm text-[#4654CD] font-medium">
            {selected.length} marca{selected.length > 1 ? 's' : ''} seleccionada{selected.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={handleClearAll}
            className="text-xs text-[#4654CD] hover:underline cursor-pointer"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Grid of brands */}
      <div className="grid grid-cols-3 gap-2">
        {filteredOptions.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => handleToggle(option.value)}
              className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[72px] ${
                isSelected
                  ? 'border-[#4654CD] bg-[#4654CD]/5'
                  : 'border-neutral-200 bg-white hover:border-[#4654CD]/50'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4654CD] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-12 h-8 flex items-center justify-center">
                <BrandLogo logo={option.logo} label={option.label} />
              </div>
              <span className="text-[10px] text-neutral-400">({option.count})</span>
            </button>
          );
        })}
      </div>

      {/* No results message */}
      {filteredOptions.length === 0 && searchQuery && (
        <p className="text-sm text-neutral-500 text-center py-4">
          No se encontraron marcas para &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    </div>
  );
};

export default BrandFilterV10;
