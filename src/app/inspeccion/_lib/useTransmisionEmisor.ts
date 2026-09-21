'use client';

import { useEffect, useRef, type RefObject } from 'react';
import {
  ICE_SERVERS,
  bindSenales,
  esperarIceCompleto,
  mandarSenal,
  type SenalChannel,
  type SenalPayload,
} from './senalizacion';

/**
 * Lado CÁMARA de la transmisión en vivo: responde las ofertas del
 * controlador colgándose del mismo track que está grabando.
 *
 * La conexión la inicia el escáner, no la cámara: mientras nadie mire, este
 * hook no abre ningún peer y el teléfono no gasta batería codificando para
 * nadie.
 *
 * REGLA INNEGOCIABLE: nada de acá puede tocar la grabación. Toda excepción
 * de WebRTC se traga con un log — la evidencia es el video que está
 * subiendo, y un preview no puede degradarla nunca.
 */

/** Techo del bitrate del preview. La grabación pide un orden de magnitud
 * más; esto es deliberadamente chico para que el segundo encode no le pelee
 * al primero. */
export const PREVIEW_BITRATE_MAX = 400_000;

/** Lado largo objetivo del preview, en píxeles. Lo que el visor tiene que
 * contestar es "¿se movió?", y eso no necesita resolución. */
export const PREVIEW_LADO_OBJETIVO = 480;

export interface UseTransmisionEmisorOpciones {
  /** El canal presence ya suscripto. `null` mientras no haya. */
  channel: SenalChannel | null;
  /** El `device_id` de ESTA cámara, para filtrar las señales. */
  deviceId: string | null;
  /** El device token, para poder contestar por REST. */
  token: string | null;
  /** El stream de `useKioskRecorder`. */
  streamRef: RefObject<MediaStream | null>;
}

/**
 * Limita lo que el sender manda, para que el segundo encode no le pelee al de
 * la grabación.
 *
 * EL PATRÓN IMPORTA, y no es una preferencia de estilo: se MUTA el objeto que
 * devuelve `getParameters()`, nunca se reemplaza el array `encodings`.
 * Reemplazarlo descarta la identidad del encoding y el `transactionId`, y
 * WebKit responde `InvalidModificationError: parameters are not valid`.
 *
 * Medido en un iPhone con iOS 18.7 / Safari 26.5 el 2026-09-21, sobre la
 * cámara real a 1920×1920@30:
 *   - reemplazando el array: `setParameters` LANZA y no se aplica NINGÚN
 *     límite — transmitía 960×960 a ~2,5 Mbps, seis veces el presupuesto.
 *   - mutando en el lugar: aceptado, y se aplican los dos — 480×480 a
 *     351 kbps.
 *
 * `degradationPreference` va en una llamada APARTE a propósito: de las tres
 * cosas es la única prescindible, y si un navegador la rechaza no puede
 * llevarse puestos el bitrate y la escala, que son los que protegen la
 * grabación. (Ese iPhone la aceptó; otros no tienen por qué.)
 */
async function limitarSender(sender: RTCRtpSender, track: MediaStreamTrack): Promise<void> {
  const parametros = sender.getParameters();
  if (!parametros.encodings?.length) parametros.encodings = [{}];
  parametros.encodings[0].maxBitrate = PREVIEW_BITRATE_MAX;
  parametros.encodings[0].scaleResolutionDownBy = escalaPara(track);
  await sender.setParameters(parametros);

  try {
    // Cast: `degradationPreference` existe en `RTCRtpSendParameters` pero las
    // versiones nuevas de lib.dom lo sacaron del tipo.
    const conPreferencia = sender.getParameters() as RTCRtpSendParameters & {
      degradationPreference?: string;
    };
    conPreferencia.degradationPreference = 'maintain-framerate';
    await sender.setParameters(conPreferencia);
  } catch {
    // Opcional: si el navegador no lo acepta, los límites de arriba quedan.
  }
}

/** Cuánto hay que achicar el track para dejarlo en `PREVIEW_LADO_OBJETIVO`.
 * Nunca menos de 1: agrandar no tiene sentido y el navegador lo rechaza. */
function escalaPara(track: MediaStreamTrack): number {
  const { width, height } = track.getSettings();
  const lado = Math.max(width ?? 0, height ?? 0);
  if (!lado) return 1;
  return Math.max(1, lado / PREVIEW_LADO_OBJETIVO);
}

export function useTransmisionEmisor({
  channel,
  deviceId,
  token,
  streamRef,
}: UseTransmisionEmisorOpciones): void {
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  useEffect(() => {
    if (!channel || !deviceId || !token) return undefined;

    const peers = peersRef.current;

    const cerrar = (destino: string) => {
      const pc = peers.get(destino);
      if (!pc) return;
      peers.delete(destino);
      try {
        pc.close();
      } catch {
        // Ya cerrada: no hay nada que hacer y no puede propagar.
      }
    };

    const responder = async (payload: SenalPayload) => {
      const stream = streamRef.current;
      const [track] = stream?.getVideoTracks() ?? [];
      // Sin cámara armada no hay nada que transmitir. El escáner lo va a ver
      // como "Sin transmisión" y va a reintentar; el semáforo del pre-vuelo
      // ya explica por qué esta cámara no sirve.
      if (!track || !stream) return;

      // Una oferta nueva para el mismo destino reemplaza la negociación
      // anterior: es el escáner reintentando.
      cerrar(payload.origen_device_id);

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peers.set(payload.origen_device_id, pc);

      pc.addEventListener('iceconnectionstatechange', () => {
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          cerrar(payload.origen_device_id);
        }
      });

      const sender = pc.addTrack(track, stream);
      await limitarSender(sender, track);

      await pc.setRemoteDescription({ type: 'offer', sdp: payload.sdp } as RTCSessionDescriptionInit);
      await pc.setLocalDescription(await pc.createAnswer());
      await esperarIceCompleto(pc);

      // El escáner pudo haberse ido mientras juntábamos candidatos.
      if (peers.get(payload.origen_device_id) !== pc) return;
      await mandarSenal(token, payload.origen_device_id, 'answer', pc.localDescription?.sdp ?? '');
    };

    const alRecibir = (payload: SenalPayload) => {
      if (payload.tipo === 'bye') {
        cerrar(payload.origen_device_id);
        return;
      }
      if (payload.tipo !== 'offer') return;
      // Acá se traga todo: ver la REGLA INNEGOCIABLE del doc-comment.
      void responder(payload).catch((e) => {
        console.warn('[transmision] no se pudo responder la oferta', e);
        cerrar(payload.origen_device_id);
      });
    };

    const desbindear = bindSenales(channel, deviceId, alRecibir);

    /**
     * El corte que de verdad cubre "el escáner se fue sin avisar" (recarga,
     * pestaña cerrada, kiosco apagado). No depende de que alcance a mandar
     * un `bye` ni de esperar a que ICE se caiga sola: si el controlador ya
     * no está en el canal, no hay nadie mirando.
     */
    const alIrse = (data: unknown) => {
      const miembro = data as { id?: string } | null;
      if (miembro?.id) cerrar(miembro.id);
    };
    channel.bind('pusher:member_removed', alIrse);

    return () => {
      desbindear();
      channel.unbind?.('pusher:member_removed', alIrse);
      [...peers.keys()].forEach(cerrar);
    };
  }, [channel, deviceId, token, streamRef]);
}
