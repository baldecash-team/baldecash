'use client';

/**
 * ProductSummary - Resumen de productos solicitados
 * Estilo visual igual al checkout (SelectedProductBar)
 * Soporta múltiples productos, accesorios, seguro y cupón
 * v0.6.1: Added variant/color display and initial payment info
 */

import React, { useState } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Shield, Tag, ShoppingCart, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { ReceivedData } from '../../../types/received';

interface ProductSummaryProps {
  data: ReceivedData;
}

/** Format number as price (floor, a favor del usuario) */
const formatPrice = (n: number): string => `S/${Math.floor(n).toLocaleString('en-US')}`;

export const ProductSummary: React.FC<ProductSummaryProps> = ({ data }) => {
  const [isAccessoriesExpanded, setIsAccessoriesExpanded] = useState(true);

  // Calcular subtotal de productos (suma exacta, floor al final)
  const productsSubtotal = data.products.reduce(
    (sum, p) => sum + (p.monthlyQuota * p.quantity),
    0
  );

  // Calcular subtotal de accesorios
  const accessoriesSubtotal = data.accessories?.reduce(
    (sum, acc) => sum + acc.monthlyQuota,
    0
  ) || 0;

  const hasAccessories = data.accessories && data.accessories.length > 0;
  const hasInsurance = !!data.insurance;
  const hasCoupon = !!data.coupon;

  // Calcular total sin descuento (para mostrar tachado)
  const totalWithoutDiscount = Math.floor(productsSubtotal) +
    Math.floor(accessoriesSubtotal) +
    (data.insurance?.monthlyPrice || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-8 space-y-3"
    >
      <h3 className="font-semibold text-neutral-800 mb-3">Tu solicitud</h3>

      {/* Products Card */}
      <Card className="border border-neutral-200 shadow-sm">
        <CardBody className="p-4">
          {/* Header if multiple products */}
          {data.products.length > 1 && (
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
              <ShoppingCart className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-neutral-800">
                {data.products.length} productos seleccionados
              </span>
            </div>
          )}

          {/* Products List */}
          <div className="space-y-4">
            {data.products.map((product, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-4 ${idx > 0 ? 'pt-4 border-t border-neutral-100' : ''}`}
              >
                {/* Product Image */}
                <div className="w-16 h-16 bg-neutral-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-neutral-300" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  {product.brand && (
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">
                      {product.brand}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-neutral-800">
                    {product.name}
                  </p>
                  {product.specs && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {[
                        product.specs.processor,
                        product.specs.ram,
                        product.specs.storage
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {/* v0.6.1: Show selected color */}
                  {product.variant && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="w-3 h-3 rounded-full border border-neutral-200 flex-shrink-0"
                        style={{ backgroundColor: product.variant.colorHex }}
                        title={product.variant.colorName}
                      />
                      <span className="text-xs text-neutral-500">
                        {product.variant.colorName}
                      </span>
                    </div>
                  )}
                  {product.quantity > 1 && (
                    <span className="text-xs text-neutral-500">
                      Cantidad: {product.quantity}
                    </span>
                  )}
                </div>

                {/* Pricing */}
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-[var(--color-primary)]">
                    {formatPrice(product.monthlyQuota)}/mes
                  </p>
                  <p className="text-xs text-neutral-500">
                    {data.termMonths} meses
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal - only if multiple products or has accessories/insurance */}
          {(data.products.length > 1 || hasAccessories || hasInsurance) && (
            <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-800">Cuota total productos</span>
              <span className="text-base font-bold text-[var(--color-primary)]">
                {formatPrice(productsSubtotal)}/mes
              </span>
            </div>
          )}

          {/* Coupon Badge - Inside products card */}
          {hasCoupon && data.coupon && (
            <div className="mt-3 flex items-center justify-between px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Tag className="w-4 h-4" />
                <span className="font-medium">PROMO</span>
                <span className="text-green-600">Descuento de {formatPrice(data.coupon.discountAmount)}</span>
              </div>
              <span className="font-bold text-green-600">
                -{formatPrice(data.coupon.discountAmount)}/mes
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Insurance Card - Separate */}
      {hasInsurance && data.insurance && (
        <div className="bg-[var(--color-secondary)]/5 rounded-xl border border-[var(--color-secondary)]/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--color-secondary)]" />
              <p className="text-sm font-semibold text-neutral-800">
                Seguro
              </p>
            </div>
            <span className="text-sm font-medium text-[var(--color-secondary)]">
              +{formatPrice(data.insurance.monthlyPrice)}/mes
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1 ml-6">
            {data.insurance.name}
          </p>
        </div>
      )}

      {/* Accessories Card with Accordion */}
      {hasAccessories && data.accessories && (
        <div className="bg-[var(--color-primary)]/5 rounded-xl border border-[var(--color-primary)]/10 overflow-hidden">
          {/* Accordion Header */}
          <button
            onClick={() => setIsAccessoriesExpanded(!isAccessoriesExpanded)}
            className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--color-primary)]/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[var(--color-primary)]" />
              <p className="text-sm font-semibold text-neutral-800">
                Accesorios ({data.accessories.length})
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isAccessoriesExpanded && (
                <span className="text-sm font-medium text-[var(--color-primary)]">
                  +{formatPrice(accessoriesSubtotal)}/mes
                </span>
              )}
              {isAccessoriesExpanded ? (
                <ChevronUp className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              )}
            </div>
          </button>

          {/* Accordion Content */}
          <AnimatePresence>
            {isAccessoriesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pt-2 pb-4 border-t border-[var(--color-primary)]/10">
                  {/* Accessories List */}
                  <div className="space-y-2">
                    {data.accessories.map((acc, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Plus className="w-3 h-3 text-[var(--color-primary)] flex-shrink-0" />
                          <span className="text-neutral-700 truncate">{acc.name}</span>
                        </div>
                        <span className="text-[var(--color-primary)] font-medium flex-shrink-0 ml-4">
                          +{formatPrice(acc.monthlyQuota)}/mes
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Total Card */}
      <div className={`p-4 rounded-xl ${hasCoupon ? 'bg-green-50' : 'bg-[var(--color-primary)]/5'}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-neutral-800">Cuota mensual total</span>
          <div className="text-right">
            {hasCoupon && (
              <span className="text-sm text-neutral-400 line-through block">
                {formatPrice(totalWithoutDiscount)}/mes
              </span>
            )}
            <span className={`text-xl font-bold ${hasCoupon ? 'text-green-600' : 'text-[var(--color-primary)]'}`}>
              {formatPrice(data.totalMonthlyQuota)}/mes
            </span>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          {data.termMonths} cuotas
          {/* v0.6.1: Show initial payment if applicable */}
          {data.initialPayment && data.initialPayment > 0 && (
            <> · Inicial {formatPrice(data.initialPayment)} ({data.initialPaymentPercent}%)</>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductSummary;
