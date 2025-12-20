'use client';

/**
 * CronogramaV3 - Cards por Año/Semestre
 *
 * Groups payments by year or semester.
 * Shows progress within each period.
 */

import React, { useState } from 'react';
import { Calendar, ChevronRight, Wallet, TrendingUp } from 'lucide-react';

export interface CronogramaProps {
  monthlyQuota: number;
  term?: number;
  startDate?: Date;
}

const TERMS = [12, 18, 24, 36, 48];

export const CronogramaV3: React.FC<CronogramaProps> = ({
  monthlyQuota,
  term = 36,
  startDate = new Date(),
}) => {
  const [selectedTerm, setSelectedTerm] = useState(term);

  // Group by year
  const getYearGroups = () => {
    const groups: { year: number; months: number[]; startMonth: number }[] = [];
    let currentYear = startDate.getFullYear();
    let currentMonths: number[] = [];
    let startMonth = startDate.getMonth();

    for (let i = 0; i < selectedTerm; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);

      if (date.getFullYear() !== currentYear) {
        if (currentMonths.length > 0) {
          groups.push({ year: currentYear, months: currentMonths, startMonth });
        }
        currentYear = date.getFullYear();
        currentMonths = [i + 1];
        startMonth = 0;
      } else {
        currentMonths.push(i + 1);
      }
    }

    if (currentMonths.length > 0) {
      groups.push({ year: currentYear, months: currentMonths, startMonth });
    }

    return groups;
  };

  const yearGroups = getYearGroups();
  const totalAmount = monthlyQuota * selectedTerm;

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Plan por Años</h3>
            <p className="text-sm text-neutral-500">Distribución anual de pagos</p>
          </div>
        </div>

        {/* Term Selector */}
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

      {/* Year Cards */}
      <div className="space-y-3">
        {yearGroups.map((group, idx) => {
          const yearTotal = monthlyQuota * group.months.length;
          const progress = (group.months.length / selectedTerm) * 100;
          const isLastYear = idx === yearGroups.length - 1;

          return (
            <div
              key={group.year}
              className={`p-4 rounded-xl border-2 transition-all ${
                isLastYear
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-neutral-200 bg-neutral-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    isLastYear
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[#4654CD]/10 text-[#4654CD]'
                  }`}>
                    {group.year.toString().slice(-2)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">{group.year}</p>
                    <p className="text-sm text-neutral-500">
                      {group.months.length} cuotas ({group.months[0]} - {group.months[group.months.length - 1]})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-neutral-800">S/{yearTotal.toFixed(0)}</p>
                  <p className="text-xs text-neutral-500">{progress.toFixed(0)}% del total</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isLastYear ? 'bg-green-500' : 'bg-[#4654CD]'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#4654CD]/5 to-[#4654CD]/10 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#4654CD]" />
            <span className="font-medium text-neutral-700">Inversión total</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#4654CD]">S/{totalAmount.toFixed(0)}</p>
            <p className="text-xs text-neutral-500">en {yearGroups.length} año{yearGroups.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronogramaV3;
