'use client';

/**
 * PricingCalculator - Calculadora Interactiva de Cuotas
 *
 * Caracteristicas:
 * - Slider de plazo (12-48 meses)
 * - Calculo en tiempo real
 * - Muestra cuota, total e intereses
 * - Transparencia financiera completa
 */

import React, { useState, useMemo } from 'react';
import { Slider, Button, Chip } from '@nextui-org/react';
import { Calculator, Calendar, Percent, CreditCard, ChevronRight, Check } from 'lucide-react';
import { PricingCalculatorProps } from '../../../types/detail';
import { calculateQuota, formatCurrency } from '../../../data/mockDetailData';

const termOptions = [12, 18, 24, 36, 48];

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  basePrice,
  discount = 0,
  monthlyRate = 0.012,
}) => {
  const [selectedTerm, setSelectedTerm] = useState(36);
  const [showDetails, setShowDetails] = useState(false);

  const finalPrice = basePrice - discount;

  const calculations = useMemo(() => {
    const monthlyQuota = calculateQuota(finalPrice, selectedTerm, monthlyRate);
    const totalAmount = monthlyQuota * selectedTerm;
    const interestAmount = totalAmount - finalPrice;
    const annualRate = monthlyRate * 12 * 100;

    return {
      monthlyQuota,
      totalAmount,
      interestAmount,
      annualRate,
    };
  }, [finalPrice, selectedTerm, monthlyRate]);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800">Calcula tu cuota</h3>
            <p className="text-sm text-neutral-500">Ajusta el plazo a tu medida</p>
          </div>
        </div>

        {discount > 0 && (
          <Chip
            size="sm"
            radius="sm"
            classNames={{
              base: 'bg-[#22c55e] px-2.5 py-1 h-auto',
              content: 'text-white text-xs font-medium',
            }}
          >
            Ahorras {formatCurrency(discount)}
          </Chip>
        )}
      </div>

      {/* Precio */}
      <div className="flex items-baseline gap-2">
        {discount > 0 && (
          <span className="text-lg text-neutral-400 line-through">
            {formatCurrency(basePrice)}
          </span>
        )}
        <span className="text-2xl font-bold text-neutral-800">
          {formatCurrency(finalPrice)}
        </span>
      </div>

      {/* Botones de plazo */}
      <div>
        <label className="text-sm text-neutral-600 mb-2 block">Elige tu plazo</label>
        <div className="flex gap-2 flex-wrap">
          {termOptions.map((term) => (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                selectedTerm === term
                  ? 'bg-[#4654CD] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {term} meses
            </button>
          ))}
        </div>
      </div>

      {/* Slider alternativo */}
      <div className="hidden">
        <Slider
          aria-label="Plazo en meses"
          step={6}
          minValue={12}
          maxValue={48}
          value={selectedTerm}
          onChange={(value) => setSelectedTerm(value as number)}
          classNames={{
            track: 'bg-neutral-200',
            filler: 'bg-[#4654CD]',
            thumb: 'bg-[#4654CD] border-2 border-white shadow-md',
          }}
        />
      </div>

      {/* Resultado principal */}
      <div className="bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-xl p-6 text-center">
        <p className="text-sm text-neutral-600 mb-1">Tu cuota mensual</p>
        <p className="text-4xl font-black text-[#4654CD]">
          {formatCurrency(calculations.monthlyQuota)}
          <span className="text-lg font-normal text-neutral-500">/mes</span>
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          Durante {selectedTerm} meses
        </p>
      </div>

      {/* Desglose de transparencia */}
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-neutral-100">
          <span className="text-neutral-600 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Precio del equipo
          </span>
          <span className="font-medium text-neutral-800">{formatCurrency(finalPrice)}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-neutral-100">
          <span className="text-neutral-600 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Financiamiento
          </span>
          <span className="font-medium text-neutral-800">
            {formatCurrency(calculations.interestAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 bg-neutral-50 px-3 rounded-lg -mx-3">
          <span className="font-semibold text-neutral-800">Total a pagar</span>
          <span className="font-bold text-lg text-neutral-800">
            {formatCurrency(calculations.totalAmount)}
          </span>
        </div>
      </div>

      {/* Info adicional */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between text-sm text-[#4654CD] hover:underline cursor-pointer"
      >
        <span>Ver detalle de tasas</span>
        <ChevronRight
          className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`}
        />
      </button>

      {showDetails && (
        <div className="p-4 bg-neutral-50 rounded-lg text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-600">Tasa mensual</span>
            <span className="font-medium">{(monthlyRate * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">CAT anual</span>
            <span className="font-medium">{calculations.annualRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Cargos adicionales</span>
            <span className="font-medium text-[#22c55e]">Sin cargos ocultos</span>
          </div>
        </div>
      )}

      {/* Trust signals */}
      <div className="flex flex-wrap gap-2 pt-2">
        <span className="flex items-center gap-1 text-xs text-neutral-500">
          <Check className="w-3 h-3 text-[#22c55e]" />
          Sin historial crediticio
        </span>
        <span className="flex items-center gap-1 text-xs text-neutral-500">
          <Check className="w-3 h-3 text-[#22c55e]" />
          Sin aval
        </span>
        <span className="flex items-center gap-1 text-xs text-neutral-500">
          <Check className="w-3 h-3 text-[#22c55e]" />
          Pre-aprobacion en 5 min
        </span>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
      >
        Solicitar ahora por {formatCurrency(calculations.monthlyQuota)}/mes
      </Button>
    </div>
  );
};

export default PricingCalculator;
