'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Calculator, ExternalLink } from 'lucide-react';

interface DownPaymentCalculatorV3Props {
  productName?: string;
}

/**
 * DownPaymentCalculatorV3 - Link a Calculadora Externa
 * Solo un link para ver opciones en otra página
 */
export const DownPaymentCalculatorV3: React.FC<DownPaymentCalculatorV3Props> = ({
  productName = 'este equipo',
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <p className="font-medium text-neutral-800">¿Puedes pagar una inicial?</p>
          <p className="text-sm text-neutral-500">Calcula cuánto podrías financiar</p>
        </div>
      </div>
      <Button
        variant="light"
        className="text-[#4654CD] cursor-pointer font-medium"
        endContent={<ExternalLink className="w-4 h-4" />}
      >
        Calcular opciones
      </Button>
    </div>
  );
};
