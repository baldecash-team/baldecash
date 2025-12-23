'use client';

/**
 * ConvenioHeroV2 - Hero con Video/Foto de Campus
 * Version: V2 - Imagen de fondo con estudiantes en campus
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ConvenioHeroProps } from '../../types/convenio';
import { calcularCuotaConDescuento } from '../../data/mockConvenioData';

export const ConvenioHeroV2: React.FC<ConvenioHeroProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaDesde, convenio.descuentoCuota);

  const beneficios = [
    `${convenio.descuentoCuota}% de descuento exclusivo`,
    'Sin historial crediticio',
    'Aprobación en 24 horas',
    'Entrega en campus',
  ];

  return (
    <div className="relative min-h-[80vh]">
      {/* Background image - campus/students */}
      <img
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop"
        alt="Campus universitario"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24 min-h-[80vh] flex items-center">
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
              S/{cuotaConDescuento}
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

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: convenio.colorPrimario }}
              endContent={<ArrowRight className="w-5 h-5" />}
              onPress={onVerEquipos}
            >
              Ver equipos disponibles
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="border-white/30 text-white rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
            >
              ¿Cómo funciona?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvenioHeroV2;
