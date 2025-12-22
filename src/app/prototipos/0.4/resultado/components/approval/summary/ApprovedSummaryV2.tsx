'use client';

/**
 * ApprovedSummaryV2 - Minimalista
 * Diseño limpio con solo información esencial
 */

import React from 'react';
import type { ApprovalData } from '../../../types/approval';

interface SummaryProps {
  data: ApprovalData;
}

export const ApprovedSummaryV2: React.FC<SummaryProps> = ({ data }) => {
  const { product, creditDetails } = data;

  return (
    <div className="w-full">
      {/* Producto - minimalista */}
      <div className="text-center mb-6">
        <p className="text-lg text-neutral-800 font-medium">{product.name}</p>
        <p className="text-sm text-neutral-500">{product.brand}</p>
      </div>

      {/* Cuota destacada */}
      <div className="text-center mb-8">
        <p className="text-sm text-neutral-500 mb-2">Pagarás</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-sm text-neutral-600">S/</span>
          <span className="text-5xl font-bold text-[#4654CD]">
            {creditDetails.monthlyPayment.toLocaleString()}
          </span>
          <span className="text-sm text-neutral-600">/mes</span>
        </div>
      </div>

      {/* Detalles en línea */}
      <div className="flex justify-center gap-8 text-sm">
        <div className="text-center">
          <p className="text-neutral-500">Cuotas</p>
          <p className="font-semibold text-neutral-800">{creditDetails.installments}</p>
        </div>
        <div className="w-px bg-neutral-200" />
        <div className="text-center">
          <p className="text-neutral-500">Tasa</p>
          <p className="font-semibold text-neutral-800">{creditDetails.interestRate}%</p>
        </div>
        <div className="w-px bg-neutral-200" />
        <div className="text-center">
          <p className="text-neutral-500">Total</p>
          <p className="font-semibold text-neutral-800">S/ {creditDetails.totalAmount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ApprovedSummaryV2;
