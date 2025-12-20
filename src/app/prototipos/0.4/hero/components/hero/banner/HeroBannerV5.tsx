'use client';

/**
 * HeroBannerV5 - Split 50/50 (Equilibrado)
 *
 * Concepto: Pantalla dividida verticalmente
 * Layout: Texto izquierda blanco + Visual derecha primario
 * Referencia: Webflow, Framer, Linear
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, Shield, Clock, Check } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';

export const HeroBannerV5: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
}) => {
  return (
    <section className="min-h-[70vh]">
      <div className="grid md:grid-cols-2 min-h-[70vh]">
        {/* Left: White content */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white">
          {/* Badge */}
          <Chip
            size="sm"
            radius="sm"
            classNames={{
              base: 'bg-[#03DBD0]/20 px-3 py-1 h-auto mb-6 w-fit',
              content: 'text-[#03DBD0] text-xs font-semibold',
            }}
          >
            Financiamiento estudiantil
          </Chip>

          {/* Headline */}
          <h1 className="font-['Baloo_2'] text-4xl md:text-5xl font-bold text-neutral-900 leading-tight mb-4">
            <span>{headline.split(' ').slice(0, -1).join(' ')} </span>
            <span className="text-[#4654CD] relative inline-block">
              {headline.split(' ').slice(-1)[0]}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" fill="none">
                <path d="M2 8C30 4 70 4 98 8" stroke="#03DBD0" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-neutral-600 mb-6 max-w-md">
            {subheadline}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-3xl md:text-4xl font-bold text-[#4654CD]">S/{minQuota}</span>
            <span className="text-neutral-500 text-lg">/mes</span>
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-[#22c55e]/20 px-2 py-0.5 h-auto ml-2',
                content: 'text-[#22c55e] text-xs font-medium',
              }}
            >
              Sin inicial
            </Chip>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              size="lg"
              radius="lg"
              className="bg-[#4654CD] text-white font-semibold px-8 cursor-pointer hover:bg-[#3a47b3] transition-colors"
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              {primaryCta?.text || 'Ver laptops'}
            </Button>
            <Button
              size="lg"
              radius="lg"
              variant="bordered"
              className="border-neutral-300 text-neutral-700 font-medium cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              Como funciona
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#4654CD]" />
              </div>
              <span className="text-neutral-600 text-sm">SBS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#4654CD]" />
              </div>
              <span className="text-neutral-600 text-sm">24h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-[#4654CD]" />
              </div>
              <span className="text-neutral-600 text-sm">Sin aval</span>
            </div>
          </div>
        </div>

        {/* Right: Primary with image */}
        <div className="bg-[#4654CD] flex items-center justify-center p-8 md:p-12 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full border-2 border-white" />
            <div className="absolute bottom-20 left-20 w-60 h-60 rounded-full border border-white" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Laptop Image */}
            <img
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"
              alt="Laptop"
              className="w-full max-w-md mx-auto drop-shadow-2xl mb-8"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />

            {/* Stats */}
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">10,000+</p>
                <p className="text-white/70 text-sm">Estudiantes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">32</p>
                <p className="text-white/70 text-sm">Convenios</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">24h</p>
                <p className="text-white/70 text-sm">Aprobacion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerV5;
