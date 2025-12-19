'use client';

/**
 * HeroBannerV8 - Data-Driven (Confianza por Numeros)
 *
 * Concepto: Numeros grandes, contadores animados, estadisticas prominentes
 * Layout: Titulo + Stats grandes + Cuota destacada + CTA
 * Referencia: Fintech dashboards, Stripe metrics
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';

const stats = [
  { value: '10,000+', label: 'laptops financiadas', color: 'text-[#4654CD]' },
  { value: '32', label: 'convenios educativos', color: 'text-[#03DBD0]' },
  { value: '24h', label: 'tiempo de aprobacion', color: 'text-[#22c55e]' },
];

export const HeroBannerV8: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
}) => {
  return (
    <section className="min-h-[80vh] bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4654CD]/10 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-[#4654CD]" />
            <span className="text-[#4654CD] text-sm font-medium">Financiamiento estudiantil en Peru</span>
          </div>
          <h1 className="font-['Baloo_2'] text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {headline}
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            {subheadline}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-8 rounded-2xl bg-neutral-50 border border-neutral-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            >
              <p className={`text-5xl md:text-6xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </p>
              <p className="text-neutral-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Price Highlight */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="inline-block bg-gradient-to-r from-[#4654CD] to-[#5B68D8] rounded-3xl p-8 md:p-10">
            <p className="text-white/80 text-xl mb-2">Cuotas desde</p>
            <p className="text-6xl md:text-7xl font-bold text-white">
              S/{minQuota}<span className="text-2xl md:text-3xl font-normal opacity-80">/mes</span>
            </p>
            <p className="text-white/70 text-sm mt-2">Sin historial crediticio requerido</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-[#4654CD] text-white font-semibold px-10 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            {primaryCta?.text || 'Ver laptops disponibles'}
          </Button>

          {/* Trust badges */}
          <div className="flex justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-neutral-500">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Regulados por SBS</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Proceso 100% digital</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBannerV8;
