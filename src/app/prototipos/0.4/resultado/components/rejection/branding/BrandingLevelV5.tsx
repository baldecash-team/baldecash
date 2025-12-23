'use client';

import React from 'react';

/**
 * BrandingLevelV5 - Split
 * Header con marca + contenido minimalista
 * Transición visual de marca a contenido neutro
 */

interface BrandingLevelProps {
  children?: React.ReactNode;
}

export const BrandingLevelV5: React.FC<BrandingLevelProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header con marca fuerte */}
      <header className="bg-[#4654CD] py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-[#4654CD] font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-white">BaldeCash</span>
          </div>
        </div>
      </header>

      {/* Contenido minimalista */}
      <main className="py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-sm border border-neutral-100">
          {children}
        </div>
      </main>
    </div>
  );
};
