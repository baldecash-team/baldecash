'use client';

/**
 * CronogramaV6 - Comparador de Plazos
 *
 * Side-by-side comparison of different terms.
 * Shows monthly quota vs total cost trade-off.
 */

import React, { useState } from 'react';
import { Calendar, ArrowRight, Check, TrendingDown, Clock, Wallet } from 'lucide-react';

export interface CronogramaProps {
  monthlyQuota: number;
  term?: number;
  startDate?: Date;
}

const TERMS = [12, 18, 24, 36, 48];

export const CronogramaV6: React.FC<CronogramaProps> = ({
  monthlyQuota,
  term = 36,
  startDate = new Date(),
}) => {
  const [selectedTerm, setSelectedTerm] = useState(term);

  // Simulated quota variation by term (shorter = higher monthly, lower total)
  const getQuotaForTerm = (t: number) => {
    const baseTotal = monthlyQuota * 36; // Reference at 36 months
    const factor = 36 / t;
    return (monthlyQuota * factor * 0.95); // Slightly less due to shorter term
  };

  const getTotalForTerm = (t: number) => getQuotaForTerm(t) * t;

  const getEndDate = (t: number) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + t);
    return date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
  };

  // Find cheapest and most affordable
  const totals = TERMS.map(t => ({ term: t, total: getTotalForTerm(t) }));
  const cheapestTotal = Math.min(...totals.map(t => t.total));
  const lowestMonthly = Math.min(...TERMS.map(t => getQuotaForTerm(t)));

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Compara Plazos</h3>
          <p className="text-sm text-neutral-500">Elige el que mejor te convenga</p>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {TERMS.map((t) => {
          const quota = getQuotaForTerm(t);
          const total = getTotalForTerm(t);
          const isSelected = selectedTerm === t;
          const isCheapestTotal = total === cheapestTotal;
          const isLowestMonthly = quota === lowestMonthly;

          return (
            <button
              key={t}
              onClick={() => setSelectedTerm(t)}
              className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                isSelected
                  ? 'border-[#4654CD] bg-[#4654CD]/5 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              {/* Badges */}
              {isCheapestTotal && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Menor costo
                </div>
              )}
              {isLowestMonthly && !isCheapestTotal && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <Wallet className="w-3 h-3" />
                  Más accesible
                </div>
              )}

              {/* Term */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-2xl font-bold ${isSelected ? 'text-[#4654CD]' : 'text-neutral-800'}`}>
                  {t}
                </span>
                <span className="text-xs text-neutral-500">meses</span>
              </div>

              {/* Quota */}
              <div className="mb-2">
                <p className="text-xs text-neutral-500 mb-0.5">Cuota mensual</p>
                <p className={`text-lg font-bold ${isSelected ? 'text-[#4654CD]' : 'text-neutral-800'}`}>
                  S/{quota.toFixed(0)}
                </p>
              </div>

              {/* Total */}
              <div className="pt-2 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 mb-0.5">Total</p>
                <p className="text-sm font-semibold text-neutral-600">
                  S/{total.toFixed(0)}
                </p>
              </div>

              {/* End Date */}
              <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
                <Clock className="w-3 h-3" />
                <span>Hasta {getEndDate(t)}</span>
              </div>

              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#4654CD] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#4654CD]/5 to-[#4654CD]/10 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 mb-1">Plan seleccionado: {selectedTerm} meses</p>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-2xl font-bold text-[#4654CD]">
                  S/{getQuotaForTerm(selectedTerm).toFixed(2)}
                </span>
                <span className="text-neutral-500">/mes</span>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400" />
              <div>
                <span className="text-lg font-bold text-neutral-800">
                  S/{getTotalForTerm(selectedTerm).toFixed(0)}
                </span>
                <span className="text-neutral-500 text-sm"> total</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Terminas en</p>
            <p className="font-semibold text-neutral-800">{getEndDate(selectedTerm)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronogramaV6;
