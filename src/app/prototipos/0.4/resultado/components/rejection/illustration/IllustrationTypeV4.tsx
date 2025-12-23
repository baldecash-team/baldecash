'use client';

import React from 'react';

/**
 * IllustrationTypeV4 - Shapes abstractos
 * Formas geométricas flotantes, estilo fintech
 * Moderno, abstracto, profesional
 */

export const IllustrationTypeV4: React.FC = () => {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative w-40 h-32">
        {/* Círculo grande */}
        <div className="absolute left-4 top-4 w-16 h-16 rounded-full bg-[#4654CD]/10" />

        {/* Cuadrado rotado */}
        <div className="absolute right-4 top-8 w-10 h-10 rounded-lg bg-[#4654CD]/15 transform rotate-12" />

        {/* Círculo pequeño */}
        <div className="absolute left-1/2 bottom-4 w-8 h-8 rounded-full bg-[#4654CD]/20" />

        {/* Rectángulo */}
        <div className="absolute left-8 bottom-0 w-20 h-3 rounded-full bg-neutral-200" />

        {/* Punto decorativo */}
        <div className="absolute right-8 top-4 w-4 h-4 rounded-full bg-[#03DBD0]/30" />

        {/* Línea decorativa */}
        <div className="absolute left-1/2 top-0 w-0.5 h-8 bg-neutral-200 transform -translate-x-1/2" />
      </div>
    </div>
  );
};
