'use client';

/**
 * ProductAlternativesV1 - Grid de 3 productos alternativos
 *
 * G.11 V1: Grid de 3 productos que sí calificas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Package, DollarSign, Calendar } from 'lucide-react';
import { AlternativeProduct } from '../../../types/rejection';

interface ProductAlternativesV1Props {
  products: AlternativeProduct[];
  onSelectProduct?: (product: AlternativeProduct) => void;
}

export const ProductAlternativesV1: React.FC<ProductAlternativesV1Props> = ({
  products,
  onSelectProduct,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-[#4654CD]" />
        Productos que sí puedes financiar
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.slice(0, 3).map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="border border-neutral-200 hover:border-[#4654CD]/50 transition-colors">
              <CardBody className="p-4">
                <div className="w-full h-24 bg-neutral-100 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="w-10 h-10 text-neutral-300" />
                </div>

                <h4 className="font-medium text-neutral-800 text-sm mb-2 line-clamp-2">
                  {product.name}
                </h4>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-600">
                      S/ {product.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span className="text-green-600 font-medium">
                      S/ {product.monthlyQuota}/mes
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full bg-[#4654CD] text-white"
                  onPress={() => onSelectProduct?.(product)}
                >
                  Ver detalles
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductAlternativesV1;
