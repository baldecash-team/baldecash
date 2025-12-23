'use client';

import React from 'react';
import { Heart, Shield, Star } from 'lucide-react';

/**
 * IllustrationTypeV6 - Grande emocional
 * Ilustración de impacto emocional grande
 * Conexión empática visual prominente
 */

export const IllustrationTypeV6: React.FC = () => {
  return (
    <div className="flex justify-center mb-10">
      <div className="relative">
        {/* Círculo principal grande */}
        <div className="w-40 h-40 rounded-full bg-neutral-50 border-2 border-neutral-100 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-neutral-100 flex items-center justify-center">
            <Shield className="w-14 h-14 text-neutral-400" strokeWidth={1} />
          </div>
        </div>

        {/* Decoraciones orbitales */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
            <Star className="w-4 h-4 text-[#4654CD]" />
          </div>
        </div>

        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 rounded-full bg-[#03DBD0]/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#03DBD0]" />
          </div>
        </div>

        {/* Círculos decorativos */}
        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-100" />
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-100" />
      </div>
    </div>
  );
};
