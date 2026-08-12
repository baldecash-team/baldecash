'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { clearDeviceSession, getDeviceSession, type DeviceSession } from '../_lib/deviceSession';
import { API_BASE_URL, redeemPairingCode } from '../_lib/pairing';
import { usePresenceChannel } from '../_lib/usePresenceChannel';
import { useKioskRecorder, type EstadoCaptura, type ResultadoDetener } from '../_lib/useKioskRecorder';
import { useWakeLock } from '../_lib/useWakeLock';
import { useServerClock } from '../_lib/useServerClock';
import { useComandos, type ComandoStartPayload } from '../_lib/useComandos';
import {
  descartar,
  encolar,
  listarFallidos,
  reintentar,
  suscribir,
  uploadQueue,
  type UploadQueueEstado,
} from '../_lib/uploadQueue';

/**
 * Confirma al backend que ESTA cámara recibió un comando (spec §6.1 regla 1:
 * sin ack, la API nunca asume que se grabó). Se manda apenas llega
 * `cmd.start`, ANTES de programar la grabación — el escáner espera esta
 * confirmación para saber que el mensaje llegó, no que ya está grabando
 * (plan F3 Task 4, Step 4).
 *
 * `listo` — fix post-review de F3 (C2 / I5), CRÍTICO: antes se ackeaba
 * incondicionalmente, así que "recibí el mensaje" se confundía con "recibí
 * el mensaje Y voy a poder grabar". Una cámara sin armar o caída ackeaba
 * igual, el backend contaba ese ack para el quórum, y el escáner terminaba
 * mostrando GRABANDO sin un solo frame de esa cámara. `listo` distingue las
 * dos cosas en el timeline de `inspection_event`: `false` es "llegó a una
 * cámara que no puede grabar", no "no llegó". Quien llama decide `listo`
 * mirando el estado de captura Y el reloj (`useServerClock.listo` — I5: un
 * offset sin calibrar todavía degrada la sincronía sin dejar rastro).
 *
 * NOTA DE COORDINACIÓN: el contrato de `POST /ack` en ws2 todavía no lee
 * `listo` (`AckRequest` solo tiene `seq` a la fecha de este fix) — ese
 * cambio de backend se coordina aparte. Mandarlo ya es inofensivo (Pydantic
 * ignora campos extra por default) y deja el front listo para el día que el
 * backend lo empiece a usar, sin otro deploy de acá.
 *
 * Sin reintento a propósito: si falla por red, para cuando uno resolviera el
 * escáner ya habría decidido por el timeout de 1,5s (spec §10) — no hay nada
 * más accionable acá que dejar que ese camino haga su trabajo.
 */
async function ackComando(inspectionId: number, seq: number, token: string, listo: boolean): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/inspections/${inspectionId}/ack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Token': token },
      body: JSON.stringify({ seq, listo }),
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

  // F4 Task 4: estado agregado de la cola de subida (`_lib/uploadQueue.ts`,
  // Task 3), SOLO para pintarlo — esta vista nunca es dueña de la cola, ni
  // la muta directamente (spec §8.1: "el progreso se reporta a la UI por
  // callback"). Lazy init con `uploadQueue.estadoActual()` (el snapshot
  // síncrono que ese módulo expone justo para esto) en vez de arrancar en
  // algún estado "vacío" inventado y esperar la primera notificación — el
  // singleton puede llegar con trabajo pendiente de ANTES de este montaje
  // (p.ej. HMR en dev, o una subida que quedó en vuelo de una inspección
  // previa en la misma pestaña).
  const [uploadEstado, setUploadEstado] = useState<UploadQueueEstado>(() => uploadQueue.estadoActual());
  useEffect(() => suscribir(setUploadEstado), []);

  // Cuántos videos se perdieron por backpressure de `encolar()` (cola en su
  // profundidad máxima justo cuando esta cámara intentó encolar uno nuevo).
  // No es el camino esperado — Task 5 va a evitar que el escáner comande una
  // toma nueva con la cola llena — pero mientras eso no esté cableado, un
  // `encolar()` rechazado acá NO debe perderse en silencio: no hay a dónde
  // reencolarlo (el blob ya no está en ningún lado más que en esta variable
  // de closure, que se pierde apenas termina el `.then`), así que lo único
  // que esta vista puede hacer es avisar que pasó, en vez de que la única
  // señal sea "faltó un video" descubierto horas después en S3. (Se pierde
  // igual — no hay a dónde reencolar el blob una vez que `encolar()` lo
  // rechazó — pero al menos no en silencio.)
  const [subidasPerdidas, setSubidasPerdidas] = useState(0);

  // Contador de tomas POR INSPECCIÓN — no viene en el payload de
  // `cmd.start`/`cmd.stop`/`cmd.abort` (ver `ComandoStartPayload` en
  // `useComandos.ts`: solo trae `inspection_id`/`start_at`/`seq`). El
  // backend (`session.py`, ws2) documenta que una inspección puede tener
  // VARIAS tomas y que cada toma nueva vuelve a emitir `cmd.start` sobre la
  // MISMA inspección con un `seq` creciente — nunca crea una inspección
  // nueva. Esta cámara deriva el `take_number` de esa regla: cada
  // `cmd.start` no-duplicado que efectivamente programa una grabación
  // (dentro de `manejarStart`, más abajo) es una toma más para ESE
  // `inspection_id`. Task 5 (escáner) es quien decide cuándo pedir "toma 2"
  // — acá solo se cuenta, nunca se decide.
  const takeCounterRef = useRef<Map<number, number>>(new Map());
  // La toma que se está grabando/programando AHORA MISMO — lo que
  // `encolarGrabacion` necesita cuando `detener()` resuelva (async, después
  // de que `manejarStart` ya terminó de correr) para saber a qué inspección
  // y qué número de toma pertenece el blob.
  const activeTakeRef = useRef<{ inspectionId: number; takeNumber: number } | null>(null);

  // El corazón de F4 (spec §8.1): al terminar una grabación, el blob se
  // ENCOLA — nunca se espera la subida acá. `manejarStop`/`manejarAbort` (más
  // abajo) llaman a esto en el `.then()` de `detener()`, que ya de por sí es
  // asíncrono pero CORTO (nada de red, solo el `MediaRecorder` terminando de
  // flushear) — la cámara vuelve a "armada" apenas eso resuelve, sin
  // importarle en absoluto cuánto tarde la subida real.
  const encolarGrabacion = useCallback(
    (resultado: ResultadoDetener) => {
      if (!session) return;
      const take = activeTakeRef.current;
      // No debería pasar: `detener()` solo resuelve con éxito si hubo una
      // grabación en curso, y toda grabación en curso pasó por
      // `manejarStart`, que siempre setea `activeTakeRef` ANTES de llamar
      // `grabar()` (ver más abajo). Defensivo, no un caso que un test tenga
      // que ejercitar.
      if (!take) return;
      const aceptado = encolar({
        inspectionId: take.inspectionId,
        takeNumber: take.takeNumber,
        // Ver doc-comment de `session.label` en `deviceSession.ts`: puede
        // ser `null` (dispositivo vinculado sin etiqueta todavía). Mismo
        // fallback que ya usa el render de más abajo para mostrarlo en
        // pantalla — no hay una etiqueta "mejor" que inventar acá.
        cameraLabel: session.label ?? session.kind,
        blob: resultado.blob,
        mimeType: resultado.mimeType,
        token: session.token,
        durationMs: resultado.duracionMs,
      });
      if (!aceptado) {
        setSubidasPerdidas((n) => n + 1);
      }
    },
    [session]
  );

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
  // de `useServerClock.ts`. `clockListo` (I5, fix post-review): antes nadie
  // lo consumía — `offsetMs` arranca en 0 y las 5 muestras son secuenciales,
  // así que hay una ventana real de varios segundos donde un `cmd.start`
  // se programaría contra el reloj CRUDO del teléfono, degradando la
  // sincronía (criterio duro de F3: ≤150 ms) sin ningún rastro. Entra en
  // `puedeGrabar` de `manejarStart`, más abajo.
  const { offsetMs, listo: clockListo } = useServerClock();

  // El timer del PRÓXIMO arranque programado. Un ref, no estado: no hace
  // falta re-renderizar por esto, y `manejarStart` necesita poder cancelar
  // uno anterior si por lo que sea llegara un `cmd.start` nuevo antes de que
  // el primero disparara (no debería pasar — una inspección emite un solo
  // `cmd.start` — pero cancelar el viejo es gratis y evita dos `grabar()`
  // programados a la vez si alguna vez pasara).
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fix post-review (C1, CRÍTICO): antes `manejarStop`/`manejarAbort` solo
  // llamaban `detener()`, que RECHAZA si todavía no hay grabación en curso
  // (rechazo tragado por un `.catch(() => {})`) — el timer de `manejarStart`
  // nunca se cancelaba. Secuencia verificada por la review: `cmd.start` con
  // `start_at=+1500`, `cmd.abort` a los 500ms, la cámara igual arranca a
  // grabar a los 1500ms porque nadie tocó `startTimerRef`. Esa grabación no
  // la para nadie (la inspección ya está `failed`, no va a haber
  // `cmd.stop`), y el `cmd.start` SIGUIENTE se ackea pero no graba nada
  // (`grabar()` sale temprano al ver el recorder ocupado) — cámara zombi:
  // ackea todo, graba nada, y su último `capture_state` reportado sigue
  // siendo `armada`, así que el semáforo del escáner queda verde. Encima,
  // `ACK_TIMEOUT_MS` del escáner es EL MISMO valor que `_START_DELAY_MS` del
  // backend — el abort por timeout llega justo cuando el timer iba a
  // disparar. No es un caso raro: es el camino degradado normal.
  const cancelarArranquePendiente = useCallback(() => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  }, []);

  // Dedupe por `(inspection_id, seq)` a nivel de componente — no solo el de
  // `useComandos` (que dedupea la vía EN VIVO del canal). Hace falta acá
  // porque, con el fix C4 más abajo, `manejarStart` se puede invocar por DOS
  // caminos distintos (el canal en vivo, vía `useComandos`, Y el resync
  // contra `/state` al reconectar) — sin este segundo nivel, un `cmd.start`
  // que llega tarde por el canal justo después de que el resync ya lo
  // procesó dispararía un ack y una programación duplicados.
  const procesadosStartRef = useRef<Set<string>>(new Set());

  const manejarStart = useCallback(
    (payload: ComandoStartPayload) => {
      if (!session) return;
      const clave = `start:${payload.inspection_id}:${payload.seq}`;
      if (procesadosStartRef.current.has(clave)) return;
      procesadosStartRef.current.add(clave);

      // Fix post-review (C2, CRÍTICO): el ack ahora dice la verdad sobre si
      // ESTA cámara puede grabar — ver doc-comment de `ackComando`. Antes se
      // ackeaba sin mirar `capturaEstado`: una cámara nunca armada, o caída
      // tras un `track.ended` real, ackeaba igual, el backend contaba ese
      // ack para el quórum, y el escáner mostraba GRABANDO sin un frame de
      // esta cámara. `clockListo` (I5) entra acá también: sin el reloj
      // calibrado, "grabar" sería grabar desincronizado, que para el
      // criterio de ≤150ms de F3 es tan malo como no grabar.
      const puedeGrabar = capturaEstado === 'armada' && clockListo;
      void ackComando(payload.inspection_id, payload.seq, session.token, puedeGrabar);

      cancelarArranquePendiente();
      if (!puedeGrabar) return;

      // F4 Task 4: una toma más para ESTA inspección — ver el doc-comment de
      // `takeCounterRef` más arriba sobre por qué se deriva acá y no viene
      // en el payload. Se setea ANTES de programar `grabar()` (no dentro del
      // `setTimeout`) para que quede fijo desde YA: si por lo que sea
      // llegara un `cmd.start` de OTRA inspección antes de que este timer
      // dispare (no debería, pero `cancelarArranquePendiente` ya cubre ese
      // caso cancelando el timer viejo), `activeTakeRef` de esta toma no
      // debe quedar pisado a mitad de camino por una carrera imposible de
      // ver desde acá.
      const takeNumber = (takeCounterRef.current.get(payload.inspection_id) ?? 0) + 1;
      takeCounterRef.current.set(payload.inspection_id, takeNumber);
      activeTakeRef.current = { inspectionId: payload.inspection_id, takeNumber };

      // Arranque por reloj absoluto (spec §6.1 regla 2): se programa para el
      // instante `start_at` CORREGIDO POR EL OFFSET, no para "ahora". Así
      // todas las cámaras de la estación arrancan juntas aunque el mensaje
      // de Pusher les llegue con latencias distintas. `Math.max(0, …)`
      // porque si el offset+red hicieron que el instante ya haya pasado
      // (mensaje muy tardío, o resync tardío tras reconectar — C4), lo mejor
      // que se puede hacer es arrancar ya.
      const delayMs = payload.start_at - offsetMs - Date.now();
      startTimerRef.current = setTimeout(() => {
        grabar();
      }, Math.max(0, delayMs));
    },
    [session, offsetMs, clockListo, capturaEstado, grabar, cancelarArranquePendiente]
  );

  const manejarStop = useCallback(() => {
    // Fix C1: cancelar SIEMPRE, antes de intentar `detener()` — ver
    // doc-comment de `cancelarArranquePendiente`.
    cancelarArranquePendiente();
    // F4 Task 4 (el corazón de la fase): el blob se ENCOLA apenas
    // `detener()` resuelve — la cámara ya volvió a "armada" dentro de
    // `detener()` mismo (regla 2 de `useKioskRecorder.ts`), así que para
    // cuando `encolarGrabacion` corre acá la UI ya está lista para la
    // próxima orden. Nada de esto espera a la subida real.
    detener().then(encolarGrabacion).catch(() => {});
  }, [detener, cancelarArranquePendiente, encolarGrabacion]);

  const manejarAbort = useCallback(() => {
    // Fix C1 (ver doc-comment de `cancelarArranquePendiente`). La
    // transición de la inspección a `failed` la decide el servidor
    // (CLAUDE.md / spec: "los dispositivos reportan, nunca deciden") — acá
    // solo se corta la captura local, igual que con `cmd.stop`. Encola igual
    // que `manejarStop`: lo que se alcanzó a grabar antes del abort no tiene
    // por qué perderse — si `detener()` rechaza porque no había grabación en
    // curso (el abort llegó ANTES de que arrancara), `encolarGrabacion`
    // simplemente no corre.
    cancelarArranquePendiente();
    detener().then(encolarGrabacion).catch(() => {});
  }, [detener, cancelarArranquePendiente, encolarGrabacion]);

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
  //
  // Fix post-review (C4, CRÍTICO): antes esto pedía `/state` y TIRABA la
  // respuesta (`.catch()` sin `.then()`) — el comentario decía "se
  // resincroniza contra /state" pero no había ningún código leyendo el
  // resultado. Es la red de seguridad de todo lo demás: sin esto, una
  // cámara que se perdió el `cmd.start` no se entera nunca, una que se
  // perdió el `cmd.abort` graba para siempre (mitigado también por C1, pero
  // esto cubre el caso de perder el mensaje por estar desconectada, no solo
  // por la carrera del timer), y una que se perdió el `cmd.stop` no para.
  //
  // `active_inspection.start_at`/`.seq` (agregados al backend justo para
  // esto) dejan reconstruir un `cmd.start` completo: si el status es
  // `created`/`recording`, se re-procesa como si acabara de llegar —
  // `manejarStart` re-ackea (o ackea `listo:false` si esta cámara no puede)
  // y programa `grabar()` para el instante real, clampado a "ya" si ya
  // pasó (typical tras un resync tardío). Si el status es otra cosa
  // (`uploading`/`complete`/`incomplete`/`failed`) o no hay inspección en
  // curso, se llama `manejarStop()` — no-op si esta cámara no estaba
  // grabando, y la detiene si se había perdido el `cmd.stop`/`cmd.abort`
  // correspondiente. El dedupe por `(inspection_id, seq)` de
  // `procesadosStartRef` evita que esto duplique un `cmd.start` que ya se
  // procesó por el canal en vivo.
  const yaConectadaRef = useRef(false);
  useEffect(() => {
    if (!session || kindMismatch) return;
    if (connected && !yaConectadaRef.current) {
      // I3 (review F3): re-reporta el estado de captura al reconectar, en
      // el mismo flanco — ver doc-comment del efecto de heartbeat más abajo
      // para por qué esto solo no alcanza (una cámara que nunca se
      // desconecta no pasa por acá nunca).
      if (capturaEstado === 'armada' || capturaEstado === 'caida') {
        void reportarEstadoCaptura(capturaEstado, session.token);
      }

      void (async () => {
        try {
          const r = await fetch(`${API_BASE_URL}/inspections/stations/${session.stationId}/state`, {
            headers: { 'X-Device-Token': session.token },
          });
          if (!r.ok) return;
          const body = await r.json();
          const activa = body.active_inspection as
            | { id: number; status: string; start_at?: number; seq?: number }
            | null
            | undefined;

          // Solo estos dos status significan "debería estar grabando ahora
          // o en breve" — el resto (o ninguna inspección en curso) significa
          // "no debería estar grabando".
          const deberiaEstarGrabando =
            !!activa &&
            (activa.status === 'created' || activa.status === 'recording') &&
            typeof activa.start_at === 'number' &&
            typeof activa.seq === 'number';

          if (deberiaEstarGrabando && activa) {
            manejarStart({
              inspection_id: activa.id,
              start_at: activa.start_at as number,
              seq: activa.seq as number,
            });
          } else {
            manejarStop();
          }
        } catch {
          // Sin conexión: nada más accionable — el próximo flanco de
          // reconexión reintenta.
        }
      })();
    }
    yaConectadaRef.current = connected;
  }, [connected, session, kindMismatch, capturaEstado, manejarStart, manejarStop]);

  // I3 (review F3): heartbeat liviano del estado de captura. El re-reporte
  // al reconectar (arriba) no alcanza solo: una cámara armada y QUIETA
  // durante el almuerzo o el arranque de turno no se desconecta nunca, así
  // que ese efecto nunca dispara para ella — y como la cámara solo reporta
  // en TRANSICIONES (armarse/caer/rearmarse, no en cada cambio trivial), su
  // único reporte pudo haber sido hace más de `CAPTURE_STATE_STALE_AFTER`
  // (30 min, backend). Sin este heartbeat, el umbral de vigencia marca esa
  // cámara sana como "sin estado válido" y el semáforo del escáner se pone
  // en rojo por una razón que no es real — sin ningún remedio salvo recargar
  // el teléfono, porque no hay otra transición que dispare un reporte.
  //
  // 10 minutos: tres veces el margen antes del umbral del backend, y
  // "liviano" en el sentido literal — un POST chico, sin tocar la captura
  // en sí. Solo re-reporta si hay algo que reportar (`armada`/`caida`); en
  // `inactiva`/`armando` no hay estado válido que refrescar.
  useEffect(() => {
    if (!session) return undefined;
    const HEARTBEAT_MS = 10 * 60 * 1000;
    const id = setInterval(() => {
      if (capturaEstado === 'armada' || capturaEstado === 'caida') {
        void reportarEstadoCaptura(capturaEstado, session.token);
      }
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [session, capturaEstado]);

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

  // F4 Task 4: texto del indicador de SUBIDA — tercer bloque, independiente
  // de captura y de canal (spec: "sumá el de subida al lado, no encima").
  // `motivoLlena` distingue las dos situaciones de "llena" con dos salidas
  // distintas (mismo orden de prioridad que ya aplica
  // `uploadQueue.estadoActual()`, ver su doc-comment: "fallidos" es
  // accionable y gana sobre "subiendo", que solo hay que esperar):
  // - `'fallidos'`: hay algo que HACER (reintentar/descartar) — se explica
  //   abajo con los botones.
  // - `'subiendo'`: no hay nada que hacer, solo esperar a que drene.
  // Fuera de "llena", el texto igual refleja actividad (`enVuelo`/
  // `pendientes`) o fallidos sueltos (por debajo de la profundidad máxima,
  // así que la cola no está "llena" pero igual hay algo pendiente).
  const uploadTexto =
    uploadEstado.motivoLlena === 'fallidos'
      ? 'HAY VIDEOS QUE FALLARON'
      : uploadEstado.motivoLlena === 'subiendo'
        ? 'ESPERÁ, ESTÁ DRENANDO'
        : uploadEstado.fallidos > 0
          ? `${uploadEstado.fallidos} VIDEO(S) FALLARON`
          : uploadEstado.enVuelo > 0 || uploadEstado.pendientes > 0
            ? 'SUBIENDO…'
            : 'AL DÍA';

  const uploadDotColor =
    uploadEstado.fallidos > 0
      ? TOKENS.red
      : uploadEstado.enVuelo > 0 || uploadEstado.pendientes > 0
        ? TOKENS.tertiary
        : TOKENS.green;

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

        {/* Estado de SUBIDA — F4 Task 4, tercer bloque aparte de captura y
            canal (spec §8.1: "corre en segundo plano y no bloquea nada").
            Deliberadamente puede mostrar "SUBIENDO…" mientras el bloque de
            arriba dice "GRABANDO": son dos carriles paralelos, uno de
            captura local y otro de red, y ninguno tapa al otro. */}
        <div className="mb-2 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: uploadDotColor }}
              aria-hidden
            />
            <p className="text-sm uppercase tracking-widest text-white/70">Subida: {uploadTexto}</p>
          </div>
          {/* Solo con algo ACCIONABLE (motivoLlena === 'fallidos') se
              muestran los remedios — "esperá, está drenando" no tiene botón
              porque no hay nada que un humano pueda apurar. */}
          {uploadEstado.motivoLlena === 'fallidos' && (
            <div className="flex flex-col items-center gap-1">
              <p className="max-w-sm text-xs text-white/60">
                {uploadEstado.fallidos} video(s) agotaron los reintentos automáticos, sin
                perderse (siguen en memoria). Reintentar los vuelve a subir; descartar los
                borra para siempre.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => reintentar()}
                  className="rounded-lg border border-white/40 px-3 py-1 text-xs font-semibold text-white/80"
                >
                  Reintentar subida
                </button>
                <button
                  type="button"
                  onClick={() => listarFallidos().forEach((f) => descartar(f.id))}
                  className="rounded-lg border border-white/40 px-3 py-1 text-xs font-semibold text-white/80"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}
          {subidasPerdidas > 0 && (
            <p className="max-w-sm text-xs text-red-300">
              Se perdió{subidasPerdidas > 1 ? `n ${subidasPerdidas} videos` : ' 1 video'}: la
              cola de subida estaba llena cuando esta cámara intentó encolarlo.
            </p>
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
