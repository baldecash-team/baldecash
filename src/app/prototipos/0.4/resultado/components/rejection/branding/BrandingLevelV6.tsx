'use client';

import React from 'react';

/**
 * BrandingLevelV6 - Un acento
 * Minimalista con un solo elemento de marca destacado
 * Marca presente pero no dominante
 */

export const BrandingLevelV6: React.FC = () => {
  return (
    <header className="py-4 px-4 border-b border-neutral-100 relative">
      {/* Elemento de marca destacado - línea lateral */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4654CD]" />
      <div className="max-w-4xl mx-auto pl-4">
        <span className="text-sm text-neutral-400">BaldeCash</span>
      </div>
    </header>
  );
};
