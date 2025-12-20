'use client';

/**
 * ConvenioHeroV4 - Hero Centrado con Logo Grande
 * Version: V4 - Diseño centrado con logos co-branded prominentes
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowRight, Percent } from 'lucide-react';
import { ConvenioHeroProps } from '../../types/convenio';
import { calcularCuotaConDescuento } from '../../data/mockConvenioData';

export const ConvenioHeroV4: React.FC<ConvenioHeroProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaDesde, convenio.descuentoCuota);

  return (
    <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center text-center px-4 py-16">
      {/* Logos co-branded grandes */}
      <div className="flex items-center gap-6 mb-8">
        <img
          src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
          alt="BaldeCash"
          className="h-12 md:h-16 object-contain"
        />
        <span className="text-3xl md:text-4xl text-neutral-300">×</span>
        <img
          src={convenio.logo}
          alt={convenio.nombre}
          className="h-10 md:h-12 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>

      <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-neutral-800 mb-4 font-['Baloo_2'] max-w-3xl">
        Beneficio exclusivo para{' '}
        <span style={{ color: convenio.colorPrimario }}>{convenio.nombreCorto}</span>
      </h1>

      <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl">
        Financia tu equipo con cuotas desde S/{cuotaConDescuento}/mes y aprovecha el descuento
        por ser estudiante.
      </p>

      {/* Badge de descuento grande */}
      <div
        className="inline-flex items-center gap-3 rounded-full px-6 md:px-8 py-4 text-white mb-8"
        style={{ backgroundColor: convenio.colorPrimario }}
      >
        <Percent className="w-6 md:w-8 h-6 md:h-8" />
        <span className="text-2xl md:text-3xl font-bold font-['Baloo_2']">
          {convenio.descuentoCuota}% OFF
        </span>
        <span className="text-base md:text-lg">en tu cuota mensual</span>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="bg-[#4654CD] text-white font-bold rounded-xl cursor-pointer hover:bg-[#3a47b3] transition-colors px-8"
          endContent={<ArrowRight className="w-5 h-5" />}
          onPress={onVerEquipos}
        >
          Ver equipos con descuento
        </Button>
        <Button
          size="lg"
          variant="bordered"
          className="border-neutral-300 text-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors"
        >
          ¿Cómo funciona?
        </Button>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-6 mt-12 text-neutral-500">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          Sin historial crediticio
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          Aprobación en 24h
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          Hasta 24 cuotas
        </div>
      </div>
    </div>
  );
};

export default ConvenioHeroV4;
