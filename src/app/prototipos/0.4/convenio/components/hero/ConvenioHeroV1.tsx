'use client';

/**
 * ConvenioHeroV1 - Hero Clásico Co-branded
 * Version: V1 - Diseño e-commerce con producto + colores de universidad
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, Shield, Clock, CreditCard } from 'lucide-react';
import { ConvenioHeroProps } from '../../types/convenio';
import { calcularCuotaConDescuento } from '../../data/mockConvenioData';

export const ConvenioHeroV1: React.FC<ConvenioHeroProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaDesde, convenio.descuentoCuota);
  const ahorroPorCuota = cuotaDesde - cuotaConDescuento;

  return (
    <div className="relative min-h-[70vh] bg-[#4654CD] overflow-hidden">
      {/* Accent color from university */}
      <div
        className="absolute top-0 right-0 w-1/3 h-full opacity-20"
        style={{ backgroundColor: convenio.colorPrimario }}
      />

      {/* Decorative circles */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
      <div className="absolute top-20 right-1/4 w-40 h-40 rounded-full bg-white/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            {/* Badge convenio */}
            <Chip
              radius="sm"
              classNames={{
                base: 'bg-white/20 backdrop-blur px-3 py-1 h-auto mb-4',
                content: 'text-white text-xs font-medium',
              }}
            >
              Exclusivo para estudiantes {convenio.nombreCorto}
            </Chip>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-['Baloo_2']">
              Tu equipo para clases virtuales
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6">
              Financiamiento hasta 24 meses con {convenio.descuentoCuota}% de descuento en tu cuota
            </p>

            {/* Badge de ahorro */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl px-5 py-4 mb-8">
              <div>
                <p className="text-white/60 text-xs mb-1">Cuota desde</p>
                <p className="text-3xl md:text-4xl font-bold font-['Baloo_2']">
                  S/{cuotaConDescuento}
                  <span className="text-base font-normal text-white/80">/mes</span>
                </p>
              </div>
              <div className="border-l border-white/20 pl-4">
                <p className="text-[#03DBD0] text-sm font-semibold">
                  Ahorras S/{ahorroPorCuota}/mes
                </p>
                <p className="text-white/60 text-xs">vs precio regular</p>
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="bg-white text-[#4654CD] font-bold rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors"
              endContent={<ArrowRight className="w-5 h-5" />}
              onPress={onVerEquipos}
            >
              Ver equipos disponibles
            </Button>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <Shield className="w-4 h-4" />
                <span>Sin historial crediticio</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <Clock className="w-4 h-4" />
                <span>Aprobación en 24h</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <CreditCard className="w-4 h-4" />
                <span>Sin tarjeta</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&h=500&fit=crop"
              alt="Laptop para estudiantes"
              className="w-full rounded-2xl shadow-2xl"
              loading="lazy"
            />
            {/* Logo universidad flotante */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4">
              <img
                src={convenio.logo}
                alt={convenio.nombre}
                className="h-10 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.parentElement!.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvenioHeroV1;
