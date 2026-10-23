'use client';

/**
 * Hoja "¿Qué cubre?" de una protección en Diseño 2 (prototipo de Brenda,
 * Paso 4). Reemplaza en Diseño 2 al `InsuranceDetailModal` de Diseño 1, que
 * no cambia.
 *
 * Como el prototipo: nombre y "×" arriba, la cuota en una caja gris con el
 * total en cuotas, las coberturas con ✓ verde, la nota, el proveedor con
 * "Ver términos y condiciones" y abajo "Cerrar" + "Agregar a mi solicitud"
 * (en celular, solo el botón principal a todo lo ancho). Escritorio: ventana
 * de 500 px con `bcPop` 0,2 s; celular: hoja desde abajo con `bcPop` 0,25 s.
 *
 * Lo que arregló el QA en celular (BAL-4969, bug 1) se mantiene: va en un
 * portal a `<body>` por encima de la barra fija, es `role="dialog"` modal,
 * Escape la cierra, el foco entra al abrir, queda atrapado adentro y vuelve
 * al "¿Qué cubre?" al cerrar.
 *
 * El contenido sale del mismo `getModalConfig` de Diseño 1 (el endpoint de
 * seguros no trae coberturas). Un plan "solo informativo" (multiasistencia)
 * no ofrece agregar desde la hoja, igual que en Diseño 1.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getModalConfig } from '@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceDetailModal';
import type { InsurancePlan } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';
import { formatCuotaDeLanding, sufijoDeFrecuencia } from '@/app/prototipos/0.6/utils/formatCuota';
import { useSalidaAnimada } from '../movimiento';

const ENFOCABLE = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Las coberturas en una lista plana (la multiasistencia trae grupos). */
export function coberturasDelPlan(tipo: string): string[] {
  const config = getModalConfig(tipo);
  if (config.coverageGroups?.length) return config.coverageGroups.flatMap((g) => g.items.map((i) => i.text));
  return config.coverageItems ?? [];
}

export interface HojaSeguroV2Props {
  plan: InsurancePlan | null;
  elegido: boolean;
  onAlternar: () => void;
  onCerrar: () => void;
  landing: string;
  frecuencia?: string | null;
}

export function HojaSeguroV2({ plan, elegido, onAlternar, onCerrar, landing, frecuencia }: HojaSeguroV2Props) {
  const hojaRef = useRef<HTMLDivElement>(null);
  const [saliendo, salir] = useSalidaAnimada();
  const cerrar = useCallback(() => {
    salir(onCerrar);
  }, [salir, onCerrar]);

  // Foco adentro al abrir; de vuelta a quien la abrió al cerrar. Escape
  // cierra y Tab no sale de la hoja. El fondo no se desplaza.
  const abierta = plan !== null;
  useEffect(() => {
    if (!abierta) return;
    const anterior = document.activeElement as HTMLElement | null;
    const hoja = hojaRef.current;
    hoja?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrar();
        return;
      }
      if (e.key !== 'Tab' || !hoja) return;
      const enfocables = Array.from(hoja.querySelectorAll<HTMLElement>(ENFOCABLE));
      if (enfocables.length === 0) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === hoja)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [abierta, cerrar]);

  if (!plan || typeof document === 'undefined') return null;

  const config = getModalConfig(plan.insuranceType);
  const coberturas = coberturasDelPlan(plan.insuranceType);
  const nota = config.coversText || config.copayNote || null;
  const proveedor = plan.provider?.name || 'BaldeCash';
  const terminos = config.moreInfoUrl || 'https://baldecash.com/seguros';
  const cuota = `+S/${formatCuotaDeLanding(plan.monthlyPrice, landing)}${sufijoDeFrecuencia(frecuencia)}`;
  const total = plan.totalPrice > 0 && plan.paymentMonths > 0
    ? `S/${formatCuotaDeLanding(plan.totalPrice, landing)} en ${plan.paymentMonths} cuotas`
    : null;
  const textoAlternar = elegido ? 'Quitar de mi solicitud' : 'Agregar a mi solicitud';
  const idTitulo = `hoja-seguro-v2-${plan.id}`;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-start md:overflow-y-auto md:pb-6 md:pt-[min(220px,12vh)]" data-hoja-seguro-v2>
      <div
        className={`absolute inset-0 bg-[rgba(20,24,40,0.45)] ${saliendo ? 'd2-fundido-sale' : 'd2-fundido'}`}
        aria-hidden="true"
        onClick={cerrar}
      />
      <div
        ref={hojaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className={`relative flex max-h-[calc(100dvh-12px)] w-full flex-col gap-3 overflow-y-auto overscroll-contain rounded-t-[22px] bg-white px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-[0_20px_48px_rgba(20,24,40,0.25)] outline-none md:max-h-none md:w-[500px] md:gap-3.5 md:overflow-visible md:rounded-[18px] md:p-[26px] ${
          saliendo ? 'd2-sale-hoja' : 'd2-pop-modal-chico d2-pop-hoja'
        }`}
      >
        <div className="h-1 w-10 self-center rounded-full bg-[#C9CEF0] md:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3 md:gap-4">
          <h2 id={idTitulo} className="pt-2 text-[20px] font-bold leading-tight text-[#1E2230] md:text-[21px]">
            {plan.name}
          </h2>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F4F5F8] text-[#1E2230] transition-colors duration-150 hover:bg-[#E9EBF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <X className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-0.5 rounded-xl bg-[#F4F5F8] px-3.5 py-3">
          <span className="text-[22px] font-bold text-[var(--color-primary-text)]">{cuota}</span>
          {total && <span className="text-[13px] text-[#5B6275]">{total}</span>}
        </div>

        {coberturas.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {coberturas.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-[15px] text-[#1E2230]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E8C78" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0">
                  <path d="M5 12l5 5 9-10" />
                </svg>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        )}

        {nota && <p className="text-sm text-[#5B6275]">{nota}</p>}

        <p className="text-[13px] text-[#5B6275]">
          {proveedor} ·{' '}
          <a href={terminos} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary-text)] underline">
            Ver términos y condiciones
          </a>
        </p>

        <div className="flex flex-col gap-3 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={cerrar}
            className={`hidden min-h-[48px] cursor-pointer rounded-xl border-[1.5px] border-[#C9CEF0] bg-white px-5 text-[15px] font-semibold text-[#1E2230] transition-colors duration-150 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 md:inline-flex md:items-center ${
              config.infoOnly ? '!inline-flex justify-center' : ''
            }`}
          >
            Cerrar
          </button>
          {!config.infoOnly && (
            <button
              type="button"
              data-alternar-seguro-v2
              onClick={() => {
                onAlternar();
                cerrar();
              }}
              className="min-h-[52px] cursor-pointer rounded-xl bg-[var(--color-primary)] px-5 text-base font-bold text-[var(--color-on-primary)] transition-colors duration-150 hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 md:min-h-[48px] md:text-[15px]"
            >
              {textoAlternar}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default HojaSeguroV2;
