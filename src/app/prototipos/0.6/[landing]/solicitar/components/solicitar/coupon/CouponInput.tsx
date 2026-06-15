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
 * Validates coupons via API: POST /api/v1/public/coupons/validate
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Loader2, Check, X, Sparkles, Lock } from 'lucide-react';
import { validateCoupon } from '@/app/prototipos/0.6/utils/couponApi';
import { useProduct } from '../../../context/ProductContext';
import { useWizardConfig } from '../../../context/WizardConfigContext';
import { useEventTrackerOptional } from '../../../context/EventTrackerContext';

type CouponState = 'idle' | 'validating' | 'success' | 'error';

interface CouponInputProps {
  /**
   * Si es true, muestra un indicador de que el cupón es obligatorio
   */
  isRequired?: boolean;
}

export const CouponInput: React.FC<CouponInputProps> = ({ isRequired = false }) => {
  const tracker = useEventTrackerOptional();
  const [couponCode, setCouponCode] = useState('');
  const [state, setState] = useState<CouponState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const {
    appliedCoupon,
    setAppliedCoupon,
    clearCoupon,
    selectedProduct,
    cartProducts,
    getDiscountAmount
  } = useProduct();
  const { config } = useWizardConfig();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setState('error');
      setErrorMessage('Ingresa un código de cupón');
      setTimeout(() => setState('idle'), 2000);
      return;
    }

    setState('validating');

    try {
      // Get product_id for validation (use selected product or first cart product)
      const productId = selectedProduct?.id
        ? parseInt(selectedProduct.id, 10)
        : cartProducts[0]?.id
          ? parseInt(cartProducts[0].id, 10)
          : undefined;

      const result = await validateCoupon({
        code: couponCode.trim(),
        productId,
        landingId: config?.landing?.id ?? config?.landing_id,
      });

      if (result.ok) {
        setState('success');
        setAppliedCoupon(result.coupon);
        tracker?.track('coupon_applied', {
          coupon_code: result.coupon.code,
          coupon_type: result.coupon.couponType,
          discount_value: String(result.coupon.discount),
        });
      } else {
        setState('error');
        setErrorMessage(result.error || 'Cupón no válido o expirado');
        tracker?.track('coupon_error', {
          coupon_code: couponCode.trim(),
          error_message: result.error ?? 'invalid',
        });
        setTimeout(() => setState('idle'), 2000);
      }
    } catch {
      setState('error');
      setErrorMessage('Error al validar el cupón. Intenta nuevamente.');
      tracker?.track('coupon_error', {
        coupon_code: couponCode.trim(),
        error_message: 'network_error',
      });
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const handleRemoveCoupon = () => {
    tracker?.track('coupon_removed', { coupon_code: appliedCoupon?.code });
    clearCoupon();
    setCouponCode('');
    setState('idle');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && state === 'idle') {
      handleApplyCoupon();
    }
  };

  const isLockedCampaign = appliedCoupon?.lockedFromUrl === true;
  const firstQuotaOnly = (appliedCoupon?.quotasAffected ?? 1) <= 1;
  // Cupón de regalo: no aplica descuento monetario sino que entrega un producto.
  // Se muestra "Cantidad asociada" + el regalo en vez de "-S/x".
  //
  // HARDCODE FE: el backend aún no envía el regalo (solo value=0.00), así que
  // tratamos todo cupón con descuento 0 que NO sea de referido como cupón de
  // regalo y mostramos un nombre/cantidad fijos. Si en el futuro el API envía
  // gift_name/gift_quantity, esos valores reales tienen prioridad.
  const FALLBACK_GIFT_NAME = 'Audífonos Samsung Galaxy Buds';
  const FALLBACK_GIFT_QUANTITY = 1;
  const isReferralCoupon = !!appliedCoupon?.referrerName;
  const isGiftCoupon =
    !isReferralCoupon &&
    (!!appliedCoupon?.giftName || appliedCoupon?.discount === 0);
  const giftName = appliedCoupon?.giftName || FALLBACK_GIFT_NAME;
  const giftQuantity = appliedCoupon?.giftQuantity ?? FALLBACK_GIFT_QUANTITY;

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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-green-700">{appliedCoupon.code}</span>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full"
                >
                  {isLockedCampaign ? 'Aplicado automáticamente' : 'Aplicado'}
                </motion.span>
              </div>
              {isGiftCoupon ? (
                <p className="text-sm text-green-600">Cantidad asociada: {giftQuantity}</p>
              ) : (
                <p className="text-sm text-green-600">{appliedCoupon.label}</p>
              )}
              {!isGiftCoupon && isLockedCampaign && firstQuotaOnly && (
                <p className="text-xs text-green-700/80 mt-1">
                  Descuento solo en tu primera cuota. No se puede quitar en esta campaña.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-right"
            >
              {isGiftCoupon ? (
                <>
                  <p className="text-base font-bold text-green-600 leading-tight">
                    + {giftName}
                  </p>
                  <p className="text-xs text-green-500">S/0</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-green-600">
                    -S/{getDiscountAmount().toFixed(0)}
                  </p>
                  <p className="text-xs text-green-500">
                    {firstQuotaOnly
                      ? 'solo en 1.ª cuota'
                      : appliedCoupon.quotasAffected
                        ? `en ${appliedCoupon.quotasAffected} cuotas`
                        : 'por mes'}
                  </p>
                </>
              )}
            </motion.div>

            {isLockedCampaign ? (
              <div
                className="p-2 text-[var(--text-faint,#9ca3af)] rounded-lg"
                title="Cupón de campaña — no se puede quitar"
              >
                <Lock className="w-4 h-4" aria-hidden />
              </div>
            ) : (
              <button
                onClick={handleRemoveCoupon}
                className="p-2 text-[var(--text-faint,#9ca3af)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Quitar cupón"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
                  color: ['#22c55e', '#4ade80', '#86efac', '#fbbf24', 'var(--color-primary)'][i % 5],
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="bg-[var(--surface,#fff)] rounded-xl p-4 border border-[var(--border-soft,#e5e7eb)]">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-5 h-5 text-[var(--color-primary)]" />
        <h3 className="font-semibold text-[var(--text-strong,#1f2937)]">
          Cupón de descuento
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {isRequired && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            Obligatorio
          </span>
        )}
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
            /* fontSize: 16px (text-base) evita el auto-zoom de iOS Safari
               cuando el input recibe focus. */
            style={{ fontSize: '16px' }}
            className={`
              w-full px-4 py-3 rounded-xl border-2 text-base font-medium uppercase
              transition-all duration-200 outline-none
              ${state === 'error'
                ? 'border-red-300 bg-red-50 text-red-700 placeholder:text-red-300'
                : 'border-[var(--border-soft,#e5e7eb)] bg-[var(--surface-bg,#fafafa)] text-[var(--text-strong,#1f2937)] placeholder:text-[var(--text-faint,#9ca3af)] focus:border-[var(--color-primary)] focus:bg-[var(--surface,#fff)]'
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
              ? 'bg-[rgba(var(--color-primary-rgb),0.5)] text-white cursor-wait'
              : 'bg-[var(--color-primary)] text-white hover:brightness-90'
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

    </div>
  );
};

export default CouponInput;
