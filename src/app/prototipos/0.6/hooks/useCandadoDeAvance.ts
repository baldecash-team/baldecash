'use client';

import { useCallback, useEffect, useRef } from 'react';

/** Cuánto queda cerrado el candado después de avanzar. */
export const ESPERA_UN_SOLO_CLIC_MS = 1500;

/**
 * Candado contra el doble clic en los botones que envían o avanzan (E2E
 * BAL-4969: el doble clic mandaba dos POST /submit y duplicaba
 * `form_step_complete` / `form_submit_success`).
 *
 * El handler llama a `tomar()` justo en el punto en que AVANZA (ya pasó la
 * validación): si devuelve `false`, otro clic ya avanzó y este se ignora. Un
 * clic que solo muestra errores no lo toma, así la persona corrige y vuelve a
 * apretar enseguida. Es un ref —se cierra en el acto, no espera al próximo
 * render— y se abre solo a los `esperaMs` por si la navegación no desmonta la
 * pantalla (o falla). No toca el botón: Diseño 1 se ve igual.
 */
export function useCandadoDeAvance(esperaMs: number = ESPERA_UN_SOLO_CLIC_MS) {
  const tomadoRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const tomar = useCallback((): boolean => {
    if (tomadoRef.current) return false;
    tomadoRef.current = true;
    timerRef.current = window.setTimeout(() => {
      tomadoRef.current = false;
      timerRef.current = null;
    }, esperaMs);
    return true;
  }, [esperaMs]);

  return tomar;
}
