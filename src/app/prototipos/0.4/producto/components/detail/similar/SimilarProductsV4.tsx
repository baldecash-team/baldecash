'use client';

import { Card, CardBody, Button } from '@nextui-org/react';
import { useState } from 'react';

export interface SimilarProduct {
  id: string;
  name: string;
  thumbnail: string;
  monthlyQuota: number;
  quotaDifference: number;
  matchScore: number;
  differentiators: string[];
  slug: string;
}

export interface SimilarProductsProps {
  products: SimilarProduct[];
  currentQuota: number;
}

export default function SimilarProductsV4({ products, currentQuota }: SimilarProductsProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.4/producto/detail-preview?infoHeader=3&gallery=1&tabs=1&specs=2&pricing=4&cronograma=2&similar=2&limitations=6&certifications=1&mode=clean`;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-800 mb-2">
          Explora opciones similares
        </h3>
        <p className="text-neutral-600">
          Pasa el cursor para ver más detalles
        </p>
      </div>

      {/* Floating Cards with Hover Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const isHovered = hoveredProduct === product.id;
          const isCheaper = product.quotaDifference < 0;

          return (
            <div
              key={product.id}
              className="relative"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  isHovered
                    ? 'shadow-2xl scale-105 z-10'
                    : 'shadow-md hover:shadow-lg'
                }`}
                isPressable
                onPress={() => handleProductClick(product.slug)}
              >
                <CardBody className="p-0 overflow-hidden">
                  {/* Thumbnail with Overlay */}
                  <div className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isHovered ? 'scale-110' : 'scale-100'
                      }`}
                      onError={handleImageError}
                    />

                    {/* Hover Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-sm font-semibold mb-2">
                          Vista rápida
                        </p>
                        <div className="space-y-1">
                          {product.differentiators.slice(0, 2).map((diff, idx) => (
                            <p key={idx} className="text-white/90 text-xs flex items-start gap-1">
                              <span>•</span>
                              <span>{diff}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-neutral-700 shadow-lg">
                      {product.matchScore}% match
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Product Name */}
                    <h4 className="font-semibold text-neutral-800 mb-3 line-clamp-2 h-12">
                      {product.name}
                    </h4>

                    {/* Quota Comparison - CRITICAL */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-neutral-800">
                          S/{product.monthlyQuota}
                        </p>
                        <p className="text-xs text-neutral-500">por mes</p>
                      </div>
                      {product.quotaDifference !== 0 && (
                        <div
                          className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                            isCheaper
                              ? 'bg-[#22c55e]/10 text-[#22c55e]'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}
                        </div>
                      )}
                    </div>

                    {/* Comparison Text */}
                    <p className="text-xs text-neutral-600 mb-4">
                      {product.quotaDifference < 0 && (
                        <span className="text-[#22c55e] font-semibold">
                          Ahorras S/{Math.abs(product.quotaDifference)}/mes
                        </span>
                      )}
                      {product.quotaDifference > 0 && (
                        <span className="text-amber-600 font-semibold">
                          S/{Math.abs(product.quotaDifference)}/mes más
                        </span>
                      )}
                      {product.quotaDifference === 0 && (
                        <span className="text-neutral-600">
                          Misma cuota mensual
                        </span>
                      )}
                      {' '}que el producto actual
                    </p>

                    {/* CTA - Appears/changes on hover */}
                    <Button
                      className={`w-full transition-all duration-300 ${
                        isHovered ? 'scale-105' : 'scale-100'
                      }`}
                      color={isCheaper ? 'success' : 'primary'}
                      variant={isHovered ? 'solid' : 'bordered'}
                      size="md"
                    >
                      {isHovered ? 'Ver producto ahora' : 'Ver detalles'}
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Floating Preview Badge (appears on hover) */}
              {isHovered && (
                <div className="hidden lg:block absolute -top-2 -right-2 bg-[#4654CD] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-xl animate-bounce z-20">
                  Click para comparar
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600">
          Tu cuota actual: <span className="font-bold text-neutral-800">S/{currentQuota}/mes</span>
        </p>
      </div>
    </div>
  );
}
