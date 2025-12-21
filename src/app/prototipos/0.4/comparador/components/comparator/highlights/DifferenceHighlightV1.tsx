'use client';

import React from 'react';
import { DifferenceHighlightProps } from '../../../types/comparator';

/**
 * DifferenceHighlightV1 - Highlight Amarillo
 * Highlight amarillo en celdas diferentes
 * Referencia: Excel, Google Sheets
 */
export const DifferenceHighlightV1: React.FC<DifferenceHighlightProps> = ({
  isDifferent,
  isWinner,
  version,
  children,
}) => {
  let className = 'transition-colors';

  if (isDifferent) {
    if (isWinner) {
      className += ' bg-[#22c55e]/10 ring-2 ring-[#22c55e]/30';
    } else {
      className += ' bg-amber-50';
    }
  }

  return <div className={className}>{children}</div>;
};

/**
 * DifferenceHighlightV2 - Toggle Diferencias
 * Con botón para mostrar/ocultar diferencias
 */
export const DifferenceHighlightV2: React.FC<DifferenceHighlightProps & { visible?: boolean }> = ({
  isDifferent,
  isWinner,
  version,
  children,
  visible = true,
}) => {
  if (!visible && !isDifferent) {
    return null;
  }

  let className = 'transition-all';

  if (isDifferent && visible) {
    if (isWinner) {
      className += ' bg-[#22c55e]/10 border-l-4 border-[#22c55e]';
    } else {
      className += ' bg-neutral-50 border-l-4 border-amber-400';
    }
  }

  return <div className={className}>{children}</div>;
};

/**
 * DifferenceHighlightV3 - Animación Pulsante
 * Animación pulsante para diferencias
 */
export const DifferenceHighlightV3: React.FC<DifferenceHighlightProps> = ({
  isDifferent,
  isWinner,
  version,
  children,
}) => {
  let className = 'transition-all';

  if (isDifferent) {
    if (isWinner) {
      className += ' bg-[#22c55e]/10 animate-pulse';
    } else {
      className += ' bg-amber-50/50';
    }
  }

  return <div className={className}>{children}</div>;
};

/**
 * DifferenceHighlightV4 - Glow Sutil Fintech
 * Diferencias con glow sutil
 */
export const DifferenceHighlightV4: React.FC<DifferenceHighlightProps> = ({
  isDifferent,
  isWinner,
  version,
  children,
}) => {
  let className = 'transition-all rounded-lg';

  if (isDifferent) {
    if (isWinner) {
      className += ' bg-gradient-to-r from-[#22c55e]/5 to-[#22c55e]/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
    } else {
      className += ' bg-gradient-to-r from-neutral-50 to-neutral-100';
    }
  }

  return <div className={className}>{children}</div>;
};

/**
 * DifferenceHighlightV5 - Columna Separada
 * Para uso en layout de columna de diferencias
 */
export const DifferenceHighlightV5: React.FC<DifferenceHighlightProps> = ({
  isDifferent,
  isWinner,
  version,
  children,
}) => {
  if (!isDifferent) {
    return <div className="opacity-50">{children}</div>;
  }

  return (
    <div className={`font-medium ${isWinner ? 'text-[#22c55e]' : 'text-neutral-800'}`}>
      {children}
    </div>
  );
};

/**
 * DifferenceHighlightV6 - Solo Diferencias
 * Solo muestra si hay diferencia
 */
export const DifferenceHighlightV6: React.FC<DifferenceHighlightProps> = ({
  isDifferent,
  isWinner,
  version,
  children,
}) => {
  if (!isDifferent) {
    return null;
  }

  return (
    <div className={`p-4 rounded-xl ${isWinner ? 'bg-[#4654CD] text-white' : 'bg-neutral-100'}`}>
      {children}
    </div>
  );
};

// Export all versions
export const DifferenceHighlight: React.FC<DifferenceHighlightProps> = (props) => {
  switch (props.version) {
    case 1:
      return <DifferenceHighlightV1 {...props} />;
    case 2:
      return <DifferenceHighlightV2 {...props} />;
    case 3:
      return <DifferenceHighlightV3 {...props} />;
    case 4:
      return <DifferenceHighlightV4 {...props} />;
    case 5:
      return <DifferenceHighlightV5 {...props} />;
    case 6:
      return <DifferenceHighlightV6 {...props} />;
    default:
      return <DifferenceHighlightV1 {...props} />;
  }
};
