'use client';

/**
 * ApprovedProductSummary - Resumen del producto aprobado
 * Versión fija para v0.5: Card completa con imagen
 */

import React from 'react';
import { Card, CardBody, Divider } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Laptop, Package, Shield } from 'lucide-react';
import Image from 'next/image';
import { ApprovalData } from '../../../types/approval';

interface ApprovedProductSummaryProps {
  data: ApprovalData;
}

export const ApprovedProductSummary: React.FC<ApprovedProductSummaryProps> = ({
  data,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border border-neutral-200 shadow-sm">
        <CardBody className="p-4">
          <div className="flex gap-4">
            {/* Product image */}
            <div className="w-24 h-24 flex-shrink-0 bg-neutral-50 rounded-lg p-2 flex items-center justify-center overflow-hidden">
              {data.product.thumbnail ? (
                <Image
                  src={data.product.thumbnail}
                  alt={data.product.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              ) : (
                <Laptop className="w-12 h-12 text-neutral-300" />
              )}
            </div>

            {/* Product details */}
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-800 mb-1">
                {data.product.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-[#4654CD]">
                  S/ {data.totalMonthlyQuota}
                </span>
                <span className="text-neutral-500">/mes</span>
              </div>
              <p className="text-sm text-neutral-500">
                {data.product.term} cuotas · Total S/{' '}
                {data.product.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Accessories and insurance */}
          {(data.accessories?.length || data.insurance) && (
            <>
              <Divider className="my-3" />
              <div className="space-y-2">
                {data.accessories?.map((acc, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Package className="w-4 h-4" />
                      <span>{acc.name}</span>
                    </div>
                    <span className="text-neutral-500">+S/ {acc.monthlyQuota}/mes</span>
                  </div>
                ))}
                {data.insurance && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Shield className="w-4 h-4" />
                      <span>{data.insurance.name}</span>
                    </div>
                    <span className="text-neutral-500">
                      +S/ {data.insurance.monthlyPrice}/mes
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ApprovedProductSummary;
