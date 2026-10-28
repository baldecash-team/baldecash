'use client';

/**
 * Cabecera azul de `ConfirmacionV2` (F8, BAL-4967): confeti, la píldora
 * "Solicitud N.° …" y el título + subtítulo. Sin Baldecito (BAL-5203: Brenda
 * prefiere ahorrar el espacio; no se reemplaza por nada y la píldora sube).
 *
 * El texto lo decide `textoCabeceraV2` (quien llama arma `titulo`/`subtitulo`
 * ya resueltos); esta pieza solo pinta. El confeti respeta
 * `prefers-reduced-motion` con `useMenosMovimiento` (`../movimiento`), la
 * única fuente del kit de Diseño 2: lee `matchMedia`, así que los tests lo
 * pueden probar apagado.
 */

import React from 'react';
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
      // Prototipo de Brenda: banda a todo lo ancho con el degradado de marca
      // (140°, hacia un azul más oscuro), dos círculos decorativos y espacio
      // abajo para que las tarjetas se monten encima.
      className="relative flex flex-col items-center gap-3 overflow-hidden px-6 pb-[112px] pt-10 text-center"
      style={{
        background:
          'linear-gradient(140deg, var(--d2-cabecera-inicio) 0%, var(--d2-cabecera-medio) 55%, var(--d2-cabecera-fin) 100%)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -left-[90px] -top-[130px] h-80 w-80 rounded-full bg-white/[0.06]" />
        <span className="absolute -bottom-[150px] -right-[70px] h-[360px] w-[360px] rounded-full bg-[rgba(25,195,166,0.18)]" />
      </div>
      <style>{`
        @keyframes confettiV2Caer {
          0% { opacity: 0; transform: translate3d(0, -20px, 0) rotate(0deg); }
          8% { opacity: 1; }
          100% { opacity: 0; transform: translate3d(var(--sway, 24px), 400px, 0) rotate(620deg); }
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

      <div className="relative inline-flex items-center gap-2 rounded-full border border-white/[0.28] bg-white/[0.14] px-3 py-[5px] text-[13px] font-semibold tabular-nums text-[var(--d2-cabecera-texto)]">
        <span className="h-2 w-2 rounded-full bg-[#5FD3BE]" aria-hidden />
        Solicitud N.° {numeroDeSolicitud}
      </div>

      <h1 className="relative font-['Baloo_2',_sans-serif] text-[30px] font-bold leading-[1.1] text-[var(--d2-cabecera-texto)] [text-wrap:balance] sm:text-[42px]">
        {titulo}
      </h1>
      <p className="relative mx-auto max-w-[540px] text-[15px] leading-normal text-[var(--d2-cabecera-texto)] opacity-90 sm:text-[17px]">{subtitulo}</p>
    </div>
  );
}

export default CabeceraConfirmacionV2;
