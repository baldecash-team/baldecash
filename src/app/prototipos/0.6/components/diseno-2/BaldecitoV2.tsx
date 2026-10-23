'use client';

/**
 * Baldecito del prototipo de Brenda (BAL-4959), copiado tal cual en SVG: el
 * balde con las hojas, los brazos, la mano que saluda, los ojos que
 * parpadean y la sonrisa. El azul es el color de la landing
 * (`--color-primary`); la tapa, ese color aclarado.
 *
 * Movimiento (`globals.css`): todo el cuerpo flota (`bcBob`), la mano
 * saluda (`bcWave`) y los ojos parpadean (`bcBlink`). Con `animado={false}`
 * o `prefers-reduced-motion`, queda quieto.
 */

import React from 'react';

export interface BaldecitoV2Props {
  /** Ancho en px; el alto sale de la proporción del dibujo (120 × 130). */
  ancho: number;
  animado?: boolean;
  /** Flotar: duración y demora en segundos (puente 1,1 s / 1,3 s; confirmación 3 s / 0). */
  flotar?: { duracion: number; demora: number };
  /** Saludo: duración y demora en segundos (puente 0,7 s / 1,25 s; confirmación 1,6 s / 0). */
  saludar?: { duracion: number; demora: number };
  /** Nombre accesible; sin él, el dibujo es decorativo. */
  etiqueta?: string;
}

const AZUL = 'var(--color-primary)';
const TAPA = 'color-mix(in srgb, var(--color-primary) 82%, white)';

export function BaldecitoV2({
  ancho,
  animado = true,
  flotar = { duracion: 1.1, demora: 1.3 },
  saludar = { duracion: 0.7, demora: 1.25 },
  etiqueta,
}: BaldecitoV2Props) {
  const alto = Math.round((ancho * 130) / 120);
  const anima = (nombre: string, d: { duracion: number; demora: number }) =>
    animado ? { animation: `${nombre} ${d.duracion}s ease-in-out ${d.demora}s infinite` } : undefined;
  return (
    <svg
      width={ancho}
      height={alto}
      viewBox="0 0 120 130"
      {...(etiqueta ? { role: 'img', 'aria-label': etiqueta } : { 'aria-hidden': true })}
      style={{ overflow: 'visible', display: 'block' }}
      data-baldecito-v2
    >
      <ellipse cx="60" cy="127" rx="26" ry="3" fill="rgba(30, 34, 48, 0.12)" />
      <g className="d2-baldecito-parte" style={{ transformBox: 'fill-box', transformOrigin: 'center', ...anima('d2Flota', flotar) }}>
        <path d="M42 32 L56 8 L68 32 Z" fill="#19C3A6" />
        <rect x="54" y="4" width="22" height="30" rx="2" fill="#0E8C78" transform="rotate(10 65 19)" />
        <path d="M70 34 L86 14 L96 34 Z" fill="#5FD3BE" />
        <path d="M28 66 Q14 58 14 40" stroke={AZUL} strokeWidth="7" fill="none" strokeLinecap="round" />
        <circle cx="14" cy="37" r="6" fill={AZUL} />
        <g className="d2-baldecito-parte" style={{ transformBox: 'fill-box', transformOrigin: '0% 100%', ...anima('d2Saluda', saludar) }}>
          <path d="M92 62 Q106 54 108 36" stroke={AZUL} strokeWidth="7" fill="none" strokeLinecap="round" />
          <circle cx="108" cy="33" r="6" fill={AZUL} />
        </g>
        <path d="M50 112 V124" stroke={AZUL} strokeWidth="7" strokeLinecap="round" />
        <path d="M70 112 V124" stroke={AZUL} strokeWidth="7" strokeLinecap="round" />
        <path d="M26 36 H94 L86 108 A6 6 0 0 1 80 113 H40 A6 6 0 0 1 34 108 Z" fill={AZUL} />
        <rect x="22" y="31" width="76" height="11" rx="5.5" fill={TAPA} />
        <g className="d2-baldecito-parte" style={{ transformBox: 'fill-box', transformOrigin: 'center', ...anima('d2Parpadea', { duracion: 4, demora: 0 }) }}>
          <ellipse cx="50" cy="64" rx="6" ry="7" fill="#FFFFFF" />
          <circle cx="51" cy="65" r="3.4" fill="#1E2230" />
          <ellipse cx="72" cy="64" rx="6" ry="7" fill="#FFFFFF" />
          <circle cx="73" cy="65" r="3.4" fill="#1E2230" />
        </g>
        <path d="M47 79 Q60 96 73 79" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default BaldecitoV2;
