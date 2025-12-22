'use client';

/**
 * ApprovedSummaryV6 - Hero destacado
 * Cuota mensual como elemento hero gigante
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { ApprovalData } from '../../../types/approval';

interface SummaryProps {
  data: ApprovalData;
}

export const ApprovedSummaryV6: React.FC<SummaryProps> = ({ data }) => {
  const { product, creditDetails } = data;

  return (
    <div className="w-full text-center">
      {/* Producto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <p className="text-neutral-600">{product.brand}</p>
        <p className="text-xl font-semibold text-neutral-800">{product.name}</p>
      </motion.div>

      {/* Cuota Hero */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        className="relative py-8"
      >
        {/* Decoración */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-48 h-48 bg-[#4654CD] rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-[#03DBD0]/10 text-[#03DBD0] px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Tu cuota mensual
          </div>

          <div className="flex items-baseline justify-center">
            <span className="text-2xl text-neutral-600">S/</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-7xl md:text-8xl font-bold text-[#4654CD]"
            >
              {creditDetails.monthlyPayment.toLocaleString()}
            </motion.span>
          </div>

          <p className="text-neutral-500 mt-2">
            por {creditDetails.installments} meses
          </p>
        </div>
      </motion.div>

      {/* Detalles secundarios */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center gap-8 mt-6 text-sm"
      >
        <div>
          <p className="text-neutral-400">Precio equipo</p>
          <p className="font-semibold text-neutral-700">S/ {product.price.toLocaleString()}</p>
        </div>
        <div className="w-px bg-neutral-200" />
        <div>
          <p className="text-neutral-400">Tasa</p>
          <p className="font-semibold text-neutral-700">{creditDetails.interestRate}% mensual</p>
        </div>
        <div className="w-px bg-neutral-200" />
        <div>
          <p className="text-neutral-400">Total</p>
          <p className="font-semibold text-neutral-700">S/ {creditDetails.totalAmount.toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ApprovedSummaryV6;
