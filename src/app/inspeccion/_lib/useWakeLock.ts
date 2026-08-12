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
 *
 * Revisión de F2 (I1/I2) — dos wake locks colgados encontrados ejecutando
 * probes, documentados en cada punto de abajo donde se corrigieron.
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
  // I2: sin esto, la guarda de re-adquisición (`!sentinelRef.current`) es
  // falsa-negativa mientras hay un `request()` en vuelo — `sentinelRef`
  // recién se llena cuando la promesa RESUELVE, no cuando se pide. Medido:
  // 4 `visibilitychange` seguidos (algo tan simple como cambiar de app y
  // volver varias veces rápido) disparaban 4 requests, y de las respuestas
  // que llegaban tarde, las de más quedaban sin `sentinelRef` propio donde
  // guardarse — 2 de 4 sentinels irrecuperables. Este ref se pone en `true`
  // ANTES de llamar a `request()` y se limpia apenas la promesa se asienta
  // (éxito o error), así que cubre exactamente la ventana peligrosa.
  const inFlightRef = useRef(false);
  // I1: si el componente se desmonta mientras `request()` está en vuelo, el
  // cleanup del efecto de abajo corre con `sentinelRef.current` todavía en
  // `null` (la promesa no resolvió) — no libera nada. Cuando la promesa
  // resuelve DESPUÉS del desmontaje, ningún efecto de este hook vuelve a
  // correr, así que `activoRef.current` quedó en lo último que tenía antes
  // de desmontar (potencialmente `true`, stale) — el sentinel se guarda
  // igual, en un hook que ya nadie puede tocar: nadie lo libera nunca.
  // Medido: 3 ciclos montar/desmontar → 3 locks pedidos, 0 liberados. En
  // dev con StrictMode pasa en cada carga (monta, desmonta, vuelve a
  // montar). `aliveRef` es la señal real de "¿sigue vivo este hook?" — se
  // pone en `true` al montar y en `false` en el cleanup de un efecto que
  // solo corre una vez, así que para cuando la promesa tardía resuelve ya
  // está en `false` sin importar el orden entre cleanups.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
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
    // I2: ya hay un lock sostenido, o ya hay un `request()` en vuelo — no
    // pedir un segundo. Ver el doc-comment de `inFlightRef` arriba.
    if (sentinelRef.current || inFlightRef.current) return;
    inFlightRef.current = true;
    navigator.wakeLock
      .request('screen')
      .then((sentinel) => {
        inFlightRef.current = false;
        // I1: si el hook ya se desmontó, no hay nadie que pueda liberar
        // este sentinel más adelante — soltarlo YA, no guardarlo. Ver
        // doc-comment de `aliveRef` arriba.
        if (!aliveRef.current) {
          sentinel.release().catch(() => {});
          return;
        }
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
        inFlightRef.current = false;
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
      // Nota (I1): si en este punto hay un `request()` en vuelo
      // (`inFlightRef.current === true`), acá no hay nada que liberar
      // todavía — el `aliveRef` de arriba es quien se encarga de soltarlo
      // cuando la respuesta llegue tarde.
    };
  }, [activo, soportado, requestLock]);

  useEffect(() => {
    if (!soportado) return undefined;
    const onVisibilityChange = () => {
      // Re-adquirir SOLO si seguimos queriendo el lock y de verdad no lo
      // tenemos NI LO PEDIMOS TODAVÍA — es la regla crítica del hook (ver
      // doc-comment del módulo). Sin el chequeo de `sentinelRef.current` Y
      // `inFlightRef.current` (I2), varios `visibilitychange` seguidos
      // pedirían un lock nuevo por cada uno, aunque ya hubiera uno vivo o
      // en camino.
      if (
        document.visibilityState === 'visible' &&
        activoRef.current &&
        !sentinelRef.current &&
        !inFlightRef.current
      ) {
        requestLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [soportado, requestLock]);

  return { soportado, activo: held };
}
