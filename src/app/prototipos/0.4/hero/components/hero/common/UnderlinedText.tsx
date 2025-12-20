'use client';

/**
 * UnderlinedText - Componente de texto con subrayado configurable
 *
 * 6 estilos disponibles:
 * 1. Onda SVG (curva elegante)
 * 2. Línea Punteada (dashed)
 * 3. Línea Sólida (simple)
 * 4. Sin Subrayado (limpio)
 * 5. Marcador Resaltador (highlight)
 * 6. Doble Línea (énfasis)
 */

import React from 'react';
import { UnderlineStyle } from '../../../types/hero';

interface UnderlinedTextProps {
  children: React.ReactNode;
  style?: UnderlineStyle;
  color?: 'primary' | 'white' | 'inherit';
  className?: string;
}

export const UnderlinedText: React.FC<UnderlinedTextProps> = ({
  children,
  style = 1,
  color = 'primary',
  className = '',
}) => {
  const textColorClass = color === 'primary'
    ? 'text-[#4654CD]'
    : color === 'white'
    ? 'text-white'
    : '';

  const renderUnderline = () => {
    switch (style) {
      case 1: // Onda SVG (curva elegante)
        return (
          <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" fill="none">
            <path d="M2 8C30 4 70 4 98 8" stroke="#03DBD0" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 2: // Línea Punteada (dashed)
        return (
          <span className="absolute -bottom-1 left-0 w-full h-1 border-b-[3px] border-dashed border-[#03DBD0]" />
        );

      case 3: // Línea Sólida (simple)
        return (
          <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#03DBD0] rounded-full" />
        );

      case 4: // Sin Subrayado (limpio)
        return null;

      case 5: // Marcador Resaltador (highlight)
        return (
          <span className="absolute inset-0 -skew-x-3 bg-[#03DBD0]/20 -z-10 scale-x-110 scale-y-125" />
        );

      case 6: // Doble Línea (énfasis)
        return (
          <>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#03DBD0]" />
            <span className="absolute -bottom-2.5 left-0 w-full h-0.5 bg-[#03DBD0]/50" />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <span className={`relative inline-block ${textColorClass} ${className}`}>
      {children}
      {renderUnderline()}
    </span>
  );
};

export default UnderlinedText;
