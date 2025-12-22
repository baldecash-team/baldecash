'use client';

import React, { useState } from 'react';
import { Slider, Button } from '@nextui-org/react';
import { Wallet, Calculator, Zap, ArrowRight, Check } from 'lucide-react';
import { DownPaymentCalculator as CalculatorType } from '../../../types/rejection';

interface DownPaymentCalculatorV6Props {
  calculator: CalculatorType;
  productName?: string;
}

/**
 * DownPaymentCalculatorV6 - Hero Central
 * Calculadora como elemento principal de la página
 */
export const DownPaymentCalculatorV6: React.FC<DownPaymentCalculatorV6Props> = ({
  calculator,
  productName = 'tu equipo',
}) => {
  const [downPayment, setDownPayment] = useState(Math.round((calculator.minDownPayment + calculator.maxDownPayment) / 2));

  const remainingAmount = calculator.productPrice - downPayment;
  const estimatedQuota = Math.round(remainingAmount / 12);
  const originalQuota = Math.round(calculator.productPrice / 12);
  const savings = originalQuota - estimatedQuota;

  return (
    <div className="bg-gradient-to-b from-[#4654CD] to-[#3a47b3] rounded-2xl p-8 text-white">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Con una inicial, sí puedes</h2>
        <p className="text-white/70">Ajusta el monto y descubre tu nueva cuota</p>
      </div>

      {/* Calculadora */}
      <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6">
        <div className="text-center mb-6">
          <p className="text-white/60 text-sm mb-2">Tu cuota inicial</p>
          <p className="text-5xl font-bold">S/{downPayment.toLocaleString()}</p>
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
            filler: 'bg-[#03DBD0]',
            thumb: 'bg-white w-7 h-7 shadow-lg cursor-pointer',
            track: 'bg-white/30 h-3',
          }}
        />
        <div className="flex justify-between text-xs text-white/50 mt-2">
          <span>Mínimo S/{calculator.minDownPayment.toLocaleString()}</span>
          <span>Máximo S/{calculator.maxDownPayment.toLocaleString()}</span>
        </div>
      </div>

      {/* Resultado */}
      <div className="bg-white rounded-xl p-6 text-neutral-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Tu nueva cuota mensual</p>
            <p className="text-4xl font-bold text-[#4654CD]">
              S/{estimatedQuota}<span className="text-lg font-normal text-neutral-500">/mes</span>
            </p>
          </div>
          {savings > 0 && (
            <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg">
              <p className="text-xs">Ahorras</p>
              <p className="font-bold">S/{savings}/mes</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm border-t border-neutral-100 pt-4">
          <div>
            <p className="text-neutral-500">A financiar</p>
            <p className="font-semibold">S/{remainingAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-neutral-500">Plazo</p>
            <p className="font-semibold">12 meses</p>
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div className="flex items-center justify-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#03DBD0]" />
          <span className="text-white/80">Sin aval</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#03DBD0]" />
          <span className="text-white/80">Respuesta inmediata</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#03DBD0]" />
          <span className="text-white/80">100% online</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full bg-white text-[#4654CD] font-bold py-6 cursor-pointer hover:bg-neutral-100 transition-colors"
        endContent={<ArrowRight className="w-5 h-5" />}
      >
        Solicitar con S/{downPayment.toLocaleString()} de inicial
      </Button>
    </div>
  );
};
