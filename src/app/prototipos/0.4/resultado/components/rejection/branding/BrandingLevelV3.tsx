'use client';

import React from 'react';

/**
 * BrandingLevelV3 - Branding reducido
 * Solo logo pequeño en header
 * Balance entre marca y discreción
 */

export const BrandingLevelV3: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-100 py-3">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#4654CD] flex items-center justify-center">
            <span className="text-white font-bold text-xs">B</span>
          </div>
          <span className="text-sm text-neutral-500">BaldeCash</span>
        </div>
      </div>
    </header>
  );
};
