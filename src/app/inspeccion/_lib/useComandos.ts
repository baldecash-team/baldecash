'use client';

import { useEffect, useRef } from 'react';

/**
 * Escucha los comandos de una inspección sobre el canal presence de la
 * estación (spec §6). Deliberadamente NO abre ninguna conexión propia: recibe
 * el `channel` ya suscripto de `usePresenceChannel` — Task 4 solo agrega el
 * consumo de `cmd.start` / `cmd.stop` / `cmd.abort`, no un segundo canal.
 *
 * Idempotencia por `seq` (spec §6.1 regla 1): Pusher entrega at-least-once y
 * redistribuye al reconectar, así que el mismo comando puede llegar dos
 * veces. El backend (`session.py`, ws2) documenta que `seq` es FIJO POR
 * INSPECCIÓN — 1 para `cmd.start`, 2 para `cmd.stop`/`cmd.abort` — no un
 * contador global. Por eso la clave de dedupe de acá abajo combina tipo +
 * `inspection_id` + `seq`: sin `inspection_id`, el `cmd.start` (seq=1) de una
 * inspección nueva se confundiría con el de la inspección anterior y jamás
 * volvería a disparar `onStart`.
 *
 * Quien llama es responsable de lo que pasa DESPUÉS de un comando único
 * (ackear, programar la grabación, detenerla) — este hook solo garantiza que
 * cada comando único llega UNA sola vez a esos callbacks, nunca más. Eso es
 * lo que hace que "un seq repetido no dispare dos grabaciones ni dos acks":
 * si `onStart` nunca se llama dos veces para el mismo comando, nada que
 * dependa de esa única llamada (ack incluido) puede duplicarse tampoco.
 */
export interface ComandoStartPayload {
  inspection_id: number;
  /** Epoch ms, absoluto — no relativo a "ahora". */
  start_at: number;
  seq: number;
  /**
   * Fix de review post-F4-Task-5 (CRÍTICO): el número de toma que le
   * corresponde a ESTE `cmd.start`, decidido por el servidor
   * (`InspectionService.siguiente_take`/`crear`, ws2) — nunca inferido acá.
   * Antes no viajaba en el payload y la cámara lo adivinaba contando
   * cuántos `cmd.start` había recibido para la inspección
   * (`CamaraPageContent.tsx`); como Pusher no garantiza entrega (spec §6.1
   * regla 3), una cámara que se pierde un `cmd.start` quedaba desfasada
   * para siempre y subía cada toma siguiente con el `take_number` de la
   * ANTERIOR — pisando su objeto en S3 sin que nadie se enterara. El
   * servidor es la única fuente de verdad de este número, igual que ya lo
   * es de `seq`.
   */
  take_number: number;
}

export interface ComandoStopPayload {
  inspection_id: number;
  seq: number;
}

export interface ComandoAbortPayload {
  inspection_id: number;
  seq: number;
}

export interface UseComandosOpciones {
  onStart?: (payload: ComandoStartPayload) => void;
  onStop?: (payload: ComandoStopPayload) => void;
  onAbort?: (payload: ComandoAbortPayload) => void;
}

/**
 * Lo mínimo que necesitamos del canal: `bind`/`unbind` de `pusher-js`
 * (`Channel`/`PresenceChannel`). Tipado acá en vez de importar el tipo real
 * de la librería para que un fake de test mínimo (solo `bind`/`emit`, como
 * `_test-support/fakePusher.ts`) siga sirviendo sin tener que implementar la
 * forma completa de la clase.
 */
export interface ComandoChannel {
  bind: (event: string, callback: (data: unknown) => void) => void;
  unbind?: (event: string, callback: (data: unknown) => void) => void;
}

interface ConPayload {
  inspection_id: number;
  seq: number;
}

export function useComandos(
  channel: ComandoChannel | null,
  { onStart, onStop, onAbort }: UseComandosOpciones
): void {
  // Refs para los callbacks: el efecto de abajo solo debe re-bindear cuando
  // CAMBIA el `channel` en sí (una identidad estable durante toda la vida de
  // la suscripción) — no en cada render solo porque el padre pasó una
  // función nueva por identidad, algo muy común con closures inline en JSX.
  const onStartRef = useRef(onStart);
  const onStopRef = useRef(onStop);
  const onAbortRef = useRef(onAbort);
  // Actualizar el `.current` de un ref es un efecto colateral, no algo para
  // hacer en el cuerpo del render (`react-hooks/refs`) — de ahí el
  // `useEffect` sin dependencias en vez de la asignación directa de arriba.
  // Corre después de CADA render, así que para cuando pueda llegar un evento
  // real del canal (siempre en respuesta a algo externo, nunca durante un
  // render) los refs ya están al día.
  useEffect(() => {
    onStartRef.current = onStart;
    onStopRef.current = onStop;
    onAbortRef.current = onAbort;
  });

  // Comandos ya despachados, por clave `tipo:inspection_id:seq`. Vive fuera
  // del efecto (no se resetea si `channel` cambia de identidad, p.ej. una
  // reconexión completa que re-crea el objeto) porque una redelivery de
  // Pusher puede llegar mucho después de ese cambio — el dispositivo no debe
  // volver a grabar solo porque cambió de socket.
  const vistosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!channel) return undefined;

    function despachar<T extends ConPayload>(
      tipo: string,
      data: unknown,
      callback: ((payload: T) => void) | undefined
    ) {
      const payload = data as T;
      const clave = `${tipo}:${payload.inspection_id}:${payload.seq}`;
      if (vistosRef.current.has(clave)) return;
      vistosRef.current.add(clave);
      callback?.(payload);
    }

    const handleStart = (data: unknown) =>
      despachar<ComandoStartPayload>('start', data, onStartRef.current);
    const handleStop = (data: unknown) =>
      despachar<ComandoStopPayload>('stop', data, onStopRef.current);
    const handleAbort = (data: unknown) =>
      despachar<ComandoAbortPayload>('abort', data, onAbortRef.current);

    channel.bind('cmd.start', handleStart);
    channel.bind('cmd.stop', handleStop);
    channel.bind('cmd.abort', handleAbort);

    return () => {
      channel.unbind?.('cmd.start', handleStart);
      channel.unbind?.('cmd.stop', handleStop);
      channel.unbind?.('cmd.abort', handleAbort);
    };
  }, [channel]);
}
