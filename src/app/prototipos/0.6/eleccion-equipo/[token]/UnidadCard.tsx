'use client';

/**
 * Card de una unidad física en la lista de `/eleccion-equipo/[token]`.
 *
 * Dos formas según el ancho, que es el encargo explícito del diseño:
 * - Mobile: fila — miniatura de 104x88 a la izquierda, texto a la derecha.
 * - Desktop: card de grilla — la miniatura pasa a ser APAISADA y va arriba,
 *   ocupando todo el ancho de la card.
 *
 * La card ENTERA es el botón (y no un botón adentro de un div clickeable): así
 * hay un solo destino de foco, se abre con Enter/Espacio y el lector de
 * pantalla anuncia una sola acción. El "Ver y elegir" es un `span` pintado como
 * botón — un `<button>` adentro de otro es HTML inválido.
 *
 * NO se muestran bullets de "detalle estético": ese dato no existe (nadie lo
 * captura). Las fotos hablan solas.
 */

import type { EleccionUnidad } from '../../services/eleccionEquipoApi';
import { etiquetaFoto, etiquetaGrado, nombreUnidad, resumenMedios } from './formato';

export interface UnidadCardProps {
  unidad: EleccionUnidad;
  onAbrir: () => void;
  /**
   * Pinta el grado al lado del título. `false` cuando TODAS las unidades del
   * link comparten grado —lo normal— porque ahí ya encabeza la página y
   * repetirlo por card sugiere una diferencia entre unidades que no existe.
   */
  mostrarGrado?: boolean;
}

export function UnidadCard({ unidad, onAbrir, mostrarGrado = true }: UnidadCardProps) {
  const titulo = nombreUnidad(unidad.display_number);
  const grado = mostrarGrado ? etiquetaGrado(unidad.grado, unidad.grado_label) : '';
  const portada = unidad.photos[0];
  const medios = resumenMedios(unidad.photos.length, Boolean(unidad.video_url));

  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={`${titulo}: ver fotos y video`}
      className="flex w-full gap-3.5 rounded-[18px] border border-[#e9e9ef] bg-white p-3.5 text-left shadow-[0_6px_20px_rgba(21,23,68,.06)] transition hover:border-[#4654CD]/40 hover:shadow-[0_10px_26px_rgba(21,23,68,.10)] active:scale-[.99] md:flex-col md:gap-0 md:p-0 md:pb-4"
    >
      {/* Cuadrada en mobile: la estación de inspección graba 1:1 y un recuadro
          apaisado (104x88) le cortaba la mitad de arriba al equipo. En desktop
          se deja apaisada a propósito — es la forma de la card de la grilla, y
          ahí el recorte no molestó en la demo. */}
      <span className="relative grid h-[104px] w-[104px] flex-none place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#f7f7fb] to-[#e9eaf1] md:h-[170px] md:w-full md:rounded-b-none md:rounded-t-[18px]">
        {portada ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL firmada de S3, sin host fijo para next/image
          <img
            src={portada.url}
            alt={`${titulo} — ${etiquetaFoto(0)}`}
            loading="lazy"
            // 60% vertical, MEDIDO sobre las 7 unidades del link vivo de
            // producción, no estimado: el equipo ocupa de ~23% a ~86% del alto
            // del cuadro 1:1 (el plato giratorio negro entra en ese rango), o
            // sea su centro cae en ~54%, no en el 50% del centro geométrico.
            // Con la caja de la card (355x170 en desktop) se ve el 48% del alto
            // de la fuente, y dejar ese centro en el medio del recuadro pide
            // 57%; 60% redondea hacia mostrar un poco más del apoyo, que es lo
            // que hace que la laptop no parezca colgada.
            //
            // Centrar en 50% —lo que estuvo un rato— empuja la ventana hacia
            // arriba y deja el equipo pegado al borde de abajo: se lee como
            // "la foto está corrida hacia abajo".
            //
            // Solo aplica donde el recuadro es apaisado, o sea esta card en
            // desktop. En mobile es cuadrado como la fuente y `object-position`
            // no hace nada.
            className="h-full w-full object-cover object-[50%_60%]"
          />
        ) : (
          <span className="px-2 text-center text-[10px] font-semibold text-[#9a9aa8]">
            Fotos en camino
          </span>
        )}

        {unidad.video_url && (
          <span
            aria-hidden="true"
            className="absolute grid h-[30px] w-[30px] place-items-center rounded-full bg-white/92 text-[#4654CD] shadow-[0_2px_8px_rgba(0,0,0,.15)] md:h-[46px] md:w-[46px]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="md:h-[22px] md:w-[22px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}

        {medios && (
          <span className="absolute bottom-[5px] left-[5px] rounded-md bg-[#151744]/78 px-1.5 py-[3px] text-[9.5px] font-semibold text-white md:bottom-2 md:left-2 md:text-[11px]">
            {medios}
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col md:px-4 md:pt-3.5">
        <span className="flex flex-wrap items-center gap-2 text-base font-extrabold text-[#151744]">
          {titulo}
          {grado && (
            <span className="rounded-xl bg-[#03DBD0] px-2 py-[3px] text-[10px] font-bold text-[#04413e]">
              {grado}
            </span>
          )}
        </span>

        <span className="mt-1 flex-1 text-[12.5px] leading-[1.4] text-[#5b5c6b]">
          Mira sus fotos y su video antes de decidir.
        </span>

        <span className="mt-2 inline-flex items-center gap-1.5 self-start rounded-[20px] bg-[#EEF0FC] px-3.5 py-2 text-[13px] font-bold text-[#4654CD]">
          Ver y elegir
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </span>
    </button>
  );
}

export default UnidadCard;
