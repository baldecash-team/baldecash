'use client';

import React from 'react';

/**
 * RejectionVisualV3 - Colores de marca suavizados
 * Color primario al 10% de opacidad
 * Mantiene identidad de marca sin ser agresivo
 */

interface RejectionVisualProps {
  children?: React.ReactNode;
}

export const RejectionVisualV3: React.FC<RejectionVisualProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#4654CD]/5">
      <div className="bg-white border-b border-[#4654CD]/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Header con marca suave */}
          <div className="text-[#4654CD]/80 text-sm font-medium">BaldeCash</div>
        </div>
      </div>
      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-sm border border-[#4654CD]/10">
          {children}
        </div>
      </div>
    </div>
  );
};
