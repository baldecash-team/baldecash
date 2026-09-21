'use client';

import { API_BASE_URL } from './pairing';

/**
 * Transporte de la negociación WebRTC de la transmisión en vivo.
 *
 * Respeta la regla del spec §6 del módulo: las confirmaciones suben por REST
 * y bajan por Pusher; el canal presence es solo notificación. Nada de eventos
 * de cliente (`client-*`) — ver el doc-comment de
 * `DEVICE_CAPTURE_STATE_EVENT` en `usePresenceChannel.ts` para las tres
 * razones por las que se descartaron, que valen igual acá.
 */

/** Los tres únicos tipos que viajan. No hay `candidate`: la señalización va
 * SIN trickle ICE, así que los candidatos viajan adentro del SDP. */
export type TipoSenal = 'offer' | 'answer' | 'bye';

/** Evento del BACKEND (no de cliente) que reemite una señal al canal. */
export const SENAL_EVENT = 'device.senal';

export interface SenalPayload {
  origen_device_id: string;
  destino_device_id: string;
  tipo: TipoSenal;
  /** Vacío en el `bye`. */
  sdp: string;
}

/**
 * Lo mínimo que necesitamos del canal (`bind`/`unbind` de `pusher-js`).
 * Tipado acá en vez de importar el tipo real para que un fake de test mínimo
 * siga sirviendo — mismo criterio que `ComandoChannel` en `useComandos.ts`.
 */
export interface SenalChannel {
  bind: (event: string, callback: (data: unknown) => void) => void;
  unbind?: (event: string, callback: (data: unknown) => void) => void;
}

/**
 * Solo STUN público: sin TURN por decisión de diseño (no sumar infra). Eso
 * ata la función a que la WiFi del local no aísle clientes entre sí — ver
 * §12 del spec.
 */
export const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

/**
 * Cuánto se espera a juntar candidatos antes de mandar el SDP igual.
 *
 * En LAN el gathering termina en ~200ms. Los 2s son para el caso en que el
 * STUN público no conteste: ahí se manda lo que haya — los candidatos host,
 * que son justamente los que van a servir en una red local. Sin este corte,
 * un STUN caído dejaría la negociación colgada para siempre.
 */
export const ICE_GATHERING_TIMEOUT_MS = 2_000;

/**
 * Manda una señal al backend, que la reemite por el canal.
 *
 * Fire-and-forget, mismo criterio que `reportarEstadoCaptura` en
 * `CamaraPageContent.tsx`: si falla por red no hay nada accionable acá, y el
 * receptor lo va a ver como una conexión que no prospera y va a reintentar.
 * Nunca lanza: la transmisión es best-effort y no puede tumbar a quien la
 * llama.
 */
export async function mandarSenal(
  token: string,
  destinoDeviceId: string,
  tipo: TipoSenal,
  sdp = ''
): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/inspections/devices/senal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Token': token },
      body: JSON.stringify({ destino_device_id: destinoDeviceId, tipo, sdp }),
    });
  } catch {
    // Ver doc-comment: nada accionable acá.
  }
}

/**
 * Escucha las señales del canal y entrega SOLO las dirigidas a este
 * dispositivo. El evento viaja a todos los miembros porque el canal es uno
 * por estación; el filtro es de este lado, igual que en
 * `device.capture_state`.
 *
 * Devuelve la función para desbindear.
 */
export function bindSenales(
  channel: SenalChannel | null,
  miDeviceId: string,
  onSenal: (payload: SenalPayload) => void
): () => void {
  if (!channel) return () => {};

  const handler = (data: unknown) => {
    const payload = data as SenalPayload | null;
    if (!payload?.origen_device_id || !payload?.destino_device_id || !payload?.tipo) return;
    if (payload.destino_device_id !== miDeviceId) return;
    onSenal(payload);
  };

  channel.bind(SENAL_EVENT, handler);
  return () => channel.unbind?.(SENAL_EVENT, handler);
}

/**
 * Espera a que termine el gathering de candidatos para poder mandar UN solo
 * SDP con todo adentro (sin trickle — ver §4.3 del spec).
 *
 * Nunca rechaza: al vencer el timeout resuelve igual, porque mandar los
 * candidatos que ya se juntaron es mejor que no mandar nada.
 */
export function esperarIceCompleto(
  pc: RTCPeerConnection,
  timeoutMs = ICE_GATHERING_TIMEOUT_MS
): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();

  return new Promise<void>((resolve) => {
    let listo = false;

    const terminar = () => {
      if (listo) return;
      listo = true;
      clearTimeout(timer);
      pc.removeEventListener('icegatheringstatechange', alCambiar);
      resolve();
    };

    const alCambiar = () => {
      if (pc.iceGatheringState === 'complete') terminar();
    };

    // `terminar` cierra sobre `timer` antes de que se asigne: no hay TDZ
    // real porque solo se invoca de forma asíncrona, después de esta línea.
    const timer = setTimeout(terminar, timeoutMs);
    pc.addEventListener('icegatheringstatechange', alCambiar);
  });
}
