'use client';

/**
 * ProductInfoHeaderV6 - Layout Interactivo (Badges expandibles)
 *
 * Compact layout with expandable quick specs section.
 * Badges hidden by default, revealed on user interaction.
 */

import React, { useState } from 'react';
import { Chip, Button } from '@nextui-org/react';
import { Star, ChevronDown, ChevronUp, Monitor, Battery, Package, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductInfoHeaderProps } from '../../../types/detail';

export const ProductInfoHeaderV6: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'os': return <Monitor className="w-4 h-4" />;
      case 'battery': return <Battery className="w-4 h-4" />;
      case 'stock': return <Package className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Brand + Name inline */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#4654CD] uppercase">
            {product.brand}
          </span>
          <span className="text-neutral-300">•</span>
          <span className="text-sm text-neutral-500">{product.stock} disponibles</span>
        </div>

        <h1 className="text-lg md:text-xl font-bold text-neutral-900 font-['Baloo_2'] leading-snug">
          {product.displayName}
        </h1>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-neutral-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-neutral-700">{product.rating}</span>
        <span className="text-sm text-neutral-500">({product.reviewCount} opiniones)</span>
      </div>

      {/* Expandable Quick Specs */}
      <div>
        <Button
          variant="light"
          size="sm"
          onPress={() => setIsExpanded(!isExpanded)}
          endContent={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          className="text-[#4654CD] font-medium px-0 cursor-pointer hover:bg-transparent"
        >
          {isExpanded ? 'Ocultar especificaciones' : 'Ver especificaciones rapidas'}
        </Button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {product.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#4654CD]">
                        {getBadgeIcon(badge.type)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {badge.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Extra quick specs */}
              <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductInfoHeaderV6;
