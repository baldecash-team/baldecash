'use client';

/**
 * HeroBannerV4 - Abstracto Flotante (Fintech Moderna)
 *
 * Concepto: Shapes geometricos, elementos 3D sutiles, precio flotante
 * Layout: Fondo primario con elementos flotantes animados
 * Referencia: Nubank, Revolut, N26
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ArrowRight, Shield, Clock, Zap } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';

export const HeroBannerV4: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
}) => {
  return (
    <section className="relative min-h-[80vh] bg-[#4654CD] overflow-hidden">
      {/* Floating shapes */}
      <motion.div
        className="absolute top-20 right-20 w-40 h-40 rounded-full bg-white/10 blur-xl"
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 left-10 w-60 h-60 rounded-full bg-[#03DBD0]/20 blur-2xl"
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-40 left-1/4 w-32 h-32 rounded-full bg-white/5 blur-lg"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Price badge floating */}
      <motion.div
        className="absolute top-32 right-16 bg-white rounded-2xl shadow-2xl p-6 z-20 hidden lg:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <p className="text-neutral-500 text-sm">Cuotas desde</p>
        <p className="text-4xl font-bold text-[#4654CD]">
          S/{minQuota}<span className="text-lg font-normal text-neutral-400">/mes</span>
        </p>
        <p className="text-xs text-neutral-400 mt-1">Sin historial crediticio</p>
      </motion.div>

      {/* Trust badge floating */}
      <motion.div
        className="absolute bottom-32 right-32 bg-white/10 backdrop-blur-sm rounded-xl p-4 z-20 hidden lg:flex items-center gap-3"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Shield className="w-5 h-5 text-[#03DBD0]" />
        <span className="text-white text-sm">Regulados por SBS</span>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-2xl">
          {/* Headline */}
          <motion.h1
            className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-lg md:text-xl text-white/80 mb-8 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {subheadline}
          </motion.p>

          {/* Mobile Price */}
          <motion.div
            className="lg:hidden bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-white/70 text-sm">Cuotas desde</p>
            <p className="text-3xl font-bold text-white">
              S/{minQuota}<span className="text-lg font-normal text-white/70">/mes</span>
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="bg-white text-[#4654CD] font-semibold px-8 cursor-pointer hover:bg-neutral-100 transition-colors"
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              {primaryCta?.text || 'Ver laptops'}
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="border-white/30 text-white font-medium cursor-pointer hover:bg-white/10 transition-colors"
            >
              Calcular cuota
            </Button>
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            className="flex flex-wrap gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Clock className="w-4 h-4 text-[#03DBD0]" />
              <span>Aprobacion en 24h</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Zap className="w-4 h-4 text-[#03DBD0]" />
              <span>100% digital</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Shield className="w-4 h-4 text-[#03DBD0]" />
              <span>Sin aval ni garante</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating laptop */}
      <motion.div
        className="absolute right-10 bottom-0 w-80 lg:w-96 hidden md:block"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80"
          alt="Laptop"
          className="w-full drop-shadow-2xl"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </motion.div>
    </section>
  );
};

export default HeroBannerV4;
