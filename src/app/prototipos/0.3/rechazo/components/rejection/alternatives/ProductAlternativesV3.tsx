'use client';

/**
 * ProductAlternativesV3 - Un solo producto recomendado destacado
 *
 * G.11 V3: Un solo producto recomendado con mayor énfasis
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Star, Package, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { AlternativeProduct } from '../../../types/rejection';

interface ProductAlternativesV3Props {
  product: AlternativeProduct;
  originalPrice?: number;
  onSelectProduct?: (product: AlternativeProduct) => void;
}

export const ProductAlternativesV3: React.FC<ProductAlternativesV3Props> = ({
  product,
  originalPrice,
  onSelectProduct,
}) => {
  const savings = originalPrice ? originalPrice - product.price : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="border-2 border-[#4654CD]/30 bg-gradient-to-br from-white to-[#4654CD]/5">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 bg-[#4654CD] text-white text-xs rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Recomendado para ti
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="w-full aspect-square bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Package className="w-16 h-16 text-neutral-300" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-neutral-800 mb-2">
                {product.name}
              </h3>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-[#4654CD]">
                  S/ {product.price.toLocaleString()}
                </span>
                {originalPrice && (
                  <span className="text-lg text-neutral-400 line-through">
                    S/ {originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {savings > 0 && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mb-4"
                >
                  <Sparkles className="w-4 h-4" />
                  Ahorras S/ {savings.toLocaleString()}
                </motion.div>
              )}

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Pre-aprobado con cuota de</span>
                  <span className="font-bold text-green-600">
                    S/ {product.monthlyQuota}/mes
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full md:w-auto bg-[#4654CD] text-white"
                endContent={<ArrowRight className="w-4 h-4" />}
                onPress={() => onSelectProduct?.(product)}
              >
                Continuar con este producto
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ProductAlternativesV3;
