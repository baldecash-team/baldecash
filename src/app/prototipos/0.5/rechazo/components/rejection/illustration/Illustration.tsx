'use client';

/**
 * Illustration - Ilustración de persona reflexiva
 * Versión fija para v0.5 - Estilo V1
 * Persona pensativa mirando hacia adelante
 */

import React from 'react';
import { User, Sparkles } from 'lucide-react';

export const Illustration: React.FC = () => {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        {/* Círculo de fondo */}
        <div className="w-32 h-32 rounded-full bg-neutral-100 flex items-center justify-center">
          <User className="w-16 h-16 text-neutral-400" strokeWidth={1.5} />
        </div>
        {/* Sparkle decorativo */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#4654CD]" />
        </div>
        {/* Pensamiento */}
        <div className="absolute -right-4 top-1/3 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-neutral-200" />
          <div className="w-3 h-3 rounded-full bg-neutral-200" />
          <div className="w-4 h-4 rounded-full bg-neutral-200" />
        </div>
      </div>
    </div>
  );
};

export default Illustration;
