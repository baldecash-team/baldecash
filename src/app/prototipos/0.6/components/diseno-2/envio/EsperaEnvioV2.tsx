'use client';

/**
 * «Enviando tu solicitud» de Diseño 2 (BAL-5361, prototipo de Brenda v58 del
 * 30-oct): va entre «Enviar solicitud» y «Recibimos tu solicitud».
 *
 * Círculo de marca que gira, «Enviando tu solicitud», «Tarda unos segundos.»,
 * la tarjeta «Progreso del envío» con los 3 pasos en fila (avanzan con el
 * envío real: `pasosDeLaEspera`) y «No cierres ni actualices esta página»
 * (si actualiza o vuelve atrás puede enviar dos veces y la segunda se
 * rechaza sola).
 *
 * Medidas del prototipo: computadora 36 px de título y pasos de 14,5/12,5 px;
 * celular (< 768 px) 28 px y 13/11,5 px, cabecera de 52 px con el logo al
 * centro. Con «reducir movimiento» no gira nada (`.d2-espera-gira` en
 * `globals.css`), pero los pasos igual se marcan.
 *
 * Interlineado `normal`, como el prototipo (el de Tailwind lo estiraba).
 *
 * Colores con los tokens del tema (`--color-primary`, `--d2-*`), así sirve
 * igual en la landing oscura.
 */
import React from 'react';
import { Check, Info } from 'lucide-react';
import type { SubmitStage } from '@/app/prototipos/0.6/[landing]/solicitar/hooks/useSubmitApplication';
import { useLayoutOptional } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { pasosDeLaEspera, subtituloDeLaEspera, type PasoEspera } from './esperaEnvio';

export interface EsperaEnvioV2Props {
  stage: SubmitStage;
}

function CirculoDelPaso({ paso, numero }: { paso: PasoEspera; numero: number }) {
  return (
    <span
      data-paso-estado={paso.estado}
      className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--d2-marca-suave-2)]"
    >
      {paso.estado === 'pendiente' && (
        <span className="text-[14px] font-bold text-[color-mix(in_srgb,var(--color-primary)_80%,white)]">{numero}</span>
      )}
      {paso.estado === 'actual' && (
        <span
          aria-hidden
          className="d2-espera-gira box-border h-[22px] w-[22px] rounded-full border-[2.5px] border-[var(--color-primary)] border-r-transparent"
        />
      )}
      {paso.estado === 'hecho' && (
        <span className="d2-check-in absolute inset-0 flex items-center justify-center rounded-full bg-[var(--d2-progreso-ok)] text-white">
          <Check width={18} height={18} strokeWidth={3} aria-hidden />
        </span>
      )}
    </span>
  );
}

/** Tramo entre dos pasos: gris, y se llena en verde cuando el de la izquierda está hecho. */
function Tramo({ desde, lleno }: { desde: string; lleno: boolean }) {
  return (
    <span
      aria-hidden
      className="absolute top-[21px] h-[3px] overflow-hidden rounded-sm bg-[var(--d2-borde)]"
      style={{ left: `calc(${desde} + 26px)`, width: 'calc(33.33% - 52px)' }}
    >
      <span
        data-tramo-lleno={lleno ? '1' : '0'}
        className="absolute inset-y-0 left-0 bg-[var(--d2-progreso-ok)] transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
        style={{ width: lleno ? '100%' : '0%' }}
      />
    </span>
  );
}

export function EsperaEnvioV2({ stage }: EsperaEnvioV2Props) {
  const logoUrl = useLayoutOptional()?.navbarProps?.logoUrl;
  const pasos = pasosDeLaEspera(stage);

  return (
    <div
      data-espera-envio-v2
      role="status"
      aria-live="polite"
      className="d2-fundido fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-[var(--d2-fondo)] font-['Asap',_sans-serif] leading-[normal] text-[var(--d2-texto)]"
    >
      {logoUrl && (
        <header className="box-border flex h-[52px] flex-shrink-0 items-center justify-center border-b border-[var(--d2-borde)] bg-[var(--d2-tarjeta)] md:h-16 md:justify-start md:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="BaldeCash" className="h-[26px] w-auto md:h-[30px]" />
        </header>
      )}

      <div className="flex flex-auto flex-col items-center justify-center gap-3 px-4 py-6 text-center md:px-6">
        <div
          aria-hidden
          className="flex h-[84px] w-[84px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]"
        >
          <span className="d2-espera-gira box-border block h-[34px] w-[34px] rounded-full border-[3.5px] border-white border-r-transparent" />
        </div>

        <h1 className="m-0 mt-2 font-['Baloo_2',_sans-serif] text-[28px] font-bold leading-[1.1] text-[var(--d2-texto)] md:text-[36px]">
          Enviando tu solicitud
        </h1>
        <p className="m-0 text-[15px] text-[var(--d2-texto-suave)] md:text-[16px]">{subtituloDeLaEspera(stage)}</p>

        <div className="mt-2.5 box-border w-full max-w-[540px] rounded-[18px] border border-[var(--d2-borde)] bg-[var(--d2-tarjeta)] px-3.5 pb-5 pt-[18px] text-left md:px-5">
          <span className="mb-4 block text-[16px] font-bold text-[var(--d2-texto)]">Progreso del envío</span>
          <ol className="relative m-0 grid list-none grid-cols-3 p-0">
            <Tramo desde="16.67%" lleno={pasos[0].estado === 'hecho'} />
            <Tramo desde="50%" lleno={pasos[1].estado === 'hecho'} />
            {pasos.map((paso, i) => (
              <li
                key={paso.titulo}
                aria-current={paso.estado === 'actual' ? 'step' : undefined}
                className="relative z-[1] flex flex-col items-center gap-2 px-1 text-center"
              >
                <CirculoDelPaso paso={paso} numero={i + 1} />
                <span className="text-[13px] font-bold leading-[1.25] text-[var(--d2-texto)] md:text-[14.5px]">{paso.titulo}</span>
                <span className="text-[11.5px] leading-[1.3] text-[var(--d2-texto-suave)] md:text-[12.5px]">{paso.detalle}</span>
              </li>
            ))}
          </ol>
        </div>

        <span className="mt-1 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-primary-text)] md:text-[14px]">
          <Info width={16} height={16} strokeWidth={2} aria-hidden />
          No cierres ni actualices esta página
        </span>
      </div>
    </div>
  );
}

export default EsperaEnvioV2;
