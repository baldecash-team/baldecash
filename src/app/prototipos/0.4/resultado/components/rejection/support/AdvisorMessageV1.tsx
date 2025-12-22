'use client';

import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';

interface AdvisorMessageV1Props {
  onContact?: () => void;
}

/**
 * AdvisorMessageV1 - Mensaje Optimista
 * "Un asesor puede revisar opciones contigo"
 */
export const AdvisorMessageV1: React.FC<AdvisorMessageV1Props> = ({ onContact }) => {
  return (
    <div className="text-center">
      <p className="text-neutral-600 mb-4">
        Un asesor puede revisar opciones personalizadas contigo y ayudarte a encontrar la mejor alternativa.
      </p>
      <button
        onClick={onContact}
        className="inline-flex items-center gap-2 text-[#4654CD] font-medium hover:underline cursor-pointer"
      >
        <MessageCircle className="w-4 h-4" />
        Hablar con un asesor
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
