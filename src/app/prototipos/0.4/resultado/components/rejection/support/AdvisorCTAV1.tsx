'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { MessageCircle, ArrowRight } from 'lucide-react';

interface AdvisorCTAV1Props {
  onContact?: () => void;
}

/**
 * AdvisorCTAV1 - CTA Prominente
 * Botón grande "Habla con un asesor"
 */
export const AdvisorCTAV1: React.FC<AdvisorCTAV1Props> = ({ onContact }) => {
  return (
    <div className="text-center py-6">
      <Button
        size="lg"
        className="bg-[#4654CD] text-white font-bold px-8 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
        startContent={<MessageCircle className="w-5 h-5" />}
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onContact}
      >
        Habla con un asesor
      </Button>
      <p className="text-sm text-neutral-500 mt-3">
        Respuesta en menos de 5 minutos por WhatsApp
      </p>
    </div>
  );
};
