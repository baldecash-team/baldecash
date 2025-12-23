'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicTotalProps {
  productQuota: number;
  accessoriesQuota: number;
  insuranceQuota: number;
  totalQuota: number;
}

/**
 * DynamicTotal - Muestra el total con animación
 * Se actualiza en tiempo real con cada cambio
 */
export const DynamicTotal: React.FC<DynamicTotalProps> = ({
  productQuota,
  accessoriesQuota,
  insuranceQuota,
  totalQuota,
}) => {
  return (
    <div className="bg-neutral-50 rounded-xl p-4">
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Equipo</span>
          <span className="text-neutral-800">S/{productQuota}/mes</span>
        </div>
        
        <AnimatePresence>
          {accessoriesQuota > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between text-sm"
            >
              <span className="text-neutral-600">Accesorios</span>
              <span className="text-neutral-800">+S/{accessoriesQuota}/mes</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {insuranceQuota > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between text-sm"
            >
              <span className="text-neutral-600">Seguro</span>
              <span className="text-neutral-800">+S/{insuranceQuota}/mes</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-3 border-t border-neutral-200">
        <div className="flex justify-between items-center">
          <span className="text-neutral-800 font-medium">Total mensual</span>
          <motion.span
            key={totalQuota}
            initial={{ scale: 1.1, color: '#4654CD' }}
            animate={{ scale: 1, color: '#232323' }}
            className="text-xl font-bold"
          >
            S/{totalQuota}/mes
          </motion.span>
        </div>
      </div>
    </div>
  );
};

export default DynamicTotal;
