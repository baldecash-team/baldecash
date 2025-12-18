'use client';

/**
 * PaymentSchedule - Cronograma de Pagos
 *
 * Caracteristicas:
 * - Tabla con todas las cuotas
 * - Desglose de capital e interes
 * - Balance pendiente
 * - Fechas estimadas de pago
 */

import React, { useState, useMemo } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Calendar, ChevronDown, ChevronUp, Download, Check } from 'lucide-react';
import { PaymentScheduleProps, PaymentScheduleRow } from '../../../types/detail';
import { generatePaymentSchedule, formatCurrency } from '../../../data/mockDetailData';

export const PaymentSchedule: React.FC<PaymentScheduleProps> = ({
  amount,
  term,
  monthlyRate,
}) => {
  const [showAll, setShowAll] = useState(false);

  const schedule = useMemo(() => {
    return generatePaymentSchedule(amount, term, monthlyRate);
  }, [amount, term, monthlyRate]);

  const visibleSchedule = showAll ? schedule : schedule.slice(0, 6);
  const remainingMonths = schedule.length - 6;

  const totalInterest = schedule.reduce((acc, row) => acc + row.interest, 0);
  const monthlyQuota = schedule[0]?.amount || 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800">Cronograma de pagos</h3>
              <p className="text-sm text-neutral-500">{term} cuotas de {formatCurrency(monthlyQuota)}</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="flat"
            startContent={<Download className="w-4 h-4" />}
            className="bg-neutral-100 text-neutral-600 cursor-pointer"
          >
            Descargar
          </Button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 mb-1">Monto financiado</p>
            <p className="font-bold text-neutral-800">{formatCurrency(amount)}</p>
          </div>
          <div className="text-center p-3 bg-[#4654CD]/5 rounded-lg">
            <p className="text-xs text-[#4654CD] mb-1">Cuota mensual</p>
            <p className="font-bold text-[#4654CD]">{formatCurrency(monthlyQuota)}</p>
          </div>
          <div className="text-center p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 mb-1">Total intereses</p>
            <p className="font-bold text-neutral-800">{formatCurrency(totalInterest)}</p>
          </div>
        </div>
      </div>

      {/* Tabla de cuotas */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Cuota
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Fecha
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Monto
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">
                Capital
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">
                Interes
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">
                Saldo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visibleSchedule.map((row, index) => (
              <tr
                key={row.cuotaNumber}
                className={`hover:bg-neutral-50 transition-colors ${
                  row.cuotaNumber === 1 ? 'bg-[#4654CD]/5' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-medium text-neutral-600">
                      {row.cuotaNumber}
                    </span>
                    {row.cuotaNumber === 1 && (
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: 'bg-[#4654CD] h-5 px-1.5',
                          content: 'text-white text-xs px-0',
                        }}
                      >
                        Primera
                      </Chip>
                    )}
                    {row.cuotaNumber === term && (
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: 'bg-[#22c55e] h-5 px-1.5',
                          content: 'text-white text-xs px-0',
                        }}
                      >
                        Ultima
                      </Chip>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{row.dueDate}</td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-800">
                  {formatCurrency(row.amount)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-neutral-600 hidden sm:table-cell">
                  {formatCurrency(row.principal)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-neutral-500 hidden sm:table-cell">
                  {formatCurrency(row.interest)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-neutral-600 hidden md:table-cell">
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ver mas */}
      {!showAll && remainingMonths > 0 && (
        <div className="p-4 border-t border-neutral-100 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center gap-2 mx-auto text-[#4654CD] hover:underline cursor-pointer"
          >
            <span>Ver las {remainingMonths} cuotas restantes</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {showAll && schedule.length > 6 && (
        <div className="p-4 border-t border-neutral-100 text-center">
          <button
            onClick={() => setShowAll(false)}
            className="flex items-center gap-2 mx-auto text-neutral-600 hover:underline cursor-pointer"
          >
            <span>Mostrar menos</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer con info */}
      <div className="p-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-[#22c55e]" />
            Fechas estimadas (pueden variar)
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-[#22c55e]" />
            Sin penalidad por pago anticipado
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSchedule;
