'use client';

import { Card, CardBody, Button } from '@nextui-org/react';

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

export default function SimilarProductsV3({ products, currentQuota }: SimilarProductsProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.4/producto/${slug}`;
    }
  };

  // Sort: cheaper products first
  const sortedProducts = [...products].sort((a, b) => a.quotaDifference - b.quotaDifference);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-800 mb-2">
          Compara y elige mejor
        </h3>
        <p className="text-neutral-600">
          Opciones similares ordenadas por cuota mensual
        </p>
      </div>

      {/* 3-Column Grid with Delta Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product, index) => {
          const isCheaper = product.quotaDifference < 0;
          const isMoreExpensive = product.quotaDifference > 0;
          const isSame = product.quotaDifference === 0;

          return (
            <Card
              key={product.id}
              className="cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
              isPressable
              onPress={() => handleProductClick(product.slug)}
            >
              <CardBody className="p-0">
                {/* Delta Badge - Top Right */}
                {!isSame && (
                  <div
                    className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full shadow-lg font-bold text-sm ${
                      isCheaper
                        ? 'bg-[#22c55e] text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}/mes
                  </div>
                )}

                {/* Best Deal Badge */}
                {index === 0 && isCheaper && (
                  <div className="absolute top-4 left-4 z-10 bg-[#4654CD] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Mejor oferta
                  </div>
                )}

                {/* Thumbnail */}
                <div className="relative w-full aspect-square bg-neutral-100 overflow-hidden">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Product Name */}
                  <h4 className="font-bold text-neutral-800 mb-3 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h4>

                  {/* Quota Display - CRITICAL */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-neutral-800">
                        S/{product.monthlyQuota}
                      </span>
                      <span className="text-neutral-500">/mes</span>
                    </div>
                    <p className="text-sm text-neutral-600">
                      Producto actual: S/{currentQuota}/mes
                    </p>
                  </div>

                  {/* Match Score Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-600">
                        Similitud
                      </span>
                      <span className="text-xs font-bold text-[#4654CD]">
                        {product.matchScore}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#4654CD] h-full rounded-full transition-all duration-500"
                        style={{ width: `${product.matchScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Differentiators */}
                  {product.differentiators.length > 0 && (
                    <div className="mb-4 bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-neutral-700 mb-2">
                        Diferencias clave:
                      </p>
                      <ul className="space-y-1.5">
                        {product.differentiators.slice(0, 3).map((diff, idx) => (
                          <li key={idx} className="text-xs text-neutral-600 flex items-start gap-2">
                            <svg
                              className="w-3 h-3 text-[#4654CD] mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{diff}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <Button
                    className="w-full"
                    color={isCheaper ? 'success' : 'primary'}
                    variant="solid"
                    size="md"
                  >
                    {isCheaper
                      ? `Ahorra S/${Math.abs(product.quotaDifference)}/mes`
                      : 'Ver detalles'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Summary Footer */}
      <Card className="mt-6 bg-neutral-50">
        <CardBody className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-800 mb-1">
                Rango de cuotas mensuales
              </p>
              <p className="text-xs text-neutral-600">
                Desde S/{Math.min(...products.map((p) => p.monthlyQuota))} hasta S/
                {Math.max(...products.map((p) => p.monthlyQuota))} por mes
              </p>
            </div>
            <Button color="primary" variant="bordered" size="sm">
              Ver todos los productos
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
