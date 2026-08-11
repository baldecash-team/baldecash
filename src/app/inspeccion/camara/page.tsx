'use client';

import { useEffect, useState } from 'react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { getDeviceSession, type DeviceSession } from '../_lib/deviceSession';
import { redeemPairingCode } from '../_lib/pairing';
import { usePresenceChannel } from '../_lib/usePresenceChannel';

function hayCodigoEnUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('p') !== null;
}

/**
 * Vista de kiosco de una cámara. En F1 solo se vincula, se conecta y muestra su
 * estado: la captura llega en F2. Sin navegación a propósito (spec §7).
 *
 * Vinculación: si la URL trae ?p={código}, se LIMPIA SINCRÓNICAMENTE al
 * entrar al efecto, antes de cualquier `await` — un código no debe
 * sobrevivir ni un instante del primer render: queda en Analytics (el
 * layout raíz manda `page_location` con el query string a GA/GTM), en el
 * historial, y sobrevive a un refresh si el canje todavía no terminó. Recién
 * después de limpiar se decide si se canjea.
 *
 * El código GANA sobre una sesión ya guardada: abrir una URL con `?p=` es
 * una acción deliberada de un humano parado frente al escáner —re-vincular,
 * cambiar de estación, reemplazar un token revocado. Es, hoy, el ÚNICO
 * camino de re-vinculación: `clearDeviceSession()` está exportada pero
 * nadie la llama, así que sin esto un dispositivo que necesita cambiar de
 * identidad solo se recupera borrando los datos del sitio a mano en Chrome.
 */
export default function CamaraPage() {
  // Lazy init: `getDeviceSession()` es síncrono (lee `localStorage`), así
  // que el estado arranca con el valor real desde el primer render en vez
  // de pasar por un efecto + microtask solo para copiar un valor que ya
  // estaba disponible. Mismo criterio para `vinculando`: si hay `?p=` en la
  // URL arranca en `true` (se está por canjear); si no, en `false` — no hay
  // nada que esperar.
  const [session, setSession] = useState<DeviceSession | null>(() => getDeviceSession());
  const [error, setError] = useState<string | null>(null);
  const [vinculando, setVinculando] = useState<boolean>(() => hayCodigoEnUrl());

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('p');
    if (!code) return;

    // Sincrónico, antes de cualquier await — ver doc-comment de arriba.
    window.history.replaceState({}, '', window.location.pathname);

    redeemPairingCode(code)
      .then((s) => setSession(s))
      .catch((e: Error) => setError(e.message))
      .finally(() => setVinculando(false));
  }, []);

  // `error: channelError` para no chocar con el `error` de vinculación
  // (código vencido/ya usado) declarado más arriba: son dos problemas
  // distintos y no deben pisarse el mensaje.
  const { connected, error: channelError } = usePresenceChannel(
    session?.stationId ?? null,
    session?.token ?? null
  );

  if (vinculando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-xl">Vinculando…</p>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-center text-white">
        <div>
          <p className="text-2xl font-semibold">Dispositivo no vinculado</p>
          <p className="mt-2 text-sm text-white/70">
            {error ?? 'Escaneá el QR que muestra el escáner de la estación.'}
          </p>
        </div>
      </main>
    );
  }

  // `missing_config` no es un problema de red — esperar no lo arregla, hace
  // falta setear las env vars de Pusher. Se distingue del texto genérico
  // "SIN CONEXIÓN" para que el operador no vaya a revisar la red del
  // teléfono cuando el problema real es un deploy sin configurar.
  const statusText = channelError
    ? channelError.reason === 'missing_config'
      ? 'FALTA CONFIGURACIÓN'
      : 'ERROR DE CONEXIÓN'
    : connected
      ? 'CONECTADA'
      : 'SIN CONEXIÓN';

  const dotColor = channelError
    ? channelError.reason === 'missing_config'
      ? TOKENS.tertiary
      : TOKENS.red
    : connected
      ? TOKENS.green
      : TOKENS.red;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
      <p className="text-sm uppercase tracking-widest text-white/60">
        {session.label ?? session.kind} · {session.stationId}
      </p>
      <p className="mt-4 text-5xl font-bold">{statusText}</p>
      <span
        className="mt-6 h-4 w-4 rounded-full"
        style={{ background: dotColor }}
        aria-hidden
      />
      {channelError && (
        <p className="mt-4 max-w-sm text-sm text-white/70">{channelError.message}</p>
      )}
    </main>
  );
}
