'use client';

import { API_BASE_URL } from './pairing';

/**
 * Cola de subida de videos a S3 (spec §8.1, plan F4 Task 3 — "el corazón de
 * esta fase").
 *
 * **Esto NO es un hook.** Es un módulo con estado propio, pensado para
 * vivir como singleton FUERA del ciclo de vida de React durante toda la
 * sesión del kiosco (`uploadQueue`, exportado al final). La razón es
 * concreta: un re-render, un cambio de estado de la vista, o la transición
 * `armada → grabando` de `useKioskRecorder.ts` NO deben cancelar un PUT en
 * vuelo. Si esto viviera dentro de un `useEffect` o de `useState`, el primer
 * re-render (o un simple montaje/desmontaje del componente que lo usa) lo
 * mataría — invisible en desarrollo, catastrófico en planta con el video
 * perdido y sin ninguna señal.
 *
 * Por eso la clase de abajo no tiene ninguna dependencia de React: ni
 * hooks, ni refs, ni efectos. Es un emisor de eventos común y corriente que
 * guarda sus subidas en un array de módulo y las procesa con `fetch`/`PUT`
 * comunes. La UI (Task 4/5) se entera del progreso SOLO por el callback de
 * `suscribir()` — nunca al revés, la UI no es dueña de la cola ni puede
 * tocar su estado interno.
 *
 * Contrato de red por video (spec §8, plan F4 Task 1 — ya implementado en
 * ws2, rama `feat/inspeccion-f4-subida`):
 *
 * ```
 * POST /inspections/{id}/takes/{take}/videos/{camera_label}/upload-url
 *      (X-Device-Token) {content_type} -> {upload_url, s3_key, expires_in}
 * PUT  <upload_url>                        (directo a S3, sin token)
 * POST /inspections/{id}/takes/{take}/videos/{camera_label}/complete
 *      (X-Device-Token) {bytes, duration_s, content_type} -> {status}
 * ```
 *
 * La API nunca ve el video: el PUT va directo al `upload_url` firmado.
 */

/**
 * Se exporta la clase (no solo el singleton de abajo) para que los tests
 * puedan instanciar colas aisladas entre sí, con `fetchImpl`/`profundidadMaxima`
 * /`maxIntentos`/`backoffBaseMs` inyectados — necesario para probar reintentos
 * y backpressure sin esperar segundos reales ni compartir estado entre tests.
 * El código de producción (Task 4/5) importa `encolar`/`suscribir` sueltos,
 * que delegan al singleton `uploadQueue` de más abajo — ESE es el contrato
 * literal del plan.
 */
export interface UploadQueueItem {
  inspectionId: number;
  takeNumber: number;
  cameraLabel: string;
  blob: Blob;
  mimeType: string;
  token: string;
  /**
   * Duración real de la grabación en milisegundos (`detener()` de
   * `useKioskRecorder.ts` la devuelve como `duracionMs`). Opcional y NO
   * parte del contrato literal del plan de Task 3 — se agrega acá porque el
   * endpoint `.../complete` de Task 1 la exige (`duration_s`) y esta cola es
   * la única pieza que le habla a ese endpoint. Sin ella se manda `0`: no
   * rompe la verificación server-side (esa se hace por `HeadObject` sobre
   * `bytes`, spec §8), pero el dato quedaría pobre — Task 4, al enganchar
   * `useKioskRecorder`, debería empezar a pasarla.
   */
  durationMs?: number;
}

/** Estado agregado que se reporta hacia la UI por callback (spec §8.1: "el
 * progreso se reporta hacia la UI por callback, no al revés"). */
export interface UploadQueueEstado {
  /** Subidas activas ahora mismo: haciendo la llamada de red, o esperando
   * el backoff de un reintento — ver el comentario de `procesar()` sobre por
   * qué un reintento en espera sigue contando acá y no como "pendiente". */
  enVuelo: number;
  /** Aceptadas pero todavía sin arrancar: la cola ya está en su profundidad
   * máxima de subidas concurrentes. */
  pendientes: number;
  /** Agotaron los reintentos. Terminal: nadie las vuelve a intentar sola. El
   * blob NO se descarta (`listarFallidos()` lo sigue exponiendo) — spec: "tras
   * N fallos queda marcado fallido sin perder el blob". */
  fallidos: number;
}

export type UploadQueueListener = (estado: UploadQueueEstado) => void;

export interface UploadQueueDeps {
  /** Inyectable para tests. Default: el `fetch` global (navegador). Se usa
   * tanto para los dos POST a la API como para el PUT directo a S3 — es la
   * misma primitiva de red, no hay razón para tener dos. */
  fetchImpl?: typeof fetch;
  /** Default: `API_BASE_URL` de `pairing.ts` — mismo fallback que el resto
   * de los módulos de `_lib` (ver su doc-comment). */
  baseUrl?: string;
  /** Cuántas subidas puede tener la cola simultáneamente "en vuelo" (activas
   * o reintentando) ANTES de rechazar por backpressure. Spec §8.1: "Profundidad
   * 2 por defecto: hasta dos videos en vuelo (~100 MB en memoria)". */
  profundidadMaxima?: number;
  /** Intentos totales por video (el primero + los reintentos) antes de
   * marcarlo `fallido`. Spec §10: "PUT a S3 falla: 3 reintentos con backoff
   * exponencial; después failed" → 1 intento inicial + 3 reintentos = 4. */
  maxIntentos?: number;
  /** Base del backoff exponencial en ms: intento N espera
   * `backoffBaseMs * 2^(N-1)` antes de reintentar (1s, 2s, 4s con el
   * default). Ajustable en tests para no esperar segundos reales. */
  backoffBaseMs?: number;
}

export const DEFAULT_PROFUNDIDAD_MAXIMA = 2;
const DEFAULT_MAX_INTENTOS = 4;
const DEFAULT_BACKOFF_BASE_MS = 1000;

/**
 * Una entrada trackeada por la cola. `estado` es interno — lo que sale hacia
 * afuera es siempre el agregado de `UploadQueueEstado`, nunca esto.
 */
interface Entrada {
  item: UploadQueueItem;
  estado: 'pendiente' | 'subiendo' | 'fallido';
  intentos: number;
}

export class UploadQueue {
  private entradas: Entrada[] = [];
  private listeners = new Set<UploadQueueListener>();
  // Sin resolver contra el `fetch` global EN EL CONSTRUCTOR: el singleton de
  // más abajo (`export const uploadQueue = new UploadQueue()`) se construye
  // al cargar el módulo, y en jsdom (los tests de este repo) `fetch` recién
  // existe como global una vez que el test lo asigna con `global.fetch = …`
  // — antes de eso, referenciar el identificador `fetch` a secas revienta
  // con `ReferenceError: fetch is not defined`. Guardar solo lo inyectado
  // (o `undefined`) y resolver contra `globalThis.fetch` recién al hacer la
  // llamada real (`subirUnaVez`, ya en runtime, con el test corriendo)
  // evita el problema sin perder la inyección para los tests.
  private readonly fetchImplInyectado: typeof fetch | undefined;
  private readonly baseUrl: string;
  private readonly profundidadMaxima: number;
  private readonly maxIntentos: number;
  private readonly backoffBaseMs: number;

  constructor(deps: UploadQueueDeps = {}) {
    this.fetchImplInyectado = deps.fetchImpl;
    this.baseUrl = deps.baseUrl ?? API_BASE_URL;
    this.profundidadMaxima = deps.profundidadMaxima ?? DEFAULT_PROFUNDIDAD_MAXIMA;
    this.maxIntentos = deps.maxIntentos ?? DEFAULT_MAX_INTENTOS;
    this.backoffBaseMs = deps.backoffBaseMs ?? DEFAULT_BACKOFF_BASE_MS;
  }

  /**
   * Encola un video para subir. Dispara la subida en segundo plano — nunca
   * bloquea, nunca hay que esperar nada acá (spec §8.1: "la subida corre en
   * segundo plano y no bloquea nada").
   *
   * Devuelve `true` si se aceptó, `false` si la cola está en su profundidad
   * máxima (backpressure). El plan tipa esto `: void`, pero un backpressure
   * mudo — que el llamador no pueda distinguir "encolado" de "descartado" —
   * es justamente lo que el spec pide evitar ("`encolar` reporta backpressure
   * en vez de aceptar infinito", plan F4 Task 3 Step 1). Un `boolean`
   * síncrono es la forma más simple de reportarlo sin inventar un canal
   * paralelo; Task 4/5 lo usa para decidir si bloquear al operador.
   *
   * La profundidad máxima cuenta TODO lo que sigue ocupando memoria sin
   * haber llegado a subir con éxito — en vuelo, pendiente y fallido por
   * igual. Un video `fallido` sigue siendo un blob de ~50 MB vivo en el
   * navegador (spec §8.1: "sin perder el blob"); si no contara para el
   * límite, la cola podría acumular fallidos sin techo y el riesgo de
   * memoria que el límite existe para acotar quedaría sin cubrir. La
   * contracara: con la cola trabada en fallidos (sin una vía de reintento
   * manual expuesta en esta Task), deja de aceptar nuevas subidas hasta que
   * alguien reinicie la pestaña — es el mismo "riesgo asumido" de memoria en
   * vuelo que ya documenta el spec, aplicado también al caso fallido.
   */
  encolar(item: UploadQueueItem): boolean {
    if (this.entradas.length >= this.profundidadMaxima) {
      return false;
    }
    this.entradas.push({ item, estado: 'pendiente', intentos: 0 });
    this.notificar();
    this.procesar();
    return true;
  }

  /**
   * Suscribe un callback a los cambios de `{ enVuelo, pendientes, fallidos }`.
   * Devuelve la función de desuscripción (mismo patrón que el resto de
   * `_lib`: `useComandos`/`usePresenceChannel` devuelven cleanup de
   * `useEffect`). No emite el estado actual al suscribirse — es un emisor de
   * eventos simple, no un observable con replay; quien necesite el estado
   * inicial lo pide con `estadoActual()`.
   */
  suscribir(cb: UploadQueueListener): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  /** Snapshot síncrono del estado agregado — útil para el valor inicial de
   * un `useState` en la UI, sin tener que esperar la primera notificación. */
  estadoActual(): UploadQueueEstado {
    let enVuelo = 0;
    let pendientes = 0;
    let fallidos = 0;
    for (const entrada of this.entradas) {
      if (entrada.estado === 'subiendo') enVuelo++;
      else if (entrada.estado === 'pendiente') pendientes++;
      else fallidos++;
    }
    return { enVuelo, pendientes, fallidos };
  }

  /**
   * Items que agotaron los reintentos, con su blob intacto. No hay API de
   * reintento manual en esta Task (fuera de alcance — Task 4/5 no la piden);
   * esto existe para que nada dependa de leer el estado interno de la cola
   * para verificar que el blob sobrevive a un fallo terminal.
   */
  listarFallidos(): UploadQueueItem[] {
    return this.entradas.filter((e) => e.estado === 'fallido').map((e) => e.item);
  }

  private notificar(): void {
    const estado = this.estadoActual();
    this.listeners.forEach((cb) => cb(estado));
  }

  /**
   * Arranca tantos `pendiente` como huecos haya hasta `profundidadMaxima`,
   * en el orden en que se encolaron (FIFO: recorre `entradas` de adelante
   * hacia atrás). Se llama tanto al encolar como al liberarse un lugar
   * (éxito o fallo terminal de otra entrada) — nunca al terminar un reintento
   * que todavía sigue vivo: una entrada "reintentando" retiene su lugar
   * hasta que se resuelve (spec: profundidad = "en vuelo", y un reintento en
   * curso sigue siendo trabajo en vuelo, no un hueco libre para otro video).
   */
  private procesar(): void {
    let disponibles =
      this.profundidadMaxima - this.entradas.filter((e) => e.estado === 'subiendo').length;
    if (disponibles <= 0) return;
    for (const entrada of this.entradas) {
      if (disponibles <= 0) break;
      if (entrada.estado !== 'pendiente') continue;
      entrada.estado = 'subiendo';
      disponibles--;
      this.notificar();
      void this.subirConReintentos(entrada);
    }
  }

  /**
   * Ciclo completo de una entrada: intenta, y si falla reintenta con backoff
   * exponencial hasta `maxIntentos`. Nunca pierde `entrada.item` — el blob
   * vive en el closure de `entrada` durante todo el ciclo, y si se agotan
   * los intentos la entrada queda en la lista como `fallido` en vez de
   * descartarse.
   */
  private async subirConReintentos(entrada: Entrada): Promise<void> {
    for (;;) {
      entrada.intentos++;
      try {
        await this.subirUnaVez(entrada.item);
        this.entradas = this.entradas.filter((e) => e !== entrada);
        this.notificar();
        this.procesar();
        return;
      } catch {
        if (entrada.intentos >= this.maxIntentos) {
          entrada.estado = 'fallido';
          this.notificar();
          // Libera el CUPO DE CONCURRENCIA para el siguiente pendiente. La
          // entrada fallida sigue contando para la profundidad total (ver
          // `encolar()`), pero ya no ocupa un lugar "en vuelo" activo.
          this.procesar();
          return;
        }
        const delayMs = this.backoffBaseMs * 2 ** (entrada.intentos - 1);
        await this.esperar(delayMs);
      }
    }
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Ver el comentario de `fetchImplInyectado`: resuelto acá, en runtime,
   * nunca en el constructor. */
  private get fetchImpl(): typeof fetch {
    return this.fetchImplInyectado ?? globalThis.fetch;
  }

  /** Un intento: pide la URL firmada, hace el PUT directo a S3, y confirma.
   * Cualquier respuesta no-ok o excepción de red se propaga como error —
   * `subirConReintentos` decide qué hacer con eso. */
  private async subirUnaVez(item: UploadQueueItem): Promise<void> {
    const apiHeaders = {
      'Content-Type': 'application/json',
      'X-Device-Token': item.token,
    };

    const urlRes = await this.fetchImpl(
      `${this.baseUrl}/inspections/${item.inspectionId}/takes/${item.takeNumber}/videos/${item.cameraLabel}/upload-url`,
      {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ content_type: item.mimeType }),
      }
    );
    if (!urlRes.ok) throw new Error(`upload-url http_${urlRes.status}`);
    const { upload_url: uploadUrl } = (await urlRes.json()) as { upload_url: string };

    // Directo a S3 — spec §3/§8: "el video nunca pasa por la API". Sin
    // `X-Device-Token`: la autorización ya está en la firma de la URL.
    const putRes = await this.fetchImpl(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': item.mimeType },
      body: item.blob,
    });
    if (!putRes.ok) throw new Error(`put http_${putRes.status}`);

    const completeRes = await this.fetchImpl(
      `${this.baseUrl}/inspections/${item.inspectionId}/takes/${item.takeNumber}/videos/${item.cameraLabel}/complete`,
      {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          bytes: item.blob.size,
          duration_s: item.durationMs != null ? Math.round(item.durationMs / 1000) : 0,
          content_type: item.mimeType,
        }),
      }
    );
    if (!completeRes.ok) throw new Error(`complete http_${completeRes.status}`);
  }
}

/**
 * El singleton real que usan las vistas (Task 4/5). Vive en el módulo, no en
 * ningún componente — sobrevive a cualquier cantidad de montajes/
 * desmontajes/re-renders mientras la pestaña siga abierta. Ver el
 * doc-comment del módulo, arriba, para por qué esto es un requisito y no un
 * detalle de implementación.
 */
export const uploadQueue = new UploadQueue();

export function encolar(item: UploadQueueItem): boolean {
  return uploadQueue.encolar(item);
}

export function suscribir(cb: UploadQueueListener): () => void {
  return uploadQueue.suscribir(cb);
}
