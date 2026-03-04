'use client';

/**
 * ProductPricing - Calculador de precios y cuotas
 *
 * Muestra el precio, cuota mensual con plazo seleccionable,
 * y boton CTA para solicitar financiamiento.
 */

import React, { useState, useMemo } from 'react';
import { ShoppingCart, CreditCard, CalendarDays, Percent } from 'lucide-react';
import {
  type TermMonths,
  type InitialPaymentPercent,
  termOptions,
  termLabels,
  initialOptions,
  initialLabels,
  calculateQuotaWithInitial,
} from '../../../catalogo/types/catalog';

interface ProductPricingProps {
  price: number;
  originalPrice?: number;
  discount?: number;
  onSolicitar?: () => void;
}

export const ProductPricing: React.FC<ProductPricingProps> = ({
  price,
  originalPrice,
  discount,
  onSolicitar,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<TermMonths>(24);
  const [selectedInitial, setSelectedInitial] = useState<InitialPaymentPercent>(0);

  const pricing = useMemo(() => {
    return calculateQuotaWithInitial(price, selectedTerm, selectedInitial);
  }, [price, selectedTerm, selectedInitial]);

  const quota = pricing.quota;
  const initialAmount = pricing.initialAmount;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-5">
      {/* Price header */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-neutral-900">
            S/ {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-lg text-neutral-400 line-through">
              S/ {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {discount && discount > 0 && (
          <span className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
            <Percent className="w-3.5 h-3.5" />
            {discount}% descuento
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-100" />

      {/* Monthly quota highlight */}
      <div className="bg-[#4654CD]/5 rounded-xl p-4 text-center">
        <p className="text-xs text-neutral-500 mb-1">Cuota mensual desde</p>
        <p className="text-4xl font-bold text-[#4654CD]">
          S/ {formatPrice(quota)}
          <span className="text-base font-normal text-neutral-500"> /mes</span>
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {selectedTerm} meses
          {selectedInitial > 0 && ` con ${selectedInitial}% de inicial (S/ ${formatPrice(initialAmount)})`}
        </p>
      </div>

      {/* Term selector */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="w-4 h-4 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700">Plazo</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {termOptions.map((term) => (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                selectedTerm === term
                  ? 'bg-[#4654CD] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {termLabels[term]}
            </button>
          ))}
        </div>
      </div>

      {/* Initial payment selector */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700">Cuota inicial</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {initialOptions.map((initial) => (
            <button
              key={initial}
              onClick={() => setSelectedInitial(initial)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                selectedInitial === initial
                  ? 'bg-[#4654CD] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {initialLabels[initial]}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onSolicitar}
        className="w-full bg-[#4654CD] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#3a47b3] transition-colors cursor-pointer shadow-lg shadow-[#4654CD]/25 flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-5 h-5" />
        Solicitar ahora
      </button>

      {/* Fine print */}
      <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
        * Las cuotas son referenciales. El monto final puede variar segun evaluacion crediticia.
        Sujeto a aprobacion. TEA referencial.
      </p>
    </div>
  );
};

export default ProductPricing;
