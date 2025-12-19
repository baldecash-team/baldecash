'use client';

/**
 * BrandFilterV7 - Accordion por Marca
 *
 * Expandir marca muestra contador y checkbox
 * Estilo profesional para muchas opciones
 */

import React, { useState } from 'react';
import { Accordion, AccordionItem, Checkbox } from '@nextui-org/react';
import { FilterOption } from '../../../../types/catalog';

interface BrandFilterV7Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

const BrandLogo: React.FC<{ logo?: string; label: string }> = ({ logo, label }) => {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return (
      <div className="w-8 h-6 flex items-center justify-center">
        <span className="text-xs font-semibold text-neutral-500">{label.slice(0, 2)}</span>
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={label}
      className="w-8 h-6 object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export const BrandFilterV7: React.FC<BrandFilterV7Props> = ({
  options,
  selected,
  onChange,
}) => {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Sort options - selected first
  const sortedOptions = [...options].sort((a, b) => {
    const aSelected = selected.includes(a.value) ? 0 : 1;
    const bSelected = selected.includes(b.value) ? 0 : 1;
    return aSelected - bSelected;
  });

  return (
    <Accordion
      selectionMode="multiple"
      defaultExpandedKeys={selected.length > 0 ? selected : []}
      className="p-0 gap-1"
      itemClasses={{
        base: 'border-none',
        trigger: 'py-2 px-0 hover:bg-neutral-50 rounded-lg transition-colors',
        content: 'pt-1 pb-3',
        title: 'text-sm',
        indicator: 'text-neutral-400',
      }}
    >
      {sortedOptions.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <AccordionItem
            key={option.value}
            aria-label={option.label}
            title={
              <div className="flex items-center gap-3 w-full">
                <BrandLogo logo={option.logo} label={option.label} />
                <span className={`flex-1 ${isSelected ? 'text-[#4654CD] font-medium' : 'text-neutral-700'}`}>
                  {option.label}
                </span>
                <span className="text-xs text-neutral-400 mr-2">
                  {option.count} productos
                </span>
              </div>
            }
          >
            <div className="pl-11">
              <Checkbox
                isSelected={isSelected}
                onValueChange={() => handleToggle(option.value)}
                classNames={{
                  base: 'cursor-pointer',
                  wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                  icon: 'text-white transition-opacity',
                  label: 'text-sm text-neutral-600',
                }}
              >
                Incluir {option.label} en resultados
              </Checkbox>
            </div>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default BrandFilterV7;
