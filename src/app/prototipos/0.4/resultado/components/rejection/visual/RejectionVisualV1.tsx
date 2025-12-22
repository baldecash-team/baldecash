'use client';

import React from 'react';

/**
 * RejectionVisualV1 - Neutros fríos
 * Grises suaves, sin color de marca prominente
 * Transmite calma sin asociación directa con la marca
 */

interface RejectionVisualProps {
  children?: React.ReactNode;
}

export const RejectionVisualV1: React.FC<RejectionVisualProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="bg-neutral-200/50 border-b border-neutral-300">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Header minimalista */}
          <div className="text-neutral-500 text-sm">BaldeCash</div>
        </div>
      </div>
      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
