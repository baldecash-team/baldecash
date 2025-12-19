'use client';

/**
 * PricingCalculatorV2 - Calculadora con slider interactivo
 *
 * Caracteristicas:
 * - Slider interactivo de plazo
 * - Cards de resumen con animaciones
 * - Visualizacion de ahorro por plazo
 */

import React, { useState, useMemo } from 'react';
import { Slider, Button, Chip, Card, CardBody } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Calendar, TrendingDown, Wallet, Check, Sparkles } from 'lucide-react';
import { PricingCalculatorProps } from '../../../types/detail';
import { calculateQuota, formatCurrency } from '../../../data/mockDetailData';

export const PricingCalculatorV2: React.FC<PricingCalculatorProps> = ({
  basePrice,
  discount = 0,
  monthlyRate = 0.012,
}) => {
  const [selectedTerm, setSelectedTerm] = useState(36);

  const finalPrice = basePrice - discount;

  const calculations = useMemo(() => {
    const monthlyQuota = calculateQuota(finalPrice, selectedTerm, monthlyRate);
    const totalAmount = monthlyQuota * selectedTerm;
    const interestAmount = totalAmount - finalPrice;
    const annualRate = monthlyRate * 12 * 100;

    // Calcular cuota mas corta y mas larga para comparacion
    const shortestQuota = calculateQuota(finalPrice, 12, monthlyRate);
    const longestQuota = calculateQuota(finalPrice, 48, monthlyRate);

    return {
      monthlyQuota,
      totalAmount,
      interestAmount,
      annualRate,
      shortestQuota,
      longestQuota,
    };
  }, [finalPrice, selectedTerm, monthlyRate]);

  const getTermLabel = (term: number) => {
    if (term <= 18) return 'Plazo corto';
    if (term <= 30) return 'Plazo medio';
    return 'Plazo largo';
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4654CD] to-[#6B7AE8] flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800">Calcula tu cuota</h3>
            <p className="text-sm text-neutral-500">Desliza para ajustar tu plazo</p>
          </div>
        </div>

        {discount > 0 && (
          <Chip
            size="sm"
            radius="sm"
            startContent={<Sparkles className="w-3 h-3" />}
            classNames={{
              base: 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-2.5 py-1 h-auto',
              content: 'text-white text-xs font-medium',
            }}
          >
            Ahorras {formatCurrency(discount)}
          </Chip>
        )}
      </div>

      {/* Precio con descuento */}
      <div className="flex items-center gap-3">
        {discount > 0 && (
          <span className="text-lg text-neutral-400 line-through">
            {formatCurrency(basePrice)}
          </span>
        )}
        <span className="text-3xl font-bold text-neutral-800 font-['Baloo_2']">
          {formatCurrency(finalPrice)}
        </span>
      </div>

      {/* Slider interactivo */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-neutral-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            {selectedTerm} meses
          </span>
          <Chip
            size="sm"
            variant="flat"
            classNames={{
              base: 'bg-[#4654CD]/10',
              content: 'text-[#4654CD] text-xs font-medium',
            }}
          >
            {getTermLabel(selectedTerm)}
          </Chip>
        </div>

        <Slider
          aria-label="Plazo en meses"
          step={6}
          minValue={12}
          maxValue={48}
          value={selectedTerm}
          onChange={(value) => setSelectedTerm(value as number)}
          showSteps
          classNames={{
            base: 'w-full',
            track: 'bg-neutral-200 h-2',
            filler: 'bg-gradient-to-r from-[#4654CD] to-[#6B7AE8]',
            thumb: 'bg-[#4654CD] border-3 border-white shadow-lg w-6 h-6 cursor-grab active:cursor-grabbing',
            step: 'bg-neutral-300',
          }}
        />

        <div className="flex justify-between text-xs text-neutral-400">
          <span>12 meses</span>
          <span>24 meses</span>
          <span>36 meses</span>
          <span>48 meses</span>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`quota-${calculations.monthlyQuota}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#4654CD] to-[#5B68D8] border-none">
              <CardBody className="p-4 text-center">
                <p className="text-white/80 text-xs mb-1">Tu cuota mensual</p>
                <p className="text-3xl font-black text-white font-['Baloo_2']">
                  {formatCurrency(calculations.monthlyQuota)}
                </p>
                <p className="text-white/70 text-xs mt-1">/mes</p>
              </CardBody>
            </Card>
          </motion.div>
        </AnimatePresence>

        <Card className="bg-neutral-50 border border-neutral-200">
          <CardBody className="p-4 text-center">
            <p className="text-neutral-500 text-xs mb-1">Total a pagar</p>
            <p className="text-2xl font-bold text-neutral-800 font-['Baloo_2']">
              {formatCurrency(calculations.totalAmount)}
            </p>
            <p className="text-neutral-400 text-xs mt-1">en {selectedTerm} cuotas</p>
          </CardBody>
        </Card>
      </div>

      {/* Comparativa de cuotas */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <p className="text-xs text-neutral-500 mb-3 flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          Compara tus opciones
        </p>
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-xs text-neutral-400">12 meses</p>
            <p className="font-semibold text-neutral-700">{formatCurrency(calculations.shortestQuota)}/mes</p>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="text-center bg-[#4654CD]/10 px-3 py-1 rounded-lg">
            <p className="text-xs text-[#4654CD]">{selectedTerm} meses</p>
            <p className="font-bold text-[#4654CD]">{formatCurrency(calculations.monthlyQuota)}/mes</p>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="text-center">
            <p className="text-xs text-neutral-400">48 meses</p>
            <p className="font-semibold text-neutral-700">{formatCurrency(calculations.longestQuota)}/mes</p>
          </div>
        </div>
      </div>

      {/* Desglose */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center py-2">
          <span className="text-neutral-600 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Precio del equipo
          </span>
          <span className="font-medium text-neutral-800">{formatCurrency(finalPrice)}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-neutral-600">Costo de financiamiento</span>
          <span className="font-medium text-neutral-600">{formatCurrency(calculations.interestAmount)}</span>
        </div>
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap gap-3 pt-2">
        <span className="flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-full">
          <Check className="w-3 h-3 text-[#22c55e]" />
          Sin historial crediticio
        </span>
        <span className="flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-full">
          <Check className="w-3 h-3 text-[#22c55e]" />
          Sin aval
        </span>
        <span className="flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-full">
          <Check className="w-3 h-3 text-[#22c55e]" />
          Pre-aprobacion en 5 min
        </span>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full bg-gradient-to-r from-[#4654CD] to-[#5B68D8] text-white font-semibold cursor-pointer shadow-lg shadow-[#4654CD]/30"
      >
        Solicitar ahora por {formatCurrency(calculations.monthlyQuota)}/mes
      </Button>
    </div>
  );
};

export default PricingCalculatorV2;
