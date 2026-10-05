'use client';

/**
 * Compuerta legal: condiciones que hay que aceptar antes de la calculadora.
 *
 * Es lo único del legal que NO acompaña: corta el paso. SENATI pide que quien
 * arma el financiamiento haya visto y aceptado que el crédito no es suyo, y una
 * franja al pie no prueba eso — se puede recorrer la landing entera sin mirarla.
 *
 * Se interpone por DESTINO y no por botón. Los botones que llevan a la
 * calculadora los define la configuración de la landing —texto y enlace salen
 * de la base—, así que atarse a su rótulo significa que el día que alguien lo
 * renombre el paso queda abierto sin que nadie lo note. El maquetado de
 * referencia hace justamente eso: engancha por el texto del botón.
 *
 * Y el destino se compara por CAMINO, no como cadena. La primera versión usaba
 * igualdad exacta y la compuerta quedó muda en producción: el destino de esta
 * landing está cargado como `https://www.baldecash.com/titulo-senati/calculadora/`
 * y se comparaba contra una ruta relativa sin barra final. La forma en que está
 * escrito el enlace es una decisión de quien carga el dato —y con
 * `trailingSlash` encendido ni siquiera la barra es estable—; lo único que
 * importa es a dónde apunta.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { routes } from '../../utils/routes';
import { avisoLegalDe, type CompuertaLegal as Condiciones } from './avisos';

/**
 * Dónde se recuerda la aceptación.
 *
 * En la sesión del navegador y no en `localStorage`: la aceptación acompaña a
 * una visita, no queda firmada para siempre. Quien vuelve otro día vuelve a
 * ver las condiciones, que es lo que las hace valer; y quien va y viene entre
 * la portada y la calculadora en la misma visita no las ve tres veces.
 */
function claveAceptacion(landing: string): string {
  return `baldecash-${landing}-compuerta-legal`;
}

function yaAceptada(landing: string): boolean {
  try {
    return sessionStorage.getItem(claveAceptacion(landing)) === 'true';
  } catch {
    // Sin almacenamiento se muestra de nuevo. Mostrar de más es el lado seguro
    // de este error: lo que no se puede hacer es dar por aceptado lo que no
    // consta.
    return false;
  }
}

function recordarAceptacion(landing: string): void {
  try {
    sessionStorage.setItem(claveAceptacion(landing), 'true');
  } catch {
    // La aceptación de ESTE paso ya ocurrió y el avance sigue; lo único que se
    // pierde es no volver a preguntar.
  }
}

/** Sin barra final: el proyecto corre con `trailingSlash`, así que la misma ruta llega escrita de las dos formas. */
function sinBarraFinal(ruta: string): string {
  return ruta.replace(/\/+$/, '') || '/';
}

/** Un host es el mismo con `www.` o sin él. */
function hostComparable(host: string): string {
  return host.replace(/^www\./i, '').toLowerCase();
}

/**
 * El camino de un destino, o `null` si no se puede afirmar que sea de este sitio.
 *
 * Los destinos NO llegan en una sola forma. Los configura quien edita la
 * landing y salen tal cual de la base: los hay relativos (`calculadora`), ya
 * resueltos (`/titulo-senati/calculadora`) y absolutos con dominio
 * (`https://www.baldecash.com/titulo-senati/calculadora/`). Compararlos como
 * cadenas es lo que dejó la compuerta muda: la forma escrita es una decisión de
 * quien carga el dato, y lo que hay que mirar es a dónde apunta.
 *
 * Un destino a otro dominio devuelve `null` aunque el camino coincida: no es
 * nuestra calculadora, y detener a alguien camino a un sitio ajeno con nuestras
 * condiciones no tiene sentido.
 */
function caminoDe(destino: string): string | null {
  if (!/^https?:\/\//i.test(destino)) {
    // Relativo: alcanza con quitarle lo que no es camino.
    return destino.split(/[?#]/)[0] || null;
  }

  // Sin navegador no hay con qué comparar el host. Es el render del servidor, y
  // ahí no hay ningún clic que interceptar.
  if (typeof window === 'undefined') return null;

  try {
    const url = new URL(destino);
    if (hostComparable(url.host) !== hostComparable(window.location.host)) return null;
    return url.pathname;
  } catch {
    return null;
  }
}

interface Compuerta {
  condiciones: Condiciones | null;
  abierta: boolean;
  /**
   * Si este destino tiene condiciones pendientes.
   *
   * Se expone porque hay accesos que no navegan igual segun la forma del
   * destino —un ancla con un enlace absoluto navega sola, uno relativo lo
   * empuja el enrutador—, y esos necesitan saber si van a tener que
   * interceptar ANTES de decidir como. Sin esto habria que interceptar todo y
   * reconstruir a mano la navegacion que el navegador ya hacia bien.
   */
  aplicaA: (destino: string) => boolean;
  /**
   * Envuelve una navegación. Si la compuerta no aplica —la landing no tiene
   * condiciones, el destino no es la calculadora, o ya se aceptaron— llama a
   * `avanzar` de inmediato y no se ve nada.
   */
  pedirPaso: (destino: string, avanzar: () => void) => void;
  aceptar: () => void;
  cancelar: () => void;
}

export function useCompuertaLegal(landing: string): Compuerta {
  const condiciones = avisoLegalDe(landing)?.compuerta ?? null;
  const [abierta, setAbierta] = useState(false);
  /**
   * La navegación queda en suspenso mientras se decide.
   *
   * En una referencia y no en estado: no se dibuja nada con ella, y guardarla
   * en estado obligaría a envolverla para que React no la trate como un
   * actualizador.
   */
  const avanzarRef = useRef<(() => void) | null>(null);

  const aplicaA = useCallback(
    (destino: string) => {
      if (!condiciones || yaAceptada(landing)) return false;
      const camino = caminoDe(destino);
      if (camino === null) return false;
      return sinBarraFinal(camino) === sinBarraFinal(routes.calculadora(landing));
    },
    [condiciones, landing]
  );

  const pedirPaso = useCallback(
    (destino: string, avanzar: () => void) => {
      if (!aplicaA(destino)) {
        avanzar();
        return;
      }
      avanzarRef.current = avanzar;
      setAbierta(true);
    },
    [aplicaA]
  );

  const aceptar = useCallback(() => {
    recordarAceptacion(landing);
    setAbierta(false);
    const avanzar = avanzarRef.current;
    avanzarRef.current = null;
    avanzar?.();
  }, [landing]);

  /**
   * Cancelar descarta el destino. No se guarda para reintentarlo después: quien
   * cerró estas condiciones no dejó a medias una navegación, decidió no hacerla.
   */
  const cancelar = useCallback(() => {
    setAbierta(false);
    avanzarRef.current = null;
  }, []);

  return { condiciones, abierta, aplicaA, pedirPaso, aceptar, cancelar };
}

/**
 * El diálogo. Recibe la compuerta entera para que montarlo sea una línea al
 * lado del `useCompuertaLegal` que ya tiene quien lo usa.
 */
export function CompuertaLegal({ condiciones, abierta, aceptar, cancelar }: Compuerta) {
  // Cerrar con Escape y bloquear el scroll de fondo mientras está abierta.
  useEffect(() => {
    if (!abierta) return;
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') cancelar();
    };
    document.addEventListener('keydown', alPresionar);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierta, cancelar]);

  if (!abierta || !condiciones) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 p-4"
      onClick={cancelar}
      role="presentation"
    >
      {/*
        `text-left` explícito: el diálogo se monta dentro del componente que lo
        dispara, y uno de esos —la sección de cierre de la portada— vive en un
        contenedor centrado. Sin esto, hereda ese centrado y las condiciones
        salen alineadas al medio, con las viñetas separadas de su texto.
      */}
      <div
        className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-left shadow-2xl sm:p-7"
        onClick={(evento) => evento.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-compuerta-legal"
      >
        <div className="mb-2 flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
          <h2 id="titulo-compuerta-legal" className="text-lg font-bold text-neutral-800">
            {condiciones.titulo}
          </h2>
        </div>
        <p className="mb-5 text-sm text-neutral-500">{condiciones.subtitulo}</p>

        <ul className="mb-6 space-y-3">
          {condiciones.condiciones.map((condicion) => (
            <li
              key={condicion.destacado}
              className="flex gap-2.5 text-sm leading-relaxed text-neutral-600"
            >
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
              <span>
                <span className="font-semibold text-neutral-800">{condicion.destacado}</span>{' '}
                {condicion.cuerpo}
              </span>
            </li>
          ))}
        </ul>

        {/*
          En columna invertida en el teléfono: el pulgar cae abajo, y ahí tiene
          que estar el botón que confirma, no el que cancela.
        */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={cancelar}
            className="cursor-pointer rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            {condiciones.textoCancelar}
          </button>
          <button
            type="button"
            onClick={aceptar}
            className="cursor-pointer rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-90"
          >
            {condiciones.textoAceptar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompuertaLegal;
