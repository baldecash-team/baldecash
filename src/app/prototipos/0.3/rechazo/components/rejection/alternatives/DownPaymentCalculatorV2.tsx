'use client';

/**
 * DownPaymentCalculatorV2 - Presets de montos de inicial
 *
 * G.12 V2: Botones presets con input manual
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Button, Input } from '@nextui-org/react';
import { Calculator, ArrowRight } from 'lucide-react';

interface DownPaymentCalculatorV2Props {
  productPrice: number;
  originalMonthlyQuota: number;
  onCalculate?: (downPayment: number, newQuota: number) => void;
}

export const DownPaymentCalculatorV2: React.FC<DownPaymentCalculatorV2Props> = ({
  productPrice,
  originalMonthlyQuota,
  onCalculate,
}) => {
  const presets = [
    { label: '10%', value: productPrice * 0.1 },
    { label: '20%', value: productPrice * 0.2 },
    { label: '30%', value: productPrice * 0.3 },
    { label: '40%', value: productPrice * 0.4 },
  ];

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const downPayment = selectedPreset !== null
    ? presets[selectedPreset].value
    : parseFloat(customAmount) || 0;

  const newQuota = useMemo(() => {
    if (downPayment === 0) return originalMonthlyQuota;
    const amountToFinance = Math.max(0, productPrice - downPayment);
    const interestRate = 0.025;
    const term = 24;
    const quota =
      (amountToFinance * interestRate * Math.pow(1 + interestRate, term)) /
      (Math.pow(1 + interestRate, term) - 1);
    return Math.round(quota);
  }, [downPayment, productPrice, originalMonthlyQuota]);

  const handlePresetClick = (index: number) => {
    setSelectedPreset(index);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPreset(null);
  };

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
              Reduce tu cuota con una inicial
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {presets.map((preset, index) => (
              <Button
                key={index}
                variant={selectedPreset === index ? 'solid' : 'bordered'}
                className={
                  selectedPreset === index
                    ? 'bg-[#4654CD] text-white'
                    : 'border-neutral-300'
                }
                onPress={() => handlePresetClick(index)}
              >
                <div className="text-center">
                  <div className="font-bold">{preset.label}</div>
                  <div className="text-xs opacity-80">
                    S/ {Math.round(preset.value).toLocaleString()}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="mb-4">
            <Input
              type="number"
              label="O ingresa un monto personalizado"
              placeholder="Ej: 500"
              value={customAmount}
              onValueChange={handleCustomChange}
              startContent={
                <span className="text-neutral-400 text-sm">S/</span>
              }
              classNames={{
                inputWrapper: 'border-neutral-200',
              }}
            />
          </div>

          {downPayment > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-neutral-50 rounded-xl p-4 mb-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-neutral-500">Cuota original</p>
                  <p className="text-lg text-neutral-400 line-through">
                    S/ {originalMonthlyQuota}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-300" />
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Nueva cuota</p>
                  <p className="text-xl font-bold text-green-600">
                    S/ {newQuota}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <Button
            className="w-full bg-[#4654CD] text-white"
            isDisabled={downPayment === 0}
            onPress={() => onCalculate?.(downPayment, newQuota)}
          >
            Solicitar con inicial de S/ {Math.round(downPayment).toLocaleString()}
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default DownPaymentCalculatorV2;
