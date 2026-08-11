'use client';

import { useEffect, useState } from 'react';
import Pusher, { type PresenceChannel } from 'pusher-js';

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
 * Suscribe al canal presence de la estación y expone sus miembros en vivo.
 *
 * member_added / member_removed son exactamente lo que alimenta el pre-vuelo
 * del escáner: por eso el canal es presence y no private. No asume cuántos
 * dispositivos hay — una estación puede operar con una sola cámara — así que
 * `members` sale tal cual del canal, sin cantidad esperada hardcodeada.
 */
export function usePresenceChannel(stationId: string | null, token: string | null) {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!stationId || !token) return undefined;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1'}/pusher/auth`,
      auth: { headers: { 'X-Device-Token': token } },
    });

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

  return { members, connected };
}
