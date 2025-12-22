'use client';

import React from 'react';

/**
 * RejectionVisualV5 - Split visual
 * Sección neutra arriba + alternativas con color abajo
 * Contraste entre mensaje y opciones positivas
 */

interface RejectionVisualProps {
  children?: React.ReactNode;
}

export const RejectionVisualV5: React.FC<RejectionVisualProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      {/* Sección superior neutra */}
      <div className="bg-neutral-100">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="text-neutral-600 text-sm font-medium">BaldeCash</div>
          </div>
        </div>
      </div>

      {/* Contenido con transición visual */}
      <div className="bg-gradient-to-b from-neutral-100 via-neutral-50 to-[#4654CD]/5">
        <div className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
