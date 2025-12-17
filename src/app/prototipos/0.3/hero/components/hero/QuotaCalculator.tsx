'use client';

/**
 * QuotaCalculator - Mini calculadora de cuotas (Fijo)
 *
 * Implementacion fija segun A.4:
 * - Slider de monto
 * - Selector de plazo
 * - Calculo de cuota estimada en tiempo real
 */

import React, { useState, useMemo } from 'react';
import { Slider, Button } from '@nextui-org/react';
import { Calculator, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuotaCalculatorProps } from '../../types/hero';
import { mockQuotaCalculator, calculateQuota, formatCurrency } from '../../data/mockHeroData';

export const QuotaCalculator: React.FC<QuotaCalculatorProps> = ({
  config = mockQuotaCalculator,
  onCalculate,
}) => {
  const [amount, setAmount] = useState(config.defaultAmount);
  const [selectedTerm, setSelectedTerm] = useState(config.terms[2]); // Default 24 months

  const monthlyQuota = useMemo(() => {
    return calculateQuota(amount, selectedTerm, config.monthlyRate);
  }, [amount, selectedTerm, config.monthlyRate]);

  const handleCalculate = () => {
    onCalculate?.(amount, selectedTerm, monthlyQuota);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 max-w-md"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#4654CD]/10 rounded-lg flex items-center justify-center">
          <Calculator className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">Calcula tu cuota</h3>
          <p className="text-sm text-neutral-500">Simulacion rapida</p>
        </div>
      </div>

      {/* Amount Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-neutral-600">Monto a financiar</label>
          <span className="text-lg font-bold text-[#4654CD]">
            {formatCurrency(amount)}
          </span>
        </div>
        <Slider
          size="md"
          step={100}
          minValue={config.minAmount}
          maxValue={config.maxAmount}
          value={amount}
          onChange={(value) => setAmount(value as number)}
          classNames={{
            track: 'bg-neutral-200',
            filler: 'bg-[#4654CD]',
            thumb: 'bg-[#4654CD] border-2 border-white shadow-md',
          }}
          aria-label="Monto a financiar"
        />
        <div className="flex justify-between text-xs text-neutral-400 mt-1">
          <span>{formatCurrency(config.minAmount)}</span>
          <span>{formatCurrency(config.maxAmount)}</span>
        </div>
      </div>

      {/* Term Selection */}
      <div className="mb-6">
        <label className="text-sm text-neutral-600 mb-2 block">
          Plazo en meses
        </label>
        <div className="flex gap-2">
          {config.terms.map((term) => (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                selectedTerm === term
                  ? 'bg-[#4654CD] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="bg-neutral-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-neutral-500 text-center">Tu cuota mensual seria</p>
        <p className="text-4xl font-bold text-[#4654CD] text-center">
          {formatCurrency(monthlyQuota)}
          <span className="text-lg font-normal text-neutral-500">/mes</span>
        </p>
        <p className="text-xs text-neutral-400 text-center mt-2">
          *Tasa referencial. Sujeto a evaluacion crediticia.
        </p>
      </div>

      {/* CTA */}
      <Button
        className="w-full bg-[#4654CD] text-white font-semibold"
        size="lg"
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={handleCalculate}
      >
        Solicitar este monto
      </Button>
    </motion.div>
  );
};

export default QuotaCalculator;
