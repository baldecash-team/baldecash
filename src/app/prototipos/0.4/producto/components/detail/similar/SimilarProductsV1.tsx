'use client';

import { Card, CardBody, Button } from '@nextui-org/react';
import { useState } from 'react';

export interface SimilarProduct {
  id: string;
  name: string;
  thumbnail: string;
  monthlyQuota: number;
  quotaDifference: number; // Positive = more expensive, Negative = cheaper
  matchScore: number;
  differentiators: string[];
  slug: string;
}

export interface SimilarProductsProps {
  products: SimilarProduct[];
  currentQuota: number;
}

export default function SimilarProductsV1({ products, currentQuota }: SimilarProductsProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.4/producto/${slug}`;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-800 mb-2">
          Productos similares
        </h3>
        <p className="text-neutral-600">
          Compara cuotas mensuales con el producto actual
        </p>
      </div>

      {/* Side Panel Layout - Desktop Grid, Mobile Scroll */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const isSelected = selectedProduct === product.id;
          const isCheaper = product.quotaDifference < 0;
          const isMoreExpensive = product.quotaDifference > 0;

          return (
            <Card
              key={product.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-[#4654CD]' : ''
              }`}
              isPressable
              onPress={() => setSelectedProduct(product.id)}
            >
              <CardBody className="p-4">
                {/* Thumbnail */}
                <div className="relative w-full aspect-square mb-3 bg-neutral-100 rounded-lg overflow-hidden">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  {/* Match Score Badge */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-neutral-700">
                    {product.matchScore}% similar
                  </div>
                </div>

                {/* Product Name */}
                <h4 className="font-semibold text-neutral-800 mb-2 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h4>

                {/* Quota Difference - CRITICAL: Focus on variation */}
                <div className="mb-3 space-y-1">
                  {product.quotaDifference !== 0 && (
                    <p
                      className={`text-xl font-bold ${
                        isCheaper ? 'text-[#22c55e]' : 'text-amber-600'
                      }`}
                    >
                      {isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}/mes
                    </p>
                  )}
                  <p className="text-sm text-neutral-600">
                    S/{product.monthlyQuota}/mes vs S/{currentQuota}/mes actual
                  </p>
                </div>

                {/* Differentiators */}
                {product.differentiators.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-neutral-500 mb-1">
                      Diferencias clave:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {product.differentiators.slice(0, 2).map((diff, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full"
                        >
                          {diff}
                        </span>
                      ))}
                      {product.differentiators.length > 2 && (
                        <span className="text-xs text-neutral-500">
                          +{product.differentiators.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <Button
                  color={isCheaper ? 'success' : 'primary'}
                  variant={isSelected ? 'solid' : 'bordered'}
                  className="w-full"
                  size="sm"
                  onPress={() => handleProductClick(product.slug)}
                >
                  {isCheaper ? 'Ahorra aquí' : 'Ver detalles'}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Comparison Panel (shown when product selected) */}
      {selectedProduct && (
        <Card className="mt-4 border-2 border-[#4654CD]">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">
                  Producto seleccionado para comparar
                </p>
                <p className="font-semibold text-neutral-800">
                  {products.find((p) => p.id === selectedProduct)?.name}
                </p>
              </div>
              <Button
                color="primary"
                variant="solid"
                onPress={() => {
                  const product = products.find((p) => p.id === selectedProduct);
                  if (product) handleProductClick(product.slug);
                }}
              >
                Comparar en detalle
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
