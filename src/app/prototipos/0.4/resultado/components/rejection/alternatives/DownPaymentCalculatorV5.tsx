'use client';

import React, { useState } from 'react';
import { Slider, Card, CardBody } from '@nextui-org/react';
import { Wallet, Check, ArrowRight } from 'lucide-react';
import { DownPaymentCalculator as CalculatorType } from '../../../types/rejection';

interface DownPaymentCalculatorV5Props {
  calculator: CalculatorType;
  productName?: string;
}

/**
 * DownPaymentCalculatorV5 - Split Layout
 * Calculadora a la izquierda, resultados a la derecha
 */
export const DownPaymentCalculatorV5: React.FC<DownPaymentCalculatorV5Props> = ({
  calculator,
  productName = 'este equipo',
}) => {
  const [downPayment, setDownPayment] = useState(calculator.minDownPayment);

  const remainingAmount = calculator.productPrice - downPayment;
  const estimatedQuota = Math.round(remainingAmount / 12);
  const originalQuota = Math.round(calculator.productPrice / 12);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Lado izquierdo - Calculadora */}
      <div className="bg-white rounded-xl p-5 border border-neutral-200">
        <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#4654CD]" />
          Ajusta tu inicial
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-600">Monto de inicial</span>
              <span className="font-bold text-[#4654CD]">S/{downPayment.toLocaleString()}</span>
            </div>
            <Slider
              size="md"
              step={calculator.step}
              minValue={calculator.minDownPayment}
              maxValue={calculator.maxDownPayment}
              value={downPayment}
              onChange={(val) => setDownPayment(val as number)}
              classNames={{
                filler: 'bg-[#4654CD]',
                thumb: 'bg-white border-2 border-[#4654CD] cursor-pointer',
                track: 'bg-neutral-200',
              }}
            />
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Precio del equipo</span>
              <span className="text-neutral-700">S/{calculator.productPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-neutral-500">A financiar</span>
              <span className="font-medium text-neutral-800">S/{remainingAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Resultado */}
      <Card className="bg-[#4654CD] text-white">
        <CardBody className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Tu nueva cuota mensual</p>
            <p className="text-4xl font-bold mb-1">
              S/{estimatedQuota}<span className="text-lg font-normal opacity-70">/mes</span>
            </p>
            <p className="text-sm text-white/60">
              Antes: S/{originalQuota}/mes
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-[#03DBD0]" />
              <span>12 cuotas fijas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-[#03DBD0]" />
              <span>Sin intereses ocultos</span>
            </div>
          </div>

          <button className="w-full mt-4 bg-white text-[#4654CD] py-3 rounded-lg font-semibold cursor-pointer hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2">
            Aplicar ahora
            <ArrowRight className="w-4 h-4" />
          </button>
        </CardBody>
      </Card>
    </div>
  );
};
