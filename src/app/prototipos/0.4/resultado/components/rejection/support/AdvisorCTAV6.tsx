'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Headphones, ArrowRight, Check, Clock } from 'lucide-react';

interface AdvisorCTAV6Props {
  onContact?: () => void;
}

/**
 * AdvisorCTAV6 - Asesor como Solución Principal
 * Asesor destacado como la opción principal
 */
export const AdvisorCTAV6: React.FC<AdvisorCTAV6Props> = ({ onContact }) => {
  return (
    <div className="bg-gradient-to-br from-[#4654CD] to-[#3a47b3] rounded-2xl p-8 text-white">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Icono */}
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Headphones className="w-10 h-10 text-white" />
        </div>

        {/* Contenido */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-2">¿Quieres explorar más opciones?</h3>
          <p className="text-white/80 mb-4">
            Un asesor puede revisar tu caso personalmente y encontrar alternativas que se ajusten a tu situación.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-[#03DBD0]" />
              <span>Sin compromiso</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#03DBD0]" />
              <span>Respuesta inmediata</span>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-white text-[#4654CD] font-bold px-8 cursor-pointer hover:bg-neutral-100"
            endContent={<ArrowRight className="w-5 h-5" />}
            onPress={onContact}
          >
            Hablar con un asesor ahora
          </Button>
        </div>
      </div>
    </div>
  );
};
