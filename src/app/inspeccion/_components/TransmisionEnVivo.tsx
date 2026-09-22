'use client';

import { useEffect, useRef } from 'react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import type { Transmision } from '../_lib/useTransmisionReceptor';

/**
 * Lo que cada cámara está viendo, en vivo, mientras la inspección está
 * abierta.
 *
 * Presentacional y nada más: no sabe de peers ni de señalización. Toda la
 * lógica vive en `useTransmisionReceptor`, y `EscanerPageContent.tsx` —que ya
 * pasa las 1500 líneas— solo monta esto.
 *
 * REGLA DE COLOR: un tile sin transmisión va GRIS, nunca rojo. La grabación
 * está saliendo bien igual; el rojo está reservado para el semáforo del
 * pre-vuelo, que sí significa "no podés grabar". Un rojo que no exige nada
 * devalúa el rojo que sí.
 */

/** Fondo de un tile sin imagen. Mismo gris que ya usan las miniaturas de las
 * fotos en `EscanerPageContent.tsx`. */
const FONDO_VACIO = '#EEE';

function Tile({
  transmision,
  onReintentar,
}: {
  transmision: Transmision;
  onReintentar: (deviceId: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // `srcObject` no se puede setear por atributo de JSX: es una propiedad del
  // elemento, no un atributo del DOM.
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = transmision.stream;
  }, [transmision.stream]);

  const viendo = transmision.estado === 'viendo' && transmision.stream !== null;

  return (
    <figure data-transmision={transmision.label} className="m-0">
      {viendo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-[360px] w-full rounded-xl bg-black object-cover"
        />
      ) : (
        <div
          className="flex h-[360px] w-full flex-col items-center justify-center gap-3 rounded-xl"
          style={{ background: FONDO_VACIO }}
        >
          <p className="text-sm font-semibold" style={{ color: TOKENS.slate }}>
            {transmision.estado === 'conectando' ? 'Conectando…' : 'Sin transmisión'}
          </p>
          {transmision.estado === 'sin-transmision' && (
            <button
              type="button"
              onClick={() => onReintentar(transmision.deviceId)}
              className="rounded-lg border px-4 py-2 text-xs font-semibold transition-colors hover:bg-black/[0.04]"
              style={{ borderColor: TOKENS.line, color: TOKENS.slate }}
            >
              Reintentar
            </button>
          )}
        </div>
      )}
      <figcaption
        className="mt-1 text-center text-[11px] font-semibold uppercase"
        style={{ color: TOKENS.slate }}
      >
        {transmision.label}
      </figcaption>
    </figure>
  );
}

export function TransmisionEnVivo({
  transmisiones,
  onReintentar,
}: {
  transmisiones: Transmision[];
  onReintentar: (deviceId: string) => void;
}) {
  if (transmisiones.length === 0) return null;

  return (
    <div
      className="mt-4 grid gap-3"
      style={{
        // Una cámara ocupa todo el ancho; dos o más van en dos columnas. El
        // número sale de las cámaras que la estación declara, nunca de una
        // constante — igual que el pre-vuelo.
        gridTemplateColumns: `repeat(${Math.min(transmisiones.length, 2)}, minmax(0, 1fr))`,
      }}
    >
      {transmisiones.map((t) => (
        <Tile key={t.deviceId} transmision={t} onReintentar={onReintentar} />
      ))}
    </div>
  );
}
