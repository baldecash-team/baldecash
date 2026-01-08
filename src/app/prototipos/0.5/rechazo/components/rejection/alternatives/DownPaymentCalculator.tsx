'use client';

/**
 * DownPaymentCalculator - Calculadora de cuota inicial
 * Versión fija para v0.5 - Estilo V2 (Ejemplos fijos)
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Wallet, Check } from 'lucide-react';
import { DownPaymentCalculator as CalculatorType } from '../../../types/rejection';

interface DownPaymentCalculatorProps {
  calculator: CalculatorType;
  productName?: string;
}

export const DownPaymentCalculator: React.FC<DownPaymentCalculatorProps> = ({
  calculator,
}) => {
  const examples = [
    { downPayment: 500, label: 'Mínima' },
    { downPayment: 1000, label: 'Recomendada' },
    { downPayment: 2000, label: 'Óptima' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="w-5 h-5 text-[#4654CD]" />
        <h3 className="font-semibold text-neutral-800">Con una cuota inicial accedes a:</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {examples.map((example, index) => {
          const remaining = calculator.productPrice - example.downPayment;
          const quota = Math.round(remaining / 12);
          const isRecommended = example.label === 'Recomendada';

          return (
            <Card
              key={index}
              isPressable
              className={`cursor-pointer transition-all ${
                isRecommended
                  ? 'border-2 border-[#4654CD] shadow-md'
                  : 'border border-neutral-200 hover:border-[#4654CD]/50'
              }`}
            >
              <CardBody className="p-4 text-center relative">
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-[#4654CD] text-white text-[10px] px-2 py-0.5 rounded-bl-lg rounded-tr-lg font-medium">
                    Recomendado
                  </div>
                )}
                <p className="text-xs text-neutral-500 mb-1">{example.label}</p>
                <p className="text-lg font-bold text-[#4654CD] mb-2">
                  S/{example.downPayment.toLocaleString()} inicial
                </p>
                <div className="flex items-center justify-center gap-1 text-neutral-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Cuota de S/{quota}/mes</span>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-neutral-500 text-center mt-2">
        Selecciona una opción para continuar con la solicitud
      </p>
    </motion.div>
  );
};

export default DownPaymentCalculator;
