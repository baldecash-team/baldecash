'use client';

/**
 * HeroBannerV7 - Asimetrico Bold (Disruptivo)
 *
 * Concepto: Tipografia oversized, elementos fuera del grid
 * Layout: Titulo grande que corta + Laptop rotada + Badge overlap
 * Referencia: Airbnb rebrand, Figma, Pitch
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';

export const HeroBannerV7: React.FC<HeroBannerProps> = ({
  headline,
  minQuota,
  primaryCta,
}) => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      {/* Giant Typography */}
      <div className="absolute top-20 md:top-24 left-0 right-0 px-4">
        <motion.h1
          className="font-['Baloo_2'] text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-black text-neutral-900 leading-[0.85] -ml-2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          TU
          <br />
          LAPTOP
        </motion.h1>
      </div>

      {/* Laptop Image - Rotated */}
      <motion.div
        className="absolute right-0 top-32 md:top-20 w-1/2 md:w-2/5 z-10"
        initial={{ opacity: 0, x: 100, rotate: 10 }}
        animate={{ opacity: 1, x: 20, rotate: 6 }}
        transition={{ duration: 0.8, delay: 0.2 }}
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

      {/* Price Badge - Overlap position */}
      <motion.div
        className="absolute bottom-48 md:bottom-56 right-8 md:right-32 bg-[#03DBD0] text-neutral-900 p-6 md:p-8 rounded-2xl shadow-xl z-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="text-sm font-medium opacity-80">Cuotas desde</p>
        <p className="text-4xl md:text-5xl font-black">S/{minQuota}</p>
        <p className="text-sm font-medium opacity-80">/mes</p>
      </motion.div>

      {/* CTA Area - Bottom left */}
      <motion.div
        className="absolute bottom-16 md:bottom-24 left-4 md:left-12 z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Button
          size="lg"
          className="bg-[#4654CD] text-white font-bold text-lg px-10 py-7 cursor-pointer hover:bg-[#3a47b3] transition-colors"
          endContent={<ArrowRight className="w-6 h-6" />}
        >
          {primaryCta?.text || 'Ver catalogo'}
        </Button>

        {/* Trust signals */}
        <div className="flex gap-6 mt-6">
          <div className="flex items-center gap-2 text-neutral-600">
            <Shield className="w-5 h-5" />
            <span className="text-sm">SBS</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Zap className="w-5 h-5" />
            <span className="text-sm">24h</span>
          </div>
        </div>
      </motion.div>

      {/* Subtitle - Small text */}
      <motion.p
        className="absolute bottom-16 md:bottom-24 right-4 md:right-12 text-sm text-neutral-500 max-w-xs text-right z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        Financiamiento para estudiantes peruanos. Sin historial crediticio. Sin aval.
      </motion.p>
    </section>
  );
};

export default HeroBannerV7;
