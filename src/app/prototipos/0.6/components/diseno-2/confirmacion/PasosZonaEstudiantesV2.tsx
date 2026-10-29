'use client';

/**
 * Barra de pasos de Zona Estudiantes (BAL-5274) dentro de la cabecera azul
 * de la confirmación. Reglas en `pasosZonaEstudiantes`; esto solo pinta.
 *
 * Medidas del prototipo de Brenda: círculos de 28 px con la línea a 13 px del
 * borde de arriba, que va del centro del primer paso al centro del último
 * (por eso arranca en 50 % / N). El tramo verde une «Recibida» con
 * «Evaluación» (100 % / N). Ancho máximo 520 px en computadora y 360 px en
 * celular. El verde (#19C3A6) es de la ilustración, igual en los dos temas,
 * como el confeti.
 */
import React from 'react';
import { Check } from 'lucide-react';
import { pasosZonaEstudiantes, type PasoZonaEstudiantes } from './pasosZonaEstudiantes';

function Circulo({ paso, numero }: { paso: PasoZonaEstudiantes; numero: number }) {
  const base =
    'relative z-[1] box-border flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold';
  if (paso.estado === 'hecho') {
    return (
      <span className={`${base} bg-[#19C3A6] text-white`}>
        <Check width={15} height={15} strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (paso.estado === 'actual') {
    return (
      <span className={`${base} bg-[#FFFFFF] text-[var(--d2-cabecera-inicio)] shadow-[0_0_0_5px_rgba(255,255,255,0.25)]`}>
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[var(--d2-cabecera-inicio)]" />
      </span>
    );
  }
  return (
    <span className={`${base} border-[1.5px] border-white/45 bg-[var(--d2-cabecera-medio)] text-white/85`}>{numero}</span>
  );
}

export function PasosZonaEstudiantesV2({ conInicial }: { conInicial: boolean }) {
  const pasos = pasosZonaEstudiantes(conInicial);
  const mitad = `${50 / pasos.length}%`;
  return (
    <div data-pasos-zona-estudiantes className="relative mt-2.5 w-full max-w-[360px] md:mt-3.5 md:max-w-[520px]">
      <span aria-hidden className="absolute top-[13px] h-0.5 rounded-sm bg-white/30" style={{ left: mitad, right: mitad }} />
      <span aria-hidden className="absolute top-[13px] h-0.5 rounded-sm bg-[#19C3A6]" style={{ left: mitad, width: `${100 / pasos.length}%` }} />
      <ol
        aria-label="Pasos de tu solicitud"
        className="relative m-0 grid w-full list-none p-0"
        style={{ gridTemplateColumns: `repeat(${pasos.length}, minmax(0, 1fr))` }}
      >
        {pasos.map((paso, i) => (
          <li key={paso.nombre} aria-current={paso.estado === 'actual' ? 'step' : undefined} className="flex min-w-0 flex-col items-center gap-1.5">
            <Circulo paso={paso} numero={i + 1} />
            <span
              className={`text-center text-xs leading-[1.2] text-[var(--d2-cabecera-texto)] ${
                paso.estado === 'actual' ? 'font-bold' : 'font-medium opacity-[0.78]'
              }`}
            >
              {paso.nombre}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default PasosZonaEstudiantesV2;
