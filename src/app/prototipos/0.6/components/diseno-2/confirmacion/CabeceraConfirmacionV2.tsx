'use client';

/**
 * Cabecera azul de `ConfirmacionV2` (F8, BAL-4967): confeti, Baldecito con
 * anillo animado, la píldora "Solicitud N.° …" y el título + subtítulo.
 *
 * El texto lo decide `textoCabeceraV2` (quien llama arma `titulo`/`subtitulo`
 * ya resueltos); esta pieza solo pinta. El confeti y el anillo respetan
 * `prefers-reduced-motion` con `useMenosMovimiento` (`../movimiento`), la
 * única fuente del kit de Diseño 2: lee `matchMedia`, así que los tests lo
 * pueden probar apagado.
 */

import React from 'react';
import { BALDECITO } from '@/app/prototipos/0.6/components/diseno-2/TransicionPaso';
import { useMenosMovimiento } from '../movimiento';
import { piezasDeConfeti } from './confeti';

export interface CabeceraConfirmacionV2Props {
  titulo: string;
  subtitulo: string;
  /** `data.applicationId` — el `reference` real, nunca "BC-…" (BAL-4188). */
  numeroDeSolicitud: string;
}

export function CabeceraConfirmacionV2({ titulo, subtitulo, numeroDeSolicitud }: CabeceraConfirmacionV2Props) {
  const reducido = useMenosMovimiento();
  const piezas = piezasDeConfeti(reducido);

  return (
    <div
      data-cabecera-confirmacion-v2
      className="relative overflow-hidden rounded-b-[28px] bg-[var(--color-primary)] bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.18))] px-6 pb-10 pt-12 text-center sm:pb-12 sm:pt-14"
    >
      <style>{`
        @keyframes confettiV2Caer {
          0% { opacity: 0; transform: translate3d(0, -20px, 0) rotate(0deg); }
          8% { opacity: 1; }
          100% { opacity: 0; transform: translate3d(var(--sway, 24px), 400px, 0) rotate(620deg); }
        }
        @keyframes anilloConfirmacionV2 {
          0% { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(1.55); opacity: 0; }
        }
      `}</style>

      {/* Confeti: decorativo, nunca se anuncia a lectores de pantalla. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {piezas.map((p, i) => (
          <span
            key={i}
            data-confeti-pieza
            className="absolute -top-[18px]"
            style={
              {
                left: p.left,
                width: p.width,
                height: p.height,
                borderRadius: p.borderRadius,
                background: p.background,
                opacity: 0,
                animation: `confettiV2Caer ${p.duracion} linear ${p.demora} 3`,
                '--sway': p.sway,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative mx-auto flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
        {!reducido && (
          <span
            aria-hidden
            data-anillo-baldecito
            className="absolute inset-0 rounded-full border-2 border-white/55"
            style={{ animation: 'anilloConfirmacionV2 2.4s ease-out 0.4s infinite' }}
          />
        )}
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white p-3 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BALDECITO} alt="" className="h-full w-full object-contain" />
        </div>
      </div>

      <div className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-[var(--color-on-primary)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#5FD3BE]" aria-hidden />
        Solicitud N.° {numeroDeSolicitud}
      </div>

      <h1 className="relative mt-4 font-['Baloo_2',_sans-serif] text-2xl font-bold leading-tight text-[var(--color-on-primary)] sm:text-3xl">
        {titulo}
      </h1>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-[var(--color-on-primary)] opacity-90 sm:text-base">{subtitulo}</p>
    </div>
  );
}

export default CabeceraConfirmacionV2;
