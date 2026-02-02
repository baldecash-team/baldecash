'use client';

import React from 'react';
import { Package, ArrowRight } from 'lucide-react';
import { EmptyIllustrationProps } from '../../../types/empty';

/**
 * EmptyIllustrationV5 - Split Layout
 * Ilustración izquierda + mensaje y acciones derecha
 * Referencia: Webflow, Framer - layout editorial
 */
export const EmptyIllustrationV5: React.FC<EmptyIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-8 text-center md:text-left ${className}`}>
      {/* Ilustración lado izquierdo */}
      <div className="relative w-40 h-40 flex-shrink-0">
        {/* Fondo circular */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4654CD]/10 to-[#03DBD0]/10 rounded-full" />

        {/* Caja vacía estilizada */}
        <div className="absolute inset-4 flex items-center justify-center">
          <div className="relative">
            {/* Caja 3D */}
            <div className="w-20 h-16 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center bg-white/50">
              <Package className="w-8 h-8 text-neutral-300" />
            </div>
            {/* Sombra */}
            <div className="absolute -bottom-2 left-2 right-2 h-4 bg-neutral-100 rounded-full blur-md" />
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-2 right-2 w-3 h-3 bg-[#4654CD]/30 rounded-full" />
        <div className="absolute bottom-4 left-2 w-4 h-4 bg-[#03DBD0]/30 rounded-full" />
        <div className="absolute top-1/2 right-0 w-2 h-2 bg-neutral-200 rounded-full" />
      </div>

      {/* Mensaje lado derecho */}
      <div className="flex flex-col items-center md:items-start">
        <h3 className="text-xl font-bold text-neutral-800 mb-2">
          Catálogo vacío
        </h3>
        <p className="text-neutral-600 max-w-sm mb-4">
          No hay equipos que coincidan con tu selección actual de filtros
        </p>
        <div className="flex items-center gap-2 text-[#4654CD] text-sm font-medium">
          <span>Ajusta los filtros para ver opciones</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
