'use client';

import React from 'react';

/**
 * BrandingLevelV5 - Split
 * Header con marca fuerte (fondo azul)
 * Transición visual de marca a contenido neutro
 */

export const BrandingLevelV5: React.FC = () => {
  return (
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
  );
};
