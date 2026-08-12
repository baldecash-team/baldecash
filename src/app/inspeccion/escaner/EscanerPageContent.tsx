'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { PreVuelo, estaListo } from '../_components/PreVuelo';
import { clearDeviceSession, getDeviceSession, type DeviceSession } from '../_lib/deviceSession';
import { mensajeDeError, mensajeDeRed } from '../_lib/errores';
import { IdentificarEquipo, type EquipoCatalogo } from '../_components/IdentificarEquipo';
import { API_BASE_URL, redeemPairingCode } from '../_lib/pairing';
import { type PresenceCaptureState, usePresenceChannel } from '../_lib/usePresenceChannel';

interface PairingCode {
  code: string;
  expires_at: string;
  pair_url: string;
}

/**
 * Estado local del CONTROL DE GRABACIÓN (F3 Task 5, extendido en F4 Task
 * 5). No confundir con `InspectionStatus` del backend
 * (`created`/`recording`/…): esto es la máquina de estados de la VISTA, más
 * chica — el backend sigue siendo la única fuente de verdad de la
 * inspección en sí (spec §6, "solo la API transiciona estados").
 *
 * - `inactiva`    — nada en curso; puede iniciar si el pre-vuelo está listo.
 * - `iniciando`   — `POST /inspections` ya salió, esperando los acks de
 *                   todas las cámaras (`recording.started`) o el timeout.
 * - `grabando`    — todas las cámaras ackearon a tiempo (toma 1) o el
 *                   servidor ya confirmó `POST /takes` (toma 2+, que NO
 *                   espera acks — ver doc-comment de `pedirTomaSiguiente`).
 * - `decidiendo`  — (F4 Task 5) la toma actual ya se detuvo (`POST /stop`
 *                   ya resolvió) y el operador tiene que elegir: otra toma
 *                   del mismo equipo, o subir y cerrar. La inspección
 *                   sigue viva en el backend (`uploading`) mientras se
 *                   decide — solo la vista está "en pausa" acá.
 */
type SesionEstado = 'inactiva' | 'iniciando' | 'grabando' | 'decidiendo';

/**
 * Ventana para que TODAS las cámaras de la estación confirmen el arranque
 * (spec §6.1 regla 1). Las cámaras mandan su ack apenas les llega `cmd.start`,
 * antes de programar nada (ver doc-comment de `ackComando` en
 * `CamaraPageContent.tsx`). Si no llegó `recording.started`, no hay ambigüedad
 * posible: alguna cámara no confirmó y NUNCA se asume que grabó — se aborta.
 *
 * **Tiene que ser MAYOR que `_START_DELAY_MS` del backend (1,5s), no igual.**
 * Valían lo mismo, y eso hacía una carrera que se perdía sola en hardware real:
 * el ack no viaja por Pusher sino por REST desde el teléfono, así que su ida y
 * vuelta (entrega de Pusher + red móvil + request) supera 1,5s con facilidad en
 * 4G o WiFi cargado. El escáner abortaba en el mismo instante en que la cámara
 * arrancaba — se veía el 3·2·1 en pantalla junto al mensaje de aborto, y el
 * segundo intento andaba. Medido en la primera prueba con teléfono, 2026-08-12.
 *
 * 5s deja ~3,5s de margen sobre el arranque. El costo de subirlo es que una
 * cámara realmente caída tarda más en detectarse; el costo de dejarlo corto era
 * abortar inspecciones que estaban saliendo bien, que es mucho peor: la cámara
 * ya gastó el gesto del operador y el equipo ya está en posición.
 */
const ACK_TIMEOUT_MS = 5_000;

function hayCodigoEnUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('p') !== null;
}

/**
 * Controlador de la estación. En F1 muestra el pre-vuelo y permite vincular
 * cámaras por QR: la lectura del serial es F2 y el comando de grabación es F3.
 *
 * El QR se genera EN EL CLIENTE con `qrcode.react` — no se manda la URL de
 * vinculación a un servicio externo (ver nota sobre `pedirCodigo` más abajo).
 *
 * REGLA DE VINCULACIÓN — igual en esta vista y en `CamaraPageContent.tsx`,
 * a propósito, no una casualidad; no la deduzcas comparando archivos:
 *
 *   1. Si la URL trae `?p={código}`, el parámetro se LIMPIA
 *      SINCRÓNICAMENTE al entrar al efecto, ANTES de cualquier `await` —
 *      sin excepciones, haya o no una sesión guardada. Un código no debe
 *      sobrevivir ni un instante del primer render: el layout raíz manda
 *      `page_location` (con query string) a GA/GTM, así que un código sin
 *      limpiar termina en Analytics; y mientras siga en la URL, sigue
 *      siendo canjeable en cada refresh.
 *   2. El código GANA sobre una sesión ya guardada: escanear un QR es una
 *      acción deliberada de alguien parado frente a la pantalla —
 *      re-vincular, cambiar de estación, reemplazar un token revocado —
 *      no un accidente. Es, hoy, el ÚNICO camino de re-vinculación:
 *      `clearDeviceSession()` está exportada pero nadie la llama, así que
 *      si el código "nuevo" perdiera contra la sesión existente, un
 *      dispositivo mal vinculado solo se recuperaría borrando los datos
 *      del sitio a mano en Chrome.
 *
 * Este componente se monta SOLO en el cliente (`page.tsx` lo carga con
 * `next/dynamic(..., { ssr: false })`) — ver el doc-comment de `page.tsx`
 * para el porqué. Gracias a eso, el `useState(() => getDeviceSession())`
 * de abajo es seguro: no hay HTML de servidor con el que discrepar.
 */
export default function EscanerPageContent() {
  // Lazy init por el mismo motivo que CamaraPageContent.tsx: valores
  // síncronos disponibles desde el primer render, sin efecto + microtask.
  const [session, setSession] = useState<DeviceSession | null>(() => getDeviceSession());
  const [vinculando, setVinculando] = useState<boolean>(() => hayCodigoEnUrl());
  const [vinculoError, setVinculoError] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [stateError, setStateError] = useState<string | null>(null);
  // "Snapshot" de `GET /state` — resync de la review de F2/rediseño F3 Task
  // 5: si el escáner recarga (o nunca vio el `device.capture_state` de
  // Pusher para una cámara en particular), este mapa cubre ese hueco hasta
  // que llegue un reporte fresco por el canal. Ver el merge en `members`
  // más abajo: el valor EN VIVO del canal (`usePresenceChannel`) siempre
  // gana sobre este snapshot cuando ambos existen — este es solo el piso.
  const [deviceCaptureStates, setDeviceCaptureStates] = useState<
    Record<string, PresenceCaptureState | null>
  >({});
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [pairingError, setPairingError] = useState<string | null>(null);

  // Control de grabación (F3 Task 5). `serial` es entrada MANUAL a
  // propósito: la lectura por cámara/OCR y la confirmación contra Airtable
  // (spec §5) son una fase aparte, no cubierta por este plan — "manual" es
  // uno de los tres caminos legítimos del spec, no un atajo temporal.
  const [serial, setSerial] = useState('');
  // El equipo CONFIRMADO contra el catálogo de Airtable. Es lo que habilita
  // INICIAR: el serial escrito no alcanza, porque un serial mal leído (o mal
  // tipeado) grabaría evidencia contra el equipo equivocado — que es el riesgo
  // que el spec §5.1 cierra con esta confirmación, no con un OCR mejor.
  const [equipo, setEquipo] = useState<EquipoCatalogo | null>(null);
  const [sesionEstado, setSesionEstado] = useState<SesionEstado>('inactiva');
  const [sesionError, setSesionError] = useState<string | null>(null);
  // Contador de tomas (F4 Task 5), visible en pantalla mientras se decide
  // "toma 2" o "subir". Arranca en 1 (la que ya se detuvo) — el servidor es
  // quien decide el `take_number` real de la próxima (`POST /takes` lo
  // devuelve, `InspectionService.siguiente_take`); acá solo se refleja lo
  // que el servidor confirmó, nunca se calcula localmente.
  const [takeNumber, setTakeNumber] = useState(1);
  // Bloqueo de "toma 2" por cola de subida llena (F4 Task 5, el hueco que
  // dejó F4 Task 4): `null` si ninguna cámara reportó estar llena, o
  // `{ label, motivo }` de la PRIMERA que sí — alcanza con una para
  // bloquear el botón, no hace falta juntar todas.
  const [bloqueoCola, setBloqueoCola] = useState<{ label: string; motivo: string | null } | null>(
    null
  );
  // El id de la inspección en curso vive en un ref, no en estado: lo
  // necesitan closures de callbacks/efectos (el handler de `recording.started`,
  // el timeout de acks) que no deben re-crearse solo porque cambió, y
  // `finalizarInspeccion` necesita leer el valor MÁS RECIENTE en el momento
  // del click, no el que tenía cuando se creó el callback.
  const inspectionIdRef = useRef<number | null>(null);
  const ackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('p');
    if (!code) return;

    // Sincrónico, antes de cualquier await — ver doc-comment de arriba.
    window.history.replaceState({}, '', window.location.pathname);

    redeemPairingCode(code)
      .then((s) => setSession(s))
      .catch((e: Error) => setVinculoError(e.message))
      .finally(() => setVinculando(false));
  }, []);

  // La sesión guardada puede pertenecer al otro rol (ver doc-comment sobre
  // el render de más abajo): en ese caso no hay canal de presencia de
  // escáner que conectar ni estado de estación que consultar — se pasa
  // null a propósito, no solo para no renderizar el pre-vuelo sino para no
  // autenticar contra Pusher ni pegarle al backend con un token que no es
  // el de esta vista (los botones de vinculación que dependen de `labels`
  // terminarían dando 403 igual).
  const kindMismatch = session != null && session.kind !== 'escaner';

  // `error: channelError` para no chocar con `vinculoError`/`stateError`/
  // `pairingError`: son problemas distintos y no deben pisarse el mensaje.
  const { members, connected, error: channelError, channel } = usePresenceChannel(
    kindMismatch ? null : (session?.stationId ?? null),
    kindMismatch ? null : (session?.token ?? null)
  );

  // Las etiquetas esperadas vienen del servidor: el front nunca asume cuántas son.
  useEffect(() => {
    if (!session || kindMismatch) return;
    fetch(`${API_BASE_URL}/inspections/stations/${session.stationId}/state`, {
      headers: { 'X-Device-Token': session.token },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`http_${r.status}`);
        return r.json();
      })
      .then((d) => {
        setLabels(d.camera_labels ?? []);
        // Snapshot de estado de captura por dispositivo — ver doc-comment
        // de `deviceCaptureStates` más arriba. `d.devices` es la lista
        // completa de la estación (no solo cámaras), pero solo las cámaras
        // van a tener `capture_state` no-nulo — el resto simplemente no
        // aporta nada al merge.
        type DeviceStateItem = { device_id: string; capture_state?: PresenceCaptureState | null };
        const snapshot: Record<string, PresenceCaptureState | null> = {};
        for (const dev of (d.devices ?? []) as DeviceStateItem[]) {
          snapshot[dev.device_id] = dev.capture_state ?? null;
        }
        setDeviceCaptureStates(snapshot);
        // Limpia acá, no con un microtask al arrancar el efecto: así no
        // hace falta ningún setState síncrono en el cuerpo del efecto y el
        // error previo (si lo había) sigue visible hasta que el reintento
        // realmente resuelva, en vez de parpadear a "sin error" de entrada.
        setStateError(null);
      })
      .catch(() => {
        // Distinguir "no pude consultar el estado" (problema de red del
        // escáner) de "las cámaras no están conectadas" (problema real de
        // la estación) — si no, un corte de red del escáner se ve idéntico
        // a "faltan cámaras" y el operador va a revisar los teléfonos
        // equivocados.
        setStateError('No se pudo consultar el estado de la estación. Reintentá o revisá la red del escáner.');
      });
  }, [session, kindMismatch]);

  // Merge del estado de captura EN VIVO (canal, `usePresenceChannel`) con el
  // snapshot de `GET /state` (`deviceCaptureStates`) — resync de la review
  // de F2 / rediseño F3 Task 5. El canal gana cuando tiene un valor: es más
  // fresco por definición (llegó DESPUÉS del snapshot, mientras el efecto de
  // arriba ya se resolvió). El snapshot solo cubre el hueco de "recién until
  // ahora no pasó nada por el canal para esta cámara" — típicamente el
  // primer render, o una cámara que reportó mientras el escáner estaba
  // desconectado.
  const membersConCaptura = members.map((m) => ({
    ...m,
    captureState: m.captureState ?? deviceCaptureStates[m.deviceId] ?? null,
  }));

  // Movido acá arriba (antes vivía junto al render, después de los early
  // returns) porque `iniciarInspeccion`, más abajo, es un hook (`useCallback`)
  // y los hooks no pueden depender de un valor calculado después de un
  // `return` condicional — los hooks de un componente corren siempre en el
  // mismo orden, en TODOS los renders. `connected`/`channelError` entran en
  // la cuenta por el mismo motivo que en el banner (I2): presence queda
  // stale ante un corte, así que sin esto "listo" podía seguir en verde con
  // el escáner desconectado.
  const listo = connected && !channelError && estaListo(labels, membersConCaptura);

  // Ver doc-comment de `ACK_TIMEOUT_MS` sobre el porqué de este valor y por
  // qué SÍ es un timer sancionado por el spec (regla 1: abortar si no
  // llegan los acks a tiempo) y no una violación de la regla 4 ("el escáner
  // avanza solo con señal de la API") — esa regla es sobre AVANZAR
  // (`grabando` sale únicamente de `recording.started`, más abajo), no
  // sobre decidir un fracaso cuando nadie confirmó nada.
  const abortarPorTimeout = useCallback(() => {
    if (!session) return;
    const id = inspectionIdRef.current;
    if (id == null) return;
    inspectionIdRef.current = null;
    ackTimeoutRef.current = null;
    setSesionEstado('inactiva');
    setSesionError(
      'No llegó confirmación de todas las cámaras a tiempo. Se abortó la inspección — nunca se asume que grabó.'
    );
    // Fire-and-forget, mismo criterio que `ackComando` en
    // `CamaraPageContent.tsx`: la UI ya decidió (spec §6.1 regla 1) — esto
    // solo informa a la API para que transicione la inspección a `failed`
    // server-side (la fuente de verdad sigue siendo Aurora). Sin reintento:
    // no hay nada más accionable acá si falla por red.
    void fetch(`${API_BASE_URL}/inspections/${id}/abort`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Token': session.token },
      body: JSON.stringify({ motivo: 'timeout_ack_camaras' }),
    }).catch(() => {});
  }, [session]);

  // F4 Task 5: el hueco que dejó F4 Task 4. La cámara reporta su cola de
  // subida por REST (`CamaraPageContent.tsx`, mismo endpoint que ya
  // reportaba `capture_state`) y `GET /state` la expone por dispositivo
  // (`d.cola`, ver `InspectionStationService._cola_por_device` en ws2). El
  // escáner es quien COMANDA una toma nueva, así que es quien tiene que
  // frenar ANTES de pedirla si alguna cámara no puede recibirla — sin esto,
  // `encolar()` en la cámara la rechazaría en silencio y el video se
  // perdería de verdad.
  //
  // Devuelve la PRIMERA cámara llena que encuentra (alcanza con una para
  // bloquear) o `null` si ninguna lo está — incluyendo el caso "no se pudo
  // consultar `/state`" (fail-open: un corte de red del escáner no debe
  // trabar la inspección para siempre por falta de dato, mismo criterio
  // fail-open que ya aplica el backend a un reporte de cola vencido).
  //
  // Definido ANTES de `iniciarInspeccion` (fix de review post-Task-5): el
  // recovery de 409 `estacion_ocupada` en `iniciarInspeccion` también lo
  // necesita, y un `useCallback` no puede depender de un `const` declarado
  // más abajo en el cuerpo del componente (TDZ) — `verificarColaCamaras` en
  // su array de dependencias reventaría al montar.
  const verificarColaCamaras = useCallback(async (): Promise<
    { label: string; motivo: string | null } | null
  > => {
    if (!session) return null;
    try {
      const r = await fetch(`${API_BASE_URL}/inspections/stations/${session.stationId}/state`, {
        headers: { 'X-Device-Token': session.token },
      });
      if (!r.ok) return null;
      const body = await r.json();
      type ColaReporte = { llena: boolean; motivo_llena: string | null } | null;
      type DeviceStateItem = { kind: string; label: string | null; cola?: ColaReporte };
      const devices = (body.devices ?? []) as DeviceStateItem[];
      const llena = devices.find((d) => d.kind === 'camara' && d.cola?.llena === true);
      if (!llena) return null;
      return { label: llena.label ?? 'sin etiqueta', motivo: llena.cola?.motivo_llena ?? null };
    } catch {
      return null;
    }
  }, [session]);

  const iniciarInspeccion = useCallback(async () => {
    if (!session) return;
    const serialTrim = serial.trim();
    if (!listo || !serialTrim || sesionEstado !== 'inactiva') return;

    setSesionError(null);
    setSesionEstado('iniciando');
    try {
      const r = await fetch(`${API_BASE_URL}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Token': session.token },
        // `airtable_record_id` ata la evidencia al registro del catálogo, no
        // solo al texto del serial: si mañana alguien corrige el serial en
        // Airtable, el video sigue apuntando al equipo correcto.
        body: JSON.stringify({
          serial: serialTrim,
          serial_source: 'manual',
          airtable_record_id: equipo?.record_id ?? null,
        }),
      });
      if (!r.ok) {
        // Fix de review post-F4-Task-5 (C4, CRÍTICO): un 409
        // `estacion_ocupada` (guarda C3, ws2) trae el `inspection_id` de la
        // inspección que YA está en curso — típicamente la de un ciclo
        // anterior que este escáner no llegó a cerrar (recargó la pestaña
        // en "decidiendo", perdió el estado en memoria). Antes esto se
        // mostraba como error mudo y el `inspection_id` se descartaba: sin
        // ÉL no hay forma de retomarla, la estación queda inutilizable
        // hasta que el barrido la cierre por timeout. Ahora se recupera y
        // se pasa directo a "decidiendo" — las mismas dos opciones (toma
        // siguiente / subir) que ya existen para el ciclo normal.
        if (r.status === 409) {
          const errorBody = await r.json().catch(() => null);
          const detalle = errorBody?.detail as
            | { reason?: string; inspection_id?: number }
            | undefined;
          if (detalle?.reason === 'estacion_ocupada' && typeof detalle.inspection_id === 'number') {
            inspectionIdRef.current = detalle.inspection_id;
            setBloqueoCola(await verificarColaCamaras());
            // Best-effort: recupera el `take_number` REAL de la inspección
            // recuperada desde `/state` (ws2 lo expone en
            // `active_inspection.take_number`, mismo fix de review) — se
            // muestra 1 como piso si no está disponible (p.ej. la
            // inspección recuperada sigue `recording`, sin datos de
            // arranque resueltos todavía) en vez de dejar el contador sin
            // pintar nada.
            try {
              const rEstado = await fetch(
                `${API_BASE_URL}/inspections/stations/${session.stationId}/state`,
                { headers: { 'X-Device-Token': session.token } }
              );
              if (rEstado.ok) {
                const bodyEstado = await rEstado.json();
                const tomaRecuperada = bodyEstado?.active_inspection?.take_number;
                if (typeof tomaRecuperada === 'number') setTakeNumber(tomaRecuperada);
              }
            } catch {
              // Nada más accionable: el contador se queda en el piso (1).
            }
            setSesionEstado('decidiendo');
            setSesionError(
              'Esta estación ya tenía una inspección en curso — se recuperó para continuarla.'
            );
            return;
          }
        }
        setSesionError(await mensajeDeError(r, 'iniciar la inspección'));
        setSesionEstado('inactiva');
        return;
      }
      const body = await r.json();
      inspectionIdRef.current = body.inspection_id;
      setTakeNumber(1);
      setBloqueoCola(null);
      if (ackTimeoutRef.current) clearTimeout(ackTimeoutRef.current);
      ackTimeoutRef.current = setTimeout(abortarPorTimeout, ACK_TIMEOUT_MS);
    } catch {
      setSesionError(mensajeDeRed('iniciar la inspección'));
      setSesionEstado('inactiva');
    }
  }, [session, serial, equipo, listo, sesionEstado, abortarPorTimeout, verificarColaCamaras]);

  const finalizarInspeccion = useCallback(async () => {
    if (!session) return;
    const id = inspectionIdRef.current;
    if (id == null) return;
    setSesionError(null);
    try {
      const r = await fetch(`${API_BASE_URL}/inspections/${id}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Token': session.token },
      });
      if (!r.ok) {
        setSesionError(await mensajeDeError(r, 'finalizar la inspección'));
        return;
      }
      // F4 Task 5: ya NO se resetea acá — la toma se detuvo, pero la
      // inspección sigue viva (`uploading`) hasta que el operador elija
      // "toma 2" o "subir". El escáner se libera al `stopped` (esta
      // respuesta), no a la verificación en S3 (spec, plan Task 5 Step 4):
      // la subida sigue corriendo en segundo plano mientras se decide.
      setSesionEstado('decidiendo');
      // Consulta la cola de las cámaras YA, para que el botón "toma 2"
      // nazca deshabilitado si corresponde en vez de que el operador lo
      // toque y recién ahí se entere.
      setBloqueoCola(await verificarColaCamaras());
    } catch {
      setSesionError(mensajeDeRed('finalizar la inspección'));
    }
  }, [session, verificarColaCamaras]);

  // F4 Task 5: «toma 2» — otro ángulo del MISMO equipo, se SUMA a la
  // evidencia (spec §4.1). `POST /takes` transiciona `uploading` →
  // `recording` de inmediato en el servidor (`InspectionService.iniciar_toma`)
  // y NO espera un quórum de acks como la toma 1 — las cámaras ya
  // demostraron estar armadas y sincronizadas, así que acá no hay
  // `iniciando` intermedio ni timeout de acks: éxito HTTP => `grabando`.
  const pedirTomaSiguiente = useCallback(async () => {
    if (!session) return;
    const id = inspectionIdRef.current;
    if (id == null || sesionEstado !== 'decidiendo') return;

    setSesionError(null);
    // Re-verifica la cola justo antes de comandar — la vista pudo llevar
    // un rato en "decidiendo" (el operador cambiando el equipo) y el
    // snapshot que trajo `finalizarInspeccion` ya puede estar viejo.
    const bloqueo = await verificarColaCamaras();
    setBloqueoCola(bloqueo);
    if (bloqueo) return;

    try {
      const r = await fetch(`${API_BASE_URL}/inspections/${id}/takes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Token': session.token },
      });
      if (!r.ok) {
        setSesionError(await mensajeDeError(r, 'iniciar la toma siguiente'));
        return;
      }
      const body = await r.json();
      setTakeNumber(body.take_number);
      setSesionEstado('grabando');
    } catch {
      setSesionError(mensajeDeRed('iniciar la toma siguiente'));
    }
  }, [session, sesionEstado, verificarColaCamaras]);

  // F4 Task 5: «subir» — señal explícita de que no vienen más tomas
  // (`POST /close` → `InspectionService.solicitar_cierre`). Sin esta
  // señal, la inspección NUNCA completa por sí sola por más que todos sus
  // videos verifiquen (`InspectionVideoService.puede_completarse`, ws2) —
  // es la carrera que esta Task vino a cerrar. Libera al escáner de
  // inmediato (spec Task 5 Step 4): la subida sigue en segundo plano.
  const subirInspeccion = useCallback(async () => {
    if (!session) return;
    const id = inspectionIdRef.current;
    if (id == null || sesionEstado !== 'decidiendo') return;

    setSesionError(null);
    try {
      const r = await fetch(`${API_BASE_URL}/inspections/${id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Token': session.token },
      });
      if (!r.ok) {
        setSesionError(await mensajeDeError(r, 'subir la inspección'));
        return;
      }
      inspectionIdRef.current = null;
      setSesionEstado('inactiva');
      setSerial('');
      setTakeNumber(1);
      setBloqueoCola(null);
    } catch {
      setSesionError(mensajeDeRed('subir la inspección'));
    }
  }, [session, sesionEstado]);

  // `recording.started` es la ÚNICA señal que hace avanzar a `grabando`
  // (spec §6.1 regla 4: el escáner avanza solo con señal de la API, jamás
  // con un timer propio) — la emite `POST /inspections/{id}/ack` en el
  // backend cuando ya ackearon TODAS las cámaras que `camera_labels`
  // declara (`InspectionService.intentar_marcar_grabando_por_acks`), así que
  // acá no hace falta contar acks por cámara: un solo evento con
  // `inspection_id` alcanza. Se descarta cualquier evento que no matchee la
  // inspección en curso (p. ej. una redelivery tardía de una inspección ya
  // abortada) comparando contra `inspectionIdRef`, no contra un `seq` propio
  // — este evento no lleva uno.
  useEffect(() => {
    if (!channel) return undefined;
    const handler = (data: unknown) => {
      const payload = data as { inspection_id?: number } | null;
      if (payload?.inspection_id == null) return;
      if (payload.inspection_id !== inspectionIdRef.current) return;
      if (ackTimeoutRef.current) {
        clearTimeout(ackTimeoutRef.current);
        ackTimeoutRef.current = null;
      }
      setSesionEstado('grabando');
    };
    channel.bind('recording.started', handler);
    return () => {
      // `?.`: el fake de test (`_test-support/fakePusher.ts`) solo
      // implementa `bind`/`emit`, igual que el `ComandoChannel` de
      // `useComandos.ts` — mismo criterio ahí.
      channel.unbind?.('recording.started', handler);
    };
  }, [channel]);

  // Limpieza del timeout de acks al desmontar — mismo espíritu que el timer
  // de arranque de `CamaraPageContent.tsx`: no dejar un `setTimeout` vivo
  // apuntando a un componente que ya se fue.
  useEffect(() => {
    return () => {
      if (ackTimeoutRef.current) clearTimeout(ackTimeoutRef.current);
    };
  }, []);

  const pedirCodigo = useCallback(
    async (label: string) => {
      if (!session) return;
      setPairingError(null);
      try {
        // NOTA DE CONTRATO (verificado contra el backend, commit c648e547):
        // POST /inspections/stations/{id}/pairing-codes acepta DOS vías de
        // auth (app/api/routers/inspection/pairing.py): un UserAccount de
        // backoffice por JWT Bearer, O el propio escáner de la estación por
        // `X-Device-Token` — pero solo para emitir códigos `kind=camara` de
        // SU PROPIA estación (`_authorize_scanner_camera_code`). Es lo que
        // permite vincular una cámara caída sin depender de que haya un
        // supervisor de backoffice disponible. La llamada de acá (kind fijo
        // en 'camara', mismo `session.stationId`) ya matchea ese contrato.
        const r = await fetch(
          `${API_BASE_URL}/inspections/stations/${session.stationId}/pairing-codes`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Device-Token': session.token,
            },
            body: JSON.stringify({ kind: 'camara', label }),
          }
        );
        if (!r.ok) {
          setPairingError(await mensajeDeError(r, 'emitir el código'));
          setPairing(null);
          return;
        }
        setPairing(await r.json());
      } catch {
        setPairingError(mensajeDeRed('emitir el código'));
        setPairing(null);
      }
    },
    [session]
  );

  if (vinculando) {
    return (
      <main className="p-6">
        <p className="text-lg font-semibold" style={{ color: TOKENS.ink }}>
          Vinculando…
        </p>
      </main>
    );
  }

  // Un mismo navegador solo puede estar vinculado a UN rol a la vez (ver
  // doc-comment de `deviceSession.ts`): `_upsert_device` en el backend
  // busca por `id` y sobrescribe `kind`/`token_hash`, así que vincularse acá
  // como cámara mataría esa fila de escáner sin que nadie se entere. Si la
  // sesión guardada es de otro rol, no se monta el pre-vuelo — antes
  // igual se montaba y los botones de vinculación terminaban dando 403. Se
  // explica qué pasa y se ofrece el único camino de re-vinculación que
  // existe hoy: `clearDeviceSession()`.
  if (kindMismatch && session) {
    return (
      <main className="p-6">
        <p className="text-lg font-semibold" style={{ color: TOKENS.ink }}>
          Dispositivo vinculado con otro rol
        </p>
        <p className="mt-2 text-sm" style={{ color: TOKENS.slate }}>
          Este dispositivo está vinculado como cámara ({session.label ?? 'sin etiqueta'}) de la
          estación {session.stationId}. Para usarlo como escáner hay que volver a vincularlo,
          y eso lo va a desvincular como cámara.
        </p>
        <button
          type="button"
          onClick={() => {
            clearDeviceSession();
            setSession(null);
          }}
          className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold"
          style={{ borderColor: TOKENS.primary, color: TOKENS.primary }}
        >
          Re-vincular este dispositivo
        </button>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="p-6">
        <p className="text-lg font-semibold" style={{ color: TOKENS.ink }}>
          Escáner no vinculado
        </p>
        <p className="mt-2 text-sm" style={{ color: vinculoError ? TOKENS.red : TOKENS.slate }}>
          {vinculoError ?? 'Abrí la URL de vinculación que emite el backoffice para esta estación.'}
        </p>
      </main>
    );
  }

  // Precedencia que sostiene la semántica del banner (I1): `channelError`
  // (no sé nada del canal) > `stateError` (no sé qué espera la estación) >
  // `listo`/`faltan cámaras` (sé, y falta esto). Cuando gana un error de
  // arriba, el banner NO debe afirmar nada sobre las cámaras — antes,
  // `channelError` quedaba en un <p> chico aparte mientras el banner grande
  // seguía diciendo "Faltan cámaras" (falso: nadie sabía nada de las
  // cámaras), dos pantallas contradictorias sin que ninguna ganara.
  let bannerText: string;
  let bannerBg: string;
  let bannerColor: string;
  if (channelError) {
    bannerText = channelError.message;
    bannerBg = '#FBEDEE';
    bannerColor = channelError.reason === 'missing_config' ? TOKENS.tertiary : TOKENS.red;
  } else if (stateError) {
    bannerText = stateError;
    bannerBg = '#FBEDEE';
    bannerColor = TOKENS.red;
  } else if (listo) {
    bannerText = 'Estación lista para escanear';
    bannerBg = '#E9F4EF';
    bannerColor = TOKENS.green;
  } else {
    bannerText = 'Faltan cámaras — no se puede escanear';
    bannerBg = '#FBEDEE';
    bannerColor = TOKENS.red;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: TOKENS.slate }}>
        Estación {session.stationId}
      </p>
      <h1 className="mt-1 text-2xl font-bold" style={{ color: TOKENS.ink }}>
        Pre-vuelo
      </h1>

      <div className="mt-6">
        <PreVuelo expectedLabels={labels} members={membersConCaptura} />
      </div>

      <p
        className="mt-6 rounded-xl p-4 text-center text-sm font-semibold"
        style={{ background: bannerBg, color: bannerColor }}
      >
        {bannerText}
      </p>

      {/*
        "Reconectando…" solo cuando NO hay un error explicado arriba: si
        channelError o stateError ya están en el banner grande, repetir acá
        un mensaje distinto sobre lo mismo es la contradicción que era I1.
      */}
      {!channelError && !stateError && !connected && (
        <p className="mt-3 text-center text-xs" style={{ color: TOKENS.slate }}>
          Reconectando…
        </p>
      )}

      {/*
        Control de grabación (F3 Task 5). El estado de la inspección en
        curso tiene que verse grande y claro — el operador no puede tener
        que adivinar si está grabando (plan, Task 5 Step 4) — por eso
        "GRABANDO" usa la misma tipografía enorme que el kiosco de cámara
        (`CamaraPageContent.tsx`), no un texto chico más entre los demás.
      */}
      <section className="mt-8 border-t pt-6" style={{ borderColor: TOKENS.line }}>
        <h2 className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
          Inspección
        </h2>

        {sesionEstado === 'grabando' ? (
          <>
            <p
              className="mt-4 text-center text-5xl font-bold"
              style={{ color: TOKENS.red }}
            >
              GRABANDO
            </p>
            {/* Contador de tomas (F4 Task 5, plan Step 1: "el contador de
                tomas se ve en pantalla") — visible también mientras graba,
                no solo en la pantalla de decisión, para que el operador
                nunca tenga que recordar en qué toma va. */}
            <p className="mt-1 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: TOKENS.slate }}>
              Toma {takeNumber}
            </p>
            <button
              type="button"
              onClick={() => void finalizarInspeccion()}
              className="mt-6 w-full rounded-xl px-6 py-4 text-lg font-bold text-white"
              style={{ background: TOKENS.primary }}
            >
              FINALIZAR
            </button>
          </>
        ) : sesionEstado === 'decidiendo' ? (
          <>
            {/* F4 Task 5 — el corazón de la Task: al terminar una toma, el
                operador decide entre otro ángulo del MISMO equipo (se SUMA,
                spec §4.1) o subir y cerrar. Ninguna de las dos opciones
                espera a que la subida en curso termine de verificarse en
                S3 — corre en segundo plano mientras se decide. */}
            <p className="mt-4 text-center text-2xl font-bold" style={{ color: TOKENS.ink }}>
              Toma {takeNumber} lista
            </p>
            <p className="mt-1 text-center text-xs" style={{ color: TOKENS.slate }}>
              Subiendo en segundo plano — no hace falta esperar.
            </p>

            {bloqueoCola && (
              <p
                className="mt-4 rounded-xl p-3 text-center text-xs font-semibold"
                style={{ background: '#FBEDEE', color: TOKENS.red }}
              >
                No se puede grabar otra toma todavía: la cola de subida de la cámara{' '}
                {bloqueoCola.label} está llena
                {bloqueoCola.motivo === 'fallidos'
                  ? ' (hay videos que fallaron y necesitan reintentarse en esa cámara)'
                  : bloqueoCola.motivo === 'subiendo'
                    ? ' (todavía está subiendo lo anterior)'
                    : ''}
                . Esperá a que descargue antes de pedir otra toma.
              </p>
            )}

            <button
              type="button"
              onClick={() => void pedirTomaSiguiente()}
              disabled={bloqueoCola != null}
              className="mt-6 w-full rounded-xl px-6 py-4 text-lg font-bold text-white disabled:opacity-40"
              style={{ background: TOKENS.primary }}
            >
              TOMA {takeNumber + 1}
            </button>
            <button
              type="button"
              onClick={() => void subirInspeccion()}
              className="mt-3 w-full rounded-xl border px-6 py-4 text-lg font-bold"
              style={{ borderColor: TOKENS.primary, color: TOKENS.primary }}
            >
              SUBIR
            </button>
          </>
        ) : (
          <>
            {session && (
              <IdentificarEquipo
                token={session.token}
                serial={serial}
                onSerialChange={setSerial}
                equipo={equipo}
                onEquipoChange={setEquipo}
                deshabilitado={sesionEstado !== 'inactiva'}
              />
            )}
            <button
              type="button"
              onClick={() => void iniciarInspeccion()}
              disabled={!listo || !equipo || sesionEstado !== 'inactiva'}
              className="mt-4 w-full rounded-xl px-6 py-4 text-lg font-bold text-white disabled:opacity-40"
              style={{ background: TOKENS.primary }}
            >
              {sesionEstado === 'iniciando' ? 'INICIANDO…' : 'INICIAR'}
            </button>
            {!equipo && serial.trim() && sesionEstado === 'inactiva' && (
              <p className="mt-2 text-center text-xs" style={{ color: TOKENS.slate }}>
                Confirmá el equipo contra el catálogo antes de grabar.
              </p>
            )}
          </>
        )}

        {sesionError && (
          <p className="mt-4 text-center text-sm font-semibold" style={{ color: TOKENS.red }}>
            {sesionError}
          </p>
        )}
      </section>

      <section className="mt-8 border-t pt-6" style={{ borderColor: TOKENS.line }}>
        <h2 className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
          Vincular una cámara
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {labels.map((label) => (
            <button
              key={label}
              onClick={() => pedirCodigo(label)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: TOKENS.primary, color: TOKENS.primary }}
            >
              {label}
            </button>
          ))}
        </div>

        {pairingError && (
          <p className="mt-4 text-center text-sm font-semibold" style={{ color: TOKENS.red }}>
            {pairingError}
          </p>
        )}

        {pairing && (
          <div className="mt-4 rounded-xl border p-4 text-center" style={{ borderColor: TOKENS.line }}>
            <p className="text-xs" style={{ color: TOKENS.slate }}>
              Escaneá este QR con la cámara del teléfono
            </p>
            {/*
              El escáner corre en laptop (pantalla ancha) y el teléfono lo
              escanea a cierta distancia: cuanto más grande, mejor. QRCodeSVG
              es vector (viewBox + paths, sin rasterizar) así que escalarlo
              por CSS no pierde nitidez — el `size` de abajo es solo la
              resolución interna del viewBox, el tamaño real lo da el
              contenedor responsive.
            */}
            <div className="mx-auto mt-3 w-40 sm:w-56 md:w-72 lg:w-96">
              <QRCodeSVG
                value={pairing.pair_url}
                size={384}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <p className="mt-3 font-mono text-2xl tracking-widest" style={{ color: TOKENS.ink }}>
              {pairing.code}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
