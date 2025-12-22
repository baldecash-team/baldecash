'use client';

import React from 'react';

/**
 * RejectionVisualV4 - Fintech minimalista
 * Neutros con acentos sutiles de color
 * Estilo moderno, limpio, profesional
 */

interface RejectionVisualProps {
  children?: React.ReactNode;
}

export const RejectionVisualV4: React.FC<RejectionVisualProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Header fintech */}
          <div className="text-neutral-800 text-sm font-semibold tracking-tight">BaldeCash</div>
          <div className="w-2 h-2 rounded-full bg-[#4654CD]" />
        </div>
      </div>
      <div className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
