'use client';

/**
 * ApprovedSummaryV5 - Estilo recibo/ticket
 * Diseño que simula un recibo de compra
 */

import React from 'react';
import type { ApprovalData } from '../../../types/approval';

interface SummaryProps {
  data: ApprovalData;
}

export const ApprovedSummaryV5: React.FC<SummaryProps> = ({ data }) => {
  const { product, creditDetails, applicationId } = data;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Ticket container */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {/* Serrated top edge simulation */}
        <div className="h-4 bg-neutral-50 border-b border-dashed border-neutral-300" />

        {/* Header */}
        <div className="px-6 py-4 text-center border-b border-neutral-100">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Comprobante de aprobación</p>
          <p className="text-sm font-mono text-neutral-500 mt-1">#{applicationId}</p>
        </div>

        {/* Product info */}
        <div className="px-6 py-4 border-b border-neutral-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-neutral-800">{product.name}</p>
              <p className="text-xs text-neutral-500">{product.brand}</p>
            </div>
            <p className="font-mono text-sm">S/ {product.price.toLocaleString()}</p>
          </div>
        </div>

        {/* Credit details */}
        <div className="px-6 py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Precio equipo</span>
            <span className="font-mono">S/ {product.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Intereses ({creditDetails.interestRate}% × {creditDetails.installments})</span>
            <span className="font-mono">S/ {(creditDetails.totalAmount - product.price).toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-dashed border-neutral-200">
            <span className="text-neutral-500">Total a pagar</span>
            <span className="font-mono font-semibold">S/ {creditDetails.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Monthly payment highlight */}
        <div className="px-6 py-4 bg-[#4654CD] text-white text-center">
          <p className="text-xs opacity-80">CUOTA MENSUAL</p>
          <p className="text-3xl font-bold font-mono mt-1">
            S/ {creditDetails.monthlyPayment.toLocaleString()}
          </p>
          <p className="text-xs opacity-80 mt-1">{creditDetails.installments} cuotas</p>
        </div>

        {/* Serrated bottom edge simulation */}
        <div className="h-4 bg-neutral-50 border-t border-dashed border-neutral-300" />
      </div>
    </div>
  );
};

export default ApprovedSummaryV5;
