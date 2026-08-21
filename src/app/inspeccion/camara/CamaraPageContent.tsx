'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { clearDeviceSession, getDeviceSession, type DeviceSession } from '../_lib/deviceSession';
import { API_BASE_URL, redeemPairingCode } from '../_lib/pairing';
import { usePresenceChannel } from '../_lib/usePresenceChannel';
import {
  useKioskRecorder,
  type AjustesCaptura,
  type EstadoCaptura,
  type ResultadoDetener,
} from '../_lib/useKioskRecorder';
import { useWakeLock } from '../_lib/useWakeLock';
import { useServerClock } from '../_lib/useServerClock';
import {
  useComandos,
  type ComandoPhotoPayload,
  type ComandoStartPayload,
} from '../_lib/useComandos';
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
 *
 * `cola` (F4 Task 5, opcional): snapshot de `uploadQueue.estadoActual()` de
 * ESTA cámara. Es la única pieza que sabe si su cola de subida está llena
 * — el backend no puede inferirlo, es un singleton del navegador — así que
 * viaja en el MISMO POST que ya reportaba `capture_state` (ver el
 * doc-comment del `useEffect` que llama a esto con `cola` en
 * `CamaraPageContent`, más abajo, para cuándo se manda). snake_case en el
 * body: es el contrato que espera `ReportarEstadoCapturaRequest` en ws2.
 */
async function reportarEstadoCaptura(
  estado: EstadoCaptura,
  token: string,
  cola?: UploadQueueEstado
): Promise<void> {
  try {
    const body: Record<string, unknown> = { estado };
    if (cola) {
      body.cola = {
        en_vuelo: cola.enVuelo,
        pendientes: cola.pendientes,
        fallidos: cola.fallidos,
        llena: cola.llena,
        motivo_llena: cola.motivoLlena,
      };
    }
    await fetch(`${API_BASE_URL}/inspections/devices/estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Token': token },
      body: JSON.stringify(body),
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
/**
 * Cuánto se queda en pantalla el aviso de "sacando foto".
 *
 * El disparo en sí es casi instantáneo (un `drawImage` sobre un stream que ya
 * está vivo), así que sin un mínimo el aviso aparecería y desaparecería en el
 * mismo frame y el operador no vería nada. 1,2 s es lo que tarda en levantar
 * la vista del equipo a la pantalla.
 */
const FOTO_AVISO_MS = 1_200;

/**
 * El cuadro de captura en pantalla: el cuadrado más grande que entra.
 *
 * Lo comparten el `<video>` del preview y la cuadrícula, y por eso es una
 * constante y no dos clases escritas por separado: si los dos cuadros no
 * salen del MISMO cálculo, las líneas dejan de marcar los tercios de lo que
 * se captura y pasan a mentir — que es peor que no tener cuadrícula.
 *
 * `vw`/`vh` y no porcentajes porque el `<main>` es `h-screen` (100vh) y ocupa
 * el ancho de la ventana: son las mismas unidades con las que está armado el
 * layout del kiosco.
 */
const CUADRO_ENCUADRE = 'aspect-square w-[min(100vw,100vh)]';

/** Dónde caen las líneas de la regla de los tercios, en % del lado. */
const TERCIOS = [100 / 3, 200 / 3] as const;

/**
 * Cuadrícula de encuadre: los tercios sobre el cuadro que se va a capturar.
 *
 * Las líneas van blancas con una sombra negra encima y no de un solo color:
 * el fondo es lo que haya sobre la mesa —un equipo negro, una caja blanca—,
 * y cualquier color plano desaparece contra la mitad de los casos. Finas
 * (1px) y al 30%: tienen que poder ignorarse mientras se mira un rayón, que
 * es lo que hay que juzgar antes de disparar.
 *
 * El borde del cuadrado marca dónde termina la foto. Con una cámara que sí
 * respeta el 1:1 coincide con el borde de la imagen; con una que no, deja
 * ver cuánto del preview es banda y no evidencia.
 */
function CuadriculaEncuadre() {
  const linea = 'absolute bg-white/30 [box-shadow:0_0_2px_rgba(0,0,0,0.45)]';
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      aria-hidden
      data-testid="cuadricula-encuadre"
    >
      <div className={`relative border border-white/20 ${CUADRO_ENCUADRE}`}>
        {TERCIOS.map((pct) => (
          <div key={`v-${pct}`} className={`${linea} inset-y-0 w-px`} style={{ left: `${pct}%` }} />
        ))}
        {TERCIOS.map((pct) => (
          <div key={`h-${pct}`} className={`${linea} inset-x-0 h-px`} style={{ top: `${pct}%` }} />
        ))}
      </div>
    </div>
  );
}

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
  const {
    estado: capturaEstado,
    error: capturaError,
    ajustes: capturaAjustes,
    videoRef,
    armar,
    grabar,
    capturarFoto,
    detener,
    zoom,
    zoomRango,
    zoomError,
    aplicarZoom,
  } = useKioskRecorder();

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

  // La toma que se está grabando/programando AHORA MISMO — lo que
  // `encolarGrabacion` necesita cuando `detener()` resuelva (async, después
  // de que `manejarStart` ya terminó de correr) para saber a qué inspección
  // y qué número de toma pertenece el blob.
  /**
   * Aviso local de "estoy sacando una foto". Es SOLO de esta pantalla: no se
   * reporta como `capture_state` al backend a propósito.
   *
   * El estado de captura que viaja (`armada`/`grabando`/`caida`) es el que
   * lee el pre-vuelo del escáner para decidir si la estación está lista. Un
   * estado nuevo ahí haría que la estación se viera caída cada vez que
   * alguien saca una foto, que es exactamente lo contrario de lo que pasa:
   * la cámara está perfecta, solo disparó.
   */
  const [sacandoFoto, setSacandoFoto] = useState(false);
  const avisoFotoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  //
  // Un solo `useEffect`/POST para `capturaEstado` Y `cola` (F4 Task 5),
  // no dos: son el mismo reporte hacia el mismo endpoint, y dispararlos por
  // separado mandaba dos POST casi simultáneos en la transición a
  // `armada`/`caida` (uno con `cola` desactualizada, sin ningún beneficio —
  // ver `dedupeRef` de abajo para el criterio de "cuándo SÍ hay algo nuevo
  // que reportar"). `cola` viaja SIEMPRE que se reporta `capturaEstado`
  // (spec F4 Task 5: "el hueco que dejó F4 Task 4" — el escáner necesita
  // esta información y `uploadQueue` es un singleton del navegador que solo
  // ESTA cámara puede leer), y también dispara un reporte cuando `llena`/
  // `motivoLlena` cambian solos con `capturaEstado` ya estable en
  // `armada`/`caida` — "fallidos" y "subiendo" son dos situaciones
  // distintas que el escáner necesita poder diferenciar, ver el doc-comment
  // de `motivoLlena` en `uploadQueue.ts`. Nunca en cada tick de progreso
  // (`enVuelo`/`pendientes` cambiando de a uno mientras sigue sin estar
  // llena) — mismo criterio de "transiciones, no cambios triviales" que ya
  // regía el reporte de `capture_state` antes de esta Task.
  const dedupeRef = useRef<{
    estado: EstadoCaptura;
    llena: boolean;
    motivo: UploadQueueEstado['motivoLlena'];
  } | null>(null);
  useEffect(() => {
    if (!session) return;
    if (capturaEstado !== 'armada' && capturaEstado !== 'caida') return;
    const anterior = dedupeRef.current;
    const actual = { estado: capturaEstado, llena: uploadEstado.llena, motivo: uploadEstado.motivoLlena };
    if (
      anterior &&
      anterior.estado === actual.estado &&
      anterior.llena === actual.llena &&
      anterior.motivo === actual.motivo
    ) {
      return;
    }
    dedupeRef.current = actual;
    void reportarEstadoCaptura(capturaEstado, session.token, uploadEstado);
  }, [session, capturaEstado, uploadEstado]);

  // F3: la cámara obedece comandos remotos (spec §6). `offsetMs` traduce el
  // `start_at` absoluto del servidor a un instante local — ver doc-comment
  // de `useServerClock.ts`. `clockListo` (I5, fix post-review): antes nadie
  // lo consumía — `offsetMs` arranca en 0 y las 5 muestras son secuenciales,
  // así que hay una ventana real de varios segundos donde un `cmd.start`
  // se programaría contra el reloj CRUDO del teléfono, degradando la
  // sincronía (criterio duro de F3: ≤150 ms) sin ningún rastro. Entra en
  // `puedeGrabar` de `manejarStart`, más abajo.
  const { offsetMs, listo: clockListo } = useServerClock();

  // El timer del arranque programado. Un ref, no estado: no hace falta
  // re-renderizar por esto, solo poder cancelarlo. Un solo ref para el
  // conteo de ARRANQUE y el de PARADA — nunca hay dos corriendo a la vez:
  // un `cmd.stop`/`cmd.abort` que interrumpe el conteo de arranque lo
  // cancela antes de que el de parada pudiera existir (ver
  // `cancelarConteoPendiente`, justo abajo), y al revés no puede pasar —
  // para parar hace falta estar `grabando`, así que el conteo de arranque de
  // esa toma ya terminó.
  const conteoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fix post-review (C1, CRÍTICO): antes `manejarStop`/`manejarAbort` solo
  // llamaban `detener()`, que RECHAZA si todavía no hay grabación en curso
  // (rechazo tragado por un `.catch(() => {})`) — el timer de `manejarStart`
  // nunca se cancelaba. Secuencia verificada por la review: `cmd.start` con
  // `start_at=+1500`, `cmd.abort` a los 500ms, la cámara igual arranca a
  // grabar a los 1500ms porque nadie tocó el timer. Esa grabación no la para
  // nadie (la inspección ya está `failed`, no va a haber `cmd.stop`), y el
  // `cmd.start` SIGUIENTE se ackea pero no graba nada (`grabar()` sale
  // temprano al ver el recorder ocupado) — cámara zombi: ackea todo, graba
  // nada, y su último `capture_state` reportado sigue siendo `armada`, así
  // que el semáforo del escáner queda verde. Encima, `ACK_TIMEOUT_MS` del
  // escáner es EL MISMO valor que `_START_DELAY_MS` del backend — el abort
  // por timeout llega justo cuando el timer iba a disparar. No es un caso
  // raro: es el camino degradado normal.
  //
  // La regla vale para cualquier arranque programado que siga pendiente: no
  // puede sobrevivir a un `cmd.stop`/`cmd.abort` que llegue antes de que
  // dispare.
  const cancelarConteoPendiente = useCallback(() => {
    if (conteoTimerRef.current) {
      clearTimeout(conteoTimerRef.current);
      conteoTimerRef.current = null;
    }
  }, []);

  // Motor del conteo: un tick que se reprograma a sí mismo hasta llegar a
  // cero. Recibe el instante ABSOLUTO LOCAL al que hay que llegar
  // (`objetivoLocalMs`) — para el arranque es `start_at` ya corregido por el
  // offset (ver `manejarStart`, más abajo: ESE es el requisito duro de esta
  // Task, que el conteo cuente contra el reloj compartido y no contra
  // cuándo llegó el mensaje a ESTE teléfono); para la parada no hay instante
  // compartido del servidor, así que es `Date.now() + STOP_COUNTDOWN_MS`
  // tomado una sola vez al arrancar ese conteo (ver `manejarStop`).
  //
  // En cada tick recalcula cuánto falta (`restanteMs`) contra ESE instante
  // fijo, nunca contra un contador local que se decrementa solo — así un
  // tick que se disparó un poco tarde (el hilo de JS ocupado con otra cosa)
  // no acumula deriva: el PRÓXIMO tick igual apunta al instante real. El
  // número mostrado es una función pura de `restanteMs`: si el mensaje llegó
  // tarde (ya pasó parte del delay de 1,5s que el backend hornea en
  // `start_at`) el conteo arranca directo en "2" o en "1", no siempre en
  // "3" — así, con varias cámaras en la estación y latencias de red
  // distintas, todas terminan mostrando el MISMO número en el MISMO
  // instante real.
  /**
   * Ejecuta una acción en un instante local dado, o ya mismo si ese instante
   * pasó. Reemplaza al conteo regresivo 3·2·1, que se sacó de la pantalla.
   *
   * **La espera del arranque NO es el conteo y sigue existiendo.** El servidor
   * manda `start_at` 1,5s en el futuro y cada cámara descuenta su propio offset
   * de reloj: eso es lo que hace que dos teléfonos arranquen juntos, porque
   * Pusher no entrega simultáneamente. Lo que se quitó es el overlay que lo
   * mostraba, no la sincronización — sin este retardo, cada cámara arrancaría
   * cuando le llega el mensaje y el desfase sería el de la red.
   *
   * El timer sigue viviendo en `conteoTimerRef` y sigue siendo cancelable: un
   * abort que no cancele el arranque programado deja la cámara grabando para
   * siempre con el recorder ocupado, que fue un Critical real de este módulo.
   */
  const programarEnInstante = useCallback(
    (objetivoLocalMs: number, alLlegar: () => void) => {
      const restanteMs = objetivoLocalMs - Date.now();
      if (restanteMs <= 0) {
        alLlegar();
        return;
      }
      conteoTimerRef.current = setTimeout(() => {
        conteoTimerRef.current = null;
        alLlegar();
      }, restanteMs);
    },
    []
  );

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

      // Fix de review post-F4-Task-5 (CRÍTICO): `take_number` viene del
      // servidor en el payload (`ComandoStartPayload.take_number`, ver su
      // doc-comment en `useComandos.ts`) — esta cámara YA NO lo cuenta.
      // Antes se derivaba contando cuántos `cmd.start` no-duplicados había
      // recibido para la inspección; como Pusher no garantiza entrega
      // (spec §6.1 regla 3), una cámara que se pierde uno quedaba
      // desfasada PARA SIEMPRE y subía cada toma siguiente con el
      // `take_number` de la ANTERIOR — pisando su objeto en S3 en
      // silencio. Un `take_number` ausente o inválido es un contrato roto
      // con el backend: se prefiere que se note (esta cámara no graba,
      // visible en el ack `listo:false` y en el semáforo del escáner) a
      // que la cámara adivine un número que puede corromper evidencia.
      const takeNumberValido = Number.isInteger(payload.take_number) && payload.take_number > 0;
      if (!takeNumberValido) {
        console.error(
          'cmd.start sin take_number válido — contrato roto con el backend, esta cámara no graba',
          payload
        );
      }

      // Fix post-review (C2, CRÍTICO): el ack ahora dice la verdad sobre si
      // ESTA cámara puede grabar — ver doc-comment de `ackComando`. Antes se
      // ackeaba sin mirar `capturaEstado`: una cámara nunca armada, o caída
      // tras un `track.ended` real, ackeaba igual, el backend contaba ese
      // ack para el quórum, y el escáner mostraba GRABANDO sin un frame de
      // esta cámara. `clockListo` (I5) entra acá también: sin el reloj
      // calibrado, "grabar" sería grabar desincronizado, que para el
      // criterio de ≤150ms de F3 es tan malo como no grabar. `takeNumberValido`
      // entra por el mismo motivo que `clockListo`: un contrato roto es
      // tan malo como un reloj sin calibrar — ninguno de los dos debe
      // resultar en una grabación.
      const puedeGrabar = takeNumberValido && capturaEstado === 'armada' && clockListo;
      void ackComando(payload.inspection_id, payload.seq, session.token, puedeGrabar);

      cancelarConteoPendiente();
      if (!puedeGrabar) return;

      // Se setea ANTES de programar el conteo/`grabar()` (no dentro del
      // `setTimeout`) para que quede fijo desde YA: si por lo que sea
      // llegara un `cmd.start` de OTRA inspección antes de que el timer
      // dispare (no debería, pero `cancelarConteoPendiente` ya cubre ese
      // caso cancelando el timer viejo), `activeTakeRef` de esta toma no
      // debe quedar pisado a mitad de camino por una carrera imposible de
      // ver desde acá.
      activeTakeRef.current = { inspectionId: payload.inspection_id, takeNumber: payload.take_number };

      // Arranque por reloj absoluto (spec §6.1 regla 2, y el requisito duro
      // de esta Task): el objetivo es `start_at` CORREGIDO POR EL OFFSET, no
      // "ahora". Así todas las cámaras de la estación — y, dentro de esta
      // cámara, el conteo que se pinta en pantalla — apuntan al MISMO
      // instante real aunque el mensaje de Pusher les haya llegado con
      // latencias distintas. Contar contra el instante de RECEPCIÓN en vez
      // de contra `start_at` desincronizaría el conteo entre cámaras sin que
      // hubiera ningún problema real de fondo.
      const objetivoLocalMs = payload.start_at - offsetMs;
      const delayMs = objetivoLocalMs - Date.now();
      if (delayMs <= 0) {
        // El instante ya pasó — típicamente una cámara que se reconectó
        // tarde y resincronizó contra `/state` (C4) bastante después de que
        // el resto de la estación ya arrancó. Se arranca directo.
        grabar();
      } else {
        programarEnInstante(objetivoLocalMs, grabar);
      }
    },
    [
      session,
      offsetMs,
      clockListo,
      capturaEstado,
      grabar,
      cancelarConteoPendiente,
      programarEnInstante,
    ]
  );

  const manejarStop = useCallback(() => {
    // Fix C1: cancelar SIEMPRE, antes de nada más — ver doc-comment de
    // `cancelarConteoPendiente`. Si este `cmd.stop` llegó mientras el arranque
    // programado todavía estaba pendiente (la toma nunca llegó a grabar), esto
    // lo cancela y no queda nada más por hacer: el guard de abajo
    // (`capturaEstado !== 'grabando'`) corta acá.
    cancelarConteoPendiente();
    if (capturaEstado !== 'grabando') return;

    // Detiene YA. Antes esperaba `STOP_COUNTDOWN_MS` (1,5s) mostrando un conteo
    // regresivo, con la idea de no cortar un movimiento a la mitad; en la
    // estación real esa espera se siente como que el botón no respondió, y el
    // operador ya movió el equipo para cuando la grabación corta de verdad —
    // esos segundos terminaban siendo metraje de la mesa, no del equipo.
    //
    // `detener()` deja la cámara en "armada" (regla 2 de `useKioskRecorder`)
    // antes de que `encolarGrabacion` corra, así que la UI queda lista para la
    // próxima orden sin esperar la subida.
    detener().then(encolarGrabacion).catch(() => {});
  }, [capturaEstado, cancelarConteoPendiente, detener, encolarGrabacion]);

  const manejarAbort = useCallback(() => {
    // Fix C1 (ver doc-comment de `cancelarConteoPendiente`). Deliberadamente
    // SIN conteo propio — a diferencia de `cmd.stop`, un abort corta YA: si
    // interrumpe un conteo de PARADA en curso, lo cancela y detiene de
    // inmediato en vez de esperar a que termine (algo falló, no hay "unos
    // segundos más" que ganar esperando). La transición de la inspección a
    // `failed` la decide el servidor (CLAUDE.md / spec: "los dispositivos
    // reportan, nunca deciden") — acá solo se corta la captura local, igual
    // que con `cmd.stop`. Encola igual: lo que se alcanzó a grabar antes del
    // abort no tiene por qué perderse — si `detener()` rechaza porque no
    // había grabación en curso (el abort llegó ANTES de que arrancara, o
    // durante el conteo de arranque), `encolarGrabacion` simplemente no
    // corre.
    cancelarConteoPendiente();
    detener().then(encolarGrabacion).catch(() => {});
  }, [detener, cancelarConteoPendiente, encolarGrabacion]);

  /**
   * Dispara una foto sobre la toma en curso.
   *
   * Tres decisiones que no se ven en el código:
   *
   * 1. **No usa `programarEnInstante`.** Ese timer vive en
   *    `conteoTimerRef`, que es de UN solo arranque programado: una foto
   *    disparada mientras un `cmd.start` espera su instante pisaría el
   *    timer del video y la toma no arrancaría nunca. La foto lleva su
   *    propio `setTimeout`, sin ref compartido.
   * 2. **No ackea ni cancela nada.** El escáner no espera un ack de foto —
   *    espera la verificación en S3, que es una confirmación más fuerte y
   *    llega igual (`media.verified`).
   * 3. **No toca `activeTakeRef` ni el estado de captura.** La foto no
   *    abre ni cierra una toma; si moviera el estado, el pre-vuelo del
   *    escáner vería la estación caerse por un disparo.
   */
  const manejarPhoto = useCallback(
    (payload: ComandoPhotoPayload) => {
      if (!session) return;

      // Se enciende al RECIBIR el comando, no al disparar: entre el comando y
      // el instante de captura hay un delay de sincronía (`capture_at`), y es
      // justo el momento en que el operador tiene que quedarse quieto.
      setSacandoFoto(true);
      if (avisoFotoTimerRef.current) clearTimeout(avisoFotoTimerRef.current);
      avisoFotoTimerRef.current = setTimeout(() => {
        avisoFotoTimerRef.current = null;
        setSacandoFoto(false);
      }, FOTO_AVISO_MS + Math.max(0, payload.capture_at - offsetMs - Date.now()));

      const sacar = () => {
        void capturarFoto()
          .then((foto) => {
            const aceptado = encolar({
              inspectionId: payload.inspection_id,
              takeNumber: payload.take_number,
              photoNumber: payload.photo_number,
              cameraLabel: session.label ?? session.kind,
              blob: foto.blob,
              thumbBlob: foto.thumbBlob,
              mimeType: foto.mimeType,
              token: session.token,
            });
            if (!aceptado) setSubidasPerdidas((n) => n + 1);
          })
          .catch(() => {
            // Sin foto no hay nada que encolar. El escáner se entera por
            // ausencia: nunca le va a llegar el `media.verified` de esta
            // cámara y su espera termina en "faltó una cámara", que es
            // exactamente lo que pasó.
            setSubidasPerdidas((n) => n + 1);
          });
      };

      // Mismo criterio que el arranque del video: el objetivo es el instante
      // ABSOLUTO corregido por el offset, no "ahora", para que todas las
      // cámaras congelen el mismo momento aunque Pusher les haya llegado con
      // latencias distintas.
      const objetivoLocalMs = payload.capture_at - offsetMs;
      const restanteMs = objetivoLocalMs - Date.now();
      if (restanteMs <= 0) {
        sacar();
      } else {
        setTimeout(sacar, restanteMs);
      }
    },
    [session, offsetMs, capturarFoto]
  );

  // No dejar un timer vivo apuntando a un componente que ya se fue — mismo
  // espíritu que la limpieza del timer de arranque.
  useEffect(() => {
    return () => {
      if (avisoFotoTimerRef.current) clearTimeout(avisoFotoTimerRef.current);
    };
  }, []);

  useComandos(channel, {
    onStart: manejarStart,
    onPhoto: manejarPhoto,
    onStop: manejarStop,
    onAbort: manejarAbort,
  });

  // Timer del conteo pendiente (arranque o parada): se cancela al desmontar
  // para no llamar `grabar()`/`detener()` sobre un hook que ya se fue (mismo
  // espíritu que el I6 de `useKioskRecorder.ts`, aplicado acá del lado del
  // timer, no del recorder).
  useEffect(() => {
    return () => {
      if (conteoTimerRef.current) clearTimeout(conteoTimerRef.current);
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
            | { id: number; status: string; start_at?: number; seq?: number; take_number?: number }
            | null
            | undefined;

          // Solo estos dos status significan "debería estar grabando ahora
          // o en breve" — el resto (o ninguna inspección en curso) significa
          // "no debería estar grabando". `take_number` (fix de review
          // post-F4-Task-5, CRÍTICO) entra en la MISMA guarda que
          // `start_at`/`seq`: es el mismo problema por otra puerta — sin
          // él acá, `manejarStart` no tiene de dónde sacarlo (ya no cuenta
          // `cmd.start` recibidos, ver su doc-comment), así que un resync
          // sin `take_number` válido debe tratarse igual que uno sin
          // `start_at`/`seq` — "no sé en qué toma estoy", no "asumo la 1".
          const deberiaEstarGrabando =
            !!activa &&
            (activa.status === 'created' || activa.status === 'recording') &&
            typeof activa.start_at === 'number' &&
            typeof activa.seq === 'number' &&
            typeof activa.take_number === 'number';

          if (deberiaEstarGrabando && activa) {
            manejarStart({
              inspection_id: activa.id,
              start_at: activa.start_at as number,
              seq: activa.seq as number,
              take_number: activa.take_number as number,
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

  // `h-screen` + `overflow-hidden`, no `min-h-screen`: es un kiosco, no una
  // página. Con `min-h-screen` en el <main> Y en el contenedor de contenido,
  // las alturas se sumaban y aparecía scroll vertical — en un teléfono en
  // soporte, un scroll accidental deja el estado fuera de cuadro sin que nadie
  // se entere.
  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-black text-white">
      {/* Preview a pantalla completa: sirve para encuadrar el equipo (spec,
          plan F2 Task 3). Montado SIEMPRE que se llega a este branch, sin
          condicionar al estado de captura — `armar()` escribe
          `videoRef.current.srcObject` de forma síncrona apenas resuelve
          `getUserMedia`, antes de que el estado pase a "armada"; si el
          <video> recién se montara en ese momento, `videoRef.current` sería
          null cuando `armar()` lo necesita y el preview nunca aparecería.

          `object-contain`, NO `object-cover`: con `cover` el preview llenaba la
          pantalla recortando el frame, así que el operador encuadraba contra
          una imagen distinta de la que se estaba grabando — creía tener margen
          donde no lo tenía. Con `contain` se ve el cuadro completo tal cual se
          graba, con bandas a los costados. Ese desperdicio de pantalla es el
          precio de que encuadrar signifique algo.

          El lado sale de `min(100vw, 100vh)` —el cuadrado más grande que entra
          en la pantalla— y no del tamaño intrínseco del stream: así el cuadro
          del preview es EXACTAMENTE el mismo que el de la cuadrícula, que se
          dibuja aparte (va por encima del velo). Con el alto intrínseco, una
          cámara que entrega menos píxeles que la pantalla dejaba el video más
          chico que la cuadrícula y las líneas caían fuera de la imagen. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`object-contain ${CUADRO_ENCUADRE}`}
        />
      </div>
      {/*
        Scrim solo cuando NO graba.

        En reposo la pantalla es un cartel: lo que importa es leer el estado
        desde varios metros, y el velo hace que el texto se sostenga sobre
        cualquier escena. Mientras graba desaparece, porque ahí la pantalla
        cambia de función y pasa a ser el encuadre — con el velo encima no se
        distingue si la etiqueta entra en cuadro o si un rayón se ve, que es lo
        que hay que decidir antes de grabar y ya no se puede corregir después.

        (El velo nunca afectó el VIDEO: `MediaRecorder` graba del stream de la
        cámara, no del DOM. Es un problema de encuadre, no de evidencia.)
      */}
      {capturaEstado !== 'grabando' && (
        <div className="pointer-events-none absolute inset-0 bg-black/35" aria-hidden />
      )}

      {/*
        Cuadrícula de encuadre (regla de los tercios) sobre el cuadro que se
        va a capturar.

        Lo que se fotografía es un objeto apoyado en una mesa y la foto es la
        evidencia de un rayón o de una etiqueta: sin referencia, cada operador
        encuadra distinto y el equipo termina descentrado o cortado, y eso
        recién se ve cuando la foto ya está en S3 y el equipo ya se fue. Las
        líneas dan el centro y los tercios de un vistazo, que es lo que hace
        falta para dejar el equipo donde tiene que estar.

        Va DESPUÉS del velo a propósito: el velo se pinta en reposo —justo
        cuando se encuadra, antes de disparar— y unas líneas por debajo de él
        quedan lavadas hasta desaparecer sobre una escena clara.

        Solo con imagen en pantalla (`armada`/`grabando`): una cuadrícula
        sobre el negro de una cámara sin armar o caída no ayuda a encuadrar
        nada y ensucia un cartel que se lee a varios metros.
      */}
      {(capturaEstado === 'armada' || capturaEstado === 'grabando') && <CuadriculaEncuadre />}

      {/*
        Zoom de la CÁMARA (no del preview): `aplicarZoom` va al sensor por
        `applyConstraints`, así que lo que se acerca queda en el video. Un
        `transform: scale()` sobre el `<video>` se vería igual en pantalla y
        subiría la toma sin acercar — la etiqueta seguiría ilegible en la
        evidencia, que es exactamente lo que hay que evitar.

        Solo se muestra si el hardware expone zoom (`zoomRango`): una webcam de
        laptop normalmente no, y un control que no hace nada es peor que
        ninguno. Se puede usar MIENTRAS graba, a propósito: acercarse a un
        detalle sin cortar la toma es el caso normal de una inspección.

        `z-10` lo deja debajo del conteo (`z-20`): mientras cuenta 3·2·1 no hay
        que estar tocando el encuadre.

        Va a un cuarto de la altura y no pegado al borde inferior: ahí abajo
        quedaba tapado por el contenido de estado, y en un teléfono en vertical
        cae justo donde va la mano que sostiene el aparato — se movía el zoom
        sin querer al acomodar el encuadre.
      */}
      {zoomRango && (capturaEstado === 'armada' || capturaEstado === 'grabando') && (
        <div className="absolute bottom-28 left-1/2 z-20 flex w-[min(90%,26rem)] -translate-x-1/2 items-center gap-3 rounded-full bg-black/80 px-5 py-3">
          <button
            type="button"
            onClick={() => void aplicarZoom(zoom - zoomRango.step * 5)}
            disabled={zoom <= zoomRango.min}
            aria-label="Alejar"
            className="shrink-0 rounded-full bg-white/15 px-4 py-1 text-2xl font-bold leading-none text-white disabled:opacity-30"
          >
            −
          </button>
          <input
            type="range"
            min={zoomRango.min}
            max={zoomRango.max}
            step={zoomRango.step}
            value={zoom}
            onChange={(e) => void aplicarZoom(Number(e.target.value))}
            aria-label="Zoom de la cámara"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
          />
          <button
            type="button"
            onClick={() => void aplicarZoom(zoom + zoomRango.step * 5)}
            disabled={zoom >= zoomRango.max}
            aria-label="Acercar"
            className="shrink-0 rounded-full bg-white/15 px-4 py-1 text-2xl font-bold leading-none text-white disabled:opacity-30"
          >
            +
          </button>
          <span className="shrink-0 font-mono text-sm text-white/80">{zoom.toFixed(1)}×</span>
        </div>
      )}

      {/* El hardware expuso un rango de zoom pero rechaza aplicarlo. Sin este
          aviso el slider se movía y volvía solo, que se lee como que la app
          está colgada. */}
      {zoomError && (
        <p className="absolute bottom-20 left-1/2 z-20 w-[min(90%,26rem)] -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-center text-xs font-semibold text-white/90">
          {zoomError}
        </p>
      )}

      {/*
        La UI vive en las BANDAS NEGRAS que deja el cuadro 1:1, no encima del
        video.

        Con un preview cuadrado centrado, en cualquier pantalla sobra espacio
        arriba y abajo (o a los costados en horizontal). Ese espacio ya es
        negro y no muestra nada: poner ahí el estado y los controles es gratis,
        y deja el cuadro grabado completamente limpio — sin velo, sin texto
        encima, sin nada que tape la etiqueta o un rayón justo cuando hay que
        decidir si el encuadre sirve.

        `justify-between` empuja la etiqueta arriba y el estado del canal abajo,
        que es exactamente donde caen las bandas.

        `text-shadow` se queda igual: en una pantalla apaisada el cuadro puede
        llegar a tocar el texto, y ahí la sombra es lo único que lo sostiene.
      */}
      <div
        className="relative z-10 flex h-full flex-1 flex-col items-center justify-between overflow-hidden p-6 text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]"
      >
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
            sacandoFoto={sacandoFoto}
            error={capturaError}
            armar={armar}
            grabar={grabar}
            detener={detener}
            ajustes={capturaAjustes}
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
  /**
   * Aviso local de disparo en curso. Va aparte de `estado` a proposito: el
   * estado de captura es el que viaja al backend y lee el pre-vuelo del
   * escaner, y sacar una foto no cambia lo que esa camara puede hacer.
   */
  sacandoFoto: boolean;
  error: string | null;
  armar: () => Promise<void>;
  grabar: () => void;
  detener: () => Promise<{ blob: Blob; mimeType: string; duracionMs: number }>;
  /** Resolución/fps reales y bitrate derivado; se pinta solo con `?debug=1`. */
  ajustes: AjustesCaptura | null;
  /** `true` solo con `?debug=1` en la URL — gatea los botones de prueba. */
  debug: boolean;
}

// Recibe funciones/estado sueltos, NUNCA el objeto `captura` completo del
// hook — ver el comentario de arriba de `useKioskRecorder()` en
// `CamaraPageContent`: ese objeto trae `videoRef` adentro, y
// `react-hooks/refs` no deja pasar un ref río abajo metido en un prop.
function CapturaEstado({
  estado,
  sacandoFoto,
  error,
  armar,
  grabar,
  detener,
  ajustes,
  debug,
}: CapturaEstadoProps) {
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

  // El aviso de foto se pinta ANTES del switch: mientras dura, es lo único
  // que importa en pantalla. Gana también sobre GRABANDO — la toma sigue
  // corriendo (el cartel de abajo lo sigue diciendo), pero lo que el operador
  // necesita saber en ese segundo y medio es que se está tomando la foto y
  // que no mueva el equipo.
  if (sacandoFoto && (estado === 'armada' || estado === 'grabando')) {
    return (
      <>
        <p className="text-6xl font-bold" aria-live="polite">
          📸 FOTO
        </p>
        <p className="mt-2 text-sm text-white/70">No muevas el equipo</p>
        {estado === 'grabando' && (
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/50">
            La grabación sigue
          </p>
        )}
      </>
    );
  }

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
              {/* Con qué se está grabando DE VERDAD. Pedir 1920 no garantiza
                  1920 y el bitrate sale de lo que la cámara entregó, así que
                  sin esto la única forma de saberlo era bajar el video de S3
                  y parsearlo — que es exactamente como se descubrió que el
                  techo de 2 Mbps era nuestro y no del teléfono. */}
              {ajustes && (
                <p className="text-xs text-white/50">
                  {ajustes.ancho && ajustes.alto
                    ? `${ajustes.ancho}×${ajustes.alto}`
                    : 'resolución n/d'}
                  {ajustes.fps ? ` · ${Math.round(ajustes.fps)} fps` : ''} ·{' '}
                  {(ajustes.bitrate / 1e6).toFixed(1)} Mbps
                </p>
              )}
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
