'use client';

import React, { useState } from 'react';
import { Slider } from '@nextui-org/react';
import { Wallet, Calculator, ArrowRight } from 'lucide-react';
import { DownPaymentCalculator as CalculatorType } from '../../../types/rejection';

interface DownPaymentCalculatorV1Props {
  calculator: CalculatorType;
  productName?: string;
}

/**
 * DownPaymentCalculatorV1 - Calculadora con Slider Interactivo
 * Slider prominente con actualización en tiempo real
 */
export const DownPaymentCalculatorV1: React.FC<DownPaymentCalculatorV1Props> = ({
  calculator,
  productName = 'este equipo',
}) => {
  const [downPayment, setDownPayment] = useState(calculator.minDownPayment);

  const remainingAmount = calculator.productPrice - downPayment;
  const estimatedQuota = Math.round(remainingAmount / 12);

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-800">Calculadora de inicial</h3>
          <p className="text-sm text-neutral-500">Ajusta el monto y ve tu nueva cuota</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Slider de inicial */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-600">Cuota inicial</span>
            <span className="font-bold text-[#4654CD] text-xl">S/{downPayment.toLocaleString()}</span>
          </div>
          <Slider
            size="lg"
            step={calculator.step}
            minValue={calculator.minDownPayment}
            maxValue={calculator.maxDownPayment}
            value={downPayment}
            onChange={(val) => setDownPayment(val as number)}
            className="max-w-full"
            classNames={{
              base: 'max-w-full',
              filler: 'bg-[#4654CD]',
              thumb: 'bg-white border-2 border-[#4654CD] w-5 h-5 shadow-md cursor-pointer after:bg-[#4654CD]',
              track: 'bg-neutral-200 h-2',
            }}
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>S/{calculator.minDownPayment.toLocaleString()}</span>
            <span>S/{calculator.maxDownPayment.toLocaleString()}</span>
          </div>
        </div>

        {/* Resultado */}
        <div className="bg-[#4654CD]/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-600">Monto a financiar</span>
            <span className="font-semibold text-neutral-800">S/{remainingAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Tu nueva cuota mensual</span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-[#4654CD]">S/{estimatedQuota}</span>
              <span className="text-sm text-neutral-500">/mes</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full flex items-center justify-center gap-2 bg-[#4654CD] text-white py-3 rounded-lg font-semibold cursor-pointer hover:bg-[#3a47b3] transition-colors">
          <Wallet className="w-5 h-5" />
          <span>Aplicar con S/{downPayment.toLocaleString()} de inicial</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
