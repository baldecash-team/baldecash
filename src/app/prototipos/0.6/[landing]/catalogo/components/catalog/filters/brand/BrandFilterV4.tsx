'use client';

import React, { useRef, useState } from 'react';
import { BrandFilterProps } from '../../../../types/catalog';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * BrandFilterV4 - Carousel de Logos
 * Scroll horizontal de logos, seleccion multiple
 * Ideal para muchas marcas en poco espacio
 */
export const BrandFilterV4: React.FC<BrandFilterProps> = ({
  options,
  selected,
  onChange,
  showCounts = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleToggle = (brand: string) => {
    if (selected.includes(brand)) {
      onChange(selected.filter((b) => b !== brand));
    } else {
      onChange([...selected, brand]);
    }
  };

  const handleImageError = (brand: string) => {
    setImageErrors((prev) => ({ ...prev, [brand]: true }));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 120;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-neutral-50"
      >
        <ChevronLeft className="w-4 h-4 text-neutral-600" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-2 py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          const hasError = imageErrors[option.value];

          return (
            <button
              key={option.value}
              onClick={() => handleToggle(option.value)}
              className={`relative flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer min-w-[80px] ${
                isSelected
                  ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                  : 'border-neutral-200 bg-white hover:border-[rgba(var(--color-primary-rgb),0.5)]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              <div className="w-12 h-8 flex items-center justify-center mb-1">
                {option.logo && !hasError ? (
                  <img
                    src={option.logo}
                    alt={option.label}
                    className={`max-w-full max-h-full object-contain transition-all ${
                      isSelected ? '' : 'grayscale hover:grayscale-0'
                    }`}
                    loading="lazy"
                    onError={() => handleImageError(option.value)}
                  />
                ) : (
                  <span className="text-xs font-bold text-neutral-500 text-center">
                    {option.label}
                  </span>
                )}
              </div>

              <span className="text-[10px] text-neutral-600 truncate max-w-full">
                {option.label}
              </span>
              {showCounts && (
                <span className="text-[10px] text-neutral-400">({option.count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-neutral-50"
      >
        <ChevronRight className="w-4 h-4 text-neutral-600" />
      </button>
    </div>
  );
};
