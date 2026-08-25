'use client';

/**
 * Galería de UNA unidad: el video y las fotos que le grabó la estación de
 * inspección, y el botón para quedársela.
 *
 * Es el corazón de la pantalla. El valor no es elegir un número: es VER el
 * equipo concreto antes de aceptarlo, así que el medio manda y el resto es
 * marco.
 *
 * Dos formas según el ancho:
 * - Mobile: bottom-sheet, como el diseño aprobado.
 * - Desktop: diálogo centrado en dos columnas — el video grande a la
 *   izquierda, las fotos y el detalle a la derecha.
 *
 * NO hay bullets de "detalle estético" ni marcas dibujadas sobre la imagen: ese
 * dato no existe, nadie lo captura. Y NUNCA se muestra el serial — el cliente
 * ve "Unidad 01" (`display_number`), que es lo único que el backend manda.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { EleccionUnidad } from '../../services/eleccionEquipoApi';
import { etiquetaGrado, nombreUnidad } from './formato';

/** Qué se está viendo en el visor grande. */
type Medio = { tipo: 'video' } | { tipo: 'foto'; indice: number };

export interface GaleriaUnidadProps {
  unidad: EleccionUnidad;
  /** Bloquea el CTA mientras el POST está en vuelo. */
  enviando: boolean;
  /** Error que NO cierra la galería (red o rechazo inesperado). */
  error: string | null;
  onCerrar: () => void;
  onElegir: () => void;
  /** Cambió de foto en la tira. `indice` es 0-based. */
  onCambiarFoto: (indice: number) => void;
  /** El video empezó a reproducirse. Se llama UNA vez por apertura. */
  onReproducirVideo: () => void;
}

export function GaleriaUnidad({
  unidad, enviando, error, onCerrar, onElegir, onCambiarFoto, onReproducirVideo,
}: GaleriaUnidadProps) {
  const titulo = nombreUnidad(unidad.display_number);
  const grado = etiquetaGrado(unidad.grado, unidad.grado_label);
  const fotos = unidad.photos;

  const [medio, setMedio] = useState<Medio>(() =>
    unidad.video_url ? { tipo: 'video' } : { tipo: 'foto', indice: 0 },
  );
  // El `video_play` se emite una sola vez por apertura: el navegador dispara
  // `play` también al salir de una pausa, y contarlas todas convertiría la
  // métrica de "cuántos miran el video" en "cuántos manotean la barra".
  const videoYaContado = useRef(false);

  // Cerrar con Escape: en el diálogo de desktop es LA forma esperada de salir,
  // y en mobile no estorba.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [onCerrar]);

  const verFoto = (indice: number) => {
    setMedio({ tipo: 'foto', indice });
    onCambiarFoto(indice);
  };

  const fotoActual = medio.tipo === 'foto' ? fotos[medio.indice] : undefined;
  const sinMedios = !unidad.video_url && fotos.length === 0;

  const tira = useMemo(
    () => fotos.map((f, i) => ({ ...f, indice: i })),
    [fotos],
  );

  return (
    <>
      <div
        onClick={onCerrar}
        aria-hidden="true"
        className="fixed inset-0 z-[9998] bg-[rgba(10,12,30,.5)]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        style={{ fontFamily: 'var(--font-baloo-2), sans-serif' }}
        className="fixed z-[9999] flex flex-col bg-white text-[#151744] shadow-[0_-10px_40px_rgba(0,0,0,.2)] bottom-0 left-1/2 max-h-[92vh] w-full max-w-[480px] -translate-x-1/2 overflow-y-auto rounded-t-[22px] md:bottom-auto md:top-1/2 md:max-h-[88vh] md:max-w-[1000px] md:-translate-y-1/2 md:rounded-[22px]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e9e9ef] bg-white px-5 pb-3 pt-[18px]">
          <div className="flex items-center gap-2 text-[19px] font-extrabold">
            {titulo}
            {grado && (
              <span className="rounded-xl bg-[#03DBD0] px-2 py-[3px] text-[10px] font-bold text-[#04413e]">
                {grado}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-full bg-[#f1f1f5] text-[15px] text-[#7a7a88]"
          >
            &#10005;
          </button>
        </div>

        <div className="px-5 pb-6 pt-4 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-6 md:px-6 md:pb-7">
          {/* Visor grande: el video por defecto, o la foto que se toque. */}
          <div className="relative grid h-[210px] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#eef0fc] to-[#e6f9f8] md:h-[420px]">
            {medio.tipo === 'video' && unidad.video_url ? (
              <video
                src={unidad.video_url}
                controls
                playsInline
                preload="metadata"
                aria-label={`Video de la ${titulo}`}
                onPlay={() => {
                  if (videoYaContado.current) return;
                  videoYaContado.current = true;
                  onReproducirVideo();
                }}
                className="h-full w-full object-contain"
              />
            ) : fotoActual ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL firmada de S3, sin host fijo para next/image
              <img
                src={fotoActual.url}
                alt={`${titulo} — ${fotoActual.label ?? 'foto del equipo'}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <p className="px-6 text-center text-[13px] text-[#5b5c6b]">
                Todavía no subimos las fotos de esta unidad.
              </p>
            )}
          </div>

          <div className="md:flex md:flex-col">
            {/* Tira: el video primero (si hay) y después cada foto. */}
            {!sinMedios && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-0 md:flex-wrap md:overflow-visible">
                {unidad.video_url && (
                  <button
                    type="button"
                    onClick={() => setMedio({ tipo: 'video' })}
                    aria-pressed={medio.tipo === 'video'}
                    className={`w-[110px] flex-none rounded-xl border-2 p-1 text-center md:w-[104px] ${
                      medio.tipo === 'video' ? 'border-[#4654CD]' : 'border-transparent'
                    }`}
                  >
                    <span className="grid h-[74px] w-full place-items-center rounded-lg bg-gradient-to-br from-[#eef0fc] to-[#e6f9f8] text-[#4654CD]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold text-[#9a9aa8]">Video</span>
                  </button>
                )}

                {tira.map((foto) => (
                  <button
                    key={foto.indice}
                    type="button"
                    onClick={() => verFoto(foto.indice)}
                    aria-pressed={medio.tipo === 'foto' && medio.indice === foto.indice}
                    className={`w-[110px] flex-none rounded-xl border-2 p-1 text-center md:w-[104px] ${
                      medio.tipo === 'foto' && medio.indice === foto.indice
                        ? 'border-[#4654CD]'
                        : 'border-transparent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada de S3, sin host fijo para next/image */}
                    <img
                      src={foto.url}
                      alt={foto.label ?? `Foto ${foto.indice + 1}`}
                      loading="lazy"
                      className="h-[74px] w-full rounded-lg bg-[#f7f7fb] object-cover"
                    />
                    <span className="mt-1 block truncate text-[11px] font-semibold text-[#9a9aa8]">
                      {foto.label ?? `Foto ${foto.indice + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-[#f7f8fc] p-4 text-[13px] leading-[1.5] text-[#3a3c52]">
              Estas fotos y este video son de <b>esta unidad exacta</b>, no de una
              foto de catálogo. Míralas con calma antes de decidir.
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={onElegir}
              disabled={enviando}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4654CD] p-4 text-base font-extrabold text-white shadow-[0_10px_24px_rgba(70,84,205,.35)] disabled:opacity-60 md:mt-auto"
            >
              {!enviando && (
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              {enviando ? 'Reservando...' : 'Elegir esta unidad'}
            </button>
            <p className="mt-2.5 text-center text-xs text-[#9a9aa8]">
              Al elegir, reservamos esta unidad para ti.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default GaleriaUnidad;
