'use client';

/**
 * CronogramaV4 - Compact Payment Grid
 *
 * Optimized grid showing only payment months.
 * Touch-friendly with tap interactions.
 * Progress indicator included.
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Check, X, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

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
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate monthly quota based on selected term
  const baseTotal = monthlyQuota * term;
  const adjustedQuota = baseTotal / selectedTerm;

  const ITEMS_PER_PAGE = 12;

  const paymentMonths = useMemo(() => {
    const months: { monthIndex: number; year: number; cuotaNum: number; date: Date }[] = [];
    for (let i = 0; i < selectedTerm; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      months.push({
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        cuotaNum: i + 1,
        date,
      });
    }
    return months;
  }, [selectedTerm, startDate]);

  const totalPages = Math.ceil(paymentMonths.length / ITEMS_PER_PAGE);
  const currentPayments = paymentMonths.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleMonthClick = (cuotaNum: number) => {
    setSelectedMonth(selectedMonth === cuotaNum ? null : cuotaNum);
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Cronograma de Pagos</h3>
            <p className="text-sm text-neutral-500">{selectedTerm} cuotas mensuales</p>
          </div>
        </div>

        <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl">
          {TERMS.map((t) => (
            <button
              key={t}
              onClick={() => { setSelectedTerm(t); setCurrentPage(0); setSelectedMonth(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedTerm === t
                  ? 'bg-[#4654CD] text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t}m
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5 p-3 bg-neutral-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4654CD]" />
            <span className="text-xs font-medium text-neutral-600">Progreso total</span>
          </div>
          <span className="text-xs font-bold text-[#4654CD]">
            {currentPage * ITEMS_PER_PAGE + currentPayments.length} / {selectedTerm} cuotas
          </span>
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4654CD] to-[#6B7AE5] rounded-full transition-all"
            style={{ width: `${((currentPage * ITEMS_PER_PAGE + currentPayments.length) / selectedTerm) * 100}%` }}
          />
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-8 h-8 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  currentPage === i
                    ? 'bg-[#4654CD] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Payment Grid - Solo meses con pago */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {currentPayments.map((payment) => {
          const isSelected = selectedMonth === payment.cuotaNum;
          const isLastPayment = payment.cuotaNum === selectedTerm;
          const isFirstPayment = payment.cuotaNum === 1;

          return (
            <button
              key={payment.cuotaNum}
              onClick={() => handleMonthClick(payment.cuotaNum)}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all cursor-pointer border-2 ${
                isSelected
                  ? 'bg-[#4654CD] text-white border-[#4654CD] shadow-lg scale-105 z-10'
                  : isLastPayment
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : isFirstPayment
                      ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-[#4654CD]/5 hover:border-[#4654CD]/30'
              }`}
            >
              {/* Badge */}
              {isLastPayment && !isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Cuota Number */}
              <span className={`text-lg font-bold ${isSelected ? 'text-white' : ''}`}>
                {payment.cuotaNum}
              </span>

              {/* Month/Year */}
              <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-neutral-500'}`}>
                {MONTHS_SHORT[payment.monthIndex]} {payment.year.toString().slice(-2)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Month Detail */}
      {selectedMonth && (
        <div className="mt-4 p-4 bg-[#4654CD]/5 rounded-xl border border-[#4654CD]/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-neutral-900 mb-1">
                Cuota #{selectedMonth}
              </p>
              <p className="text-xs text-neutral-500">
                {paymentMonths[selectedMonth - 1]?.date.toLocaleDateString('es-PE', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() => setSelectedMonth(null)}
              className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3 text-neutral-600" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Monto cuota</p>
              <p className="text-lg font-bold text-neutral-900">S/{adjustedQuota.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Acumulado</p>
              <p className="text-lg font-bold text-[#4654CD]">S/{(adjustedQuota * selectedMonth).toFixed(0)}</p>
            </div>
          </div>

          {/* Progress to this payment */}
          <div className="mt-3 pt-3 border-t border-[#4654CD]/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-neutral-500">Progreso hasta esta cuota</span>
              <span className="text-xs font-bold text-[#4654CD]">{((selectedMonth / selectedTerm) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4654CD] rounded-full"
                style={{ width: `${(selectedMonth / selectedTerm) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-5 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-50 border-2 border-amber-300" />
            <span className="text-xs text-neutral-600">Primera</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-50 border-2 border-emerald-300" />
            <span className="text-xs text-neutral-600">Última</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Total a pagar</p>
          <p className="text-xl font-bold text-neutral-900">
            S/{(adjustedQuota * selectedTerm).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CronogramaV4;
