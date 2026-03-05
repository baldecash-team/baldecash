'use client';

/**
 * ProductSummary - Resumen del producto solicitado
 * Adapted from v0.5 for v0.6
 */

import React from 'react';
import { Card, CardBody, Divider } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Laptop, Package, Shield, Ticket } from 'lucide-react';
import Image from 'next/image';
import { ReceivedData } from '../../../types/received';

interface ProductSummaryProps {
  data: ReceivedData;
}

/** Format number as price with 2 decimals */
const formatPrice = (n: number): string => n.toFixed(2);

export const ProductSummary: React.FC<ProductSummaryProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-8"
    >
      <h3 className="font-semibold text-neutral-800 mb-3">Tu solicitud</h3>
      <Card className="border border-neutral-200 shadow-sm">
        <CardBody className="p-4">
          <div className="flex gap-4">
            {/* Product image */}
            <div className="w-20 h-20 flex-shrink-0 bg-neutral-50 rounded-lg p-2 flex items-center justify-center overflow-hidden">
              {data.product.thumbnail ? (
                <Image
                  src={data.product.thumbnail}
                  alt={data.product.name}
                  width={72}
                  height={72}
                  className="object-contain"
                />
              ) : (
                <Laptop className="w-10 h-10 text-neutral-300" />
              )}
            </div>

            {/* Product details */}
            <div className="flex-1">
              <h4 className="font-semibold text-neutral-800 mb-1">{data.product.name}</h4>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xl font-bold text-[var(--color-primary)]">
                  S/ {formatPrice(data.totalMonthlyQuota)}
                </span>
                <span className="text-neutral-500 text-sm">/mes</span>
              </div>
              <p className="text-sm text-neutral-500">
                {data.product.term} cuotas · Total S/ {formatPrice(data.product.totalAmount)}
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
                    <span className="text-neutral-500">+S/ {formatPrice(acc.monthlyQuota)}/mes</span>
                  </div>
                ))}
                {data.insurance && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Shield className="w-4 h-4" />
                      <span>{data.insurance.name}</span>
                    </div>
                    <span className="text-neutral-500">+S/ {formatPrice(data.insurance.monthlyPrice)}/mes</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Coupon discount */}
          {data.coupon && (
            <>
              <Divider className="my-3" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <Ticket className="w-4 h-4" />
                  <span>Cupón {data.coupon.code}</span>
                </div>
                <span className="text-green-600 font-medium">-S/ {formatPrice(data.coupon.discountAmount)}</span>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ProductSummary;
