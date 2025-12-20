'use client';

/**
 * CronogramaV1 - Timeline Horizontal con Marcadores
 *
 * Visual horizontal timeline showing payment milestones.
 * Shows key months with payment amounts.
 */

import React, { useState } from 'react';
import { Calendar, Check, Clock, Banknote } from 'lucide-react';

export interface CronogramaProps {
  monthlyQuota: number;
  term?: number;
  startDate?: Date;
}

const TERMS = [12, 18, 24, 36, 48];

export const CronogramaV1: React.FC<CronogramaProps> = ({
  monthlyQuota,
  term = 36,
  startDate = new Date(),
}) => {
  const [selectedTerm, setSelectedTerm] = useState(term);

  // Generate milestone months (first, 25%, 50%, 75%, last)
  const getMilestones = () => {
    const milestones = [1];
    const quarter = Math.floor(selectedTerm / 4);
    if (quarter > 1) milestones.push(quarter);
    milestones.push(Math.floor(selectedTerm / 2));
    if (quarter * 3 < selectedTerm) milestones.push(quarter * 3);
    milestones.push(selectedTerm);
    return [...new Set(milestones)].sort((a, b) => a - b);
  };

  const milestones = getMilestones();
  const totalPaid = monthlyQuota * selectedTerm;

  const getMonthName = (monthsFromNow: number) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthsFromNow);
    return date.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Cronograma de Pagos</h3>
          <p className="text-sm text-neutral-500">Visualiza tu plan de financiamiento</p>
        </div>
      </div>

      {/* Term Selector */}
      <div className="flex gap-2 mb-8">
        {TERMS.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTerm(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              selectedTerm === t
                ? 'bg-[#4654CD] text-white shadow-md'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {t}m
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative mb-8">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-neutral-200 rounded-full" />
        <div className="absolute top-5 left-0 h-1 bg-gradient-to-r from-[#4654CD] to-[#6B7AED] rounded-full w-full" />

        {/* Milestones */}
        <div className="relative flex justify-between">
          {milestones.map((month, idx) => {
            const progress = ((month) / selectedTerm) * 100;
            const isFirst = idx === 0;
            const isLast = idx === milestones.length - 1;

            return (
              <div
                key={month}
                className="flex flex-col items-center"
                style={{ width: isFirst || isLast ? 'auto' : `${100 / (milestones.length - 1)}%` }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                  isLast
                    ? 'bg-green-500 text-white'
                    : 'bg-[#4654CD] text-white'
                }`}>
                  {isLast ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-xs font-bold">{month}</span>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-xs font-semibold text-neutral-700">
                    {getMonthName(month - 1)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Cuota {month}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-neutral-500 mb-1">
            <Banknote className="w-4 h-4" />
            <span className="text-xs">Cuota mensual</span>
          </div>
          <p className="text-xl font-bold text-[#4654CD]">S/{monthlyQuota.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-neutral-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Plazo</span>
          </div>
          <p className="text-xl font-bold text-neutral-800">{selectedTerm} meses</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-neutral-500 mb-1">
            <Check className="w-4 h-4" />
            <span className="text-xs">Total</span>
          </div>
          <p className="text-xl font-bold text-neutral-800">S/{totalPaid.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};

export default CronogramaV1;
