'use client';

/**
 * UnderlinedText - Componente de texto con subrayado configurable
 * Default: Sin subrayado (estilo 4) para v0.5
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
  style = 4, // Sin subrayado por default en v0.5
  color = 'primary',
  className = '',
}) => {
  const textColorStyle = color === 'primary'
    ? { color: 'var(--color-primary, #4654CD)' }
    : color === 'white'
    ? { color: 'white' }
    : {};

  const renderUnderline = () => {
    switch (style) {
      case 1: // Onda SVG (curva elegante)
        return (
          <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" fill="none">
            <path d="M2 8C30 4 70 4 98 8" stroke="var(--color-secondary, #03DBD0)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 2: // Línea Punteada (dashed)
        return (
          <span
            className="absolute -bottom-1 left-0 w-full h-1 border-b-[3px] border-dashed"
            style={{ borderColor: 'var(--color-secondary, #03DBD0)' }}
          />
        );

      case 3: // Línea Sólida (simple)
        return (
          <span
            className="absolute -bottom-1 left-0 w-full h-1 rounded-full"
            style={{ backgroundColor: 'var(--color-secondary, #03DBD0)' }}
          />
        );

      case 4: // Sin Subrayado (limpio) - DEFAULT v0.5
        return null;

      case 5: // Marcador Resaltador (highlight)
        return (
          <span
            className="absolute inset-0 -skew-x-3 -z-10 scale-x-110 scale-y-125"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-secondary, #03DBD0) 20%, transparent)' }}
          />
        );

      case 6: // Doble Línea (énfasis)
        return (
          <>
            <span
              className="absolute -bottom-1 left-0 w-full h-0.5"
              style={{ backgroundColor: 'var(--color-secondary, #03DBD0)' }}
            />
            <span
              className="absolute -bottom-2.5 left-0 w-full h-0.5"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-secondary, #03DBD0) 50%, transparent)' }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <span className={`relative inline-block ${className}`} style={textColorStyle}>
      {children}
      {renderUnderline()}
    </span>
  );
};

export default UnderlinedText;
