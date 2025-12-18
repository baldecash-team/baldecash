'use client';

/**
 * SuggestionsPanel - Panel de productos sugeridos
 *
 * Muestra productos alternativos cuando no hay resultados
 */

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SuggestedProduct } from '../../types/estados';

interface SuggestionsPanelProps {
  products: SuggestedProduct[];
  onProductClick?: (productId: string) => void;
  maxProducts?: number;
  animationLevel?: 'none' | 'subtle' | 'full';
}

const getGamaColor = (gama: string): string => {
  const colors: Record<string, string> = {
    entry: 'bg-neutral-100 text-neutral-700',
    media: 'bg-blue-100 text-blue-700',
    alta: 'bg-purple-100 text-purple-700',
    premium: 'bg-amber-100 text-amber-700',
  };
  return colors[gama] || 'bg-neutral-100 text-neutral-700';
};

const getGamaLabel = (gama: string): string => {
  const labels: Record<string, string> = {
    entry: 'Entrada',
    media: 'Gama Media',
    alta: 'Gama Alta',
    premium: 'Premium',
  };
  return labels[gama] || gama;
};

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  products,
  onProductClick,
  maxProducts = 3,
  animationLevel = 'subtle',
}) => {
  const displayProducts = products.slice(0, maxProducts);

  if (displayProducts.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#4654CD]" />
        <h4 className="text-lg font-semibold text-neutral-800">
          Productos que podrían interesarte
        </h4>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={animationLevel !== 'none' ? { opacity: 0, y: 20 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              isPressable
              className="border border-neutral-200 hover:border-[#4654CD]/50 transition-all"
              onPress={() => onProductClick?.(product.id)}
            >
              <CardBody className="p-3">
                <div className="flex gap-3">
                  {/* Image placeholder */}
                  <div className="w-20 h-20 flex-shrink-0 bg-neutral-50 rounded-lg p-2 flex items-center justify-center">
                    <div className="w-12 h-12 bg-neutral-200 rounded-lg" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-neutral-500 uppercase">
                        {product.brand}
                      </span>
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: `${getGamaColor(product.gama)} px-1.5 py-0 h-auto`,
                          content: 'text-[10px] font-medium',
                        }}
                      >
                        {getGamaLabel(product.gama)}
                      </Chip>
                    </div>
                    <h5 className="font-medium text-sm text-neutral-800 line-clamp-2 mb-2">
                      {product.displayName}
                    </h5>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-[#4654CD]">
                        S/{product.lowestQuota}
                      </span>
                      <span className="text-xs text-neutral-500">/mes</span>
                    </div>
                  </div>
                </div>

                {/* View CTA */}
                <div className="flex items-center justify-end mt-2 pt-2 border-t border-neutral-100">
                  <span className="text-xs text-[#4654CD] font-medium flex items-center gap-1">
                    Ver detalles
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsPanel;
