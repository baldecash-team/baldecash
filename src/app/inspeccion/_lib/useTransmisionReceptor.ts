'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ICE_SERVERS,
  bindSenales,
  esperarIceCompleto,
  mandarSenal,
  type SenalChannel,
  type SenalPayload,
} from './senalizacion';

/**
 * Lado ESCÁNER de la transmisión en vivo: le pide video a cada cámara de la
 * estación mientras la inspección está abierta.
 *
 * El que inicia es este lado, no la cámara — ver el doc-comment de
 * `useTransmisionEmisor.ts`. Mientras `activo` sea false no se abre ningún
 * peer y ningún teléfono codifica de más.
 */

export type EstadoTransmision = 'conectando' | 'viendo' | 'sin-transmision';

export interface CamaraConectable {
  deviceId: string;
  label: string;
}

export interface Transmision {
  deviceId: string;
  label: string;
  estado: EstadoTransmision;
  stream: MediaStream | null;
}

/**
 * Esperas entre reintentos, en ms. Tres y para: un teléfono que no conecta
 * por topología de red no va a conectar al décimo intento, y mientras tanto
 * quema batería. A partir de ahí el operador decide con "Reintentar".
 */
export const BACKOFF_MS = [2_000, 5_000, 15_000];

export interface UseTransmisionReceptorOpciones {
  channel: SenalChannel | null;
  /** El `device_id` de ESTE escáner, para filtrar las señales. */
  deviceId: string | null;
  token: string | null;
  /** Solo con la inspección abierta (`grabando`/`fotografiando`/`decidiendo`). */
  activo: boolean;
  camaras: CamaraConectable[];
}

export function useTransmisionReceptor({
  channel,
  deviceId,
  token,
  activo,
  camaras,
}: UseTransmisionReceptorOpciones): {
  transmisiones: Transmision[];
  reintentar: (deviceId: string) => void;
} {
  const [estados, setEstados] = useState<Record<string, EstadoTransmision>>({});
  const [streams, setStreams] = useState<Record<string, MediaStream>>({});

  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const intentosRef = useRef<Map<string, number>>(new Map());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  /** `conectar` vive adentro del efecto (necesita su closure); esto lo deja
   * alcanzable desde `reintentar`, que es un callback del componente. */
  const conectarRef = useRef<((cam: CamaraConectable) => void) | null>(null);

  // `camaras` sale de `members` y cambia de identidad en cada render del
  // padre. El efecto tiene que re-correr por su CONTENIDO, no por su
  // identidad — mismo patrón de refs que usa `useComandos.ts`.
  const camarasRef = useRef(camaras);
  useEffect(() => {
    camarasRef.current = camaras;
  });
  const clave = camaras
    .map((c) => `${c.deviceId}:${c.label}`)
    .sort()
    .join('|');

  useEffect(() => {
    if (!channel || !deviceId || !token || !activo) return undefined;
    // TS no propaga el narrowing de `token` hacia las funciones DECLARADAS
    // más abajo (hoisting): son `function`, no `const`, porque se llaman
    // entre sí. Este alias sí queda narrowed y es lo que ellas usan.
    const tokenListo = token;

    const peers = peersRef.current;
    const intentos = intentosRef.current;
    const timers = timersRef.current;
    let vivo = true;

    const marcar = (id: string, estado: EstadoTransmision) =>
      setEstados((previos) => ({ ...previos, [id]: estado }));

    const cerrar = (id: string) => {
      const pc = peers.get(id);
      if (pc) {
        peers.delete(id);
        try {
          pc.close();
        } catch {
          // Ya cerrada.
        }
      }
      const timer = timers.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.delete(id);
      }
      setStreams((previos) => {
        if (!(id in previos)) return previos;
        const copia = { ...previos };
        delete copia[id];
        return copia;
      });
    };

    // `programarReintento`, `conectar` y `lanzar` se llaman entre sí, así que
    // van como declaraciones de función (hoisted) y no como const: con
    // arrow functions, `programarReintento` referenciaría `lanzar` antes de
    // su inicialización y ESLint lo marcaría (`no-use-before-define`).
    function programarReintento(cam: CamaraConectable) {
      marcar(cam.deviceId, 'sin-transmision');
      const hechos = intentos.get(cam.deviceId) ?? 0;
      if (hechos >= BACKOFF_MS.length) return;
      intentos.set(cam.deviceId, hechos + 1);
      const timer = setTimeout(() => {
        if (vivo) lanzar(cam);
      }, BACKOFF_MS[hechos]);
      timers.set(cam.deviceId, timer);
    }

    async function conectar(cam: CamaraConectable) {
      cerrar(cam.deviceId);
      marcar(cam.deviceId, 'conectando');

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peers.set(cam.deviceId, pc);

      pc.addEventListener('track', (evento) => {
        const [stream] = (evento as RTCTrackEvent).streams ?? [];
        if (!stream) return;
        intentos.set(cam.deviceId, 0);
        setStreams((previos) => ({ ...previos, [cam.deviceId]: stream }));
        marcar(cam.deviceId, 'viendo');
      });

      pc.addEventListener('iceconnectionstatechange', () => {
        if (pc.iceConnectionState !== 'failed' && pc.iceConnectionState !== 'disconnected') return;
        // Si ya hay otro peer para esta cámara, este es un fantasma.
        if (peers.get(cam.deviceId) !== pc) return;
        cerrar(cam.deviceId);
        programarReintento(cam);
      });

      pc.addTransceiver('video', { direction: 'recvonly' });
      await pc.setLocalDescription(await pc.createOffer());
      await esperarIceCompleto(pc);

      if (!vivo || peers.get(cam.deviceId) !== pc) return;
      await mandarSenal(tokenListo, cam.deviceId, 'offer', pc.localDescription?.sdp ?? '');
    }

    /** `conectar` envuelto: ninguna excepción de WebRTC puede propagar. */
    function lanzar(cam: CamaraConectable) {
      void conectar(cam).catch((e) => {
        console.warn('[transmision] no se pudo ofrecer a la cámara', e);
        programarReintento(cam);
      });
    }
    conectarRef.current = lanzar;

    const alRecibir = (payload: SenalPayload) => {
      if (payload.tipo !== 'answer') return;
      const pc = peers.get(payload.origen_device_id);
      if (!pc) return;
      void pc
        .setRemoteDescription({ type: 'answer', sdp: payload.sdp } as RTCSessionDescriptionInit)
        .catch((e) => console.warn('[transmision] respuesta rechazada', e));
    };

    const desbindear = bindSenales(channel, deviceId, alRecibir);

    camarasRef.current.forEach((cam) => {
      if (peers.has(cam.deviceId)) return;
      intentos.set(cam.deviceId, 0);
      lanzar(cam);
    });

    return () => {
      vivo = false;
      conectarRef.current = null;
      desbindear();
      [...peers.keys()].forEach((id) => {
        // El cierre limpio: la cámara deja de codificar sin esperar a que
        // ICE se caiga sola.
        void mandarSenal(tokenListo, id, 'bye');
        cerrar(id);
      });
      intentos.clear();
      setEstados({});
    };
  }, [channel, deviceId, token, activo, clave]);

  const reintentar = useCallback((id: string) => {
    const cam = camarasRef.current.find((c) => c.deviceId === id);
    if (!cam) return;
    intentosRef.current.set(id, 0);
    conectarRef.current?.(cam);
  }, []);

  const transmisiones: Transmision[] = activo
    ? camaras.map((cam) => ({
        deviceId: cam.deviceId,
        label: cam.label,
        estado: estados[cam.deviceId] ?? 'conectando',
        stream: streams[cam.deviceId] ?? null,
      }))
    : [];

  return { transmisiones, reintentar };
}
