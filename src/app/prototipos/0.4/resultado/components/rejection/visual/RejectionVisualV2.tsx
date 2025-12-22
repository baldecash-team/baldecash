'use client';

import React from 'react';

/**
 * RejectionVisualV2 - Cálidos acogedores
 * Beige, crema, sensación de calidez
 * Transmite empatía y acogida en momento difícil
 */

interface RejectionVisualProps {
  children?: React.ReactNode;
}

export const RejectionVisualV2: React.FC<RejectionVisualProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-amber-50/50">
      <div className="bg-amber-100/30 border-b border-amber-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Header cálido */}
          <div className="text-amber-800/70 text-sm font-medium">BaldeCash</div>
        </div>
      </div>
      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white/60 rounded-2xl p-8 shadow-sm border border-amber-100">
          {children}
        </div>
      </div>
    </div>
  );
};
