'use client';

/**
 * HeroBannerV6 - Centrado Hero (Impacto Maximo)
 *
 * Concepto: Todo centrado, titulo grande, CTA prominente
 * Layout: Visual arriba + Texto centrado + CTA centrado
 * Referencia: Spotify, Netflix, Apple
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowRight, Play, Shield, Clock, Users, CheckCircle2, GraduationCap } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';
import { UnderlinedText } from '../common/UnderlinedText';

export const HeroBannerV6: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
  underlineStyle = 1,
}) => {
  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-white via-neutral-50 to-[#4654CD]/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid-v6" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4654CD" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid-v6)" />
        </svg>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-[#4654CD]/10 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#03DBD0]/10 blur-[80px]" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-3 h-3 bg-[#4654CD] rounded-full opacity-40" />
      <div className="absolute top-40 left-16 w-2 h-2 bg-[#03DBD0] rounded-full opacity-50" />
      <div className="absolute bottom-32 right-32 w-4 h-4 bg-[#4654CD]/30 rounded-full" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto py-12">
        {/* Product Image with Glow */}
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#4654CD]/20 to-transparent rounded-full blur-3xl scale-75" />
          <img
            src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"
            alt="Laptop para estudiantes"
            className="w-72 md:w-96 mx-auto drop-shadow-2xl relative z-10"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />

          {/* Floating Badge Left */}
          <div className="absolute left-0 md:left-10 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-neutral-100 p-3 hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
            </div>
            <div className="text-left">
              <p className="text-xs text-neutral-500">Sin aval</p>
              <p className="text-sm font-bold text-neutral-800">Sin inicial</p>
            </div>
          </div>

          {/* Floating Badge Right */}
          <div className="absolute right-0 md:right-10 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-neutral-100 p-3 hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-[#4654CD]" />
            </div>
            <div className="text-left">
              <p className="text-xs text-neutral-500">Para</p>
              <p className="text-sm font-bold text-neutral-800">Estudiantes</p>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-['Baloo_2'] text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          <span className="text-neutral-900">{headline.split(' ').slice(0, -1).join(' ')} </span>
          <UnderlinedText style={underlineStyle} color="primary">
            {headline.split(' ').slice(-1)[0]}
          </UnderlinedText>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          {subheadline}
        </p>

        {/* Price Card */}
        <div className="inline-flex flex-col items-center bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-6 mb-10">
          <p className="text-neutral-500 text-base mb-1">Cuotas desde</p>
          <p className="text-6xl md:text-7xl font-bold text-[#4654CD]">
            S/{minQuota}
            <span className="text-2xl md:text-3xl font-normal text-neutral-400">/mes</span>
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              Sin inicial
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              Sin aval
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button
            size="lg"
            radius="lg"
            className="bg-[#4654CD] text-white font-bold px-10 h-14 text-lg cursor-pointer hover:bg-[#3a47b3] hover:scale-[1.02] transition-all shadow-lg shadow-[#4654CD]/25"
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            {primaryCta?.text || 'Ver laptops disponibles'}
          </Button>
          <Button
            size="lg"
            radius="lg"
            variant="bordered"
            className="border-2 border-neutral-200 text-neutral-700 font-semibold h-14 cursor-pointer hover:bg-neutral-50 hover:border-neutral-300 transition-all"
            startContent={<Play className="w-4 h-4 fill-current" />}
          >
            Ver cómo funciona
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#4654CD]" />
            </div>
            <span className="text-neutral-700 text-sm font-medium">Regulados SBS</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-[#03DBD0]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#03DBD0]" />
            </div>
            <span className="text-neutral-700 text-sm font-medium">Aprobación 24h</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#22c55e]" />
            </div>
            <span className="text-neutral-700 text-sm font-medium">+10,000 estudiantes</span>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 80L60 73.3C120 66.7 240 53.3 360 48C480 42.7 600 45.3 720 50.7C840 56 960 64 1080 64C1200 64 1320 56 1380 52L1440 48V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroBannerV6;
