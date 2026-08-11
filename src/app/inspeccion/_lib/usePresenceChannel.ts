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
 * de un deploy sin las env vars de Pusher seteadas — el consumidor lo puede
 * distinguir de una desconexión real y mostrar algo accionable en vez de la
 * pantalla de error genérica de la app.
 */
export type PresenceChannelErrorReason = 'missing_config' | 'connection_failed';

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
  const [connected, setConnected] = useState(false);
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

    // Construcción exitosa: si un ciclo anterior de este mismo hook había
    // dejado un error seteado (config faltante / falla previa), se limpia acá.
    Promise.resolve().then(() => setError(null));

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

    channel.bind('pusher:subscription_succeeded', () => { setConnected(true); leer(); });
    channel.bind('pusher:member_added', leer);
    channel.bind('pusher:member_removed', leer);
    pusher.connection.bind('state_change', (s: { current: string }) =>
      setConnected(s.current === 'connected')
    );

    return () => {
      pusher.unsubscribe(`presence-inspection-${stationId}`);
      pusher.disconnect();
      setConnected(false);
    };
  }, [stationId, token]);

  return { members, connected, error };
}
