'use client';

/**
 * ProductAlternatives - Productos alternativos
 * Versión fija para v0.5 - Estilo V1 (Cards completas)
 */

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { ShoppingCart, Laptop } from 'lucide-react';
import Image from 'next/image';
import { AlternativeProduct } from '../../../types/rejection';
import { formatMoney } from '../../../../utils/formatMoney';

interface ProductAlternativesProps {
  products: AlternativeProduct[];
  onSelect?: (product: AlternativeProduct) => void;
}

export const ProductAlternatives: React.FC<ProductAlternativesProps> = ({
  products,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mb-6"
    >
      <h3 className="font-semibold text-neutral-800 mb-3">Productos que sí puedes obtener</h3>

      <div className="grid sm:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <Card className="border border-neutral-200">
              <CardBody className="p-4">
                {/* Imagen */}
                <div className="aspect-square bg-neutral-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={120}
                      height={120}
                      className="w-3/4 h-3/4 object-contain"
                    />
                  ) : (
                    <Laptop className="w-12 h-12 text-neutral-300" />
                  )}
                </div>

                {/* Info */}
                <p className="text-xs text-neutral-500 mb-1">{product.brand}</p>
                <h4 className="font-medium text-neutral-800 text-sm mb-2 line-clamp-2">
                  {product.name}
                </h4>

                {/* Precio */}
                <div className="mb-3">
                  <p className="text-lg font-bold text-neutral-800">
                    S/{formatMoney(product.price)}
                  </p>
                  <p className="text-sm text-[#4654CD] font-medium">
                    12 cuotas de S/{formatMoney(product.monthlyQuota)}/mes
                  </p>
                </div>

                {/* CTA */}
                <Button
                  size="sm"
                  variant="bordered"
                  startContent={<ShoppingCart className="w-4 h-4" />}
                  className="w-full border-[#4654CD] text-[#4654CD] cursor-pointer"
                  onPress={() => onSelect?.(product)}
                >
                  Ver producto
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProductAlternatives;
