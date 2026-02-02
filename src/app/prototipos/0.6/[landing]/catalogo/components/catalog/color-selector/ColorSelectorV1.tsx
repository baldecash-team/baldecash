'use client';

/**
 * ColorSelectorV1 - Swatches (Muestras Grandes)
 * Cuadrados redondeados (24-32px) con nombre visible
 * Referencia: Nike, Uniqlo
 */

import React from 'react';
import { Check } from 'lucide-react';
import type { ProductColor } from '../../../types/catalog';

interface ColorSelectorV1Props {
  colors: ProductColor[];
  selectedColorId: string;
  onColorSelect: (colorId: string) => void;
}

export const ColorSelectorV1: React.FC<ColorSelectorV1Props> = ({
  colors,
  selectedColorId,
  onColorSelect,
}) => {
  const selectedColor = colors.find((c) => c.id === selectedColorId) || colors[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {colors.map((color) => {
          const isSelected = selectedColorId === color.id;
          // Determinar si el color es oscuro para ajustar el color del check
          const isDarkColor = isColorDark(color.hex);

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onColorSelect(color.id)}
              className={`
                w-7 h-7 rounded-md border-2 transition-all flex-shrink-0
                flex items-center justify-center cursor-pointer
                ${isSelected
                  ? 'border-[#4654CD] ring-2 ring-[#4654CD]/20'
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
            </button>
          );
        })}
      </div>
      {selectedColor && (
        <p className="text-xs text-neutral-600 font-medium">
          {selectedColor.name}
        </p>
      )}
    </div>
  );
};

// Helper para determinar si un color es oscuro
function isColorDark(hexColor: string): boolean {
  // Remover # si existe
  const hex = hexColor.replace('#', '');

  // Convertir a RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calcular luminosidad (fórmula estándar)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.5;
}

export default ColorSelectorV1;
