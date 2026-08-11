'use client';

import { useEffect, useState } from 'react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { clearDeviceSession, getDeviceSession, type DeviceSession } from '../_lib/deviceSession';
import { redeemPairingCode } from '../_lib/pairing';
import { usePresenceChannel } from '../_lib/usePresenceChannel';
import { useWakeLock } from '../_lib/useWakeLock';

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
 *
 * Este componente se monta SOLO en el cliente (`page.tsx` lo carga con
 * `next/dynamic(..., { ssr: false })`) — ver el doc-comment de `page.tsx`
 * para el porqué. Gracias a eso, el `useState(() => getDeviceSession())`
 * de abajo es seguro: no hay HTML de servidor con el que discrepar.
 */
export default function CamaraPageContent() {
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

  // La sesión guardada puede pertenecer al otro rol (ver doc-comment de
  // arriba de `kindMismatch` más abajo): en ese caso no hay canal de
  // presencia de cámara que conectar — se pasa null a propósito, no solo
  // para no renderizar el kiosco sino para no autenticar contra Pusher con
  // un token que no es el de esta vista.
  const kindMismatch = session != null && session.kind !== 'camara';

  // Activo mientras el dispositivo esté vinculado como cámara — deliberadamente
  // independiente de `connected` (el canal de presencia, más abajo): la
  // pantalla no debe apagarse solo porque Pusher tarda en reconectar. La
  // captura en sí (F2 Task 3 / F3) es la que de verdad necesita la pantalla
  // viva, y arranca en cuanto el dispositivo está vinculado, no cuando el
  // canal conecta.
  useWakeLock(session != null && !kindMismatch);

  // `error: channelError` para no chocar con el `error` de vinculación
  // (código vencido/ya usado) declarado más arriba: son dos problemas
  // distintos y no deben pisarse el mensaje.
  const { connected, error: channelError } = usePresenceChannel(
    kindMismatch ? null : (session?.stationId ?? null),
    kindMismatch ? null : (session?.token ?? null)
  );

  if (vinculando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-xl">Vinculando…</p>
      </main>
    );
  }

  // Un mismo navegador solo puede estar vinculado a UN rol a la vez (ver
  // doc-comment de `deviceSession.ts`): `_upsert_device` en el backend
  // busca por `id` y sobrescribe `kind`/`token_hash`, así que vincularse acá
  // como escáner mataría esa fila de cámara sin que nadie se entere, salvo
  // por el semáforo que se apaga en la estación. Si la sesión guardada es
  // de otro rol, no se monta el kiosco (nunca llegaría a conectar nada
  // válido) — se explica qué pasa y se ofrece el único camino de
  // re-vinculación que existe hoy: `clearDeviceSession()`.
  if (kindMismatch && session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-center text-white">
        <div>
          <p className="text-2xl font-semibold">Dispositivo vinculado con otro rol</p>
          <p className="mt-2 text-sm text-white/70">
            Este dispositivo está vinculado como escáner de la estación {session.stationId}.
            Para usarlo como cámara hay que volver a vincularlo, y eso lo va a desvincular
            como escáner.
          </p>
          <button
            type="button"
            onClick={() => {
              clearDeviceSession();
              setSession(null);
            }}
            className="mt-6 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white"
          >
            Re-vincular este dispositivo
          </button>
        </div>
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
