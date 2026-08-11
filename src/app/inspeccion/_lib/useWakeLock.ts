'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wake Lock de la estación de inspección (kiosco).
 *
 * Un teléfono montado en una pared durante ocho horas apaga la pantalla
 * solo, y con la pantalla apagada Chrome suspende la captura de cámara
 * (`useKioskRecorder.ts` queda "armada" pero sin nada corriendo). Este hook
 * pide un Wake Lock de tipo `'screen'` mientras `activo` es `true`.
 *
 * El detalle que hace o rompe esto: el sistema operativo SUELTA el wake
 * lock solo en cuanto el documento pasa a background (el usuario cambia de
 * app, bloquea la pantalla) — y al volver NO lo vuelve a pedir por su
 * cuenta. Sin el listener de `visibilitychange` de acá, el kiosco funciona
 * perfecto hasta la primera vez que alguien mira otra app en ese teléfono,
 * y desde ahí la pantalla se apaga sola sin que nada lo note en una prueba
 * corta. Ver plan de F2, Task 2.
 */
export interface UseWakeLockReturn {
  /** `false` en navegadores sin Wake Lock API (p.ej. iOS viejo). */
  soportado: boolean;
  /** `true` mientras el lock está efectivamente sostenido. */
  activo: boolean;
}

function hasWakeLockApi(nav: Navigator): boolean {
  return typeof nav !== 'undefined' && 'wakeLock' in nav;
}

export function useWakeLock(activo: boolean): UseWakeLockReturn {
  // Lazy init: `'wakeLock' in navigator` es un chequeo síncrono que no
  // cambia durante la vida del componente — no hace falta un efecto (ni el
  // truco de microtask que usa `usePresenceChannel.ts` para lo que sí es
  // async) para llegar al valor real desde el primer render.
  const [soportado] = useState(() => typeof navigator !== 'undefined' && hasWakeLockApi(navigator));
  const [held, setHeld] = useState(false);

  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  // `activo` se lee dentro de callbacks async (la respuesta de `request()`,
  // el listener de `visibilitychange`) donde un closure sobre la prop
  // quedaría stale — el ref siempre tiene el valor último. Se actualiza en
  // un efecto (no durante el render) porque mutar un ref en render es lo
  // que `react-hooks/refs` prohíbe.
  const activoRef = useRef(activo);
  useEffect(() => {
    activoRef.current = activo;
  });

  const requestLock = useCallback(() => {
    if (!hasWakeLockApi(navigator)) return;
    navigator.wakeLock
      .request('screen')
      .then((sentinel) => {
        // `activo` pudo pasar a false mientras `request()` estaba en vuelo
        // (p.ej. la cámara se desvinculó). No tiene sentido sostener un
        // lock que ya nadie pidió — soltarlo ya, sin esperar al próximo
        // ciclo del efecto.
        if (!activoRef.current) {
          sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        setHeld(true);
        // Dispara tanto si alguien más llama a `sentinel.release()` como si
        // el sistema operativo lo suelta solo al pasar a background — en
        // ambos casos el lock físico ya no existe.
        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
          setHeld(false);
        });
      })
      .catch(() => {
        // Algunos navegadores rechazan `request()` con batería baja, o si
        // el documento no está visible en ese instante. No hay nada
        // accionable acá más que no dejar el hook en un estado roto.
        setHeld(false);
      });
  }, []);

  useEffect(() => {
    if (!soportado || !activo) return undefined;
    requestLock();
    return () => {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel) sentinel.release().catch(() => {});
    };
  }, [activo, soportado, requestLock]);

  useEffect(() => {
    if (!soportado) return undefined;
    const onVisibilityChange = () => {
      // Re-adquirir SOLO si seguimos queriendo el lock y de verdad no lo
      // tenemos — es la regla crítica del hook (ver doc-comment del
      // módulo). Sin el chequeo de `sentinelRef.current`, cada
      // `visibilitychange` a "visible" pediría un lock nuevo aunque ya
      // hubiera uno vivo.
      if (document.visibilityState === 'visible' && activoRef.current && !sentinelRef.current) {
        requestLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [soportado, requestLock]);

  return { soportado, activo: held };
}
