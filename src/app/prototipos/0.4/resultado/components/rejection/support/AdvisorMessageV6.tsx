'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';

interface AdvisorMessageV6Props {
  onContact?: () => void;
}

/**
 * AdvisorMessageV6 - Mensaje de Esperanza
 * Mensaje prominente y esperanzador
 */
export const AdvisorMessageV6: React.FC<AdvisorMessageV6Props> = ({ onContact }) => {
  return (
    <div className="bg-gradient-to-r from-[#4654CD]/5 to-[#03DBD0]/5 rounded-2xl p-8 text-center border border-[#4654CD]/10">
      <div className="w-16 h-16 bg-[#4654CD]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Heart className="w-8 h-8 text-[#4654CD]" />
      </div>

      <h3 className="text-2xl font-bold text-neutral-800 mb-3">
        Esto no es el final
      </h3>

      <p className="text-neutral-600 max-w-md mx-auto mb-6">
        Muchos de nuestros clientes actuales empezaron igual que tú. Un asesor puede ayudarte a encontrar el camino hacia tu próximo equipo.
      </p>

      <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 mb-6">
        <Sparkles className="w-4 h-4 text-[#4654CD]" />
        <span>El 40% de rechazados logran aprobación en su segunda solicitud</span>
      </div>

      <Button
        size="lg"
        className="bg-[#4654CD] text-white font-bold px-8 cursor-pointer hover:bg-[#3a47b3]"
        startContent={<MessageCircle className="w-5 h-5" />}
        onPress={onContact}
      >
        Hablar con un asesor
      </Button>
    </div>
  );
};
