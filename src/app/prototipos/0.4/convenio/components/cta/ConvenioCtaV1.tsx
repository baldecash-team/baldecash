'use client';

/**
 * ConvenioCtaV1 - CTA simple con botón grande
 * Version: V1 - Call to action básico y prominente
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowRight, Shield, Clock } from 'lucide-react';
import { ConvenioCtaProps } from '../../types/convenio';
import { calcularCuotaConDescuento } from '../../data/mockConvenioData';

export const ConvenioCtaV1: React.FC<ConvenioCtaProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaDesde, convenio.descuentoCuota);

  return (
    <section className="py-16 bg-[#4654CD]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Baloo_2']">
          ¿Listo para tu nuevo equipo?
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          Aprovecha tu descuento exclusivo por ser estudiante de {convenio.nombreCorto}.
          Cuotas desde S/{cuotaConDescuento}/mes.
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          className="bg-white text-[#4654CD] font-bold rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors px-10 py-6 text-lg"
          endContent={<ArrowRight className="w-5 h-5" />}
          onPress={onVerEquipos}
        >
          Ver equipos disponibles
        </Button>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Shield className="w-4 h-4" />
            <span>Sin historial crediticio</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Clock className="w-4 h-4" />
            <span>Aprobación en 24 horas</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConvenioCtaV1;
