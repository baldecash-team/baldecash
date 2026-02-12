'use client';

/**
 * SelectedProductBar - Mobile-first sticky bar showing selected product(s)
 *
 * Mobile: Bottom fixed bar, collapsible with tap
 * Tablet: Bottom bar with more info visible
 * Desktop: Top bar below stepper
 *
 * Supports multiple cart products with collapsible product list
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Package, Plus, Tag, ShoppingCart } from 'lucide-react';
import { useProduct } from '../../../context/ProductContext';
import Image from 'next/image';

interface SelectedProductBarProps {
  isCleanMode?: boolean;
  mobileOnly?: boolean;
}

export const SelectedProductBar: React.FC<SelectedProductBarProps> = ({ mobileOnly = false }) => {
  const {
    selectedProduct,
    cartProducts,
    selectedAccessories,
    appliedCoupon,
    isProductBarExpanded,
    setIsProductBarExpanded,
  } = useProduct();
  const [isAccessoriesExpanded, setIsAccessoriesExpanded] = useState(true);
  const [isProductsCollapsed, setIsProductsCollapsed] = useState(false);

  const isExpanded = isProductBarExpanded;
  const setIsExpanded = setIsProductBarExpanded;

  // Determine which products to show
  const productsToShow = useMemo(() => {
    if (cartProducts.length > 0) return cartProducts;
    if (selectedProduct) return [selectedProduct];
    return [];
  }, [cartProducts, selectedProduct]);

  const isMultiProduct = productsToShow.length > 1;

  // Calculate totals across all products
  const totalProductsMonthly = useMemo(() => {
    return productsToShow.reduce((sum, p) => sum + p.monthlyPayment, 0);
  }, [productsToShow]);

  const accessoriesMonthly = useMemo(() => {
    return selectedAccessories.reduce((sum, acc) => sum + acc.monthlyQuota, 0);
  }, [selectedAccessories]);

  const totalMonthlyPayment = totalProductsMonthly + accessoriesMonthly;
  const discountAmount = appliedCoupon?.discount || 0;
  const discountedMonthlyPayment = Math.max(0, totalMonthlyPayment - discountAmount);

  const hasAccessories = selectedAccessories.length > 0;
  const hasCoupon = !!appliedCoupon;

  if (productsToShow.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Single product for collapsed mobile view
  const firstProduct = productsToShow[0];

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
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative">
              {firstProduct.image ? (
                <Image
                  src={firstProduct.image}
                  alt={firstProduct.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <Package className="w-6 h-6 text-neutral-400" />
              )}
              {isMultiProduct && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#4654CD] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {productsToShow.length}
                </span>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {isMultiProduct
                  ? `${productsToShow.length} productos`
                  : firstProduct.shortName
                }
                {hasAccessories && (
                  <span className="text-xs text-neutral-500 ml-1">
                    +{selectedAccessories.length} acc.
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500">
                {isMultiProduct
                  ? `${firstProduct.months} meses`
                  : `${firstProduct.months} meses`
                }
              </p>
            </div>

            {/* Price & Expand Icon */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                {hasCoupon && (
                  <span className="text-xs text-neutral-400 line-through block">
                    {formatPrice(totalMonthlyPayment)}/mes
                  </span>
                )}
                <span className={`text-sm font-semibold ${hasCoupon ? 'text-green-600' : 'text-[#4654CD]'}`}>
                  {formatPrice(discountedMonthlyPayment)}/mes
                </span>
              </div>
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
                <div className="px-4 pb-4 pt-1 border-t border-neutral-100 max-h-[60vh] overflow-y-auto">
                  {/* Products List */}
                  {productsToShow.map((product, index) => (
                    <div key={product.id}>
                      <div className="flex gap-3 py-3">
                        <div className="w-16 h-16 bg-neutral-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-500 uppercase tracking-wide">
                            {product.brand}
                          </p>
                          <p className="text-sm font-semibold text-neutral-800 mt-0.5 line-clamp-2">
                            {product.name}
                          </p>
                          {product.specs && (
                            <p className="text-xs text-neutral-500 mt-1">
                              {[product.specs.processor, product.specs.ram, product.specs.storage]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#4654CD]">
                            {formatPrice(product.monthlyPayment)}/mes
                          </p>
                        </div>
                      </div>
                      {index < productsToShow.length - 1 && (
                        <div className="border-b border-neutral-100" />
                      )}
                    </div>
                  ))}

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

                  {/* Coupon Applied Badge */}
                  {hasCoupon && appliedCoupon && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <Tag className="w-3 h-3" />
                      <span className="font-medium">{appliedCoupon.code}</span>
                      <span className="text-green-500">-{formatPrice(appliedCoupon.discount)}/mes</span>
                    </div>
                  )}

                  {/* Monthly Payment Summary */}
                  <div className={`mt-4 p-3 rounded-lg ${hasCoupon ? 'bg-green-50' : 'bg-[#4654CD]/5'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-neutral-700">Cuota mensual total</span>
                      <div className="text-right">
                        {hasCoupon && (
                          <span className="text-sm text-neutral-400 line-through block">
                            {formatPrice(totalMonthlyPayment)}/mes
                          </span>
                        )}
                        <span className={`text-lg font-bold ${hasCoupon ? 'text-green-600' : 'text-[#4654CD]'}`}>
                          {formatPrice(discountedMonthlyPayment)}/mes
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {firstProduct.months} meses
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop: Top Bar */}
      {!mobileOnly && (
      <div className="hidden lg:block mb-6 space-y-3">
        {/* Products Accordion */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Accordion Header */}
          <button
            onClick={() => setIsProductsCollapsed(!isProductsCollapsed)}
            className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#4654CD]" />
              <p className="text-sm font-semibold text-neutral-800">
                Productos ({productsToShow.length})
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isProductsCollapsed && (
                <span className="text-sm font-medium text-[#4654CD]">
                  {formatPrice(totalProductsMonthly)}/mes
                </span>
              )}
              {isProductsCollapsed ? (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-neutral-400" />
              )}
            </div>
          </button>

          {/* Products List */}
          <AnimatePresence initial={false}>
            {!isProductsCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pt-2 pb-4 border-t border-neutral-100">
                  <div className="space-y-0">
                    {productsToShow.map((product, index) => (
                      <div key={product.id}>
                        <div className="flex items-center gap-4">
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
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-500 uppercase tracking-wide">
                              {product.brand}
                            </p>
                            <p className="text-base font-semibold text-neutral-800">
                              {product.name}
                            </p>
                            {product.specs && (
                              <p className="text-sm text-neutral-500 mt-0.5">
                                {[
                                  product.specs.processor,
                                  product.specs.ram,
                                  product.specs.storage
                                ].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-[#4654CD]">
                              {formatPrice(product.monthlyPayment)}/mes
                            </p>
                            <p className="text-xs text-neutral-500">
                              {product.months} meses
                            </p>
                          </div>
                        </div>
                        {index < productsToShow.length - 1 && (
                          <div className="border-b border-neutral-100 my-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accessories Accordion */}
        {hasAccessories && (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <button
              onClick={() => setIsAccessoriesExpanded(!isAccessoriesExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#4654CD]" />
                <p className="text-sm font-semibold text-neutral-800">
                  Accesorios ({selectedAccessories.length})
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isAccessoriesExpanded && (
                  <span className="text-sm font-medium text-[#4654CD]">
                    +{formatPrice(accessoriesMonthly)}/mes
                  </span>
                )}
                {isAccessoriesExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isAccessoriesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pt-2 pb-4 border-t border-neutral-100">
                    <div className="space-y-2">
                      {selectedAccessories.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <Plus className="w-3 h-3 text-[#4654CD] flex-shrink-0" />
                            <span className="text-neutral-700 truncate">{acc.name}</span>
                          </div>
                          <span className="text-[#4654CD] font-medium flex-shrink-0 ml-4">
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

        {/* Coupon Badge */}
        {hasCoupon && appliedCoupon && (
          <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Tag className="w-4 h-4" />
              <span className="font-medium">{appliedCoupon.code}</span>
              <span className="text-green-600">{appliedCoupon.label}</span>
            </div>
            <span className="font-bold text-green-600">-{formatPrice(appliedCoupon.discount)}/mes</span>
          </div>
        )}

        {/* Total Summary - Always at the bottom */}
        <div className={`p-4 rounded-xl ${hasCoupon ? 'bg-green-50 border border-green-100' : 'bg-[#4654CD]/5 border border-[#4654CD]/10'}`}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-neutral-700">Cuota mensual total</span>
            <div className="text-right">
              {hasCoupon && (
                <span className="text-sm text-neutral-400 line-through block">
                  {formatPrice(totalMonthlyPayment)}/mes
                </span>
              )}
              <span className={`text-lg font-bold ${hasCoupon ? 'text-green-600' : 'text-[#4654CD]'}`}>
                {formatPrice(discountedMonthlyPayment)}/mes
              </span>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

// Spacer component to prevent content from being hidden behind fixed bar
export const SelectedProductSpacer: React.FC = () => {
  const { selectedProduct, cartProducts } = useProduct();

  if (!selectedProduct && cartProducts.length === 0) return null;

  return <div className="lg:hidden h-[72px]" />;
};

export default SelectedProductBar;
