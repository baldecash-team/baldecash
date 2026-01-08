'use client';

/**
 * ColorSelectorV2 - Dots (Círculos Compactos)
 * Círculos pequeños (8-12px) con tooltip al hover
 * Referencia: Apple Store
 */

import React from 'react';
import { Tooltip } from '@nextui-org/react';
import type { ProductColor } from '../../../types/catalog';

interface ColorSelectorV2Props {
  colors: ProductColor[];
  selectedColorId: string;
  onColorSelect: (colorId: string) => void;
  maxVisible?: number;
}

export const ColorSelectorV2: React.FC<ColorSelectorV2Props> = ({
  colors,
  selectedColorId,
  onColorSelect,
  maxVisible = 5,
}) => {
  const visibleColors = colors.slice(0, maxVisible);
  const remainingCount = colors.length - maxVisible;

  return (
    <div className="flex items-center gap-1.5">
      {visibleColors.map((color) => (
        <Tooltip
          key={color.id}
          content={color.name}
          classNames={{
            content: 'bg-white shadow-lg border border-neutral-200 text-xs px-2 py-1',
          }}
        >
          <button
            type="button"
            onClick={() => onColorSelect(color.id)}
            className={`
              w-3 h-3 rounded-full border transition-all cursor-pointer
              ${selectedColorId === color.id
                ? 'border-[#4654CD] scale-125 ring-2 ring-[#4654CD]/30'
                : 'border-neutral-300 hover:scale-110 hover:border-neutral-400'}
            `}
            style={{ backgroundColor: color.hex }}
            aria-label={`Seleccionar color ${color.name}`}
          />
        </Tooltip>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-neutral-500 ml-0.5">+{remainingCount}</span>
      )}
    </div>
  );
};

export default ColorSelectorV2;
