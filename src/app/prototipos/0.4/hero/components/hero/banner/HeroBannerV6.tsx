'use client';

/**
 * HeroBannerV6 - Centrado Hero (Impacto Maximo)
 *
 * Concepto: Todo centrado, titulo grande, CTA prominente
 * Layout: Visual arriba + Texto centrado + CTA centrado
 * Referencia: Spotify, Netflix, Apple
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, Play, Shield, Clock, Users } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';

export const HeroBannerV6: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
}) => {
  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 bg-neutral-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#4654CD]/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#03DBD0]/5 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Product Image */}
        <div className="mb-8">
          <img
            src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
            alt="Laptop"
            className="w-64 md:w-80 mx-auto drop-shadow-xl"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Badge */}
        <Chip
          size="sm"
          radius="sm"
          classNames={{
            base: 'bg-[#4654CD]/10 px-4 py-1.5 h-auto mb-6',
            content: 'text-[#4654CD] text-sm font-medium',
          }}
        >
          Financiamiento para estudiantes peruanos
        </Chip>

        {/* Headline */}
        <h1 className="font-['Baloo_2'] text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 leading-tight mb-6">
          {headline}
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-2xl mx-auto">
          {subheadline}
        </p>

        {/* Price */}
        <div className="mb-10">
          <p className="text-neutral-500 text-lg mb-2">Cuotas desde</p>
          <p className="text-6xl md:text-7xl font-bold text-[#4654CD]">
            S/{minQuota}<span className="text-2xl md:text-3xl font-normal text-neutral-400">/mes</span>
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <Button
            size="lg"
            className="bg-[#4654CD] text-white font-semibold px-10 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            {primaryCta?.text || 'Ver laptops desde S/49/mes'}
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className="border-neutral-300 text-neutral-700 font-medium cursor-pointer hover:bg-neutral-100 transition-colors"
            startContent={<Play className="w-4 h-4" />}
          >
            Ver como funciona
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-8">
          <div className="flex items-center gap-2 text-neutral-600">
            <Shield className="w-5 h-5 text-[#4654CD]" />
            <span>Regulados por SBS</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Clock className="w-5 h-5 text-[#4654CD]" />
            <span>Aprobacion en 24h</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Users className="w-5 h-5 text-[#4654CD]" />
            <span>+10,000 estudiantes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerV6;
