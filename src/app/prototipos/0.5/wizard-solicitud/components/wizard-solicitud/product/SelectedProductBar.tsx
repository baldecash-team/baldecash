'use client';

/**
 * SelectedProductBar - Mobile-first sticky bar showing selected product
 *
 * Mobile: Bottom fixed bar, collapsible with tap
 * Tablet: Bottom bar with more info visible
 * Desktop: Top bar below stepper
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Package, Plus } from 'lucide-react';
import { useProduct } from '../../../context/ProductContext';
import Image from 'next/image';

export const SelectedProductBar: React.FC = () => {
  const { selectedProduct, selectedAccessories, getTotalPrice, getTotalMonthlyPayment } = useProduct();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!selectedProduct) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalPrice = getTotalPrice();
  const totalMonthlyPayment = getTotalMonthlyPayment();
  const hasAccessories = selectedAccessories.length > 0;

  return (
    <>
      {/* Mobile & Tablet: Bottom Fixed Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="bg-white border-t border-neutral-200 shadow-lg relative z-50"
        >
          {/* Collapsed State */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center gap-3 cursor-pointer"
          >
            {/* Product Thumbnail */}
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {selectedProduct.image ? (
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <Package className="w-6 h-6 text-neutral-400" />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {selectedProduct.shortName}
                {hasAccessories && (
                  <span className="text-xs text-neutral-500 ml-1">
                    +{selectedAccessories.length} acc.
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500">
                {formatPrice(totalMonthlyPayment)}/mes × {selectedProduct.months}
              </p>
            </div>

            {/* Price & Expand Icon */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-semibold text-[#4654CD]">
                {formatPrice(totalPrice)}
              </span>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-neutral-400" />
              )}
            </div>
          </button>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-neutral-100">
                  {/* Larger Image */}
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-neutral-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {selectedProduct.image ? (
                        <Image
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          width={96}
                          height={96}
                          className="object-contain"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-neutral-300" />
                      )}
                    </div>

                    {/* Full Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">
                        {selectedProduct.brand}
                      </p>
                      <p className="text-sm font-semibold text-neutral-800 mt-0.5">
                        {selectedProduct.name}
                      </p>

                      {selectedProduct.specs && (
                        <div className="mt-2 space-y-0.5">
                          {selectedProduct.specs.processor && (
                            <p className="text-xs text-neutral-500">
                              {selectedProduct.specs.processor}
                            </p>
                          )}
                          {selectedProduct.specs.ram && selectedProduct.specs.storage && (
                            <p className="text-xs text-neutral-500">
                              {selectedProduct.specs.ram} • {selectedProduct.specs.storage}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accessories List */}
                  {hasAccessories && (
                    <div className="mt-3 space-y-1">
                      {selectedAccessories.map((acc) => (
                        <div key={acc.id} className="flex items-center gap-2 text-xs text-neutral-600">
                          <Plus className="w-3 h-3 text-[#4654CD]" />
                          <span className="flex-1 truncate">{acc.name}</span>
                          <span className="text-[#4654CD] font-medium">+{formatPrice(acc.monthlyQuota)}/mes</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Equipo</span>
                      <span className="text-neutral-800">
                        {formatPrice(selectedProduct.price)}
                      </span>
                    </div>
                    {hasAccessories && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-neutral-600">Accesorios ({selectedAccessories.length})</span>
                        <span className="text-neutral-800">
                          {formatPrice(selectedAccessories.reduce((sum, acc) => sum + acc.price, 0))}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm mt-2 pt-2 border-t border-neutral-200">
                      <span className="font-medium text-neutral-800">Total</span>
                      <span className="font-semibold text-neutral-800">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-neutral-600">Cuota mensual</span>
                      <span className="font-medium text-[#4654CD]">
                        {formatPrice(totalMonthlyPayment)} × {selectedProduct.months} meses
                      </span>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop: Top Bar */}
      <div className="hidden lg:block mb-6 space-y-3">
        {/* Product Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-4">
            {/* Product Image */}
            <div className="w-16 h-16 bg-neutral-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {selectedProduct.image ? (
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
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
              <p className="text-xs text-neutral-500 uppercase tracking-wide">
                {selectedProduct.brand}
              </p>
              <p className="text-base font-semibold text-neutral-800">
                {selectedProduct.name}
              </p>
              {selectedProduct.specs && (
                <p className="text-sm text-neutral-500 mt-0.5">
                  {[
                    selectedProduct.specs.processor,
                    selectedProduct.specs.ram,
                    selectedProduct.specs.storage
                  ].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {/* Pricing */}
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-[#4654CD]">
                {formatPrice(selectedProduct.price)}
              </p>
              <p className="text-sm text-neutral-500">
                {formatPrice(selectedProduct.monthlyPayment)}/mes × {selectedProduct.months}
              </p>
            </div>
          </div>
        </div>

        {/* Accessories Card - Only visible when accessories are selected */}
        {hasAccessories && (
          <div className="bg-[#4654CD]/5 rounded-xl border border-[#4654CD]/10 p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-[#4654CD]" />
              <p className="text-sm font-semibold text-neutral-800">
                Accesorios ({selectedAccessories.length})
              </p>
            </div>

            {/* Accessories List */}
            <div className="space-y-2">
              {selectedAccessories.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Plus className="w-3 h-3 text-[#4654CD] flex-shrink-0" />
                    <span className="text-neutral-700 truncate">{acc.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-neutral-800 font-medium">{formatPrice(acc.price)}</span>
                    <span className="text-neutral-500 text-xs">({formatPrice(acc.monthlyQuota)}/mes)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="mt-3 pt-3 border-t border-[#4654CD]/10 flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-700">Total con accesorios</span>
              <div className="text-right">
                <span className="text-lg font-bold text-[#4654CD]">{formatPrice(totalPrice)}</span>
                <span className="text-sm text-neutral-500 ml-2">
                  ({formatPrice(totalMonthlyPayment)}/mes)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  );
};

// Spacer component to prevent content from being hidden behind fixed bar
export const SelectedProductSpacer: React.FC = () => {
  const { selectedProduct } = useProduct();

  if (!selectedProduct) return null;

  return <div className="lg:hidden h-[72px]" />;
};

export default SelectedProductBar;
