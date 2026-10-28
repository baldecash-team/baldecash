'use client';

/**
 * Hoja "¿Qué cubre?" de una protección en Diseño 2 (prototipo de Brenda,
 * Paso 4). Reemplaza en Diseño 2 al `InsuranceDetailModal` de Diseño 1, que
 * no cambia.
 *
 * Como el prototipo: nombre y "×" arriba, la cuota en una caja gris con el
 * total en cuotas, las coberturas con ✓ verde, la nota, el proveedor con
 * "Ver términos y condiciones" y abajo "Cerrar" + "Agregar a mi solicitud".
 * Desde BAL-5203 (punto 10) va sobre `ModalV2`: franja del color de la
 * landing con el nombre, cuerpo con la cuota y las coberturas, y el pie con
 * «Cerrar» + «Agregar a mi solicitud» (escritorio: ventana de 500 px;
 * celular: hoja con manija que se cierra al arrastrarla).
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

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getModalConfig } from '@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceDetailModal';
import type { InsurancePlan } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';
import { formatCuotaDeLanding, sufijoDeFrecuencia } from '@/app/prototipos/0.6/utils/formatCuota';
import { BOTON_PRIMARIO_V2, BOTON_SECUNDARIO_V2, ModalV2 } from '../ModalV2';

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
  // El plan que se está cerrando: la hoja sale con su animación y recién
  // después el padre suelta el plan (`onCerrar`).
  const [planCerrado, setPlanCerrado] = useState<InsurancePlan | null>(null);
  if (!plan) return null;
  const cerrar = () => setPlanCerrado(plan);

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

  return (
    <ModalV2
      abierto={plan !== planCerrado}
      onCerrar={cerrar}
      onSalidaTerminada={() => {
        setPlanCerrado(null);
        onCerrar();
      }}
      icono={ShieldCheck}
      titulo={plan.name}
      subtitulo="¿Qué cubre esta protección?"
      idTitulo={`hoja-seguro-v2-${plan.id}`}
      datos={{ 'data-hoja-seguro-v2': true }}
      pie={
        <>
          <button type="button" onClick={cerrar} className={`${BOTON_SECUNDARIO_V2} ${config.infoOnly ? 'flex-1 md:flex-none' : ''}`}>
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
              className={`${BOTON_PRIMARIO_V2} flex-1 md:flex-none`}
            >
              {textoAlternar}
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5 rounded-xl bg-[var(--d2-fondo)] px-3.5 py-3">
          <span className="text-[22px] font-bold text-[var(--color-primary-text)]">{cuota}</span>
          {total && <span className="text-[13px] text-[var(--d2-texto-suave)]">{total}</span>}
        </div>

        {coberturas.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {coberturas.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-[15px] text-[var(--d2-texto)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--d2-ok)]">
                  <path d="M5 12l5 5 9-10" />
                </svg>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        )}

        {nota && <p className="text-sm text-[var(--d2-texto-suave)]">{nota}</p>}

        <p className="text-[13px] text-[var(--d2-texto-suave)]">
          {proveedor} ·{' '}
          <a href={terminos} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary-text)] underline">
            Ver términos y condiciones
          </a>
        </p>
      </div>
    </ModalV2>
  );
}

export default HojaSeguroV2;
