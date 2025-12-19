'use client';

/**
 * DownPaymentCalculatorV1 - Slider para calcular inicial
 *
 * G.12 V1: Slider interactivo para ajustar monto inicial
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Slider, Button } from '@nextui-org/react';
import { Calculator, TrendingDown, CheckCircle } from 'lucide-react';

interface DownPaymentCalculatorV1Props {
  productPrice: number;
  originalMonthlyQuota: number;
  onCalculate?: (downPayment: number, newQuota: number) => void;
}

export const DownPaymentCalculatorV1: React.FC<DownPaymentCalculatorV1Props> = ({
  productPrice,
  originalMonthlyQuota,
  onCalculate,
}) => {
  const [downPayment, setDownPayment] = useState(productPrice * 0.1);

  const minDown = productPrice * 0.1;
  const maxDown = productPrice * 0.5;

  const newQuota = useMemo(() => {
    const amountToFinance = productPrice - downPayment;
    const interestRate = 0.025;
    const term = 24;
    const quota =
      (amountToFinance * interestRate * Math.pow(1 + interestRate, term)) /
      (Math.pow(1 + interestRate, term) - 1);
    return Math.round(quota);
  }, [downPayment, productPrice]);

  const quotaReduction = originalMonthlyQuota - newQuota;
  const percentReduction = Math.round((quotaReduction / originalMonthlyQuota) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border border-neutral-200">
        <CardBody className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-[#4654CD]" />
            <h3 className="font-semibold text-neutral-800">
              ¿Y si das una inicial mayor?
            </h3>
          </div>

          <p className="text-sm text-neutral-600 mb-6">
            Aumentando tu inicial puedes reducir tu cuota mensual y mejorar tus
            posibilidades de aprobación.
          </p>

          <div className="mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-sm text-neutral-500">Inicial</span>
              <span className="text-lg font-bold text-[#4654CD]">
                S/ {Math.round(downPayment).toLocaleString()}
              </span>
            </div>
            <Slider
              size="lg"
              step={50}
              minValue={minDown}
              maxValue={maxDown}
              value={downPayment}
              onChange={(value) => setDownPayment(value as number)}
              className="max-w-full"
              classNames={{
                base: 'px-1',
                track: 'bg-neutral-200 h-2 border-none',
                filler: 'bg-gradient-to-r from-[#4654CD] to-[#5B68D8]',
                thumb: 'w-5 h-5 bg-white border-2 border-[#4654CD] shadow-lg after:bg-[#4654CD] after:w-2 after:h-2 cursor-pointer',
                step: 'bg-neutral-300',
              }}
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-2">
              <span>S/ {Math.round(minDown).toLocaleString()}</span>
              <span>S/ {Math.round(maxDown).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Tu nueva cuota sería</p>
                <p className="text-2xl font-bold text-green-600">
                  S/ {newQuota}/mes
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    -{percentReduction}%
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Ahorras S/ {quotaReduction}/mes
                </p>
              </div>
            </div>
          </div>

          {percentReduction >= 20 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-green-600 text-sm mb-4"
            >
              <CheckCircle className="w-4 h-4" />
              <span>¡Excelente! Con esta inicial podrías calificar</span>
            </motion.div>
          )}

          <Button
            className="w-full bg-[#4654CD] text-white"
            onPress={() => onCalculate?.(downPayment, newQuota)}
          >
            Aplicar con esta inicial
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default DownPaymentCalculatorV1;
