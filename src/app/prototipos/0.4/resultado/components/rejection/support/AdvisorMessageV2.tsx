'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface AdvisorMessageV2Props {
  onContact?: () => void;
}

/**
 * AdvisorMessageV2 - Mensaje Neutral
 * "¿Tienes preguntas? Estamos aquí"
 */
export const AdvisorMessageV2: React.FC<AdvisorMessageV2Props> = ({ onContact }) => {
  return (
    <div className="flex items-center justify-center gap-2 text-neutral-500 text-sm">
      <HelpCircle className="w-4 h-4" />
      <span>¿Tienes preguntas?</span>
      <button
        onClick={onContact}
        className="text-[#4654CD] hover:underline cursor-pointer"
      >
        Estamos aquí para ayudarte
      </button>
    </div>
  );
};
