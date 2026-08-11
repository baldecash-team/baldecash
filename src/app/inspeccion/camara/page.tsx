'use client';

import { useEffect, useState } from 'react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { getDeviceSession, type DeviceSession } from '../_lib/deviceSession';
import { redeemPairingCode } from '../_lib/pairing';
import { usePresenceChannel } from '../_lib/usePresenceChannel';

/**
 * Vista de kiosco de una cámara. En F1 solo se vincula, se conecta y muestra su
 * estado: la captura llega en F2. Sin navegación a propósito (spec §7).
 *
 * Vinculación: si la URL trae ?p={código}, lo canjea y LIMPIA el parámetro para
 * que el código no quede en el historial ni en el Referer.
 */
export default function CamaraPage() {
  const [session, setSession] = useState<DeviceSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vinculando, setVinculando] = useState(true);

  useEffect(() => {
    const existente = getDeviceSession();
    if (existente) {
      // Deferido a un microtask (igual que la rama de redeemPairingCode más
      // abajo) para no llamar setState de forma síncrona en el cuerpo del
      // efecto: react-hooks/set-state-in-effect lo marca como error.
      Promise.resolve().then(() => {
        setSession(existente);
        setVinculando(false);
      });
      return;
    }

    const code = new URLSearchParams(window.location.search).get('p');
    if (!code) {
      Promise.resolve().then(() => setVinculando(false));
      return;
    }

    redeemPairingCode(code)
      .then((s) => setSession(s))
      .catch((e: Error) => setError(e.message))
      .finally(() => {
        // El código no debe quedar en el historial ni en el Referer —
        // en NINGÚN camino, éxito o error: un canje fallido (vencido, ya
        // usado) no hace que el código sea menos sensible.
        window.history.replaceState({}, '', window.location.pathname);
        setVinculando(false);
      });
  }, []);

  const { connected } = usePresenceChannel(
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <p className="text-sm uppercase tracking-widest text-white/60">
        {session.label ?? session.kind} · {session.stationId}
      </p>
      <p className="mt-4 text-5xl font-bold">
        {connected ? 'CONECTADA' : 'SIN CONEXIÓN'}
      </p>
      <span
        className="mt-6 h-4 w-4 rounded-full"
        style={{ background: connected ? TOKENS.green : TOKENS.red }}
        aria-hidden
      />
    </main>
  );
}
