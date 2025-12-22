'use client';

import React from 'react';

/**
 * BrandingLevelV6 - Un acento
 * Minimalista con un solo elemento de marca destacado
 * Marca presente pero no dominante
 */

interface BrandingLevelProps {
  children?: React.ReactNode;
}

export const BrandingLevelV6: React.FC<BrandingLevelProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Elemento de marca destacado - línea lateral */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4654CD]" />

      {/* Header mínimo */}
      <header className="py-6 px-4">
        <div className="max-w-4xl mx-auto pl-4">
          <span className="text-sm text-neutral-400">BaldeCash</span>
        </div>
      </header>

      {/* Contenido */}
      <main className="py-8 px-4">
        <div className="max-w-xl mx-auto pl-4">
          {children}
        </div>
      </main>
    </div>
  );
};
