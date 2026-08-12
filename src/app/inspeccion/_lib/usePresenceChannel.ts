'use client';

import { useEffect, useState } from 'react';
import Pusher, { type PresenceChannel } from 'pusher-js';
import { API_BASE_URL } from './pairing';

/**
 * Estados de captura que una cámara puede reportar por el canal (spec §7,
 * review de F2 — ver doc-comment de `CLIENT_ESTADO_CAPTURA_EVENT` más abajo).
 * Mismos valores que `EstadoCaptura` de `useKioskRecorder.ts`, pero definidos
 * acá aparte y no importados de ahí: este módulo es infraestructura de
 * presencia genérica que usan tanto el escáner como la cámara, y no debe
 * depender de un hook específico de captura.
 */
export type PresenceCaptureState = 'inactiva' | 'armando' | 'armada' | 'grabando' | 'caida';

export interface PresenceMember {
  deviceId: string;
  kind: string;
  label: string | null;
  /**
   * `null` = todavía no llegó ningún reporte de esta cámara en esta
   * suscripción (recién conectada, o el emisor no es una cámara). Antes de
   * F2 "presente en el canal" equivalía a "sirve"; ahora una cámara puede
   * estar conectada y sin armar, o caída, y el semáforo NO debe mentir en
   * verde en esos casos (ver `estaListo` en `PreVuelo.tsx`) — `null` cuenta
   * como "no sirve", igual que `'inactiva'`/`'caida'`/`'armando'`.
   */
  captureState: PresenceCaptureState | null;
}

interface PusherMemberInfo {
  kind?: string;
  label?: string | null;
}

/**
 * Evento del BACKEND (no de cliente) por el que se avisa el estado de
 * captura de una cámara a los demás miembros del canal presence (spec §7 /
 * review de F2).
 *
 * Historia: la primera versión de esto usaba un evento de CLIENTE
 * (`client-*`), que la cámara disparaba directo al canal sin pasar por la
 * API. Se descartó por tres razones (revisión posterior):
 *
 * 1. Cambiaba un modo de falla por otro: si "Enable client events" no está
 *    prendido en el dashboard de Pusher (dependencia invisible, sin
 *    evidencia de que lo esté), el semáforo queda permanentemente rojo y la
 *    estación no arranca NUNCA — sin ningún error visible que lo explique.
 * 2. Rompía el principio del spec §6: "comandos bajan por Pusher,
 *    confirmaciones suben por REST; Aurora es la fuente de verdad y Pusher
 *    es solo notificación". Un evento de cliente es la cámara publicando
 *    directo al canal sin que el servidor se entere — exactamente el patrón
 *    que el diseño evita en todo lo demás.
 * 3. Un escáner que recarga (o que no estaba conectado en el momento del
 *    reporte) nunca se enteraba: el estado solo vivía en mensajes que ya
 *    pasaron por el canal.
 *
 * La versión actual: la cámara reporta por REST
 * (`POST /inspections/devices/estado`, con su device token) al armarse, al
 * caer y al rearmarse — no en cada cambio trivial. El backend (`station.py`,
 * ws2) persiste el reporte y lo REEMITE accá, al canal — mismo patrón que ya
 * usa para `recording.started`. Server-side también expone el último estado
 * en `GET /stations/{id}/state` (`devices[].capture_state`), así que un
 * escáner que recarga lo recupera por REST sin depender de haber estado
 * conectado al canal — ver el merge en `EscanerPageContent.tsx`.
 */
export const DEVICE_CAPTURE_STATE_EVENT = 'device.capture_state';

interface DeviceCaptureStatePayload {
  device_id: string;
  estado: string;
}

/**
 * Motivo por el que el canal no está disponible. `missing_config` es el caso
 * de un deploy sin las env vars de Pusher seteadas; `auth_failed` es una
 * suscripción rechazada (`/pusher/auth` respondió 401/403/503 — token
 * revocado, estación ajena, o `INSPECTION_ENABLED=false`). El consumidor lo
 * puede distinguir de una desconexión real y mostrar algo accionable en vez
 * de la pantalla de error genérica de la app.
 */
export type PresenceChannelErrorReason = 'missing_config' | 'connection_failed' | 'auth_failed';

export interface PresenceChannelError {
  reason: PresenceChannelErrorReason;
  message: string;
}

/**
 * Suscribe al canal presence de la estación y expone sus miembros en vivo.
 *
 * member_added / member_removed son exactamente lo que alimenta el pre-vuelo
 * del escáner: por eso el canal es presence y no private. No asume cuántos
 * dispositivos hay — una estación puede operar con una sola cámara — así que
 * `members` sale tal cual del canal, sin cantidad esperada hardcodeada.
 *
 * El constructor de `pusher-js` lanza sincrónicamente si falta la app key
 * (`NEXT_PUBLIC_PUSHER_KEY`) — sin las guardas de acá ese throw ocurre dentro
 * del efecto y React lo propaga hasta el error boundary de la app: en un
 * kiosco, un dispositivo que "parece roto" en vez de una vista con un
 * mensaje claro de configuración faltante.
 */
export function usePresenceChannel(stationId: string | null, token: string | null) {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  // `connected` (el valor devuelto) se deriva de estos dos, más abajo: un
  // socket conectado con el canal sin autorizar NO es "conectado" para
  // quien consume el hook (ver `pusher:subscription_error` más abajo).
  const [subscribed, setSubscribed] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState<PresenceChannelError | null>(null);
  // El canal crudo, para quien necesite bindear sus propios eventos de
  // aplicación encima (F3, `useComandos.ts`: `cmd.start`/`cmd.stop`/
  // `cmd.abort`). Se expone recién en `pusher:subscription_succeeded` —no
  // apenas se crea, más abajo— para no violar `react-hooks/set-state-in-effect`
  // con un `setState` síncrono en el cuerpo del efecto (mismo motivo que ya
  // documentan `missing_config`/`connection_failed` un poco más abajo).
  const [channel, setChannel] = useState<PresenceChannel | null>(null);

  useEffect(() => {
    if (!stationId || !token) return undefined;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) {
      // Deferido a un microtask por la misma razón que en camara/page.tsx y
      // escaner/page.tsx: react-hooks/set-state-in-effect no permite
      // setState síncrono en el cuerpo del efecto. `connected` ya arranca en
      // `false` acá, así que no hace falta re-setearlo.
      Promise.resolve().then(() => {
        setError({
          reason: 'missing_config',
          message: 'Falta configuración de tiempo real (NEXT_PUBLIC_PUSHER_KEY / NEXT_PUBLIC_PUSHER_CLUSTER).',
        });
      });
      return undefined;
    }

    let pusher: Pusher;
    try {
      pusher = new Pusher(key, {
        cluster,
        authEndpoint: `${API_BASE_URL}/pusher/auth`,
        auth: { headers: { 'X-Device-Token': token } },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo iniciar la conexión en tiempo real.';
      Promise.resolve().then(() => {
        setError({ reason: 'connection_failed', message });
      });
      return undefined;
    }

    // Ya no hace falta limpiar acá el `error` de un ciclo anterior (config
    // faltante / falla previa): `pusher:subscription_succeeded` de abajo ya
    // lo limpia en cuanto hay una suscripción de verdad confirmada, que es
    // una señal más fuerte que "el constructor no tiró". Menos un
    // `Promise.resolve().then(...)` de sobra.
    const channel = pusher.subscribe(`presence-inspection-${stationId}`) as PresenceChannel;

    // Estado de captura conocido por dispositivo, alimentado por
    // `DEVICE_CAPTURE_STATE_EVENT` (emitido por el backend, ver su
    // doc-comment). Vive en el closure de ESTE efecto, no en un ref a nivel
    // de hook: una resuscripción completa (reconexión) tiene que arrancar en
    // blanco — la vida útil de este Map es la de ESTA suscripción, no la del
    // componente. `GET /state` (consumido por quien llama al hook, no acá:
    // ver `EscanerPageContent.tsx`) es quien resuelve "reconectar sin haber
    // visto el evento" — este Map solo refleja lo que pasó por el canal
    // mientras estuvo vivo.
    const captureStates = new Map<string, PresenceCaptureState>();

    const construirMembers = (): PresenceMember[] => {
      const out: PresenceMember[] = [];
      channel.members.each((m: { id: string; info?: PusherMemberInfo }) => {
        out.push({
          deviceId: m.id,
          kind: m.info?.kind ?? '',
          label: m.info?.label ?? null,
          captureState: captureStates.get(m.id) ?? null,
        });
      });
      return out;
    };

    const leer = () => setMembers(construirMembers());

    channel.bind(DEVICE_CAPTURE_STATE_EVENT, (data: unknown) => {
      const payload = data as DeviceCaptureStatePayload | null;
      if (!payload?.device_id || !payload?.estado) return;
      captureStates.set(payload.device_id, payload.estado as PresenceCaptureState);
      // No hace falta esperar a `member_added`/`member_removed`: el reporte
      // de estado en sí es la señal de que hay algo nuevo para mostrar.
      setMembers(construirMembers());
    });

    channel.bind('pusher:subscription_succeeded', () => {
      setSubscribed(true);
      setError(null);
      setChannel(channel);
      leer();
    });
    // Sin esto, `connected` dependía solo del socket: si `/pusher/auth`
    // responde 401 (token revocado), 403 (estación ajena) o 503
    // (`INSPECTION_ENABLED=false`, el default hoy), el WebSocket igual
    // conecta y el semáforo del pre-vuelo se ponía verde con el canal sin
    // autorizar — en F1 esa pantalla ES el entregable (spec §7), un
    // semáforo que miente en verde es peor que no tener semáforo.
    // `pusher-js` no reintenta la suscripción solo tras un
    // `subscription_error`: el estado queda así hasta recargar la página.
    channel.bind('pusher:subscription_error', () => {
      setSubscribed(false);
      // Un canal sin autorizar no es un canal usable — sin esto,
      // `useComandos` quedaría bindeado a un canal que nunca va a recibir
      // nada (el backend rechazó la suscripción).
      setChannel(null);
      setError({
        reason: 'auth_failed',
        message: 'No se pudo autorizar el canal de la estación (token inválido, estación ajena, o módulo deshabilitado). Recargá la página.',
      });
    });
    channel.bind('pusher:member_added', leer);
    channel.bind('pusher:member_removed', leer);
    pusher.connection.bind('state_change', (s: { current: string }) =>
      setSocketConnected(s.current === 'connected')
    );

    return () => {
      pusher.unsubscribe(`presence-inspection-${stationId}`);
      pusher.disconnect();
      setSubscribed(false);
      setSocketConnected(false);
      setChannel(null);
    };
  }, [stationId, token]);

  const connected = subscribed && socketConnected;

  return { members, connected, error, channel };
}
