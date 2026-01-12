'use client';

/**
 * ConvenioHero - Hero con imagen de campus (basado en V2)
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ConvenioData } from '../../../types/convenio';
import { calcularCuotaConDescuento } from '../../../data/mockConvenioData';
import { formatMoney } from '../../../../utils/formatMoney';

interface ConvenioHeroProps {
  convenio: ConvenioData;
  cuotaDesde?: number;
  catalogUrl: string;
}

export const ConvenioHero: React.FC<ConvenioHeroProps> = ({
  convenio,
  cuotaDesde = 49,
  catalogUrl,
}) => {
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaDesde, convenio.descuentoCuota);

  const beneficios = [
    `${convenio.descuentoCuota}% de descuento exclusivo`,
    'Sin historial crediticio',
    'Aprobación en 24 horas',
    'Entrega en campus',
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop"
        alt="Campus universitario"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-32 pb-16 md:pt-40 md:pb-24 min-h-screen flex items-center">
        <div className="max-w-xl">
          {/* Badge */}
          <Chip
            radius="sm"
            classNames={{
              base: 'px-3 py-1 h-auto mb-4',
              content: 'text-white text-xs font-medium',
            }}
            style={{ backgroundColor: convenio.colorPrimario }}
          >
            Convenio exclusivo
          </Chip>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-['Baloo_2']">
            Financia tu equipo con beneficios {convenio.nombreCorto}
          </h1>

          <p className="text-lg text-white/80 mb-6">
            Como estudiante de {convenio.nombre}, tienes acceso a condiciones especiales de financiamiento.
          </p>

          {/* Price highlight */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6 inline-block">
            <p className="text-white/60 text-sm mb-1">Cuotas desde</p>
            <p className="text-4xl font-bold text-white font-['Baloo_2']">
              S/{formatMoney(cuotaConDescuento)}
              <span className="text-lg font-normal text-white/70">/mes</span>
            </p>
          </div>

          {/* Benefits list */}
          <ul className="space-y-2 mb-8">
            {beneficios.map((beneficio, index) => (
              <li key={index} className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 text-[#03DBD0] flex-shrink-0" />
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            as="a"
            href={catalogUrl}
            size="lg"
            className="text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: convenio.colorPrimario }}
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            Ver equipos disponibles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConvenioHero;
