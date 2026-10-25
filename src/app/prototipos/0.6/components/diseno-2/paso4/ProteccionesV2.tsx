'use client';

/**
 * "Protege tu laptop" del Paso 4 de Diseño 2 (BAL-4966).
 *
 * Solo dibuja: los planes, la selección y la analítica vienen de
 * `usePlanesDeSeguro` (la misma lógica de `/complementos`), y los precios son
 * los del backend. "¿Qué cubre?" abre la hoja propia de Diseño 2
 * (`HojaSeguroV2`, igual al prototipo), con las viñetas, la nota y el
 * proveedor de cada tipo que ya usa el detalle de Diseño 1.
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, HeartPulse, Lock, RotateCw, ShieldCheck } from 'lucide-react';
import { HojaSeguroV2 } from './HojaSeguroV2';
import { getDescription } from '@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceCards';
import type { InsurancePlan } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';
import type { PlanesDeSeguro } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/usePlanesDeSeguro';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { formatCuotaDeLanding, sufijoDeFrecuencia } from '@/app/prototipos/0.6/utils/formatCuota';

function IconoDelPlan({ tipo }: { tipo: string }) {
  const Icono = tipo === 'seguro_robo' ? Lock : tipo === 'multiasistencia' ? HeartPulse : ShieldCheck;
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--d2-marca-suave-2)] text-[var(--color-primary-text)]" aria-hidden>
      <Icono className="h-[18px] w-[18px]" />
    </span>
  );
}

/** "Laptop" → "laptop"; sin tipo, "equipo". */
export function nombreDelEquipo(tipo: string | null | undefined): string {
  const t = String(tipo || '').trim().toLocaleLowerCase('es-PE');
  return t || 'equipo';
}

/** "1 protección elegida" / "2 protecciones elegidas". */
export function textoDeElegidas(n: number): string {
  return n === 1 ? '1 protección elegida' : `${n} protecciones elegidas`;
}

export interface ProteccionesV2Props
  extends Pick<PlanesDeSeguro, 'planes' | 'cargando' | 'elegidos' | 'alternar' | 'tipoDeEquipo'>,
    Partial<Pick<PlanesDeSeguro, 'error' | 'reintentar'>> {
  landing: string;
  frecuencia?: string | null;
  /**
   * Avisa cuando se abre o se cierra la hoja "¿Qué cubre?". El paso esconde
   * con esto la barra fija de abajo ("Enviar…"): con la hoja abierta no se
   * puede enviar (QA en celular, BAL-4969, bug 1).
   */
  onDetalleAbiertoChange?: (abierto: boolean) => void;
  /**
   * Una protección que no se dejó agregar porque la cuota pasaría el tope
   * (BAL-4969, casuísticas): el aviso va junto a esa protección.
   */
  avisoDelPlan?: { planId: string; texto: string } | null;
}

export function ProteccionesV2({ planes, cargando, error = false, reintentar, elegidos, alternar, tipoDeEquipo, landing, frecuencia, onDetalleAbiertoChange, avisoDelPlan }: ProteccionesV2Props) {
  const [detalle, setDetalle] = useState<InsurancePlan | null>(null);
  const analytics = useAnalytics();

  const detalleAbierto = detalle !== null;
  useEffect(() => {
    onDetalleAbiertoChange?.(detalleAbierto);
  }, [detalleAbierto, onDetalleAbiertoChange]);
  // Si la sección se desmonta con la hoja abierta, la barra vuelve.
  useEffect(() => () => onDetalleAbiertoChange?.(false), [onDetalleAbiertoChange]);

  // Sin planes (la landing no tiene, o es seminuevo) la sección no existe.
  // Con error sí: hay que avisar y dejar reintentar (sin esqueleto infinito).
  if (!cargando && !error && planes.length === 0) return null;

  const precio = (p: InsurancePlan) => `+S/${formatCuotaDeLanding(p.monthlyPrice, landing)}${sufijoDeFrecuencia(frecuencia)}`;

  return (
    <section
      aria-labelledby="protecciones-v2-titulo"
      data-protecciones-v2
      className="rounded-2xl border border-[var(--d2-borde-tarjeta)] bg-[var(--d2-tarjeta)] p-4 sm:p-7"
      style={{ boxShadow: 'inset 0 4px 0 0 var(--color-primary)' }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="protecciones-v2-titulo" className="text-lg font-bold text-[var(--d2-texto)]">
          Protege tu {nombreDelEquipo(tipoDeEquipo)}
        </h2>
        <span className="rounded-full bg-[var(--d2-chip)] px-2.5 py-0.5 text-xs font-semibold text-[var(--d2-texto-2)]">Opcional</span>
      </div>
      <p className="mt-1 text-[13px] text-[var(--d2-texto-suave)]">Se suman a tu cuota mensual. Toca «¿Qué cubre?» para ver el detalle.</p>

      {error ? (
        <div role="alert" className="mt-4 rounded-xl border border-[var(--d2-ambar-borde)] bg-[var(--d2-ambar-suave)] p-3 sm:p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[var(--d2-ambar-icono)]" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[var(--d2-texto)]">No pudimos cargar las protecciones.</p>
              <p className="mt-0.5 text-[13px] leading-snug text-[var(--d2-texto-suave)]">
                {elegidos.length > 0
                  ? `Guardamos tu selección (${textoDeElegidas(elegidos.length)}). Reintenta para verla antes de enviar.`
                  : 'Puedes reintentar o enviar tu solicitud sin protecciones.'}
              </p>
            </div>
          </div>
          {reintentar && (
            <button
              type="button"
              onClick={reintentar}
              className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border-[1.5px] border-[var(--color-primary)] bg-[var(--d2-tarjeta)] px-4 text-sm font-bold text-[var(--color-primary-text)] cursor-pointer hover:bg-[var(--d2-marca-suave)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
            >
              <RotateCw className="h-4 w-4" aria-hidden />
              Reintentar
            </button>
          )}
        </div>
      ) : cargando ? (
        <div className="mt-4 space-y-2" aria-busy="true" aria-label="Cargando protecciones">
          {[0, 1].map((i) => (
            <div key={i} className="h-[76px] animate-pulse motion-reduce:animate-none rounded-xl bg-[var(--d2-marca-suave)]" />
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
                  elegido ? 'border-[var(--color-primary)] bg-[var(--d2-marca-suave)]' : 'border-[var(--d2-borde)] bg-[var(--d2-tarjeta)]'
                }`}
              >
                <IconoDelPlan tipo={plan.insuranceType} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-semibold leading-tight text-[var(--d2-texto)]">{plan.name}</span>
                  {descripcion && (
                    <span className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[var(--d2-texto-suave)]">{descripcion}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      analytics.trackInsuranceViewTerms({ insurance_id: String(plan.id) });
                      setDetalle(plan);
                    }}
                    className="inline-flex min-h-[44px] items-center self-start text-[13px] font-semibold text-[var(--color-primary-text)] underline cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  >
                    ¿Qué cubre?
                  </button>
                  {avisoDelPlan?.planId === plan.id && (
                    <p role="alert" data-tope-plan-v2 className="mt-1 flex items-start gap-1.5 rounded-lg border border-[var(--d2-error-borde)] bg-[var(--d2-error-suave)] px-2.5 py-2 text-[13px] leading-snug text-[var(--d2-texto)]">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--d2-error)]" aria-hidden />
                      {avisoDelPlan.texto}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                  <span className="whitespace-nowrap text-sm font-bold text-[var(--d2-texto)]">{precio(plan)}</span>
                  <button
                    type="button"
                    // Texto visible FIJO ("Agregar") y el estado en
                    // `aria-pressed`: el nombre accesible (`aria-label`, "Agregar {plan}")
                    // empieza con lo que se ve (WCAG 2.5.3). El ✓ y el relleno
                    // son solo visuales.
                    aria-pressed={elegido}
                    aria-label={`Agregar ${plan.name}`}
                    onClick={() => alternar(plan.id)}
                    className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-[1.5px] px-4 text-sm font-bold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 ${
                      elegido
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                        : 'border-[var(--color-primary)] bg-[var(--d2-tarjeta)] text-[var(--color-primary-text)] hover:bg-[var(--d2-marca-suave)]'
                    }`}
                  >
                    {elegido && <Check className="h-4 w-4 d2-check-in" strokeWidth={3} aria-hidden data-check-v2 />}
                    Agregar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <HojaSeguroV2
        plan={detalle}
        elegido={detalle ? elegidos.includes(detalle.id) : false}
        onAlternar={() => {
          if (detalle) alternar(detalle.id);
        }}
        onCerrar={() => setDetalle(null)}
        landing={landing}
        frecuencia={frecuencia}
      />
    </section>
  );
}

export default ProteccionesV2;
