'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { clearDeviceSession, getDeviceSession, type DeviceSession } from '../_lib/deviceSession';
import { API_BASE_URL, redeemPairingCode } from '../_lib/pairing';
import { usePresenceChannel } from '../_lib/usePresenceChannel';
import { useKioskRecorder, type EstadoCaptura } from '../_lib/useKioskRecorder';
import { useWakeLock } from '../_lib/useWakeLock';
import { useServerClock } from '../_lib/useServerClock';
import { useComandos, type ComandoStartPayload } from '../_lib/useComandos';

/**
 * Confirma al backend que ESTA cámara recibió un comando (spec §6.1 regla 1:
 * sin ack, la API nunca asume que se grabó). Se manda apenas llega
 * `cmd.start`, ANTES de programar la grabación — el escáner espera esta
 * confirmación para saber que el mensaje llegó, no que ya está grabando
 * (plan F3 Task 4, Step 4).
 *
 * Sin reintento a propósito: si falla por red, para cuando uno resolviera el
 * escáner ya habría decidido por el timeout de 1,5s (spec §10) — no hay nada
 * más accionable acá que dejar que ese camino haga su trabajo.
 */
async function ackComando(inspectionId: number, seq: number, token: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/inspections/${inspectionId}/ack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Token': token },
      body: JSON.stringify({ seq }),
    });
  } catch {
    // Ver doc-comment de arriba: nada accionable acá.
  }
}

/**
 * Reporta el estado de captura al backend (F3 Task 5, review de F2 —
 * rediseño post-revisión: REST + reemisión desde el servidor, no un evento
 * de cliente de Pusher — ver el doc-comment de `DEVICE_CAPTURE_STATE_EVENT`
 * en `usePresenceChannel.ts` para el porqué). El backend persiste el reporte
 * y lo reemite al canal presence para que el pre-vuelo del escáner actualice
 * el semáforo en vivo, y lo expone en `GET /stations/{id}/state` para quien
 * recién se conecta.
 *
 * Fire-and-forget, mismo criterio que `ackComando`: no hay nada más
 * accionable acá si falla por red — el próximo reporte (o el resync por
 * `/state`) lo corrige solo.
 */
async function reportarEstadoCaptura(estado: EstadoCaptura, token: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/inspections/devices/estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Token': token },
      body: JSON.stringify({ estado }),
    });
  } catch {
    // Ver doc-comment de arriba: nada accionable acá.
  }
}

function hayCodigoEnUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('p') !== null;
}

/**
 * Gate de los botones temporales de prueba (ver doc-comment de
 * `CapturaEstado`, más abajo). Sin `?debug=1` explícito en la URL, no
 * existen: un operador de la estación mirando el kiosco normal no tiene
 * forma de tocarlos por accidente y dejar la cámara grabando fuera de una
 * inspección. Solo alguien que sabe que tiene que agregar el parámetro
 * (quien hace la verificación en hardware de la Task 4) los ve.
 */
function hayDebugEnUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debug') === '1';
}

/**
 * Vista de kiosco de una cámara. F1 la vinculaba y mostraba el estado del
 * canal; F2 (acá) suma la captura local: armar la cámara, mostrar el
 * preview y reflejar `EstadoCaptura` (`useKioskRecorder.ts`). Sin
 * navegación a propósito (spec §7).
 *
 * Captura y canal son DOS problemas distintos con dos soluciones distintas
 * (spec, plan F2 Task 3): una cámara puede estar `ARMADA` y sin conexión al
 * canal (el operador arma con el teléfono en la mano, lejos del router), o
 * conectada al canal y sin armar (recién vinculada, nadie tocó el botón
 * todavía). Por eso el render de abajo los muestra en dos bloques separados
 * — captura al centro, en tipografía grande; canal abajo, chico — y ninguno
 * de los dos texto se arma concatenando o pisando al otro.
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
  // Mismo criterio de lazy init que los de arriba: `?debug=1` es síncrono,
  // no cambia durante la vida del componente, no hace falta un efecto.
  const [debug] = useState<boolean>(() => hayDebugEnUrl());

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
  // captura en sí (`useKioskRecorder`, justo abajo) es la que de verdad
  // necesita la pantalla viva, y arranca en cuanto el dispositivo está
  // vinculado, no cuando el canal conecta ni cuando la cámara está armada.
  useWakeLock(session != null && !kindMismatch);

  // Se llama sin condicionar a `kindMismatch`/`session` — reglas de hooks —
  // pero `armar()` es un gesto humano: nunca se dispara sola. Mientras la
  // vista no llegue al kiosco real (vinculando, kind equivocado, sin sesión)
  // esto queda simplemente sin usar.
  //
  // Desestructurado acá (no `const captura = useKioskRecorder()`) por
  // `react-hooks/refs`: el lint no permite pasar `videoRef` río abajo
  // metido dentro de un objeto (`captura.videoRef` en el `ref={}` del
  // `<video>`, o `captura` entero como prop de `CapturaEstado`) — solo lo
  // acepta como variable local plana, igual que un `useRef()` directo. Por
  // eso `videoRef` se usa suelto acá y `CapturaEstado` recibe el resto de
  // las funciones/estado sin él.
  const { estado: capturaEstado, error: capturaError, videoRef, armar, grabar, detener } =
    useKioskRecorder();

  // `error: channelError` para no chocar con el `error` de vinculación
  // (código vencido/ya usado) declarado más arriba: son dos problemas
  // distintos y no deben pisarse el mensaje.
  const { connected, error: channelError, channel } = usePresenceChannel(
    kindMismatch ? null : (session?.stationId ?? null),
    kindMismatch ? null : (session?.token ?? null)
  );

  // Review de F2 (F3 Task 5, rediseño post-revisión): reporta el estado de
  // captura al backend para que el pre-vuelo del escáner (`estaListo` en
  // `PreVuelo.tsx`) no confunda "conectada al canal" con "puede grabar" — ver
  // el doc-comment de `DEVICE_CAPTURE_STATE_EVENT` en `usePresenceChannel.ts`
  // sobre por qué es REST + reemisión del servidor y no un evento de
  // cliente. Deliberadamente INDEPENDIENTE de `channel`/`connected`: es un
  // POST normal, funciona aunque el canal de Pusher esté caído (el reporte
  // igual queda en el backend, disponible via `/state`, aunque la
  // reemisión en vivo al canal en ese momento no llegue a nadie).
  //
  // Solo en `armada`/`caida` — "al armarse, al caer, y al rearmarse", NO en
  // cada cambio trivial (`inactiva`/`armando`/`grabando` no reportan; un
  // rearme ya cae en "armada" porque `armar()` es la misma función que arma
  // por primera vez).
  useEffect(() => {
    if (!session) return;
    if (capturaEstado !== 'armada' && capturaEstado !== 'caida') return;
    void reportarEstadoCaptura(capturaEstado, session.token);
  }, [session, capturaEstado]);

  // F3: la cámara obedece comandos remotos (spec §6). `offsetMs` traduce el
  // `start_at` absoluto del servidor a un instante local — ver doc-comment
  // de `useServerClock.ts`.
  const { offsetMs } = useServerClock();

  // El timer del PRÓXIMO arranque programado. Un ref, no estado: no hace
  // falta re-renderizar por esto, y `manejarStart` necesita poder cancelar
  // uno anterior si por lo que sea llegara un `cmd.start` nuevo antes de que
  // el primero disparara (no debería pasar — una inspección emite un solo
  // `cmd.start` — pero cancelar el viejo es gratis y evita dos `grabar()`
  // programados a la vez si alguna vez pasara).
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const manejarStart = useCallback(
    (payload: ComandoStartPayload) => {
      if (!session) return;
      // El ack sale YA, antes de programar nada — ver doc-comment de
      // `ackComando` arriba.
      void ackComando(payload.inspection_id, payload.seq, session.token);

      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      // Arranque por reloj absoluto (spec §6.1 regla 2): se programa para el
      // instante `start_at` CORREGIDO POR EL OFFSET, no para "ahora". Así
      // todas las cámaras de la estación arrancan juntas aunque el mensaje
      // de Pusher les llegue con latencias distintas. `Math.max(0, …)`
      // porque si el offset+red hicieron que el instante ya haya pasado
      // (mensaje muy tardío), lo mejor que se puede hacer es arrancar ya.
      const delayMs = payload.start_at - offsetMs - Date.now();
      startTimerRef.current = setTimeout(() => {
        grabar();
      }, Math.max(0, delayMs));
    },
    [session, offsetMs, grabar]
  );

  const manejarStop = useCallback(() => {
    detener().catch(() => {});
  }, [detener]);

  const manejarAbort = useCallback(() => {
    // La transición de la inspección a `failed` la decide el servidor
    // (CLAUDE.md / spec: "los dispositivos reportan, nunca deciden") — acá
    // solo se corta la captura local, igual que con `cmd.stop`.
    detener().catch(() => {});
  }, [detener]);

  useComandos(channel, { onStart: manejarStart, onStop: manejarStop, onAbort: manejarAbort });

  // Timer del arranque programado: se cancela al desmontar para no llamar
  // `grabar()` sobre un hook que ya se fue (mismo espíritu que el I6 de
  // `useKioskRecorder.ts`, aplicado acá del lado del timer, no del recorder).
  useEffect(() => {
    return () => {
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
    };
  }, []);

  // Al (re)conectar: Pusher no garantiza entrega (spec §6.1 regla 3), así
  // que una cámara que se cayó pudo perderse un comando mientras estaba sin
  // canal. Se resincroniza contra `/state` — Aurora, la fuente de verdad —
  // en cuanto el canal vuelve a confirmar la suscripción, incluida la
  // primera vez. `yaConectadaRef` detecta el FLANCO (false→true): sin él,
  // cualquier re-render con `connected=true` volvería a pegarle al backend.
  const yaConectadaRef = useRef(false);
  useEffect(() => {
    if (!session || kindMismatch) return;
    if (connected && !yaConectadaRef.current) {
      fetch(`${API_BASE_URL}/inspections/stations/${session.stationId}/state`, {
        headers: { 'X-Device-Token': session.token },
      }).catch(() => {});
    }
    yaConectadaRef.current = connected;
  }, [connected, session, kindMismatch]);

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
    <main className="relative flex min-h-screen flex-col bg-black text-white">
      {/* Preview a pantalla completa: sirve para encuadrar el equipo (spec,
          plan F2 Task 3). Montado SIEMPRE que se llega a este branch, sin
          condicionar al estado de captura — `armar()` escribe
          `videoRef.current.srcObject` de forma síncrona apenas resuelve
          `getUserMedia`, antes de que el estado pase a "armada"; si el
          <video> recién se montara en ese momento, `videoRef.current` sería
          null cuando `armar()` lo necesita y el preview nunca aparecería. */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Scrim para que el texto sea legible sobre cualquier escena de fondo. */}
      <div className="absolute inset-0 bg-black/50" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col items-center justify-between p-6 text-center">
        {/* Etiqueta de la cámara: qué cámara es esta cuando hay varias en la
            misma sala (techo, pared, ...) — spec, plan F2 Task 3. */}
        <p className="mt-2 text-sm uppercase tracking-widest text-white/80">
          {session.label ?? session.kind} · {session.stationId}
        </p>

        {/* Estado de CAPTURA — independiente del canal, tipografía grande
            legible a varios metros de la pared. */}
        <div className="flex flex-col items-center gap-6">
          <CapturaEstado
            estado={capturaEstado}
            error={capturaError}
            armar={armar}
            grabar={grabar}
            detener={detener}
            debug={debug}
          />
        </div>

        {/* Estado del CANAL — deliberadamente en un bloque aparte, más chico,
            para que el operador nunca confunda "no puedo grabar" con "no
            está conectado a la estación": son dos problemas y dos arreglos
            distintos (spec, plan F2 Task 3). */}
        <div className="mb-2 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: dotColor }}
              aria-hidden
            />
            <p className="text-sm uppercase tracking-widest text-white/70">Canal: {statusText}</p>
          </div>
          {channelError && (
            <p className="max-w-sm text-xs text-white/60">{channelError.message}</p>
          )}
        </div>
      </div>
    </main>
  );
}

/**
 * Bloque central de estado de CAPTURA. El único gesto humano de todo el
 * flujo es "Armar cámara" (spec, plan F2 Task 3): grande, y explica qué va a
 * pasar (pide permiso de cámara) porque después de tocarlo la cámara queda
 * armada durante horas sin que nadie la vuelva a tocar.
 *
 * Los botones de "Grabar" / "Detener" que aparecen en "armada"/"grabando"
 * son TEMPORALES — sirven solo para la verificación manual en hardware de
 * la Task 4 del plan (jsdom no tiene cámara, no se puede automatizar). F2 no
 * sube nada ni recibe comandos remotos: ese gesto real de grabar/detener lo
 * va a mandar el escáner por el canal en F3/F4, y este botón desaparece.
 *
 * Quedan detrás del gate `debug` (`?debug=1` en la URL, ver `hayDebugEnUrl`)
 * en vez de confiar en que alguien se acuerde de borrarlos: sin el query
 * param no existen en el DOM, así que un operador de la estación en
 * operación normal no puede tocarlos por accidente y dejar la cámara
 * grabando fuera de una inspección. Si en F3/F4 alguien se olvida de sacar
 * este bloque, el daño es cero — no un botón huérfano en producción.
 */
interface CapturaEstadoProps {
  estado: EstadoCaptura;
  error: string | null;
  armar: () => Promise<void>;
  grabar: () => void;
  detener: () => Promise<{ blob: Blob; mimeType: string; duracionMs: number }>;
  /** `true` solo con `?debug=1` en la URL — gatea los botones de prueba. */
  debug: boolean;
}

// Recibe funciones/estado sueltos, NUNCA el objeto `captura` completo del
// hook — ver el comentario de arriba de `useKioskRecorder()` en
// `CamaraPageContent`: ese objeto trae `videoRef` adentro, y
// `react-hooks/refs` no deja pasar un ref río abajo metido en un prop.
function CapturaEstado({ estado, error, armar, grabar, detener, debug }: CapturaEstadoProps) {
  const [ultimaPrueba, setUltimaPrueba] = useState<{
    pesoKB: number;
    duracionMs: number;
    mimeType: string;
  } | null>(null);

  const handleDetenerPrueba = () => {
    detener()
      .then((r) => {
        setUltimaPrueba({
          pesoKB: Math.round(r.blob.size / 1024),
          duracionMs: r.duracionMs,
          mimeType: r.mimeType,
        });
      })
      .catch(() => {});
  };

  switch (estado) {
    case 'inactiva':
      return (
        <>
          <button
            type="button"
            onClick={() => void armar()}
            className="rounded-2xl bg-white px-10 py-8 text-3xl font-bold text-black shadow-xl"
          >
            Armar cámara
          </button>
          <p className="max-w-xs text-sm text-white/70">
            Va a pedir permiso de cámara y micrófono. Después de esto queda armada durante
            horas, sin volver a tocarla.
          </p>
          {error && <p className="max-w-xs text-sm text-red-300">{error}</p>}
        </>
      );
    case 'armando':
      return <p className="text-4xl font-bold">ARMANDO…</p>;
    case 'armada':
      return (
        <>
          <p className="text-6xl font-bold">ARMADA</p>
          {/* Temporal, detrás del gate `debug` — ver doc-comment de arriba. */}
          {debug && (
            <>
              <button
                type="button"
                onClick={() => grabar()}
                className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white/80"
              >
                Grabar (prueba)
              </button>
              {ultimaPrueba && (
                <p className="text-xs text-white/50">
                  Última prueba: {ultimaPrueba.pesoKB} KB ·{' '}
                  {Math.round(ultimaPrueba.duracionMs / 1000)}s · {ultimaPrueba.mimeType}
                </p>
              )}
            </>
          )}
        </>
      );
    case 'grabando':
      return (
        <>
          <p className="text-6xl font-bold" style={{ color: TOKENS.red }}>
            GRABANDO
          </p>
          {/* Temporal, detrás del gate `debug` — ver doc-comment de arriba. */}
          {debug && (
            <button
              type="button"
              onClick={handleDetenerPrueba}
              className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white/80"
            >
              Detener (prueba)
            </button>
          )}
        </>
      );
    case 'caida':
      return (
        <>
          <p className="text-6xl font-bold" style={{ color: TOKENS.red }}>
            CÁMARA CAÍDA
          </p>
          <button
            type="button"
            onClick={() => void armar()}
            className="rounded-2xl bg-white px-8 py-6 text-2xl font-bold text-black shadow-xl"
          >
            Rearmar cámara
          </button>
          {error && <p className="max-w-xs text-sm text-red-300">{error}</p>}
        </>
      );
  }
}
