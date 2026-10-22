'use client';

/**
 * "Protege tu laptop" del Paso 4 de Diseño 2 (BAL-4966).
 *
 * Solo dibuja: los planes, la selección y la analítica vienen de
 * `usePlanesDeSeguro` (la misma lógica de `/complementos`), y los precios son
 * los del backend. "¿Qué cubre?" abre el mismo detalle de Diseño 1
 * (`InsuranceDetailModal`, con su hoja en celular): el endpoint de seguros hoy
 * no trae `coverage`, y ese detalle es el que ya tiene las viñetas, la nota y
 * el proveedor de cada tipo.
 */

import React, { useState } from 'react';
import { HeartPulse, Lock, ShieldCheck } from 'lucide-react';
import { InsuranceDetailModal } from '@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceDetailModal';
import { getDescription } from '@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceCards';
import type { InsurancePlan } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';
import type { PlanesDeSeguro } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/usePlanesDeSeguro';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { formatCuotaDeLanding, sufijoDeFrecuencia } from '@/app/prototipos/0.6/utils/formatCuota';

function IconoDelPlan({ tipo }: { tipo: string }) {
  const Icono = tipo === 'seguro_robo' ? Lock : tipo === 'multiasistencia' ? HeartPulse : ShieldCheck;
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF0FB] text-[var(--color-primary)]" aria-hidden>
      <Icono className="h-[18px] w-[18px]" />
    </span>
  );
}

/** "Laptop" → "laptop"; sin tipo, "equipo". */
export function nombreDelEquipo(tipo: string | null | undefined): string {
  const t = String(tipo || '').trim().toLocaleLowerCase('es-PE');
  return t || 'equipo';
}

export interface ProteccionesV2Props extends Pick<PlanesDeSeguro, 'planes' | 'cargando' | 'elegidos' | 'alternar' | 'tipoDeEquipo'> {
  landing: string;
  frecuencia?: string | null;
}

export function ProteccionesV2({ planes, cargando, elegidos, alternar, tipoDeEquipo, landing, frecuencia }: ProteccionesV2Props) {
  const [detalle, setDetalle] = useState<InsurancePlan | null>(null);
  const analytics = useAnalytics();

  // Sin planes (la landing no tiene, o es seminuevo) la sección no existe.
  if (!cargando && planes.length === 0) return null;

  const precio = (p: InsurancePlan) => `+S/${formatCuotaDeLanding(p.monthlyPrice, landing)}${sufijoDeFrecuencia(frecuencia)}`;

  return (
    <section
      aria-labelledby="protecciones-v2-titulo"
      data-protecciones-v2
      className="rounded-2xl border border-[#AEB6EE] bg-white p-4 sm:p-7"
      style={{ boxShadow: 'inset 0 4px 0 0 var(--color-primary)' }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="protecciones-v2-titulo" className="text-lg font-bold text-[#1E2230]">
          Protege tu {nombreDelEquipo(tipoDeEquipo)}
        </h2>
        <span className="rounded-full bg-[#EEF0F4] px-2.5 py-0.5 text-xs font-semibold text-[#3A4052]">Opcional</span>
      </div>
      <p className="mt-1 text-[13px] text-[#5B6275]">Se suman a tu cuota mensual. Toca «¿Qué cubre?» para ver el detalle.</p>

      {cargando ? (
        <div className="mt-4 space-y-2" aria-busy="true" aria-label="Cargando protecciones">
          {[0, 1].map((i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-xl bg-[#F3F5FD]" />
          ))}
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {planes.map((plan) => {
            const elegido = elegidos.includes(plan.id);
            const descripcion = getDescription(plan.insuranceType) || plan.description;
            return (
              <li
                key={plan.id}
                data-plan-v2={plan.id}
                className={`flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors duration-150 sm:px-4 ${
                  elegido ? 'border-[var(--color-primary)] bg-[#F3F5FD]' : 'border-[#E3E6EE] bg-white'
                }`}
              >
                <IconoDelPlan tipo={plan.insuranceType} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-semibold leading-tight text-[#1E2230]">{plan.name}</span>
                  {descripcion && (
                    <span className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#5B6275]">{descripcion}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      analytics.trackInsuranceViewTerms({ insurance_id: String(plan.id) });
                      setDetalle(plan);
                    }}
                    className="mt-0.5 inline-flex min-h-[32px] items-center self-start text-[13px] font-semibold text-[var(--color-primary)] underline cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  >
                    ¿Qué cubre?
                  </button>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                  <span className="whitespace-nowrap text-sm font-bold text-[#1E2230]">{precio(plan)}</span>
                  <button
                    type="button"
                    aria-pressed={elegido}
                    aria-label={elegido ? `Quitar ${plan.name}` : `Agregar ${plan.name}`}
                    onClick={() => alternar(plan.id)}
                    className={`min-h-[40px] rounded-full border-[1.5px] px-4 text-sm font-bold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 ${
                      elegido
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                        : 'border-[var(--color-primary)] bg-white text-[var(--color-primary)] hover:bg-[#F3F5FD]'
                    }`}
                  >
                    {elegido ? 'Agregada ✓' : 'Agregar'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <InsuranceDetailModal
        plan={detalle}
        isOpen={!!detalle}
        onClose={() => setDetalle(null)}
        isSelected={detalle ? elegidos.includes(detalle.id) : false}
        onToggle={() => {
          if (detalle) alternar(detalle.id);
        }}
        offerImageUrl={detalle?.imageUrl ?? null}
      />
    </section>
  );
}

export default ProteccionesV2;
