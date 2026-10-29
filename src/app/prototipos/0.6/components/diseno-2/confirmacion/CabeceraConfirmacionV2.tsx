'use client';

/**
 * Cabecera azul de `ConfirmacionV2` (F8, BAL-4967; BAL-5274): confeti, la
 * píldora "Solicitud N.° …", el título y, debajo, la barra de pasos de Zona
 * Estudiantes con «Paso 2 de N: una asesora te escribirá…» (o el subtítulo
 * de los cierres: firmada, aprobada…), y el botón «Sigue tu solicitud en
 * Zona Estudiantes». Sin Baldecito (BAL-5203).
 *
 * El texto lo decide `textoCabeceraV2` (quien llama arma `titulo`/`subtitulo`
 * ya resueltos); esta pieza solo pinta. El confeti respeta
 * `prefers-reduced-motion` con `useMenosMovimiento` (`../movimiento`), la
 * única fuente del kit de Diseño 2: lee `matchMedia`, así que los tests lo
 * pueden probar apagado.
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useMenosMovimiento } from '../movimiento';
import { piezasDeConfeti } from './confeti';
import { PasosZonaEstudiantesV2 } from './PasosZonaEstudiantesV2';
import { rotuloDelPaso, URL_ZONA_ESTUDIANTES } from './pasosZonaEstudiantes';

export interface CabeceraConfirmacionV2Props {
  titulo: string;
  /** Texto debajo del título en los cierres (firmada, aprobada…). Con `pasos`, no va. */
  subtitulo?: string | null;
  /** `data.applicationId` — el `reference` real, nunca "BC-…" (BAL-4188). */
  numeroDeSolicitud: string;
  /**
   * Barra de pasos (BAL-5274). `null` cuando sería falso decir «en
   * evaluación» (ya firmó, ya fue aprobada…): ahí va `subtitulo`.
   */
  pasos?: {
    conInicial: boolean;
    /** `applicant_phone_masked` de `/status` («9XX XXX 321»). Sin él, la frase omite «al +51 …». */
    telefono?: string | null;
  } | null;
  /** Clic en «Sigue tu solicitud en Zona Estudiantes» (para el evento). */
  onZonaEstudiantes?: () => void;
}

/** «+51 9XX XXX 321» — con espacios que no se cortan, como en BAL-4969. */
function celular(telefono: string | null | undefined): string | null {
  const limpio = (telefono || '').trim();
  return limpio ? `+51 ${limpio}` : null;
}

export function CabeceraConfirmacionV2({
  titulo,
  subtitulo,
  numeroDeSolicitud,
  pasos,
  onZonaEstudiantes,
}: CabeceraConfirmacionV2Props) {
  const reducido = useMenosMovimiento();
  const piezas = piezasDeConfeti(reducido);
  const numero = celular(pasos?.telefono);

  return (
    <div
      data-cabecera-confirmacion-v2
      // Prototipo de Brenda: banda a todo lo ancho con el degradado de marca
      // (140°, hacia un azul más oscuro), dos círculos decorativos y espacio
      // abajo para que las tarjetas se monten encima.
      // Celular: 28/20/84 px; computadora: 40/24/112 px (prototipo).
      className="relative flex flex-col items-center gap-3 overflow-hidden px-5 pb-[84px] pt-7 text-center md:px-6 md:pb-[112px] md:pt-10"
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

      <div className="relative mt-1 inline-flex items-center gap-2 rounded-full border border-white/[0.28] bg-white/[0.14] px-3 py-[5px] text-[13px] font-semibold tabular-nums text-[var(--d2-cabecera-texto)]">
        <span className="h-2 w-2 rounded-full bg-[#5FD3BE]" aria-hidden />
        Solicitud N.° {numeroDeSolicitud}
      </div>

      <h1 className="relative m-0 font-['Baloo_2',_sans-serif] text-[30px] font-bold leading-[1.1] text-[var(--d2-cabecera-texto)] [text-wrap:balance] md:text-[42px]">
        {titulo}
      </h1>

      {pasos ? (
        <>
          <PasosZonaEstudiantesV2 conInicial={pasos.conInicial} />
          <p
            data-linea-del-paso
            // Texto al 92 % y lo que va en negrita al 100 % (prototipo).
            className="relative m-0 mt-2.5 max-w-[460px] text-[15px] leading-[1.45] text-[color-mix(in_srgb,var(--d2-cabecera-texto)_92%,transparent)] md:mt-3.5 md:text-base"
          >
            <strong className="font-bold text-[var(--d2-cabecera-texto)]">{rotuloDelPaso(pasos.conInicial)}</strong> una asesora te
            escribirá por WhatsApp
            {numero ? (
              <>
                {' '}al <strong className="whitespace-nowrap font-bold text-[var(--d2-cabecera-texto)]">{numero}</strong>.
              </>
            ) : (
              '.'
            )}
          </p>
        </>
      ) : (
        subtitulo && (
          <p className="relative mx-auto max-w-[540px] text-[15px] leading-normal text-[var(--d2-cabecera-texto)] opacity-90 md:text-[17px]">{subtitulo}</p>
        )
      )}

      <a
        href={URL_ZONA_ESTUDIANTES}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onZonaEstudiantes}
        data-boton-zona-estudiantes
        // Celular: a todo el ancho (52 px, 15,5 px); computadora: al centro (54 px, 17 px).
        className="relative mt-4 flex min-h-[52px] items-center justify-center gap-2 self-stretch whitespace-nowrap rounded-[14px] bg-[#FFFFFF] px-4 text-[15.5px] font-bold text-[var(--d2-boton-cabecera-texto)] no-underline shadow-[0_10px_24px_rgba(15,20,60,0.28)] md:mt-5 md:inline-flex md:min-h-[54px] md:self-center md:px-7 md:text-[17px]"
      >
        Sigue tu solicitud en Zona Estudiantes
        <ArrowRight width={18} height={18} strokeWidth={2.2} aria-hidden />
      </a>
      <span className="relative mt-2 text-[13px] text-[color-mix(in_srgb,var(--d2-cabecera-texto)_80%,transparent)]">
        Ahí verás cada avance, sin volver a solicitar.
      </span>
    </div>
  );
}

export default CabeceraConfirmacionV2;
