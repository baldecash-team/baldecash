'use client';

/**
 * Seguros que vienen dentro del combo (S3/R7): «Incluido en tu combo», S/0,
 * fijos. No llevan botón: no se quitan ni se vuelven a comprar, y nunca entran
 * a `selectedInsurances` (no suman a la cuota ni viajan en el submit).
 *
 * - `SegurosIncluidosEnCombo`: tarjetas del paso de seguros (Diseño 1).
 * - `FilasIncluidasEnCombo`: filas compactas para la barra y el resumen.
 */
import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import type { InsurancePlan } from '../../types/upsell';
import { TEXTO_INCLUIDO_EN_COMBO, type SeguroDelCombo } from '@/app/prototipos/0.6/utils/comboIncluidos';

export function SegurosIncluidosEnCombo({ seguros, className = '' }: { seguros: InsurancePlan[]; className?: string }) {
  if (seguros.length === 0) return null;
  return (
    <section aria-labelledby="seguros-incluidos-titulo" className={className}>
      <h3 id="seguros-incluidos-titulo" className="mb-3 text-base font-semibold text-neutral-800">
        Ya vienen en tu combo
      </h3>
      <ul className="space-y-2">
        {seguros.map((s) => (
          <li
            key={s.id}
            data-testid={`seguro-incluido-${s.id}`}
            className="flex items-center gap-3 rounded-xl border-2 border-[var(--color-secondary)] bg-[rgba(var(--color-secondary-rgb),0.06)] px-4 py-3"
          >
            <input
              type="checkbox"
              checked
              disabled
              readOnly
              aria-label={`${s.name}: ${TEXTO_INCLUIDO_EN_COMBO}`}
              className="h-4 w-4 accent-[var(--color-secondary)]"
            />
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[var(--color-secondary)]" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-800">{s.name}</p>
              {s.durationMonths ? (
                <p className="text-xs text-neutral-500">{s.durationMonths} meses de cobertura</p>
              ) : null}
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-bold text-[var(--color-secondary)]">S/0</p>
              <p className="flex items-center justify-end gap-1 text-[11px] font-semibold text-[var(--color-secondary)]">
                <Check className="h-3 w-3" aria-hidden />
                {TEXTO_INCLUIDO_EN_COMBO}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FilasIncluidasEnCombo({ seguros, className = '' }: { seguros: SeguroDelCombo[]; className?: string }) {
  if (seguros.length === 0) return null;
  return (
    <div data-incluidos-en-combo className={`space-y-1.5 ${className}`}>
      {seguros.map((s) => (
        <div
          key={s.planId}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-secondary)]/10 px-3 py-2 text-xs text-neutral-600"
        >
          <ShieldCheck className="h-3 w-3 text-[var(--color-secondary)]" aria-hidden />
          <span className="flex-1 truncate">{s.name}</span>
          <span className="font-medium text-[var(--color-secondary)]">{TEXTO_INCLUIDO_EN_COMBO}</span>
        </div>
      ))}
    </div>
  );
}
