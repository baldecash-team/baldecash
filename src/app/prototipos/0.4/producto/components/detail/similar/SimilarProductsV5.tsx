'use client';

import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
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

export default function SimilarProductsV5({ products, currentQuota }: SimilarProductsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SimilarProduct | null>(null);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/200x200/e5e7eb/64748b?text=Producto';
  };

  const handleProductClick = (product: SimilarProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleViewProduct = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/prototipos/0.4/producto/detail-preview?infoHeader=3&gallery=1&tabs=1&specs=2&pricing=4&cronograma=2&similar=2&limitations=6&certifications=1&mode=clean`;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-800 mb-2">
          Productos similares
        </h3>
        <p className="text-neutral-600">
          Compara cuotas mensuales lado a lado
        </p>
      </div>

      {/* Visual Collage Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {products.map((product, index) => {
          const isCheaper = product.quotaDifference < 0;

          return (
            <div
              key={product.id}
              className={`relative cursor-pointer group ${
                index === 0 ? 'col-span-2 row-span-2' : ''
              }`}
              onClick={() => handleProductClick(product)}
            >
              <Card className="h-full overflow-hidden">
                <CardBody className="p-0">
                  <div
                    className={`relative w-full bg-neutral-100 overflow-hidden ${
                      index === 0 ? 'aspect-square' : 'aspect-[4/3]'
                    }`}
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={handleImageError}
                    />

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className={`font-bold mb-1 ${index === 0 ? 'text-base' : 'text-sm'} text-white line-clamp-2`}>
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-white ${index === 0 ? 'text-xl' : 'text-base'}`}>
                            S/{product.monthlyQuota}
                          </span>
                          <span className="text-white/80 text-xs">/mes</span>
                        </div>
                      </div>
                    </div>

                    {/* Quota Delta Badge */}
                    {product.quotaDifference !== 0 && (
                      <div
                        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                          isCheaper
                            ? 'bg-[#22c55e] text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}
                      </div>
                    )}
                  </div>

                  {/* Quick Info (visible on larger cards) */}
                  {index === 0 && (
                    <div className="p-3 bg-white">
                      <p className="text-sm font-semibold text-neutral-800 mb-2">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-neutral-800">
                            S/{product.monthlyQuota}/mes
                          </p>
                          {product.quotaDifference !== 0 && (
                            <p className={`text-sm font-semibold ${isCheaper ? 'text-[#22c55e]' : 'text-amber-600'}`}>
                              {isCheaper ? '' : '+'}S/{Math.abs(product.quotaDifference)}/mes vs actual
                            </p>
                          )}
                        </div>
                        <Button
                          color="primary"
                          size="sm"
                          variant="solid"
                        >
                          Comparar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <Button
        className="w-full"
        color="primary"
        variant="bordered"
        size="lg"
      >
        Ver todos los productos similares ({products.length})
      </Button>

      {/* Comparison Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Comparación de productos
          </ModalHeader>
          <ModalBody>
            {selectedProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Product */}
                <div className="border-2 border-[#4654CD] rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#4654CD] mb-2">
                    PRODUCTO ACTUAL
                  </p>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-neutral-800">
                      S/{currentQuota}
                    </p>
                    <p className="text-sm text-neutral-600">por mes</p>
                  </div>
                </div>

                {/* Selected Product */}
                <div className="border-2 border-neutral-300 rounded-lg p-4">
                  <p className="text-xs font-semibold text-neutral-600 mb-2">
                    PRODUCTO COMPARADO
                  </p>
                  <div className="aspect-square bg-neutral-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={selectedProduct.thumbnail}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <h4 className="font-bold text-neutral-800 mb-3">
                    {selectedProduct.name}
                  </h4>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-neutral-800">
                      S/{selectedProduct.monthlyQuota}
                    </p>
                    <p className="text-sm text-neutral-600">por mes</p>
                  </div>

                  {/* Quota Difference - CRITICAL */}
                  {selectedProduct.quotaDifference !== 0 && (
                    <div
                      className={`p-3 rounded-lg mb-4 ${
                        selectedProduct.quotaDifference < 0
                          ? 'bg-[#22c55e]/10'
                          : 'bg-amber-500/10'
                      }`}
                    >
                      <p
                        className={`font-bold ${
                          selectedProduct.quotaDifference < 0
                            ? 'text-[#22c55e]'
                            : 'text-amber-600'
                        }`}
                      >
                        {selectedProduct.quotaDifference < 0 ? '' : '+'}S/
                        {Math.abs(selectedProduct.quotaDifference)}/mes
                      </p>
                      <p className="text-xs text-neutral-600">
                        {selectedProduct.quotaDifference < 0
                          ? 'Ahorras con este producto'
                          : 'Pagas más con este producto'}
                      </p>
                    </div>
                  )}

                  {/* Match Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-600">
                        Similitud
                      </span>
                      <span className="text-xs font-bold text-[#4654CD]">
                        {selectedProduct.matchScore}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-[#4654CD] h-full rounded-full"
                        style={{ width: `${selectedProduct.matchScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Differentiators */}
                  {selectedProduct.differentiators.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-neutral-700 mb-2">
                        Diferencias clave:
                      </p>
                      <ul className="space-y-2">
                        {selectedProduct.differentiators.map((diff, idx) => (
                          <li key={idx} className="text-sm text-neutral-600 flex items-start gap-2">
                            <span className="text-[#4654CD] mt-0.5">•</span>
                            <span>{diff}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setIsModalOpen(false)}
            >
              Cerrar
            </Button>
            {selectedProduct && (
              <Button
                color={selectedProduct.quotaDifference < 0 ? 'success' : 'primary'}
                variant="solid"
                onPress={() => handleViewProduct(selectedProduct.slug)}
              >
                Ver producto completo
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
