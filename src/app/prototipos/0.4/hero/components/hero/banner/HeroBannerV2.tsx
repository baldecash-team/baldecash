'use client';

/**
 * HeroBannerV2 - Foto Lifestyle (Aspiracional)
 *
 * Concepto: Estudiante real usando laptop en ambiente universitario
 * Layout: Imagen fullwidth con overlay oscuro + texto izquierda
 * Referencia: Apple Education, Samsung, universidades
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, Shield, Users, Building } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';

export const HeroBannerV2: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
}) => {
  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
        alt="Estudiantes trabajando"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = '0';
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <Chip
            size="sm"
            radius="sm"
            classNames={{
              base: 'bg-white/20 backdrop-blur-sm px-3 py-1 h-auto mb-6',
              content: 'text-white text-xs font-medium',
            }}
          >
            +10,000 estudiantes confian en nosotros
          </Chip>

          {/* Headline */}
          <h1 className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Empieza tu carrera con la{' '}
            <span className="relative inline-block">
              herramienta correcta
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 4 150 4 198 8" stroke="#03DBD0" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
            {subheadline}
          </p>

          {/* Price Highlight */}
          <div className="inline-flex items-baseline gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 mb-8">
            <span className="text-white/70 text-lg">Desde</span>
            <span className="text-4xl md:text-5xl font-bold text-white">S/{minQuota}</span>
            <span className="text-white/70 text-lg">/mes</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              size="lg"
              radius="lg"
              className="bg-[#03DBD0] text-neutral-900 font-semibold px-8 cursor-pointer hover:bg-[#02C3BA] transition-colors"
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              {primaryCta?.text || 'Ver laptops disponibles'}
            </Button>
            <Button
              size="lg"
              radius="lg"
              variant="bordered"
              className="border-white/30 text-white font-medium cursor-pointer hover:bg-white/10 transition-colors"
            >
              Como funciona
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Shield className="w-5 h-5 text-[#03DBD0]" />
              <span>Registrados en SBS</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Users className="w-5 h-5 text-[#03DBD0]" />
              <span>+10,000 estudiantes</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Building className="w-5 h-5 text-[#03DBD0]" />
              <span>32 instituciones aliadas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerV2;
