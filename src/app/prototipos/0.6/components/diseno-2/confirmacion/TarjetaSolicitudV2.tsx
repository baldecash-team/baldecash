'use client';

/**
 * "TU SOLICITUD" de `ConfirmacionV2` (F8, BAL-4967; rediseño BAL-5274 según
 * el prototipo v53 de Brenda). Datos puros en `resumenDeTarjetaV2`; esta
 * pieza solo pinta, y omite cada fila cuyo dato no esté disponible (sin
 * dejar una fila vacía).
 *
 * Prototipo: cabecera con degradado (160°) y el equipo, y debajo una lista
 * de filas «rótulo · valor» separadas por una línea: cuota mensual total
 * (20 px, color de marca), día de pago, entrega y regalo (cápsula verde).
 */

import React from 'react';
import { Gift } from 'lucide-react';
import type { ReceivedData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/received';
import { resumenDeTarjetaV2, type OpcionesTarjetaV2 } from './resumenTarjetaV2';

export interface TarjetaSolicitudV2Props {
  data: ReceivedData;
  landingSlug: string;
  opciones?: OpcionesTarjetaV2;
}

function Fila({ etiqueta, children, ultima }: { etiqueta: string; children: React.ReactNode; ultima?: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-between gap-3 py-[11px] ${
        ultima ? '' : 'border-b border-[var(--d2-chip)]'
      }`}
    >
      <dt className="m-0 text-sm text-[var(--d2-texto-suave)]">{etiqueta}</dt>
      <dd className="m-0 text-right text-sm font-semibold text-[var(--d2-texto)]">{children}</dd>
    </div>
  );
}

/** Laptop dibujada del prototipo: va cuando el equipo no trae foto. */
function LaptopDibujada() {
  return (
    <svg width="74" height="46" viewBox="0 0 200 122" aria-hidden className="flex-shrink-0">
      <rect x="34" y="4" width="132" height="90" rx="8" fill="#252A3D" />
      <rect x="41" y="11" width="118" height="76" rx="3" fill="#5A68E0" />
      <rect x="52" y="24" width="50" height="8" rx="4" fill="rgba(255, 255, 255, 0.7)" />
      <rect x="52" y="40" width="80" height="6" rx="3" fill="rgba(255, 255, 255, 0.4)" />
      <path d="M12 96 H188 L181 110 A7 7 0 0 1 175 114 H25 A7 7 0 0 1 19 110 Z" fill="#CDD2DE" />
    </svg>
  );
}

/** La foto real del equipo en la caja de 74 × 46 px del dibujo; si falla, el dibujo. */
function ImagenDelEquipo({ src, nombre }: { src: string | null; nombre: string }) {
  const [rota, setRota] = React.useState(false);
  if (!src || rota) return <LaptopDibujada />;
  return (
    <span className="flex h-[46px] w-[74px] flex-shrink-0 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={nombre} className="h-full w-full object-contain" onError={() => setRota(true)} />
    </span>
  );
}

export function TarjetaSolicitudV2({ data, landingSlug, opciones }: TarjetaSolicitudV2Props) {
  const resumen = resumenDeTarjetaV2(data, landingSlug, opciones);
  if (!resumen) return null;

  const filas: Array<{ etiqueta: string; valor: React.ReactNode }> = [];
  if (resumen.diaDePago) filas.push({ etiqueta: 'Día de pago', valor: resumen.diaDePago });
  if (resumen.entrega) filas.push({ etiqueta: 'Entrega', valor: resumen.entrega });
  if (resumen.regalos.length > 0) {
    filas.push({
      etiqueta: resumen.regalos.length === 1 ? 'Regalo' : 'Regalos',
      valor: (
        <span className="inline-flex flex-col items-end gap-1.5">
          {resumen.regalos.map((nombre) => (
            <span
              key={nombre}
              data-regalo
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--d2-ok-suave)] px-2.5 py-[3px] text-[13px] font-bold text-[var(--d2-ok-texto)]"
            >
              <Gift width={14} height={14} strokeWidth={2} aria-hidden />
              {nombre}
            </span>
          ))}
        </span>
      ),
    });
  }

  return (
    <aside
      aria-labelledby="tarjeta-solicitud-v2"
      className="overflow-hidden rounded-[20px] border border-[var(--d2-borde)] bg-[var(--d2-tarjeta)] shadow-[0_14px_36px_rgba(30,34,48,0.08)]"
    >
      <div className="flex items-center gap-3.5 bg-[linear-gradient(160deg,var(--d2-resumen-inicio)_0%,var(--d2-resumen-fin)_100%)] px-5 py-[18px]">
        <ImagenDelEquipo src={resumen.imagen} nombre={resumen.nombreEquipo} />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span id="tarjeta-solicitud-v2" className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--d2-texto-suave)]">
            Tu solicitud
          </span>
          <span className="line-clamp-2 text-base font-bold text-[var(--d2-texto)]">{resumen.nombreEquipo}</span>
          <span className="text-[13.5px] text-[var(--d2-texto-2)]">{resumen.leyenda}</span>
        </span>
      </div>
      <dl className="m-0 flex flex-col px-5 pb-2.5 pt-1">
        <Fila etiqueta={resumen.rotuloCuota} ultima={filas.length === 0}>
          <span className="text-xl font-bold tabular-nums text-[var(--color-primary-text)]">
            {resumen.cuota}
            {resumen.sufijoCuota}
          </span>
        </Fila>
        {filas.map((f, i) => (
          <Fila key={f.etiqueta} etiqueta={f.etiqueta} ultima={i === filas.length - 1}>
            {f.valor}
          </Fila>
        ))}
      </dl>
    </aside>
  );
}

export default TarjetaSolicitudV2;
