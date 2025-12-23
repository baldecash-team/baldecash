'use client';

/**
 * HeroBannerV4 - Abstracto Flotante (Fintech Moderna)
 *
 * Concepto: Shapes geometricos, elementos 3D sutiles, precio flotante
 * Layout: Fondo primario con elementos flotantes animados
 * Referencia: Nubank, Revolut, N26
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, Shield, Clock, Zap, CheckCircle2, Sparkles, GraduationCap } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';
import { UnderlinedText } from '../common/UnderlinedText';

export const HeroBannerV4: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
  underlineStyle = 1,
}) => {
  const router = useRouter();
  const catalogUrl = '/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&card=6&techfilters=3&cols=4&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3&tags=1';

  return (
    <section className="relative min-h-[90vh] bg-[#4654CD] overflow-hidden">
      {/* Modern Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4654CD] via-[#5563d8] to-[#3a47b3]" />

      {/* Animated Floating Shapes */}
      <motion.div
        className="absolute top-[10%] right-[15%] w-72 h-72 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-3xl"
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full bg-[#03DBD0]/15 blur-3xl"
        animate={{ y: [0, 25, 0], x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[30%] left-[20%] w-48 h-48 rounded-full bg-white/5 blur-2xl"
        animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating Geometric Elements */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-4 h-4 bg-[#03DBD0] rounded-full hidden lg:block"
        animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[25%] right-[25%] w-3 h-3 bg-white/40 rounded-full hidden lg:block"
        animate={{ y: [0, 10, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[35%] left-[15%] w-2 h-2 bg-[#03DBD0]/60 rounded-full hidden lg:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* Floating Ring */}
      <motion.div
        className="absolute top-[20%] right-[40%] w-20 h-20 border-2 border-white/10 rounded-full hidden lg:block"
        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[90vh] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-16">
          {/* Left: Content */}
          <div className="space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Chip
                startContent={<Sparkles className="w-3.5 h-3.5" />}
                classNames={{
                  base: 'bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 h-auto',
                  content: 'text-white text-sm font-medium',
                }}
              >
                Financiamiento 100% digital
              </Chip>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span>{headline.split(' ').slice(0, -1).join(' ')} </span>
              <UnderlinedText style={underlineStyle} color="white">
                {headline.split(' ').slice(-1)[0]}
              </UnderlinedText>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl text-white/75 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {subheadline}
            </motion.p>

            {/* Price Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Cuotas desde</p>
                  <p className="text-5xl font-bold text-white">
                    S/{minQuota}
                    <span className="text-xl font-normal text-white/60">/mes</span>
                  </p>
                </div>
                <div className="border-l border-white/20 pl-4">
                  <div className="flex items-center gap-1.5 text-[#03DBD0]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Sin inicial</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#03DBD0] mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Sin aval</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                size="lg"
                radius="lg"
                className="bg-white text-[#4654CD] font-bold px-8 h-14 text-base cursor-pointer hover:bg-neutral-100 hover:scale-[1.02] transition-all shadow-lg shadow-black/10"
                endContent={<ArrowRight className="w-5 h-5" />}
                onPress={() => router.push(catalogUrl)}
              >
                {primaryCta?.text || 'Ver equipos disponibles'}
              </Button>
              <Button
                size="lg"
                radius="lg"
                variant="bordered"
                className="border-2 border-white/30 text-white font-semibold px-8 h-14 text-base cursor-pointer hover:bg-white/10 hover:border-white/50 transition-all"
              >
                Calcular mi cuota
              </Button>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              className="flex flex-wrap gap-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#03DBD0]" />
                </div>
                <span className="text-white/80 text-sm">Aprobación en 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#03DBD0]" />
                </div>
                <span className="text-white/80 text-sm">100% digital</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#03DBD0]" />
                </div>
                <span className="text-white/80 text-sm">Regulados SBS</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Laptop Visual */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Glow Effect Behind Laptop */}
            <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#03DBD0]/30 via-white/10 to-transparent rounded-full blur-3xl" />

            {/* Laptop Image */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=80"
                alt="Laptop para estudiantes"
                className="w-[480px] drop-shadow-2xl"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />

              {/* Floating Badge - Top Right */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 z-20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-[#4654CD]" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Para estudiantes</p>
                    <p className="text-sm font-bold text-neutral-800">Sin historial</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge - Bottom Left */}
              <motion.div
                className="absolute -bottom-2 -left-8 bg-white rounded-xl shadow-xl p-4 z-20"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#22c55e]" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">+10,000</p>
                    <p className="text-sm font-bold text-neutral-800">Aprobados</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Ring */}
              <motion.div
                className="absolute top-1/2 -right-16 transform -translate-y-1/2"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-32 h-32 border-2 border-dashed border-white/20 rounded-full" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
            fillOpacity="0.05"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroBannerV4;
