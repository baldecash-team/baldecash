'use client';

import React from 'react';
import { Chip } from '@nextui-org/react';
import { Package, Gift, Tag, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for the summary card
const mockSummaryData = {
  product: {
    name: 'Lenovo IdeaPad 3 15ITL6',
    brand: 'Lenovo',
    image: '/images/products/lenovo-ideapad-3.webp',
    specs: '15.6" FHD · Intel Core i5 · 8GB RAM · 512GB SSD',
    monthlyQuota: 129,
  },
  accessories: [
    { name: 'Mouse inalámbrico', price: 5 },
    { name: 'Mochila para laptop', price: 8 },
  ],
  promos: [
    'Envío gratis',
    'Primera cuota en 30 días',
  ],
  totalMonthlyQuota: 142,
};

export const ProductSummaryCard: React.FC = () => {
  const { product, accessories, promos, totalMonthlyQuota } = mockSummaryData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-sm"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#4654CD]/5 px-5 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#4654CD]" />
            <h3 className="text-sm font-bold text-neutral-800">Tu selección</h3>
          </div>
        </div>

        {/* Product */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-neutral-200">
              <Laptop className="w-8 h-8 text-neutral-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#4654CD] font-medium uppercase">{product.brand}</p>
              <p className="text-sm font-semibold text-neutral-800 line-clamp-1">{product.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{product.specs}</p>
            </div>
          </div>

          {/* Accessories */}
          {accessories.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Gift className="w-3.5 h-3.5 text-[#4654CD]" />
                <p className="text-xs font-semibold text-neutral-700">Accesorios</p>
              </div>
              <div className="space-y-1.5">
                {accessories.map((acc, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600">{acc.name}</span>
                    <span className="text-neutral-500">+S/{acc.price}/mes</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promos */}
          {promos.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-xs font-semibold text-neutral-700">Promociones</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {promos.map((promo, i) => (
                  <Chip key={i} size="sm" variant="flat" className="bg-emerald-50 text-emerald-700 text-xs">
                    {promo}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="pt-3 border-t border-neutral-100">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-neutral-500">Cuota total mensual</span>
              <div className="text-right">
                <span className="text-2xl font-black text-[#4654CD]">S/{totalMonthlyQuota}</span>
                <span className="text-sm text-neutral-400">/mes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductSummaryCard;
