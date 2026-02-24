'use client';

/**
 * SimilarProducts - Carousel de productos similares
 *
 * Muestra productos del mismo tipo/categoria que el actual.
 * Clickeable para navegar a su detalle.
 */

import React from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import type { CatalogProduct } from '../../../catalogo/types/catalog';
import { calculateQuotaWithInitial } from '../../../catalogo/types/catalog';

interface SimilarProductsProps {
  products: CatalogProduct[];
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ products }) => {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  if (products.length === 0) return null;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleViewProduct = (productId: string) => {
    const url = `/prototipos/0.6/${landing}/producto/detail-preview?id=${productId}`;
    router.push(url);
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-neutral-800 mb-4">Productos similares</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((product) => {
          const { quota } = calculateQuotaWithInitial(product.price, 24, 10);
          return (
            <button
              key={product.id}
              onClick={() => handleViewProduct(product.id)}
              className="bg-white rounded-xl border border-neutral-100 overflow-hidden text-left hover:shadow-md transition-shadow cursor-pointer group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                <Image
                  src={product.thumbnail}
                  alt={product.displayName}
                  fill
                  className="object-contain p-3 group-hover:scale-105 transition-transform"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-0.5">
                  {product.brand}
                </p>
                <p className="text-sm font-medium text-neutral-800 line-clamp-2 mb-2 min-h-[2.5rem]">
                  {product.displayName}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-[#4654CD]">
                    S/ {formatPrice(quota)}
                  </span>
                  <span className="text-[10px] text-neutral-400">/mes</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  S/ {formatPrice(product.price)}
                </p>
              </div>

              {/* View link */}
              <div className="px-3 pb-3">
                <span className="inline-flex items-center gap-1 text-xs text-[#4654CD] font-medium group-hover:gap-2 transition-all">
                  Ver detalle <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarProducts;
