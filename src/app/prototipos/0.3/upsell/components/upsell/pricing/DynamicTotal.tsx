'use client';

/**
 * DynamicTotal - Total con animacion en tiempo real
 *
 * D.7: El total se actualiza en tiempo real con animacion sutil
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicTotalProps {
  monthlyQuota: number;
  totalPrice: number;
  previousQuota?: number;
}

export const DynamicTotal: React.FC<DynamicTotalProps> = ({
  monthlyQuota,
  totalPrice,
  previousQuota,
}) => {
  const [displayQuota, setDisplayQuota] = useState(monthlyQuota);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (previousQuota !== undefined && previousQuota !== monthlyQuota) {
      setIsAnimating(true);
      setDirection(monthlyQuota > previousQuota ? 'up' : 'down');

      // Animate the number
      const steps = 10;
      const diff = monthlyQuota - previousQuota;
      const stepValue = diff / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setDisplayQuota(Math.round(previousQuota + stepValue * currentStep));

        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayQuota(monthlyQuota);
          setTimeout(() => {
            setIsAnimating(false);
            setDirection(null);
          }, 300);
        }
      }, 30);

      return () => clearInterval(interval);
    } else {
      setDisplayQuota(monthlyQuota);
    }
  }, [monthlyQuota, previousQuota]);

  return (
    <motion.div
      layout
      className={`p-4 rounded-xl transition-colors duration-300 ${
        isAnimating
          ? direction === 'up'
            ? 'bg-amber-50'
            : 'bg-green-50'
          : 'bg-neutral-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Tu cuota mensual</p>
          <div className="flex items-baseline gap-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={displayQuota}
                initial={{ opacity: 0, y: direction === 'up' ? 10 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction === 'up' ? -10 : 10 }}
                className={`text-3xl font-bold font-['Baloo_2'] transition-colors ${
                  isAnimating
                    ? direction === 'up'
                      ? 'text-amber-600'
                      : 'text-green-600'
                    : 'text-[#4654CD]'
                }`}
              >
                S/{displayQuota}
              </motion.span>
            </AnimatePresence>
            <span className="text-neutral-500">/mes</span>
          </div>
        </div>

        {/* Direction indicator */}
        <AnimatePresence>
          {isAnimating && direction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                direction === 'up'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {direction === 'up' ? '+' : '-'}
              S/{Math.abs(monthlyQuota - (previousQuota || 0))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-neutral-400 mt-1">
        Total a financiar: S/{totalPrice.toLocaleString()}
      </p>
    </motion.div>
  );
};

export default DynamicTotal;
