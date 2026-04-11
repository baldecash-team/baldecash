'use client';

/**
 * ColorSelector - Swatches style for product detail
 * Tooltip con nombre del color al hacer hover (desktop)
 * Nombre visible debajo en mobile
 */

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Tooltip } from '@nextui-org/react';
import type { ProductColor } from '../../../types/detail';

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColorId: string;
  onColorSelect: (colorId: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColorId,
  onColorSelect,
}) => {
  const selectedColor = colors.find((c) => c.id === selectedColorId) || colors[0];
  const [touchedId, setTouchedId] = useState<string | null>(null);

  const handleTouch = (colorId: string) => {
    setTouchedId(colorId);
    onColorSelect(colorId);
    setTimeout(() => setTouchedId(null), 1500);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {colors.map((color) => {
          const isSelected = selectedColorId === color.id;
          const isDarkColor = isColorDark(color.hex);
          const isTouched = touchedId === color.id;

          return (
            <Tooltip
              key={color.id}
              content={color.name}
              delay={0}
              closeDelay={0}
              classNames={{
                content: 'bg-neutral-800 text-white text-xs px-2 py-1 rounded-lg',
              }}
            >
              <button
                type="button"
                onClick={() => onColorSelect(color.id)}
                onTouchEnd={(e) => { e.preventDefault(); handleTouch(color.id); }}
                className={`
                  w-8 h-8 rounded-md border-2 transition-all flex-shrink-0
                  flex items-center justify-center cursor-pointer relative
                  ${isSelected
                    ? 'border-[var(--color-primary)] ring-2 ring-[rgba(var(--color-primary-rgb),0.2)]'
                    : 'border-neutral-200 hover:border-neutral-400'}
                `}
                style={{ backgroundColor: color.hex }}
                aria-label={`Seleccionar color ${color.name}`}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 ${isDarkColor ? 'text-white' : 'text-neutral-800'}`}
                    style={{
                      filter: isDarkColor ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' : 'none',
                    }}
                  />
                )}
                {isTouched && !isSelected && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10 sm:hidden">
                    {color.name}
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
      {/* Nombre del color seleccionado */}
      {selectedColor && (
        <p className="text-xs text-neutral-600 font-medium">
          Color: <span className="text-neutral-800">{selectedColor.name}</span>
        </p>
      )}
    </div>
  );
};

// Helper to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export default ColorSelector;
