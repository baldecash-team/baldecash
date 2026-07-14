'use client';

/**
 * LeadCouponField — campo de cupón OPCIONAL para el formulario de lead.
 *
 * - Valida en vivo contra `POST /public/coupons/validate` (reusa `validateCoupon`).
 *   Ese endpoint ya rechaza cupones inactivos/expirados/agotados, así que aquí
 *   "solo cupones activos" sale gratis: si no es válido, no se aplica.
 * - Se pre-llena desde `?coupon=` de la URL (`getPendingCoupon`) y se auto-aplica,
 *   para atribuir al promotor sin que el estudiante escriba nada.
 * - El código validado se reporta al form padre vía `onApply`, que lo guarda en
 *   `extra['coupon_code']`; de ahí `buildCapturePayload` lo emite como
 *   `fields.coupon_code` → `captured_data` del lead (sin migración de BD).
 *
 * Invariante: solo se reporta hacia arriba un código YA validado. Un código
 * inválido nunca queda guardado en el estado del form.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Tag, Loader2, Check, X } from 'lucide-react';
import { validateCoupon } from '../../utils/couponApi';
import { getPendingCoupon } from '../../utils/landingParams';
import type { LeadFormFieldConfig } from '../../types/hero';

interface LeadCouponFieldProps {
  field: LeadFormFieldConfig;
  landingId: number;
  landing: string;
  primaryColor: string;
  /** Código validado actualmente aplicado (viene del estado del form padre). */
  value: string;
  /** Error a nivel de form (p.ej. requerido y vacío al enviar). */
  error?: string;
  variant?: 'default' | 'split';
  onApply: (code: string) => void;
  onRemove: () => void;
}

type State = 'idle' | 'validating' | 'error';

export const LeadCouponField: React.FC<LeadCouponFieldProps> = ({
  field,
  landingId,
  landing,
  primaryColor,
  value,
  error,
  variant = 'default',
  onApply,
  onRemove,
}) => {
  const [input, setInput] = useState('');
  const [state, setState] = useState<State>('idle');
  const [msg, setMsg] = useState('');
  const [focused, setFocused] = useState(false);
  const prefilled = useRef(false);

  const apply = async (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) {
      setState('error');
      setMsg('Ingresa un código de cupón');
      return;
    }
    setState('validating');
    setMsg('');
    const res = await validateCoupon({ code, landingId });
    if (res.ok) {
      setState('idle');
      setInput('');
      onApply(res.coupon.code);
    } else {
      setState('error');
      setMsg(res.error || 'Cupón no válido o expirado');
    }
  };

  // Pre-llenar desde ?coupon= de la URL (una sola vez) y auto-aplicar.
  useEffect(() => {
    if (prefilled.current || value) return;
    prefilled.current = true;
    const pending = getPendingCoupon(landing);
    if (pending) apply(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = field.label || 'Cupón de descuento';
  const hasError = state === 'error' || (!!error && state !== 'validating');
  // Igualar el label al resto de campos (TextInput): text-sm en split, text-xs en
  // default, mismo peso y color neutral-700 — antes se veía más pequeño/claro.
  const labelClass = `block font-medium text-neutral-700 mb-1 ${
    variant === 'split' ? 'text-sm' : 'text-xs'
  }`;

  // Estado aplicado: chip verde con el código + botón para quitar.
  if (value) {
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-3 h-10">
          <span className="flex items-center gap-2 min-w-0">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="font-semibold text-green-700 truncate text-sm">{value}</span>
            <span className="text-[11px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              Aplicado
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              onRemove();
              setInput('');
              setState('idle');
              setMsg('');
            }}
            className="p-1 -mr-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Quitar cupón"
            aria-label="Quitar cupón"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className={labelClass}>
        {label}
        {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value.toUpperCase());
              if (state === 'error') {
                setState('idle');
                setMsg('');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply(input);
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={field.placeholder || 'Ingresa tu código'}
            disabled={state === 'validating'}
            /* 16px evita el auto-zoom de iOS Safari al enfocar. */
            style={{
              fontSize: '16px',
              borderColor: hasError ? '#fca5a5' : focused ? primaryColor : undefined,
            }}
            className={`w-full h-10 pl-9 pr-3 rounded-lg border text-sm font-medium uppercase outline-none transition-colors ${
              hasError
                ? 'bg-red-50 text-red-700 placeholder:text-red-300'
                : 'border-neutral-300 bg-white text-neutral-800 placeholder:text-neutral-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        </div>
        <button
          type="button"
          onClick={() => apply(input)}
          disabled={state === 'validating'}
          style={{ backgroundColor: primaryColor }}
          className="px-4 h-10 min-w-[84px] rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {state === 'validating' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
        </button>
      </div>
      {hasError && (msg || error) && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <X className="w-3.5 h-3.5" />
          {msg || error}
        </p>
      )}
    </div>
  );
};

export default LeadCouponField;
