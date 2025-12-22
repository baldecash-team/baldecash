'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface AdvisorCTAV2Props {
  onContact?: () => void;
}

/**
 * AdvisorCTAV2 - Link Secundario Sutil
 * Link discreto al final de la página
 */
export const AdvisorCTAV2: React.FC<AdvisorCTAV2Props> = ({ onContact }) => {
  return (
    <div className="text-center py-4 border-t border-neutral-100">
      <button
        onClick={onContact}
        className="inline-flex items-center gap-2 text-[#4654CD] text-sm hover:underline cursor-pointer"
      >
        <MessageCircle className="w-4 h-4" />
        ¿Tienes preguntas? Habla con un asesor
      </button>
    </div>
  );
};
