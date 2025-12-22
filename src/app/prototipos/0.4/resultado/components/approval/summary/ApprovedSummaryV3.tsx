'use client';

/**
 * ApprovedSummaryV3 - Con imagen del producto
 * Incluye imagen grande del producto financiado
 */

import React from 'react';
import { Image } from '@nextui-org/react';
import type { ApprovalData } from '../../../types/approval';

interface SummaryProps {
  data: ApprovalData;
}

export const ApprovedSummaryV3: React.FC<SummaryProps> = ({ data }) => {
  const { product, creditDetails } = data;

  return (
    <div className="w-full">
      {/* Imagen del producto */}
      <div className="relative w-full aspect-video bg-neutral-100 rounded-2xl mb-6 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-4"
            removeWrapper
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-32 h-24 bg-neutral-200 rounded-lg" />
          </div>
        )}
        {/* Badge de precio */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-sm font-semibold text-neutral-800">
            S/ {product.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Info del producto */}
      <div className="mb-6">
        <p className="text-xl font-semibold text-neutral-800">{product.name}</p>
        <p className="text-sm text-neutral-500">{product.brand}</p>
      </div>

      {/* Detalles del crédito en grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-50 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Cuota mensual</p>
          <p className="text-2xl font-bold text-[#4654CD]">
            S/ {creditDetails.monthlyPayment.toLocaleString()}
          </p>
        </div>
        <div className="bg-neutral-50 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Plazo</p>
          <p className="text-2xl font-bold text-neutral-800">
            {creditDetails.installments} <span className="text-base font-normal">meses</span>
          </p>
        </div>
        <div className="bg-neutral-50 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Tasa mensual</p>
          <p className="text-xl font-semibold text-neutral-800">{creditDetails.interestRate}%</p>
        </div>
        <div className="bg-neutral-50 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Total a pagar</p>
          <p className="text-xl font-semibold text-neutral-800">
            S/ {creditDetails.totalAmount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApprovedSummaryV3;
