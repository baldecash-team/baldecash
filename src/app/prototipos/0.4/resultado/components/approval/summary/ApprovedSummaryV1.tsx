'use client';

/**
 * ApprovedSummaryV1 - Card clásico
 * Tarjeta con todos los detalles del crédito aprobado
 */

import React from 'react';
import { Card, CardBody, Divider } from '@nextui-org/react';
import { Laptop, Calendar, Percent, CreditCard } from 'lucide-react';
import type { ApprovalData } from '../../../types/approval';

interface SummaryProps {
  data: ApprovalData;
}

export const ApprovedSummaryV1: React.FC<SummaryProps> = ({ data }) => {
  const { product, creditDetails } = data;

  return (
    <Card className="w-full bg-white shadow-md">
      <CardBody className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Resumen de tu crédito
        </h3>

        {/* Producto */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
            <Laptop className="w-8 h-8 text-[#4654CD]" />
          </div>
          <div>
            <p className="font-medium text-neutral-800">{product.name}</p>
            <p className="text-sm text-neutral-500">{product.brand}</p>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Detalles del crédito */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-600">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">Precio del equipo</span>
            </div>
            <span className="font-medium">S/ {product.price.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Cuotas</span>
            </div>
            <span className="font-medium">{creditDetails.installments} meses</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-600">
              <Percent className="w-4 h-4" />
              <span className="text-sm">Tasa mensual</span>
            </div>
            <span className="font-medium">{creditDetails.interestRate}%</span>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Cuota mensual destacada */}
        <div className="bg-[#4654CD]/5 rounded-lg p-4 text-center">
          <p className="text-sm text-neutral-600 mb-1">Tu cuota mensual</p>
          <p className="text-3xl font-bold text-[#4654CD]">
            S/ {creditDetails.monthlyPayment.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Total a pagar: S/ {creditDetails.totalAmount.toLocaleString()}
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default ApprovedSummaryV1;
