'use client';

import React from 'react';
import { Laptop, Search } from 'lucide-react';
import { EmptyIllustrationProps } from '../../../types/empty';

/**
 * EmptyIllustrationV2 - Ilustración Lifestyle
 * Estudiante buscando + mensaje empático
 * Referencia: Apple, Samsung - enfoque en experiencia
 */
export const EmptyIllustrationV2: React.FC<EmptyIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Ilustración estilo estudiante */}
      <div className="relative w-48 h-40 mb-6">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-[#4654CD]/5 rounded-full blur-xl" />

        {/* Escritorio */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-4 bg-neutral-200 rounded-t-lg" />

        {/* Laptop */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-16 bg-neutral-300 rounded-t-lg flex items-center justify-center">
          <Laptop className="w-8 h-8 text-neutral-500" />
        </div>

        {/* Persona simplificada */}
        <div className="absolute bottom-12 right-6 w-12 h-12 bg-[#03DBD0]/30 rounded-full" />
        <div className="absolute bottom-6 right-8 w-8 h-14 bg-[#03DBD0]/20 rounded-lg" />

        {/* Lupa */}
        <div className="absolute top-4 right-4 w-10 h-10 bg-[#4654CD]/10 rounded-full flex items-center justify-center animate-pulse">
          <Search className="w-5 h-5 text-[#4654CD]" />
        </div>
      </div>

      {/* Mensaje empático */}
      <h3 className="text-xl font-bold text-neutral-800 mb-2">
        No hay resultados para tu búsqueda
      </h3>
      <p className="text-neutral-600 max-w-md">
        Entendemos que buscas algo específico. Ajusta los filtros para encontrar la laptop perfecta para ti
      </p>
    </div>
  );
};
