'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { EmptyIllustrationProps } from '../../../types/empty';

/**
 * EmptyIllustrationV3 - Personaje con Lupa
 * Personaje flat animado buscando con lupa
 * Referencia: Notion, Linear - ilustración flat moderna
 */
export const EmptyIllustrationV3: React.FC<EmptyIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Personaje flat con lupa */}
      <div className="relative w-40 h-40 mb-6">
        {/* Cuerpo del personaje */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-24 bg-[rgba(var(--color-primary-rgb),0.2)] rounded-t-3xl" />

        {/* Cabeza */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 bg-[rgba(var(--color-secondary-rgb),0.3)] rounded-full" />

        {/* Ojos */}
        <div className="absolute bottom-24 left-[calc(50%-8px)] w-2 h-2 bg-neutral-600 rounded-full" />
        <div className="absolute bottom-24 left-[calc(50%+4px)] w-2 h-2 bg-neutral-600 rounded-full" />

        {/* Lupa animada */}
        <div className="absolute top-2 right-4 animate-bounce">
          <div className="w-16 h-16 bg-white rounded-full border-4 border-[var(--color-primary)] flex items-center justify-center shadow-lg">
            <Search className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          {/* Mango de la lupa */}
          <div className="absolute -bottom-4 right-0 w-3 h-8 bg-[var(--color-primary)] rounded-full transform rotate-45" />
        </div>

        {/* Brazo extendido */}
        <div className="absolute bottom-16 right-8 w-16 h-3 bg-[rgba(var(--color-primary-rgb),0.2)] rounded-full transform -rotate-45" />
      </div>

      {/* Mensaje */}
      <h3 className="text-xl font-bold text-neutral-800 mb-2">
        Seguimos buscando...
      </h3>
      <p className="text-neutral-600 max-w-md">
        No encontramos laptops con esos filtros. Intenta con opciones más amplias
      </p>
    </div>
  );
};
