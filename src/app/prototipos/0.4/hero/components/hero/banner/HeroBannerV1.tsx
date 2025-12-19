'use client';

/**
 * HeroBannerV1 - Foto Producto (E-commerce Clasico)
 *
 * Concepto: Laptop sobre fondo neutro, estilo catalogo profesional
 * Layout: Texto izquierda + Producto derecha
 * Referencia: Amazon, Best Buy, Mercado Libre
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Monitor, ArrowRight, Shield, Clock, CreditCard } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';

export const HeroBannerV1: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
  trustSignals,
}) => {
  return (
    <section className="bg-neutral-50 min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center py-12 md:py-20">
          {/* Left: Content */}
          <div className="space-y-6">
            {/* Badge */}
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-[#4654CD]/10 px-3 py-1 h-auto',
                content: 'text-[#4654CD] text-xs font-medium',
              }}
            >
              Financiamiento estudiantil
            </Chip>

            {/* Headline */}
            <h1 className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold text-[#4654CD] leading-tight">
              {headline}
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-neutral-600 max-w-lg">
              {subheadline}
            </p>

            {/* Price Badge */}
            <div className="flex items-center gap-4">
              <Chip
                size="lg"
                radius="sm"
                classNames={{
                  base: 'bg-[#4654CD] px-4 py-2 h-auto',
                  content: 'text-white text-lg font-bold',
                }}
              >
                Desde S/{minQuota}/mes
              </Chip>
              <span className="text-neutral-500 text-sm">Sin inicial</span>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-[#4654CD] text-white font-semibold px-8 cursor-pointer hover:bg-[#3a47b3] transition-colors"
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                {primaryCta?.text || 'Ver laptops disponibles'}
              </Button>
              <Button
                size="lg"
                variant="bordered"
                className="border-neutral-300 text-neutral-700 font-medium cursor-pointer hover:bg-neutral-100 transition-colors"
              >
                Como funciona
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-neutral-600 text-sm">
                <Shield className="w-4 h-4 text-[#4654CD]" />
                <span>Registrados en SBS</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600 text-sm">
                <Clock className="w-4 h-4 text-[#4654CD]" />
                <span>Aprobacion en 24h</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600 text-sm">
                <CreditCard className="w-4 h-4 text-[#4654CD]" />
                <span>Sin historial</span>
              </div>
            </div>
          </div>

          {/* Right: Product Image */}
          <div className="relative flex items-center justify-center">
            {/* Background circle */}
            <div className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full bg-[#4654CD]/5" />

            {/* Laptop Image */}
            <img
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80"
              alt="Laptop para estudiantes"
              className="relative z-10 w-full max-w-md drop-shadow-xl"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />

            {/* Floating Badge */}
            <div className="absolute -bottom-4 right-8 bg-white rounded-xl shadow-lg px-4 py-3 z-20">
              <p className="text-xs text-neutral-500">Cuota mensual</p>
              <p className="text-2xl font-bold text-[#4654CD]">S/{minQuota}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerV1;
