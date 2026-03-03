'use client';

/**
 * ProductDetailLayout - Layout 2 columnas para el detalle del producto
 *
 * Izquierda: Gallery + Specs (scroll)
 * Derecha: Pricing sticky + CTA
 * Debajo: Similar products
 */

import React from 'react';

interface ProductDetailLayoutProps {
  gallery: React.ReactNode;
  specs: React.ReactNode;
  pricing: React.ReactNode;
  similar: React.ReactNode;
  description?: string;
  condition?: string;
  stockAvailable?: number;
}

export const ProductDetailLayout: React.FC<ProductDetailLayoutProps> = ({
  gallery,
  specs,
  pricing,
  similar,
  description,
  condition,
  stockAvailable,
}) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Gallery + info */}
          <div className="space-y-6">
            {gallery}

            {/* Short description */}
            {description && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-5">
                <h2 className="text-sm font-semibold text-neutral-700 mb-2">Descripcion</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Condition & stock badges */}
            <div className="flex gap-2">
              {condition && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  condition === 'nuevo' || condition === 'nueva'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {condition === 'nuevo' || condition === 'nueva' ? 'Nuevo' : 'Reacondicionado'}
                </span>
              )}
              {stockAvailable !== undefined && stockAvailable > 0 && stockAvailable <= 5 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                  Quedan {stockAvailable} unidades
                </span>
              )}
            </div>
          </div>

          {/* Right Column - Pricing (Sticky) */}
          <div className="lg:sticky lg:top-[168px] space-y-6">
            {pricing}
          </div>
        </div>

        {/* Specs Section - Full Width */}
        <div className="mt-12">
          {specs}
        </div>

        {/* Similar Products - Full Width */}
        <div className="mt-12">
          {similar}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailLayout;
