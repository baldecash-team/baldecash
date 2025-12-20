'use client';

/**
 * CronogramaV2 - Tabla de Cuotas Mensual
 *
 * Detailed table showing each month's payment.
 * Collapsible sections for longer terms.
 */

import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Check, Clock } from 'lucide-react';

export interface CronogramaProps {
  monthlyQuota: number;
  term?: number;
  startDate?: Date;
}

const TERMS = [12, 18, 24, 36, 48];

export const CronogramaV2: React.FC<CronogramaProps> = ({
  monthlyQuota,
  term = 36,
  startDate = new Date(),
}) => {
  const [selectedTerm, setSelectedTerm] = useState(term);
  const [showAll, setShowAll] = useState(false);

  const getMonthDate = (monthIndex: number) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthIndex);
    return date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  };

  const visibleMonths = showAll ? selectedTerm : Math.min(6, selectedTerm);
  const hasMore = selectedTerm > 6;

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Detalle de Cuotas</h3>
            <p className="text-sm text-neutral-500">{selectedTerm} pagos mensuales</p>
          </div>
        </div>

        {/* Term Pills */}
        <div className="flex gap-1">
          {TERMS.map((t) => (
            <button
              key={t}
              onClick={() => { setSelectedTerm(t); setShowAll(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                selectedTerm === t
                  ? 'bg-[#4654CD] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t}m
            </button>
          ))}
        </div>
      </div>

      {/* Payment Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Cuota</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Fecha</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Monto</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: visibleMonths }, (_, i) => (
              <tr
                key={i}
                className={`border-t border-neutral-100 ${i === visibleMonths - 1 && !showAll ? 'bg-gradient-to-t from-white to-transparent' : ''}`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === selectedTerm - 1
                        ? 'bg-green-100 text-green-600'
                        : 'bg-[#4654CD]/10 text-[#4654CD]'
                    }`}>
                      {i + 1}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-neutral-600 capitalize">
                  {getMonthDate(i)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm font-semibold text-neutral-900">
                    S/{monthlyQuota.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm text-neutral-500">
                    S/{(monthlyQuota * (i + 1)).toFixed(0)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More/Less */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-sm font-medium text-[#4654CD] hover:bg-[#4654CD]/5 rounded-lg transition-colors cursor-pointer"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver las {selectedTerm - 6} cuotas restantes
            </>
          )}
        </button>
      )}

      {/* Total Summary */}
      <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-600">
          <Check className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium">Total a pagar</span>
        </div>
        <p className="text-2xl font-bold text-neutral-900">
          S/{(monthlyQuota * selectedTerm).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default CronogramaV2;
