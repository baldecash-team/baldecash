'use client';

/**
 * ApprovedSummaryV4 - Timeline visual
 * Muestra el crédito como línea de tiempo de pagos
 */

import React from 'react';
import { CheckCircle, Circle, Calendar } from 'lucide-react';
import type { ApprovalData } from '../../../types/approval';

interface SummaryProps {
  data: ApprovalData;
}

export const ApprovedSummaryV4: React.FC<SummaryProps> = ({ data }) => {
  const { product, creditDetails, firstPaymentDate } = data;

  // Generar algunos puntos de la línea de tiempo
  const timelinePoints = [
    { label: 'Hoy', sublabel: 'Aprobado', completed: true },
    { label: 'Primera cuota', sublabel: firstPaymentDate || '15 Ene 2025', completed: false },
    { label: `Cuota ${Math.floor(creditDetails.installments / 2)}`, sublabel: 'Mitad del plazo', completed: false },
    { label: 'Última cuota', sublabel: `Cuota ${creditDetails.installments}`, completed: false },
  ];

  return (
    <div className="w-full">
      {/* Producto */}
      <div className="text-center mb-6">
        <p className="font-semibold text-neutral-800">{product.name}</p>
        <p className="text-2xl font-bold text-[#4654CD] mt-1">
          S/ {creditDetails.monthlyPayment.toLocaleString()}/mes
        </p>
      </div>

      {/* Timeline */}
      <div className="relative px-4">
        {/* Línea conectora */}
        <div className="absolute left-8 top-3 bottom-3 w-0.5 bg-neutral-200" />

        <div className="space-y-6">
          {timelinePoints.map((point, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="relative z-10">
                {point.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500 fill-green-50" />
                ) : (
                  <Circle className="w-6 h-6 text-neutral-300" />
                )}
              </div>
              <div>
                <p className={`font-medium ${point.completed ? 'text-green-600' : 'text-neutral-800'}`}>
                  {point.label}
                </p>
                <p className="text-sm text-neutral-500">{point.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-6 flex items-center justify-between bg-[#4654CD]/5 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#4654CD]" />
          <span className="text-sm text-neutral-600">
            {creditDetails.installments} cuotas de S/ {creditDetails.monthlyPayment.toLocaleString()}
          </span>
        </div>
        <span className="text-sm font-medium text-neutral-800">
          Total: S/ {creditDetails.totalAmount.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default ApprovedSummaryV4;
