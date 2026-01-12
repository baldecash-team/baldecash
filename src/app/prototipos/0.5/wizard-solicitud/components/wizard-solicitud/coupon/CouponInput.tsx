'use client';

/**
 * CouponInput - Campo de cupón de descuento con animaciones
 *
 * Estados:
 * - idle: Input vacío o con texto
 * - validating: Validando cupón (spinner)
 * - success: Cupón válido (animación confetti)
 * - error: Cupón inválido (shake animation)
 *
 * Cupón válido: "PROMO" → S/10 de descuento mensual
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Loader2, Check, X, Sparkles } from 'lucide-react';
import { useProduct } from '../../../context/ProductContext';

type CouponState = 'idle' | 'validating' | 'success' | 'error';

// Cupones válidos con sus descuentos
const VALID_COUPONS: Record<string, { discount: number; label: string }> = {
  PROMO: { discount: 10, label: 'Descuento promocional' },
  BALDI10: { discount: 10, label: 'Descuento Baldi' },
  ESTUDIANTE: { discount: 15, label: 'Descuento estudiante' },
};

export const CouponInput: React.FC = () => {
  const [couponCode, setCouponCode] = useState('');
  const [state, setState] = useState<CouponState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { appliedCoupon, setAppliedCoupon, clearCoupon } = useProduct();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setState('error');
      setErrorMessage('Ingresa un código de cupón');
      setTimeout(() => setState('idle'), 2000);
      return;
    }

    setState('validating');

    // Simular validación con API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const normalizedCode = couponCode.trim().toUpperCase();
    const couponData = VALID_COUPONS[normalizedCode];

    if (couponData) {
      setState('success');
      setAppliedCoupon({
        code: normalizedCode,
        discount: couponData.discount,
        label: couponData.label,
      });
    } else {
      setState('error');
      setErrorMessage('Cupón no válido o expirado');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const handleRemoveCoupon = () => {
    clearCoupon();
    setCouponCode('');
    setState('idle');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && state === 'idle') {
      handleApplyCoupon();
    }
  };

  // Si ya hay un cupón aplicado, mostrar estado de éxito
  if (appliedCoupon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-green-600" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-700">{appliedCoupon.code}</span>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full"
                >
                  Aplicado
                </motion.span>
              </div>
              <p className="text-sm text-green-600">{appliedCoupon.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-right"
            >
              <p className="text-lg font-bold text-green-600">-S/{appliedCoupon.discount}</p>
              <p className="text-xs text-green-500">por mes</p>
            </motion.div>

            <button
              onClick={handleRemoveCoupon}
              className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Quitar cupón"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Confetti Animation */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                x: '50%',
                y: '50%',
                scale: 0,
              }}
              animate={{
                opacity: 0,
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                scale: 1,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.05,
                ease: 'easeOut',
              }}
              className="absolute"
            >
              <Sparkles
                className="w-4 h-4"
                style={{
                  color: ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#4654CD'][i % 5],
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-neutral-200">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-5 h-5 text-[#4654CD]" />
        <h3 className="font-semibold text-neutral-800">Cupón de descuento</h3>
      </div>

      <div className="flex gap-2">
        {/* Input con animación shake en error */}
        <motion.div
          className="flex-1"
          animate={state === 'error' ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Ingresa tu código"
            disabled={state === 'validating' || state === 'success'}
            className={`
              w-full px-4 py-3 rounded-xl border-2 text-sm font-medium uppercase
              transition-all duration-200 outline-none
              ${state === 'error'
                ? 'border-red-300 bg-red-50 text-red-700 placeholder:text-red-300'
                : 'border-neutral-200 bg-neutral-50 text-neutral-800 placeholder:text-neutral-400 focus:border-[#4654CD] focus:bg-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          />
        </motion.div>

        {/* Botón Aplicar */}
        <button
          onClick={handleApplyCoupon}
          disabled={state === 'validating' || state === 'success'}
          className={`
            px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
            flex items-center gap-2 cursor-pointer
            ${state === 'validating'
              ? 'bg-[#4654CD]/50 text-white cursor-wait'
              : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
            }
            disabled:cursor-not-allowed
          `}
        >
          {state === 'validating' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Validando</span>
            </>
          ) : (
            'Aplicar'
          )}
        </button>
      </div>

      {/* Mensaje de error */}
      <AnimatePresence>
        {state === 'error' && errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-500 mt-2 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hint */}
      <p className="text-xs text-neutral-400 mt-2">
        Prueba con el código <span className="font-mono font-medium text-[#4654CD]">PROMO</span>
      </p>
    </div>
  );
};

export default CouponInput;
