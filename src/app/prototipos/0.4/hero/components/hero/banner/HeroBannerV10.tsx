'use client';

/**
 * HeroBannerV10 - Interactivo (Engagement Inmediato)
 *
 * Concepto: Calculadora de cuotas inline, sliders interactivos
 * Layout: Titulo + Calculadora prominente + CTA contextual
 * Referencia: Stripe Pricing, calculadoras fintech, Kayak
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button, Slider } from '@nextui-org/react';
import { ArrowRight, Calculator, Shield, Clock } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';

const terms = [12, 18, 24, 36, 48];

export const HeroBannerV10: React.FC<HeroBannerProps> = ({
  primaryCta,
}) => {
  const [monto, setMonto] = useState(2500);
  const [plazoIndex, setPlazoIndex] = useState(2); // 24 meses default
  const plazo = terms[plazoIndex];

  // Calcular cuota con formula de cuota fija
  const cuota = useMemo(() => {
    const r = 0.012; // 1.2% mensual
    const n = plazo;
    const quota = monto * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.ceil(quota);
  }, [monto, plazo]);

  return (
    <section className="min-h-[85vh] bg-[#4654CD] text-white py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-medium">Simulador de cuotas</span>
          </div>
          <h1 className="font-['Baloo_2'] text-4xl md:text-5xl font-bold mb-4">
            Calcula tu cuota
          </h1>
          <p className="text-white/80 text-lg">
            Descubre cuanto pagarias al mes por tu laptop
          </p>
        </motion.div>

        {/* Calculator Card */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Monto */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="text-white/90 font-medium">Monto a financiar</label>
              <span className="text-2xl font-bold">S/{monto.toLocaleString()}</span>
            </div>
            <Slider
              aria-label="Monto a financiar"
              value={monto}
              onChange={(value) => setMonto(value as number)}
              minValue={1000}
              maxValue={5000}
              step={100}
              classNames={{
                base: 'max-w-full',
                track: 'bg-white/20 h-2',
                filler: 'bg-[#03DBD0]',
                thumb: 'bg-white border-2 border-[#03DBD0] w-5 h-5 shadow-lg cursor-pointer',
              }}
            />
            <div className="flex justify-between text-white/60 text-sm mt-2">
              <span>S/1,000</span>
              <span>S/5,000</span>
            </div>
          </div>

          {/* Plazo */}
          <div className="mb-8">
            <label className="block text-white/90 font-medium mb-4">Plazo en meses</label>
            <div className="flex gap-2 flex-wrap">
              {terms.map((t, index) => (
                <Button
                  key={t}
                  size="lg"
                  variant={plazoIndex === index ? 'solid' : 'bordered'}
                  className={`flex-1 min-w-[60px] cursor-pointer transition-all ${
                    plazoIndex === index
                      ? 'bg-white text-[#4654CD] font-bold'
                      : 'border-white/30 text-white hover:bg-white/10'
                  }`}
                  onPress={() => setPlazoIndex(index)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="border-t border-white/20 pt-8">
            <p className="text-white/60 text-center mb-2">Tu cuota mensual seria</p>
            <motion.p
              className="text-6xl md:text-7xl font-bold text-center text-white"
              key={cuota}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              S/{cuota}<span className="text-2xl font-normal opacity-80">/mes</span>
            </motion.p>
            <p className="text-white/50 text-center text-sm mt-2">
              Tasa: 1.2% mensual | Total: S/{(cuota * plazo).toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="bg-white text-[#4654CD] font-bold px-12 text-lg cursor-pointer hover:bg-neutral-100 transition-colors"
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            {primaryCta?.text || `Solicitar S/${monto.toLocaleString()}`}
          </Button>

          {/* Trust badges */}
          <div className="flex justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Shield className="w-4 h-4" />
              <span>Sin historial crediticio</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Clock className="w-4 h-4" />
              <span>Aprobacion en 24h</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBannerV10;
