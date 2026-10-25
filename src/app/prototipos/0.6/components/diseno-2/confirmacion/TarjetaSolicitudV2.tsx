'use client';

/**
 * "TU SOLICITUD" de `ConfirmacionV2` (F8, BAL-4967). Datos puros en
 * `resumenDeTarjetaV2`; esta pieza solo pinta, y omite cada línea cuyo dato
 * no esté disponible (sin dejar una fila vacía).
 */

import React from 'react';
import { Gift, Laptop } from 'lucide-react';
import type { ReceivedData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/received';
import { resumenDeTarjetaV2, type OpcionesTarjetaV2 } from './resumenTarjetaV2';
import { REGALO_BALDECASH_TEXTOS } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/regaloBaldecash';

/** «BaldeCash te regala» sin el emoji del título de Diseño 1 (acá va el ícono). */
const ETIQUETA_REGALO_BALDECASH = REGALO_BALDECASH_TEXTOS.titulo.replace(/^\P{L}+/u, '');

export interface TarjetaSolicitudV2Props {
  data: ReceivedData;
  landingSlug: string;
  opciones?: OpcionesTarjetaV2;
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--d2-chip-numero)] py-3 first:border-t-0">
      <span className="text-sm text-[var(--d2-texto-suave)]">{etiqueta}</span>
      <span className="text-right text-sm font-semibold text-[var(--d2-texto)]">{valor}</span>
    </div>
  );
}

export function TarjetaSolicitudV2({ data, landingSlug, opciones }: TarjetaSolicitudV2Props) {
  const resumen = resumenDeTarjetaV2(data, landingSlug, opciones);
  if (!resumen) return null;

  return (
    <aside aria-label="Tu solicitud" className="overflow-hidden rounded-[20px] border border-[var(--d2-borde)] bg-[var(--d2-tarjeta)] shadow-[0_14px_36px_rgba(30,34,48,0.08)]">
      <div className="flex items-start gap-3 bg-gradient-to-r from-[var(--d2-ok-suave-5)] to-[var(--d2-marca-suave)] px-5 py-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--d2-tarjeta)] text-[var(--color-primary-text)] shadow-sm">
          <Laptop className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--d2-texto-2)]">Tu solicitud</p>
          <p className="truncate text-[15px] font-bold text-[var(--d2-texto)]">{resumen.nombreEquipo}</p>
          <p className="text-xs text-[var(--d2-texto-suave)]">{resumen.leyenda}</p>
        </div>
      </div>
      <div className="px-5 pb-2">
        <Fila
          etiqueta={resumen.rotuloCuota}
          valor={
            <span className="text-base font-bold text-[var(--color-primary-text)]">
              {resumen.cuota}
              <span className="text-xs font-semibold">{resumen.sufijoCuota}</span>
            </span>
          }
        />
        {resumen.diaDePago && <Fila etiqueta="Día de pago" valor={resumen.diaDePago} />}
        {resumen.entrega && <Fila etiqueta="Entrega" valor={resumen.entrega} />}
        {resumen.regalo && (
          <Fila
            etiqueta="Regalo"
            valor={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--d2-ok-suave-2)] px-2.5 py-1 text-xs font-bold text-[var(--d2-ok-texto)]">
                <Gift className="h-3.5 w-3.5" aria-hidden />
                {resumen.regalo}
              </span>
            }
          />
        )}
        {resumen.regaloBaldecash && (
          <Fila
            etiqueta={ETIQUETA_REGALO_BALDECASH}
            valor={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--d2-ok-suave-2)] px-2.5 py-1 text-xs font-bold text-[var(--d2-ok-texto)]">
                <Gift className="h-3.5 w-3.5" aria-hidden />
                {resumen.regaloBaldecash} · {REGALO_BALDECASH_TEXTOS.etiquetaPrecio}
              </span>
            }
          />
        )}
      </div>
    </aside>
  );
}

export default TarjetaSolicitudV2;
