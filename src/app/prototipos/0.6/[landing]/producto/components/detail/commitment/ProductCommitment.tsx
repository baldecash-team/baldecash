'use client';

/**
 * ProductCommitment - Tarjeta de compromiso/garantía BaldeCash
 *
 * Bloque de confianza para el detalle de producto (columna derecha), inspirado en
 * el patrón de "compromiso" de marketplaces: envío, garantía, devoluciones y
 * seguridad. Adaptado a la marca BaldeCash (sin menciones a terceros).
 *
 * Contenido genérico y verificable: no incluye fechas de entrega ni montos
 * inventados.
 */

import React from 'react';
import { Truck, ShieldCheck, Check, RefreshCw, Lock } from 'lucide-react';
import { formatDeferredRange, type DeferredDelivery } from '@/app/prototipos/0.6/utils/deferredDelivery';

interface CommitmentBullet {
  text: string;
}

const PROTECTION_BULLETS: CommitmentBullet[] = [
  { text: 'Garantía oficial del fabricante' },
  { text: 'Asesoría personalizada en tu compra' },
  { text: 'Soporte durante todo tu financiamiento' },
];

interface ProductCommitmentProps {
  /** Entrega diferida (informativa). Solo se muestra el rango si isDeferred === true. */
  deferredDelivery?: DeferredDelivery | null;
}

export const ProductCommitment: React.FC<ProductCommitmentProps> = ({ deferredDelivery }) => {
  const deferredRange = deferredDelivery?.isDeferred
    ? formatDeferredRange(deferredDelivery.estimatedFrom, deferredDelivery.estimatedTo)
    : '';

  return (
    <div className="bg-[var(--surface,#fff)] rounded-2xl border border-[var(--border-soft,#e5e7eb)] shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-primary)] text-white text-[11px] font-bold tracking-wide">
          BaldeCash
        </span>
        <span className="text-[var(--color-primary)] font-bold text-base">
          Compromiso BaldeCash
        </span>
      </div>

      {/* Envío */}
      <div className="flex items-start gap-3 mb-4">
        <Truck className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[var(--text-strong,#1f2937)] text-sm">Envío gratis</p>
          {deferredRange ? (
            <p className="text-sm text-[var(--text-muted,#6b7280)]">
              Entrega: <span className="font-semibold text-[var(--text-strong,#1f2937)]">{deferredRange}</span>
            </p>
          ) : (
            <p className="text-sm text-[var(--text-muted,#6b7280)]">
              Entrega a domicilio en todo el Perú
            </p>
          )}
        </div>
      </div>

      {/* Compra protegida + bullets */}
      <div className="flex items-start gap-3 mb-3">
        <ShieldCheck className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
        <p className="font-semibold text-[var(--text-strong,#1f2937)] text-sm">Compra protegida</p>
      </div>
      <ul className="space-y-2 mb-4 ml-8">
        {PROTECTION_BULLETS.map((bullet) => (
          <li key={bullet.text} className="flex items-start gap-2 text-sm text-[var(--text-muted,#6b7280)]">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>{bullet.text}</span>
          </li>
        ))}
      </ul>

      {/* Devoluciones */}
      <div className="flex items-start gap-3 mb-4">
        <RefreshCw className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
        <p className="font-semibold text-[var(--text-strong,#1f2937)] text-sm">
          Política de devoluciones y reembolsos
        </p>
      </div>

      {/* Seguridad & Privacidad */}
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[var(--text-strong,#1f2937)] text-sm">
            Seguridad &amp; Privacidad
          </p>
          <p className="text-sm text-[var(--text-muted,#6b7280)] mt-1">
            Pagos seguros: no compartimos tus datos de pago.
          </p>
          <p className="text-sm text-[var(--text-muted,#6b7280)]">
            Datos personales seguros: protegemos tu información.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCommitment;
