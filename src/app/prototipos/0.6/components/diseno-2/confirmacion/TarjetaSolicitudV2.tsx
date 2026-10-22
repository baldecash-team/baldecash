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

export interface TarjetaSolicitudV2Props {
  data: ReceivedData;
  landingSlug: string;
  opciones?: OpcionesTarjetaV2;
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#EDEFF7] py-3 first:border-t-0">
      <span className="text-sm text-[#5B6275]">{etiqueta}</span>
      <span className="text-right text-sm font-semibold text-[#1E2230]">{valor}</span>
    </div>
  );
}

export function TarjetaSolicitudV2({ data, landingSlug, opciones }: TarjetaSolicitudV2Props) {
  const resumen = resumenDeTarjetaV2(data, landingSlug, opciones);
  if (!resumen) return null;

  return (
    <aside aria-label="Tu solicitud" className="overflow-hidden rounded-2xl border border-[#AEB6EE] bg-white shadow-sm">
      <div className="flex items-start gap-3 bg-gradient-to-r from-[#EAF7F2] to-[#F3F5FD] px-5 py-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-[#4654CD] shadow-sm">
          <Laptop className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#3A4052]">Tu solicitud</p>
          <p className="truncate text-[15px] font-bold text-[#1E2230]">{resumen.nombreEquipo}</p>
          <p className="text-xs text-[#5B6275]">{resumen.leyenda}</p>
        </div>
      </div>
      <div className="px-5 pb-2">
        <Fila
          etiqueta={resumen.rotuloCuota}
          valor={
            <span className="text-base font-bold text-[#4654CD]">
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F7F1] px-2.5 py-1 text-xs font-bold text-[#0B6B5C]">
                <Gift className="h-3.5 w-3.5" aria-hidden />
                {resumen.regalo}
              </span>
            }
          />
        )}
      </div>
    </aside>
  );
}

export default TarjetaSolicitudV2;
