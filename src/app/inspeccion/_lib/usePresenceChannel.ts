'use client';

import { useEffect, useState } from 'react';
import Pusher, { type PresenceChannel } from 'pusher-js';
import { API_BASE_URL } from './pairing';

export interface PresenceMember {
  deviceId: string;
  kind: string;
  label: string | null;
}

interface PusherMemberInfo {
  kind?: string;
  label?: string | null;
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

    const leer = () => {
      const out: PresenceMember[] = [];
      channel.members.each((m: { id: string; info?: PusherMemberInfo }) => {
        out.push({
          deviceId: m.id,
          kind: m.info?.kind ?? '',
          label: m.info?.label ?? null,
        });
      });
      setMembers(out);
    };

    channel.bind('pusher:subscription_succeeded', () => {
      setSubscribed(true);
      setError(null);
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
    };
  }, [stationId, token]);

  const connected = subscribed && socketConnected;

  return { members, connected, error };
}
