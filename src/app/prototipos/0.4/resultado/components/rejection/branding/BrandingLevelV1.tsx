'use client';

import React from 'react';

/**
 * BrandingLevelV1 - Minimalista extremo
 * Menos elementos posibles en momento difícil
 * Solo contenido esencial, sin distracciones
 */

interface BrandingLevelProps {
  children?: React.ReactNode;
}

export const BrandingLevelV1: React.FC<BrandingLevelProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sin header, máxima simplicidad */}
      <div className="py-16 px-4">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
