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
    /**
     * Lo que hay que desenganchar cuando un peer se cierra — hoy, el
     * listener de `ended` del track. Va indexado por PEER y no por destino
     * porque puede haber un peer viejo muriéndose mientras el nuevo del
     * mismo escáner ya está registrado; un `WeakMap` se limpia solo cuando
     * el peer muerto deja de estar referenciado.
     */
    const limpiezas = new WeakMap<RTCPeerConnection, () => void>();

    /**
     * Cierra el peer de `destino`.
     *
     * `esperado` no es un lujo: cerrar por CLAVE cuando ya hay otra
     * negociación en curso mata la que está sana. La secuencia medida —
     * llega la oferta 1, `responder` crea pc1 y se suspende en
     * `await limitarSender`; llega la oferta 2 (el escáner reintentando),
     * que cierra pc1 y registra pc2; pc1 reanuda, su `setRemoteDescription`
     * tira `InvalidStateError` porque su peer ya está cerrado, y el manejo
     * del error, si cerrara por clave, se llevaría puesto a pc2. Resultado:
     * los dos peers cerrados y ninguna answer mandada, con el escáner
     * convencido de que la oferta salió bien. Quien cierra POR IDENTIDAD
     * (el catch, el handler de ICE, el `ended` del track) pasa `esperado`;
     * quien cierra por decisión del otro lado (`bye`, `member_removed`) no,
     * porque ahí la orden es para el peer que haya.
     */
    const cerrar = (destino: string, esperado?: RTCPeerConnection) => {
      const pc = peers.get(destino);
      if (!pc) return;
      if (esperado && pc !== esperado) return;
      peers.delete(destino);
      limpiezas.get(pc)?.();
      limpiezas.delete(pc);
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

      const destino = payload.origen_device_id;
      // Una oferta nueva para el mismo destino reemplaza la negociación
      // anterior: es el escáner reintentando.
      cerrar(destino);

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peers.set(destino, pc);

      try {
        pc.addEventListener('iceconnectionstatechange', () => {
          if (pc.iceConnectionState !== 'failed' && pc.iceConnectionState !== 'disconnected') return;
          cerrar(destino, pc);
        });

        /**
         * El rearme de la cámara (`useKioskRecorder.armar()`) detiene los
         * tracks viejos. Si no hiciéramos nada, el peer seguiría abierto con
         * un sender cuyo track está muerto: ICE NO se cae, así que el
         * escáner conserva `estado: 'viendo'` y muestra el último frame,
         * congelado, por tiempo indefinido. Un monitor que muestra imagen
         * vieja como si fuera en vivo es peor que uno que dice "Sin
         * transmisión" — es el semáforo que miente en verde del §7 del spec
         * original. Así que se cierra y se avisa, y el escáner cae a "Sin
         * transmisión" y reintenta contra la cámara ya rearmada.
         */
        const alTerminarTrack = () => {
          if (peers.get(destino) !== pc) return;
          cerrar(destino, pc);
          void mandarSenal(token, destino, 'bye');
        };
        track.addEventListener('ended', alTerminarTrack);
        limpiezas.set(pc, () => track.removeEventListener('ended', alTerminarTrack));

        const sender = pc.addTrack(track, stream);
        await limitarSender(sender, track);

        await pc.setRemoteDescription({
          type: 'offer',
          sdp: payload.sdp,
        } as RTCSessionDescriptionInit);
        await pc.setLocalDescription(await pc.createAnswer());
        await esperarIceCompleto(pc);

        // El escáner pudo haberse ido mientras juntábamos candidatos.
        if (peers.get(destino) !== pc) return;
        await mandarSenal(token, destino, 'answer', pc.localDescription?.sdp ?? '');
      } catch (e) {
        // REGLA INNEGOCIABLE: toda excepción de WebRTC muere acá. Y el
        // cierre es del peer PROPIO, no del que esté bajo la clave.
        console.warn('[transmision] no se pudo responder la oferta', e);
        cerrar(destino, pc);
      }
    };

    const alRecibir = (payload: SenalPayload) => {
      if (payload.tipo === 'bye') {
        cerrar(payload.origen_device_id);
        return;
      }
      if (payload.tipo !== 'offer') return;
      // Red de último recurso: `responder` ya se traga lo suyo, pero nada
      // que salga de acá puede llegar a la grabación.
      void responder(payload).catch((e) => {
        console.warn('[transmision] no se pudo responder la oferta', e);
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
      // Arrow y no `forEach(cerrar)`: `forEach` pasa el índice como segundo
      // argumento, que caería en `esperado` y haría que no cerrara nada.
      [...peers.keys()].forEach((destino) => cerrar(destino));
    };
  }, [channel, deviceId, token, streamRef]);
}
