'use client';

import React from 'react';

/**
 * BrandingLevelV4 - Fintech sutil
 * Minimalista con toques sutiles de marca
 * Profesional, moderno, discreto
 */

interface BrandingLevelProps {
  children?: React.ReactNode;
}

export const BrandingLevelV4: React.FC<BrandingLevelProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header fintech */}
      <header className="border-b border-neutral-50 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <span className="text-neutral-800 font-medium tracking-tight">baldecash</span>
          <div className="w-2 h-2 rounded-full bg-[#4654CD]" />
        </div>
      </header>

      {/* Contenido */}
      <main className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer mínimo */}
      <footer className="py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="w-full h-px bg-neutral-100" />
          <p className="text-xs text-neutral-400 mt-4 text-center">
            BaldeCash - Financiamiento inteligente
          </p>
        </div>
      </footer>
    </div>
  );
};
