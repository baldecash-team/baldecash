'use client';

/**
 * BrandFilterV4 - Carousel de Logos
 *
 * Scroll horizontal de logos con seleccion multiple
 * Ideal para mostrar muchas marcas en poco espacio
 */

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { FilterOption } from '../../../../types/catalog';

interface BrandFilterV4Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

const BrandLogo: React.FC<{ logo?: string; label: string }> = ({ logo, label }) => {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return (
      <span className="text-xs font-semibold text-neutral-700 text-center leading-tight">
        {label}
      </span>
    );
  }

  return (
    <img
      src={logo}
      alt={label}
      className="max-w-full max-h-full object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export const BrandFilterV4: React.FC<BrandFilterV4Props> = ({
  options,
  selected,
  onChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-neutral-600" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-neutral-600" />
      </button>

      {/* Carousel container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-10 py-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => handleToggle(option.value)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 p-2 ${
                isSelected
                  ? 'border-[#4654CD] bg-[#4654CD]/5'
                  : 'border-neutral-200 bg-white hover:border-[#4654CD]/50'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#4654CD] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="w-12 h-8 flex items-center justify-center">
                <BrandLogo logo={option.logo} label={option.label} />
              </div>
              <span className="text-[10px] text-neutral-500">({option.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BrandFilterV4;
