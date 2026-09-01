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

interface Compuerta {
  condiciones: Condiciones | null;
  abierta: boolean;
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

  const pedirPaso = useCallback(
    (destino: string, avanzar: () => void) => {
      const esLaCalculadora = destino === routes.calculadora(landing);
      if (!condiciones || !esLaCalculadora || yaAceptada(landing)) {
        avanzar();
        return;
      }
      avanzarRef.current = avanzar;
      setAbierta(true);
    },
    [condiciones, landing]
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

  return { condiciones, abierta, pedirPaso, aceptar, cancelar };
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
      <div
        className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
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
