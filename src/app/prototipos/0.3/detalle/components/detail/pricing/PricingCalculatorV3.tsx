'use client';

/**
 * PricingCalculatorV3 - Calculadora compacta con tabs
 *
 * Caracteristicas:
 * - Tabs para seleccion de plazo
 * - Diseno compacto y minimalista
 * - Enfocado en la cuota mensual
 */

import React, { useState, useMemo } from 'react';
import { Tabs, Tab, Button, Chip, Tooltip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Info, Check, ArrowRight } from 'lucide-react';
import { PricingCalculatorProps } from '../../../types/detail';
import { calculateQuota, formatCurrency } from '../../../data/mockDetailData';

const termOptions = [
  { value: 12, label: '12 meses', desc: 'Menor costo total' },
  { value: 18, label: '18 meses', desc: 'Equilibrado' },
  { value: 24, label: '24 meses', desc: 'Cuota comoda' },
  { value: 36, label: '36 meses', desc: 'Mas popular' },
  { value: 48, label: '48 meses', desc: 'Cuota minima' },
];

export const PricingCalculatorV3: React.FC<PricingCalculatorProps> = ({
  basePrice,
  discount = 0,
  monthlyRate = 0.012,
}) => {
  const [selectedTerm, setSelectedTerm] = useState('36');

  const finalPrice = basePrice - discount;
  const termNumber = parseInt(selectedTerm);

  const calculations = useMemo(() => {
    const monthlyQuota = calculateQuota(finalPrice, termNumber, monthlyRate);
    const totalAmount = monthlyQuota * termNumber;
    const interestAmount = totalAmount - finalPrice;

    return {
      monthlyQuota,
      totalAmount,
      interestAmount,
    };
  }, [finalPrice, termNumber, monthlyRate]);

  const selectedTermOption = termOptions.find(t => t.value === termNumber);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-[#4654CD]/5 to-[#4654CD]/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#4654CD]" />
            <span className="font-semibold text-neutral-800">Calcula tu cuota</span>
          </div>
          {discount > 0 && (
            <Chip
              size="sm"
              classNames={{
                base: 'bg-[#22c55e] h-6',
                content: 'text-white text-xs font-medium',
              }}
            >
              -{formatCurrency(discount)}
            </Chip>
          )}
        </div>

        {/* Precio */}
        <div className="mt-2 flex items-baseline gap-2">
          {discount > 0 && (
            <span className="text-sm text-neutral-400 line-through">
              {formatCurrency(basePrice)}
            </span>
          )}
          <span className="text-2xl font-bold text-neutral-800 font-['Baloo_2']">
            {formatCurrency(finalPrice)}
          </span>
        </div>
      </div>

      {/* Tabs de plazo */}
      <div className="px-6 py-4 border-b border-neutral-100">
        <Tabs
          selectedKey={selectedTerm}
          onSelectionChange={(key) => setSelectedTerm(key as string)}
          variant="light"
          classNames={{
            tabList: 'gap-1 bg-neutral-100 p-1 rounded-lg w-full',
            cursor: 'bg-white shadow-sm',
            tab: 'h-9 px-2',
            tabContent: 'group-data-[selected=true]:text-[#4654CD] text-xs font-medium',
          }}
        >
          {termOptions.map((term) => (
            <Tab
              key={term.value.toString()}
              title={
                <div className="flex flex-col items-center">
                  <span>{term.value}</span>
                  <span className="text-[10px] opacity-70">meses</span>
                </div>
              }
            />
          ))}
        </Tabs>

        {selectedTermOption && (
          <p className="text-xs text-center text-neutral-500 mt-2">
            {selectedTermOption.desc}
          </p>
        )}
      </div>

      {/* Resultado */}
      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={calculations.monthlyQuota}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="text-center mb-6"
          >
            <p className="text-sm text-neutral-500 mb-1">Tu cuota mensual</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black text-[#4654CD] font-['Baloo_2']">
                S/{Math.round(calculations.monthlyQuota)}
              </span>
              <span className="text-lg text-neutral-400">/mes</span>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Durante {termNumber} meses · Total: {formatCurrency(calculations.totalAmount)}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Desglose compacto */}
        <div className="bg-neutral-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600">Equipo</span>
            <span className="font-medium">{formatCurrency(finalPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-neutral-600 flex items-center gap-1">
              Financiamiento
              <Tooltip
                content={
                  <div className="p-2 max-w-xs">
                    <p className="text-xs text-neutral-300">
                      Costo por diferir tu pago en {termNumber} meses. Sin cargos ocultos.
                    </p>
                  </div>
                }
                classNames={{
                  content: 'bg-neutral-800',
                }}
              >
                <Info className="w-3 h-3 text-neutral-400 cursor-help" />
              </Tooltip>
            </span>
            <span className="font-medium text-neutral-600">
              +{formatCurrency(calculations.interestAmount)}
            </span>
          </div>
        </div>

        {/* Trust signals compactos */}
        <div className="flex justify-center gap-4 mb-4">
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            <Check className="w-3 h-3 text-[#22c55e]" />
            Sin historial
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            <Check className="w-3 h-3 text-[#22c55e]" />
            Sin aval
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            <Check className="w-3 h-3 text-[#22c55e]" />
            5 min
          </span>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          endContent={<ArrowRight className="w-4 h-4" />}
          className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
        >
          Solicitar ahora
        </Button>
      </div>
    </div>
  );
};

export default PricingCalculatorV3;
