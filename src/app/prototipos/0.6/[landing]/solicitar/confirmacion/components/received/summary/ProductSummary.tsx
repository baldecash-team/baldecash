'use client';

/**
 * ProductSummary - Resumen de productos solicitados
 * Soporta múltiples productos, accesorios, seguro y cupón
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

/** Format number as price (floor, a favor del usuario) */
const formatPrice = (n: number): string => Math.floor(n).toLocaleString('en-US');

export const ProductSummary: React.FC<ProductSummaryProps> = ({ data }) => {
  // Calcular subtotal de productos
  const productsSubtotal = data.products.reduce(
    (sum, p) => sum + (p.monthlyQuota * p.quantity),
    0
  );

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

          {/* Lista de productos */}
          <div className="space-y-3">
            {data.products.map((product, idx) => (
              <div key={idx} className="flex gap-3">
                {/* Imagen */}
                <div className="w-16 h-16 flex-shrink-0 bg-neutral-50 rounded-lg p-1.5 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  ) : (
                    <Laptop className="w-8 h-8 text-neutral-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-neutral-800 text-sm truncate">
                    {product.name}
                  </h4>
                  {product.quantity > 1 && (
                    <span className="text-xs text-neutral-500">
                      Cantidad: {product.quantity}
                    </span>
                  )}
                </div>

                {/* Precio */}
                <div className="text-right flex-shrink-0">
                  <span className="font-semibold text-[var(--color-primary)]">
                    S/ {formatPrice(product.monthlyQuota)}
                  </span>
                  <span className="text-neutral-500 text-sm">/mes</span>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal productos (solo si hay más de 1) */}
          {data.products.length > 1 && (
            <>
              <Divider className="my-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Subtotal productos</span>
                <span className="font-medium">
                  S/ {formatPrice(productsSubtotal)}/mes
                </span>
              </div>
            </>
          )}

          {/* Accesorios */}
          {data.accessories && data.accessories.length > 0 && (
            <>
              <Divider className="my-3" />
              <div className="space-y-2">
                {data.accessories.map((acc, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Package className="w-4 h-4" />
                      <span>{acc.name}</span>
                    </div>
                    <span className="text-neutral-500">
                      +S/ {formatPrice(acc.monthlyQuota)}/mes
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Seguro */}
          {data.insurance && (
            <>
              <Divider className="my-3" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Shield className="w-4 h-4" />
                  <span>{data.insurance.name}</span>
                </div>
                <span className="text-neutral-500">
                  +S/ {formatPrice(data.insurance.monthlyPrice)}/mes
                </span>
              </div>
            </>
          )}

          {/* Cupón */}
          {data.coupon && (
            <>
              <Divider className="my-3" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <Ticket className="w-4 h-4" />
                  <span>Cupón {data.coupon.code}</span>
                </div>
                <span className="text-green-600 font-medium">
                  -S/ {formatPrice(data.coupon.discountAmount)}
                </span>
              </div>
            </>
          )}

          {/* Total */}
          <Divider className="my-3" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-800">Total mensual</span>
            <div className="text-right">
              <span className="text-xl font-bold text-[var(--color-primary)]">
                S/ {formatPrice(data.totalMonthlyQuota)}
              </span>
              <span className="text-neutral-500 text-sm">/mes</span>
            </div>
          </div>
          <p className="text-sm text-neutral-500 text-right mt-1">
            {data.termMonths} cuotas
          </p>

        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ProductSummary;
