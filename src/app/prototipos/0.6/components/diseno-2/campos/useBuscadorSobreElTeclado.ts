'use client';

/**
 * Buscador de Diseño 2 con el teclado abierto (QA en celular, BAL-4969, bug 2).
 *
 * El buscador (institución, carrera) abre su lista HACIA ABAJO. En celular,
 * con el campo a media pantalla, al salir el teclado el input y los
 * resultados quedaban debajo de él y la persona escribía sin ver nada.
 *
 * Al abrirse (y cada vez que el teclado cambia el alto visible):
 * 1. sube el campo al borde de arriba (`scrollIntoView`, `block: 'start'`;
 *    el `scroll-margin-top` del campo deja libre la cabecera fija), y
 * 2. limita el alto de la lista a lo que queda visible sobre el teclado
 *    (`visualViewport`), para que los resultados se vean enteros.
 *
 * Scroll SIN animación a propósito: el scroll suave peleaba con el teclado de
 * iOS y trababa la página (ver `useTecladoVirtualAbierto`). Solo en celular:
 * en escritorio no hay teclado que tape nada y mover la página molesta.
 */

import { useEffect, useState, type RefObject } from 'react';

/** Debajo de la lista, para que no quede pegada al teclado. */
const MARGEN_INFERIOR = 8;
/** Nunca menos que esto (2-3 resultados), aunque el teclado coma mucho. */
export const ALTO_MIN_LISTA = 96;
/** Lo de siempre (15rem): con poco teclado, la lista no crece de más. */
export const ALTO_MAX_LISTA = 240;

function esEscritorio(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 1024px)').matches;
}

export interface BuscadorSobreElTecladoOpciones {
  /** Lista abierta y con buscador (hay teclado). */
  activo: boolean;
  /** El campo entero (etiqueta + caja): lo que sube arriba. */
  campoRef: RefObject<HTMLElement | null>;
  /** El contenedor con scroll de los resultados. */
  listaRef: RefObject<HTMLElement | null>;
}

/** Devuelve el alto máximo (px) para la lista, o `null` si no aplica. */
export function useBuscadorSobreElTeclado({ activo, campoRef, listaRef }: BuscadorSobreElTecladoOpciones): number | null {
  const [alto, setAlto] = useState<number | null>(null);

  useEffect(() => {
    if (!activo || typeof window === 'undefined' || esEscritorio()) return;
    const vv = window.visualViewport;

    const ajustar = () => {
      campoRef.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
      const lista = listaRef.current;
      if (!lista) return;
      const fondoVisible = vv ? vv.offsetTop + vv.height : window.innerHeight;
      const libre = Math.floor(fondoVisible - lista.getBoundingClientRect().top - MARGEN_INFERIOR);
      setAlto(Math.max(ALTO_MIN_LISTA, Math.min(ALTO_MAX_LISTA, libre)));
    };

    // Después de pintar la lista (y de que el input tome el foco).
    const raf = window.requestAnimationFrame(ajustar);
    vv?.addEventListener('resize', ajustar);
    return () => {
      window.cancelAnimationFrame(raf);
      vv?.removeEventListener('resize', ajustar);
    };
  }, [activo, campoRef, listaRef]);

  // Cerrado (o en escritorio, donde nunca se mide) no aplica.
  return activo ? alto : null;
}

export default useBuscadorSobreElTeclado;
