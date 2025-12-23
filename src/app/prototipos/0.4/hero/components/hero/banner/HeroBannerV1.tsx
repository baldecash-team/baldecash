'use client';

/**
 * HeroBannerV1 - Foto Producto Premium (E-commerce Moderno)
 *
 * Concepto: Laptop sobre fondo con pattern, estilo fintech premium
 * Layout: Texto izquierda + Producto derecha con elementos flotantes
 * Referencia: Nubank, Stripe, Linear
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, Shield, Clock, CreditCard, Sparkles, CheckCircle2, GraduationCap, Star } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';
import { UnderlinedText } from '../common/UnderlinedText';

export const HeroBannerV1: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
  underlineStyle = 1,
}) => {
  const router = useRouter();
  const catalogUrl = '/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1';

  return (
    <section className="relative bg-gradient-to-br from-neutral-50 via-white to-[#4654CD]/5 min-h-[85vh] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#4654CD" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#4654CD]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#03DBD0]/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[85vh] py-16">
          {/* Left: Content */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Chip
                startContent={<Sparkles className="w-3.5 h-3.5" />}
                classNames={{
                  base: 'bg-[#4654CD]/10 border border-[#4654CD]/20 px-4 py-2 h-auto',
                  content: 'text-[#4654CD] text-sm font-medium',
                }}
              >
                Financiamiento estudiantil #1 en Perú
              </Chip>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-neutral-800">{headline.split(' ').slice(0, -1).join(' ')} </span>
              <UnderlinedText style={underlineStyle} color="primary">
                {headline.split(' ').slice(-1)[0]}
              </UnderlinedText>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl text-neutral-600 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {subheadline}
            </motion.p>

            {/* Price Card - Aspirational Enhanced */}
            <motion.div
              className="relative inline-flex flex-col sm:flex-row items-stretch gap-0 bg-gradient-to-br from-white via-white to-[#4654CD]/5 rounded-2xl shadow-xl shadow-[#4654CD]/10 border border-[#4654CD]/10 overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Animated gradient border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#4654CD]/20 via-[#03DBD0]/20 to-[#4654CD]/20 animate-pulse opacity-50" style={{ padding: '1px' }} />

              {/* Main Price Section */}
              <div className="relative p-5 sm:p-6 flex flex-col items-center justify-center bg-gradient-to-br from-[#4654CD] to-[#5B68D8]">
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Cuotas desde</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-medium text-white/70">S/</span>
                    <span className="text-5xl sm:text-6xl font-bold text-white drop-shadow-lg">{minQuota}</span>
                  </div>
                  <p className="text-white/80 text-sm font-medium">al mes</p>
                </motion.div>
                {/* Decorative sparkle */}
                <Sparkles className="absolute top-2 right-2 w-4 h-4 text-[#03DBD0] animate-pulse" />
              </div>

              {/* Benefits Section */}
              <div className="relative p-5 sm:p-6 space-y-3 bg-white">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Incluye</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Sin cuota inicial</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Sin aval requerido</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#03DBD0]/10 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-[#03DBD0]" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Tasa preferencial</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="flex flex-wrap gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button
                size="lg"
                radius="lg"
                className="bg-[#4654CD] text-white font-bold px-8 h-14 text-base cursor-pointer hover:bg-[#3a47b3] hover:scale-[1.02] transition-all shadow-lg shadow-[#4654CD]/25"
                endContent={<ArrowRight className="w-5 h-5" />}
                onPress={() => router.push(catalogUrl)}
              >
                {primaryCta?.text || 'Ver equipos disponibles'}
              </Button>
              <Button
                size="lg"
                radius="lg"
                variant="bordered"
                className="border-2 border-neutral-200 text-neutral-700 font-semibold px-8 h-14 text-base cursor-pointer hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                onPress={() => {
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Cómo funciona
              </Button>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              className="flex flex-wrap gap-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#4654CD]" />
                </div>
                <span className="text-neutral-600 text-sm">Regulados SBS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#03DBD0]/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#03DBD0]" />
                </div>
                <span className="text-neutral-600 text-sm">Aprobación 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[#22c55e]" />
                </div>
                <span className="text-neutral-600 text-sm">Sin historial</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Product Image */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Background circles */}
            <div className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-br from-[#4654CD]/10 to-[#03DBD0]/5" />
            <div className="absolute w-[320px] h-[320px] md:w-[400px] md:h-[400px] rounded-full border-2 border-dashed border-[#4654CD]/10" />

            {/* Static decorative elements */}
            <div className="absolute top-10 left-10 w-3 h-3 bg-[#4654CD] rounded-full" />
            <div className="absolute bottom-20 right-5 w-2 h-2 bg-[#03DBD0] rounded-full" />

            {/* Laptop Image - Static */}
            <img
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80"
              alt="Laptop para estudiantes"
              className="relative z-10 w-full max-w-lg drop-shadow-2xl"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />

            {/* Badge - Top Right */}
            <div className="absolute -top-2 right-0 md:right-10 bg-white rounded-xl shadow-xl border border-neutral-100 p-4 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Para estudiantes</p>
                  <p className="text-sm font-bold text-neutral-800">Sin historial</p>
                </div>
              </div>
            </div>

            {/* Badge - Bottom Left */}
            <div className="absolute -bottom-4 left-0 md:left-5 bg-white rounded-xl shadow-xl border border-neutral-100 p-4 z-20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">+10,000 estudiantes</p>
                </div>
              </div>
            </div>

            {/* Price Tag - Right Center */}
            <div className="absolute right-0 md:-right-4 top-1/2 transform -translate-y-1/2 bg-[#4654CD] text-white rounded-xl shadow-xl p-4 z-20">
              <p className="text-xs text-white/70">Cuota</p>
              <p className="text-2xl font-bold">S/{minQuota}</p>
              <p className="text-xs text-white/70">/mes</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 100L48 91.7C96 83.3 192 66.7 288 58.3C384 50 480 50 576 54.2C672 58.3 768 66.7 864 70.8C960 75 1056 75 1152 70.8C1248 66.7 1344 58.3 1392 54.2L1440 50V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroBannerV1;
