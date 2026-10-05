/**
 * Telemetría del formulario posterior.
 *
 * Manda al mismo `POST /public/events/batch` que usa el resto de la web
 * pública, con los tipos catalogados en ws2 (`FOLLOWUP_FORM_EVENT_TYPES`): un
 * tipo que no esté allá se descarta en el servidor y no se entera nadie.
 *
 * La `session_id` la da el backend en `telemetria_session` (derivada del token,
 * NO el token: el token es la única credencial del formulario y no puede
 * quedar guardado en una tabla de telemetría).
 *
 * Lo que mide acá y no puede medir el backend: cuánto tiempo estuvo la pantalla
 * abierta, hasta qué sección llegó, cuánto scrolleó, y cuánto tardó la subida
 * REAL del archivo --- el servidor solo ve el request ya completo.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';
const URL_BATCH = `${API_BASE_URL}/public/events/batch`;

/** Las secciones, en el orden en que se ven. El nombre es el contrato con
 * `SECCIONES` de ws2: con otro nombre, "hasta dónde llegó" queda en blanco. */
export type Seccion = 'resumen' | 'direccion' | 'documentos' | 'contacto' | 'dudas' | 'enviar';
const ORDEN: Seccion[] = ['resumen', 'direccion', 'documentos', 'contacto', 'dudas', 'enviar'];

type Props = Record<string, unknown>;
type Evento = { event_type: string; client_ts: number; properties: Props };

let sesion = '';
let solicitud = '';
/** Qué tipo de formulario le tocó (`payslip`, `fee_receipts`, …). Va en TODOS
 * los eventos: sin eso los tiempos no se pueden leer, porque no se le pide lo
 * mismo a cada casuística. */
let casuistica = '';
let inicio = 0;
let pasoMaximo: Seccion | null = null;
let cola: Evento[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let cerrado = false;

/** Junta los eventos y los manda de a tandas: un POST por scroll sería peor
 * que no medir nada en un celular con señal pobre. */
function programarEnvio() {
  if (timer || cola.length === 0) return;
  timer = setTimeout(() => { timer = null; void enviarCola(); }, cola.length >= 8 ? 0 : 4000);
}

async function enviarCola() {
  if (!sesion || cola.length === 0) return;
  const lote = cola;
  cola = [];
  try {
    await fetch(URL_BATCH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sesion, events: lote }),
      keepalive: true,
    });
  } catch {
    /* La telemetría no reintenta: perder un evento no puede costarle nada al
       estudiante, y una cola que crece sin techo sí. */
  }
}

/**
 * Cronometros con nombre. Viven aca y no en el componente porque medir con
 * `Date.now()` dentro del cuerpo de un componente es una llamada impura para
 * `react-hooks/purity` --- y porque el que mide es el que reporta.
 */
const relojes = new Map<string, number>();

export function cronometrar(clave: string) {
  relojes.set(clave, Date.now());
}

/** Milisegundos desde `cronometrar(clave)`. `undefined` si nadie lo arranco. */
export function medir(clave: string): number | undefined {
  const t0 = relojes.get(clave);
  if (t0 === undefined) return undefined;
  relojes.delete(clave);
  return Date.now() - t0;
}

export function iniciarTelemetria(
  sessionId?: string | null,
  applicationCode?: string | null,
  situacion?: string | null,
) {
  if (!sessionId) return;
  sesion = sessionId;
  solicitud = applicationCode ?? '';
  casuistica = situacion ?? '';
  inicio = Date.now();
  cerrado = false;
}

export function evento(tipo: string, props: Props = {}) {
  if (!sesion) return;
  cola.push({
    event_type: tipo,
    client_ts: Date.now(),
    properties: {
      ...props,
      ...(solicitud ? { application_code: solicitud } : {}),
      ...(casuistica ? { situacion: casuistica } : {}),
    },
  });
  programarEnvio();
}

/** Marca la sección más lejana que vio. Solo avanza: volver al resumen no
 * borra que ya había llegado a documentos. */
export function verSeccion(seccion: Seccion) {
  const antes = pasoMaximo ? ORDEN.indexOf(pasoMaximo) : -1;
  if (ORDEN.indexOf(seccion) <= antes) return;
  pasoMaximo = seccion;
  evento('followup_form_section_view', { seccion });
}

/**
 * Cierre de la pantalla. Va por `sendBeacon`, que es lo único que el navegador
 * garantiza al cerrar la pestaña; un `fetch` normal se cancela a mitad.
 * Se llama una sola vez: en móvil `visibilitychange` dispara varias veces.
 */
export function cerrarTelemetria(motivo: string) {
  if (!sesion || cerrado) return;
  cerrado = true;
  const evento_final: Evento = {
    event_type: 'followup_form_exit',
    client_ts: Date.now(),
    properties: {
      duracion_ms: Date.now() - inicio,
      paso_maximo: pasoMaximo,
      motivo,
      ...(solicitud ? { application_code: solicitud } : {}),
      ...(casuistica ? { situacion: casuistica } : {}),
    },
  };
  const cuerpo = JSON.stringify({ session_id: sesion, events: [...cola, evento_final] });
  cola = [];
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(URL_BATCH, new Blob([cuerpo], { type: 'application/json' }));
      return;
    }
  } catch {
    /* sin sendBeacon: se intenta el fetch de abajo */
  }
  try {
    void fetch(URL_BATCH, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: cuerpo, keepalive: true,
    });
  } catch {
    /* nada más que hacer: la pestaña se está yendo */
  }
}

/** Para los tests: deja el módulo como recién cargado. */
export function _reiniciarTelemetria() {
  sesion = ''; solicitud = ''; casuistica = ''; inicio = 0; pasoMaximo = null; cola = []; cerrado = false;
  relojes.clear();
  if (timer) { clearTimeout(timer); timer = null; }
}
