/**
 * Preferencias de movimiento y tamaño de pantalla para Diseño 2 (BAL-4964).
 * Única fuente de `prefers-reduced-motion` del kit (menor 9 de la revisión
 * final, BAL-4969): la guía de campos y `SeccionPlegable` leen
 * `prefiereMenosMovimiento()` al momento; los componentes que pintan distinto
 * según la preferencia usan `useMenosMovimiento()`.
 *
 * Las animaciones de CSS del kit (`.d2-pop`, `.d2-aparece`, `.d2-pulso-*`…,
 * BAL-4969) viven en `globals.css` con las curvas del prototipo de Brenda, y
 * su `@media (prefers-reduced-motion: reduce)` las apaga con el mismo
 * criterio. `usePulsoAlCambiar` y `useSalidaAnimada` son los ganchos de JS.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

const CONSULTA_MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)';

/** La persona pidió menos movimiento (`prefers-reduced-motion`). */
export function prefiereMenosMovimiento(): boolean {
  try {
    return window.matchMedia(CONSULTA_MENOS_MOVIMIENTO).matches;
  } catch {
    return false;
  }
}

/** Pantalla de celular: por debajo del corte `sm` de Tailwind (640 px). */
export function esPantallaDeCelular(): boolean {
  try {
    return window.matchMedia('(max-width: 639px)').matches;
  } catch {
    return false;
  }
}

function suscribirMenosMovimiento(avisar: () => void): () => void {
  let consulta: MediaQueryList;
  try {
    consulta = window.matchMedia(CONSULTA_MENOS_MOVIMIENTO);
  } catch {
    return () => {};
  }
  // Safari < 14 solo tiene la API vieja (`addListener`/`removeListener`).
  if (typeof consulta.addEventListener === 'function') {
    consulta.addEventListener('change', avisar);
    return () => consulta.removeEventListener('change', avisar);
  }
  consulta.addListener?.(avisar);
  return () => consulta.removeListener?.(avisar);
}

/**
 * Hook de `prefers-reduced-motion`: `false` en el servidor y sigue los
 * cambios de la preferencia en el navegador.
 */
export function useMenosMovimiento(): boolean {
  return useSyncExternalStore(suscribirMenosMovimiento, prefiereMenosMovimiento, () => false);
}

/**
 * Pulso de un número que cambió (la cuota, el total): devuelve la clase que
 * lo hace crecer y volver (`bcPulseA/B` del prototipo, 0,45 s). Alterna dos
 * nombres de animación para que cada cambio vuelva a pulsar sin desmontar.
 * Al montar no pulsa, y con menos movimiento nunca. El elemento debe ser
 * `inline-block` (o bloque) para que el `transform` se vea.
 */
export function usePulsoAlCambiar(valor: unknown): string {
  const menos = useMenosMovimiento();
  const [estado, setEstado] = useState({ valor, cambios: 0 });
  // Ajuste durante el render (el patrón de React para "cuando cambia una prop").
  if (!Object.is(estado.valor, valor)) setEstado({ valor, cambios: estado.cambios + 1 });
  if (menos || estado.cambios === 0) return '';
  return estado.cambios % 2 ? 'd2-pulso-a' : 'd2-pulso-b';
}

/** Lo que dura la salida de un modal u hoja antes de desmontarse. */
export const DURACION_SALIDA_MS = 180;

/**
 * Salida animada de una capa (modal, hoja): `salir(alTerminar)` pone
 * `saliendo` en `true` —la capa pinta su animación de salida— y recién al
 * terminar llama `alTerminar` (que la desmonta). Con menos movimiento llama
 * de una. Una segunda llamada mientras sale no hace nada.
 */
export function useSalidaAnimada(ms: number = DURACION_SALIDA_MS): readonly [boolean, (alTerminar: () => void) => boolean] {
  const [saliendo, setSaliendo] = useState(false);
  const temporizador = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    },
    [],
  );
  const salir = useCallback(
    (alTerminar: () => void) => {
      if (temporizador.current !== null) return false;
      if (prefiereMenosMovimiento()) {
        alTerminar();
        return true;
      }
      setSaliendo(true);
      temporizador.current = window.setTimeout(() => {
        temporizador.current = null;
        setSaliendo(false);
        alTerminar();
      }, ms);
      return true;
    },
    [ms],
  );
  return [saliendo, salir] as const;
}
