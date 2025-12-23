'use client';

import React, { useState, useEffect } from 'react';
import { Slider } from '@nextui-org/react';
import { Wallet, Sparkles, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownPaymentCalculator as CalculatorType } from '../../../types/rejection';

interface DownPaymentCalculatorV4Props {
  calculator: CalculatorType;
  productName?: string;
}

/**
 * DownPaymentCalculatorV4 - Calculadora Animada
 * Resultados con animaciones en tiempo real estilo fintech
 */
export const DownPaymentCalculatorV4: React.FC<DownPaymentCalculatorV4Props> = ({
  calculator,
  productName = 'este equipo',
}) => {
  const [downPayment, setDownPayment] = useState(calculator.minDownPayment);
  const [isAnimating, setIsAnimating] = useState(false);

  const remainingAmount = calculator.productPrice - downPayment;
  const estimatedQuota = Math.round(remainingAmount / 12);
  const originalQuota = Math.round(calculator.productPrice / 12);
  const savings = originalQuota - estimatedQuota;

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [downPayment]);

  return (
    <div className="bg-gradient-to-br from-[#4654CD]/5 to-[#03DBD0]/5 rounded-xl p-6 border border-[#4654CD]/20">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-[#4654CD]" />
        <h3 className="font-semibold text-neutral-800">Simula tu pago inicial</h3>
      </div>

      {/* Slider con estilo fintech */}
      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-sm text-neutral-600">Cuota inicial</span>
          <motion.span
            key={downPayment}
            initial={{ scale: 1.1, color: '#4654CD' }}
            animate={{ scale: 1, color: '#4654CD' }}
            className="text-2xl font-bold"
          >
            S/{downPayment.toLocaleString()}
          </motion.span>
        </div>
        <Slider
          size="lg"
          step={calculator.step}
          minValue={calculator.minDownPayment}
          maxValue={calculator.maxDownPayment}
          value={downPayment}
          onChange={(val) => setDownPayment(val as number)}
          classNames={{
            base: 'max-w-full',
            filler: 'bg-gradient-to-r from-[#4654CD] to-[#03DBD0]',
            thumb: 'bg-white border-2 border-[#4654CD] w-6 h-6 shadow-lg cursor-pointer',
            track: 'bg-neutral-200 h-2',
          }}
        />
      </div>

      {/* Resultados animados */}
      <AnimatePresence mode="wait">
        <motion.div
          key={estimatedQuota}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Tu nueva cuota</p>
              <p className="text-3xl font-bold text-[#4654CD]">
                S/{estimatedQuota}<span className="text-base font-normal text-neutral-500">/mes</span>
              </p>
            </div>
            {savings > 0 && (
              <div className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-full">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">-S/{savings}/mes</span>
              </div>
            )}
          </div>

          <div className="text-xs text-neutral-500 flex items-center gap-4">
            <span>Financias: S/{remainingAmount.toLocaleString()}</span>
            <span>•</span>
            <span>12 cuotas</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <button className="w-full mt-4 bg-[#4654CD] text-white py-3 rounded-lg font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors flex items-center justify-center gap-2">
        <Wallet className="w-5 h-5" />
        Continuar con esta opción
      </button>
    </div>
  );
};
