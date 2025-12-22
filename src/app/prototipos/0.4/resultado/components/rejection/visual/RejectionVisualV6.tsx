'use client';

import React from 'react';

/**
 * RejectionVisualV6 - Máxima calma
 * Colores muy suaves, casi blancos
 * Ambiente sereno y de tranquilidad total
 */

interface RejectionVisualProps {
  children?: React.ReactNode;
}

export const RejectionVisualV6: React.FC<RejectionVisualProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header ultraminimal */}
          <div className="text-neutral-400 text-sm">BaldeCash</div>
        </div>
      </div>
      <div className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-neutral-50/50 rounded-3xl p-10 border border-neutral-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
