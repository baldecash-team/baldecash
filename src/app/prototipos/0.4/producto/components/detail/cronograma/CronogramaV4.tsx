'use client';

/**
 * CronogramaV4 - Visual Calendar Grid
 *
 * Shows payments in a calendar-like grid format.
 * Interactive hover states.
 */

import React, { useState } from 'react';
import { Calendar, Check, Info } from 'lucide-react';

export interface CronogramaProps {
  monthlyQuota: number;
  term?: number;
  startDate?: Date;
}

const TERMS = [12, 18, 24, 36, 48];
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const CronogramaV4: React.FC<CronogramaProps> = ({
  monthlyQuota,
  term = 36,
  startDate = new Date(),
}) => {
  const [selectedTerm, setSelectedTerm] = useState(term);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const getPaymentMonths = () => {
    const months: { monthIndex: number; year: number; cuotaNum: number }[] = [];
    for (let i = 0; i < selectedTerm; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      months.push({
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        cuotaNum: i + 1,
      });
    }
    return months;
  };

  const paymentMonths = getPaymentMonths();
  const years = [...new Set(paymentMonths.map(m => m.year))];

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Calendario de Pagos</h3>
            <p className="text-sm text-neutral-500">Vista mensual</p>
          </div>
        </div>

        <div className="flex gap-1">
          {TERMS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTerm(t)}
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

      {/* Calendar Grid by Year */}
      <div className="space-y-6">
        {years.map((year) => {
          const yearPayments = paymentMonths.filter(m => m.year === year);

          return (
            <div key={year}>
              <p className="text-sm font-semibold text-neutral-700 mb-3">{year}</p>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                {MONTHS_SHORT.map((month, idx) => {
                  const payment = yearPayments.find(p => p.monthIndex === idx);
                  const isPaymentMonth = !!payment;
                  const isLastPayment = payment?.cuotaNum === selectedTerm;
                  const isHovered = hoveredMonth === payment?.cuotaNum;

                  return (
                    <div
                      key={`${year}-${idx}`}
                      onMouseEnter={() => payment && setHoveredMonth(payment.cuotaNum)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all cursor-pointer ${
                        isPaymentMonth
                          ? isLastPayment
                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                            : isHovered
                              ? 'bg-[#4654CD] text-white shadow-lg scale-110 z-10'
                              : 'bg-[#4654CD]/10 text-[#4654CD] border border-[#4654CD]/20'
                          : 'bg-neutral-50 text-neutral-300'
                      }`}
                    >
                      <span className="font-medium">{month}</span>
                      {isPaymentMonth && (
                        <span className={`text-[10px] ${isHovered ? 'text-white/80' : ''}`}>
                          #{payment.cuotaNum}
                        </span>
                      )}
                      {isLastPayment && (
                        <Check className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Info */}
      {hoveredMonth && (
        <div className="mt-4 p-3 bg-[#4654CD]/5 rounded-lg flex items-center gap-3">
          <Info className="w-5 h-5 text-[#4654CD]" />
          <div>
            <p className="text-sm font-medium text-neutral-800">
              Cuota #{hoveredMonth}: S/{monthlyQuota.toFixed(2)}
            </p>
            <p className="text-xs text-neutral-500">
              Acumulado: S/{(monthlyQuota * hoveredMonth).toFixed(0)}
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#4654CD]/10 border border-[#4654CD]/20" />
            <span className="text-xs text-neutral-600">Cuota</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 border-2 border-green-300" />
            <span className="text-xs text-neutral-600">Última cuota</span>
          </div>
        </div>
        <p className="text-lg font-bold text-neutral-800">
          Total: S/{(monthlyQuota * selectedTerm).toFixed(0)}
        </p>
      </div>
    </div>
  );
};

export default CronogramaV4;
