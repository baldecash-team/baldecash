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
import { UnderlinedText } from '../common/UnderlinedText';

export const HeroBannerV5: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
  underlineStyle = 1,
}) => {
  return (
    <section className="min-h-[80vh]">
      <div className="grid md:grid-cols-2 min-h-[80vh]">
        {/* Left: White content */}
        <div className="flex flex-col justify-center p-8 md:p-14 lg:p-20 bg-white">
          {/* Badge */}
          <Chip
            size="md"
            radius="md"
            classNames={{
              base: 'bg-[#03DBD0]/15 px-4 py-1.5 h-auto mb-8 w-fit',
              content: 'text-[#03DBD0] text-sm font-semibold',
            }}
          >
            Financiamiento estudiantil
          </Chip>

          {/* Headline */}
          <h1 className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
            <span>{headline.split(' ').slice(0, -1).join(' ')} </span>
            <UnderlinedText style={underlineStyle} color="primary">
              {headline.split(' ').slice(-1)[0]}
            </UnderlinedText>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-lg leading-relaxed">
            {subheadline}
          </p>

          {/* Price Card */}
          <div className="inline-flex items-center gap-4 bg-neutral-50 rounded-2xl p-5 mb-10 border border-neutral-100">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Cuotas desde</p>
              <span className="text-4xl md:text-5xl font-bold text-[#4654CD]">S/{minQuota}</span>
              <span className="text-neutral-400 text-lg">/mes</span>
            </div>
            <div className="border-l border-neutral-200 pl-4 space-y-1">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#22c55e]" />
                <span className="text-sm text-neutral-600">Sin inicial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#22c55e]" />
                <span className="text-sm text-neutral-600">Sin aval</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 mb-10">
            <Button
              size="lg"
              radius="lg"
              className="bg-[#4654CD] text-white font-bold px-10 h-14 text-base cursor-pointer hover:bg-[#3a47b3] hover:scale-[1.02] transition-all shadow-lg shadow-[#4654CD]/20"
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              {primaryCta?.text || 'Ver laptops'}
            </Button>
            <Button
              size="lg"
              radius="lg"
              variant="bordered"
              className="border-2 border-neutral-200 text-neutral-700 font-semibold h-14 cursor-pointer hover:bg-neutral-50 hover:border-neutral-300 transition-all"
            >
              Cómo funciona
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#4654CD]" />
              </div>
              <span className="text-neutral-700 text-sm font-medium">Regulados SBS</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#03DBD0]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#03DBD0]" />
              </div>
              <span className="text-neutral-700 text-sm font-medium">Aprobación 24h</span>
            </div>
          </div>
        </div>

        {/* Right: Primary with image */}
        <div className="bg-gradient-to-br from-[#4654CD] via-[#5563d8] to-[#3a47b3] flex items-center justify-center p-8 md:p-12 lg:p-16 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-48 h-48 rounded-full border-2 border-white" />
            <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full border border-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Laptop Image */}
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-[#03DBD0]/20 rounded-full blur-3xl scale-75" />
              <img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"
                alt="Laptop"
                className="w-full max-w-lg mx-auto drop-shadow-2xl relative z-10"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-10">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">10,000+</p>
                <p className="text-white/70 text-sm mt-1">Estudiantes</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-4xl font-bold text-white">32</p>
                <p className="text-white/70 text-sm mt-1">Convenios</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-4xl font-bold text-white">24h</p>
                <p className="text-white/70 text-sm mt-1">Aprobación</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerV5;
