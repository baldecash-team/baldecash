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
 *
 * **Salida para los fallidos** (review post-Task-3): contar los `fallido`
 * dentro de la profundidad máxima es correcto — un video fallido sigue
 * siendo un blob vivo en memoria, no contarlo mentiría sobre la presión
 * real — pero sin una salida, dos fallos terminales (con la profundidad
 * default de 2) trababan la cola PARA SIEMPRE: nada volvía a `encolar()`
 * con éxito hasta recargar la pestaña. `reintentar()` y `descartar()` son
 * esa salida: el primero vuelve a poner en cola el fallido conservando el
 * blob (nada se perdió, solo se lo corre de nuevo); el segundo lo saca
 * definitivamente y libera el cupo cuando el video ya no se puede
 * recuperar. El singleton, además, reintenta TODOS los fallidos solo
 * escuchando el evento `online` del navegador — ver `escucharOnline` en
 * `UploadQueueDeps` para la decisión completa de por qué eso sí y no un
 * polling propio.
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
  /**
   * Presente SOLO en una foto: 1..N dentro de la toma. Es lo que decide a
   * qué endpoints le habla esta entrada — con él va por `/photos/{n}/…`,
   * sin él por `/videos/…`. Lo asigna el servidor y llega en el
   * `cmd.photo`; la cámara nunca lo inventa.
   */
  photoNumber?: number;
  /**
   * Miniatura de la foto. Sube en el MISMO ciclo que la foto, antes de
   * confirmar: el backend no da por verificada una foto sin su vista
   * previa (es lo que el controlador muestra para decidir), así que
   * confirmar sin ella dejaría la foto en un limbo — subida y nunca válida.
   */
  thumbBlob?: Blob;
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
  /** `true` cuando `encolar()` rechazaría un item AHORA MISMO (profundidad
   * máxima alcanzada). Existe para que la UI (Task 4/5) pueda mostrar algo
   * accionable en vez de que el operador vea, sin explicación, que la
   * cámara dejó de aceptar grabaciones. */
  llena: boolean;
  /**
   * Por qué está llena, cuando `llena` es `true` — son dos situaciones con
   * dos salidas distintas y la UI necesita poder diferenciarlas:
   *
   * - `'fallidos'`: hay al menos un video que agotó sus reintentos ocupando
   *   el cupo. RECUPERABLE por una acción humana: `reintentar()` o
   *   `descartar()`. Prioridad sobre `'subiendo'` cuando se dan los dos a la
   *   vez — es el caso donde SÍ hay algo que hacer, y por eso es el mensaje
   *   que más importa mostrar.
   * - `'subiendo'`: llena solo por actividad normal (en vuelo / pendiente).
   *   Drena sola cuando terminen esas subidas — no hace falta ninguna
   *   acción, solo esperar.
   * - `null`: no está llena.
   */
  motivoLlena: 'fallidos' | 'subiendo' | null;
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
  /**
   * Si `true`, la cola escucha el evento `online` del navegador y reintenta
   * automáticamente TODOS los fallidos apenas vuelve la conectividad
   * (`window.addEventListener('online', …)`). Default `false` — a propósito
   * NO es el default de la clase, para que instanciar una `UploadQueue` en
   * un test nunca deje un listener global colgado sin que el test lo pida.
   * El singleton de producción (`uploadQueue`, al final del archivo) lo
   * prende explícitamente. Sin `window` (SSR) es un no-op silencioso.
   *
   * Por qué sí conviene (decisión, no default mudo): el escenario que más
   * plata en horas de operador cuesta es EXACTAMENTE este — se cae el wifi
   * unos minutos, los 1-2 videos en vuelo agotan sus reintentos y quedan
   * `fallidos`, la red vuelve pero la cola sigue trabada porque nadie llamó
   * `reintentar()`. Sin este flag, la estación queda muerta hasta que un
   * humano note el problema y reintente a mano (o recargue la pestaña) —
   * en un kiosco atornillado a una pared, eso puede tardar. El evento
   * `online` es exactamente la señal correcta para ese caso (a diferencia
   * de un polling propio, no inventa un timer nuevo ni un ciclo de red
   * extra) y la operación en sí (`reintentar()` sin argumentos) ya existe y
   * ya está probada — conectar un event listener a un método que de por sí
   * hay que tener es la complejidad mínima posible para cerrar el caso.
   */
  escucharOnline?: boolean;
}

export const DEFAULT_PROFUNDIDAD_MAXIMA = 2;
const DEFAULT_MAX_INTENTOS = 4;
const DEFAULT_BACKOFF_BASE_MS = 1000;

/**
 * Una entrada trackeada por la cola. `estado` es interno — lo que sale hacia
 * afuera es siempre el agregado de `UploadQueueEstado`, nunca esto (salvo
 * `id`, que sí se expone — es la manija que `reintentar()`/`descartar()`
 * necesitan para apuntar a UN fallido en particular, ver `listarFallidos()`).
 */
interface Entrada {
  id: number;
  item: UploadQueueItem;
  estado: 'pendiente' | 'subiendo' | 'fallido';
  intentos: number;
}

/** Lo que expone `listarFallidos()`: el item con su blob intacto, más el
 * `id` para poder pedir `reintentar(id)`/`descartar(id)` sobre ESE en
 * particular (sin id, ambas operaciones actúan sobre todos los fallidos). */
export interface UploadQueueFallido {
  id: number;
  item: UploadQueueItem;
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
  private siguienteId = 1;

  constructor(deps: UploadQueueDeps = {}) {
    this.fetchImplInyectado = deps.fetchImpl;
    this.baseUrl = deps.baseUrl ?? API_BASE_URL;
    this.profundidadMaxima = deps.profundidadMaxima ?? DEFAULT_PROFUNDIDAD_MAXIMA;
    this.maxIntentos = deps.maxIntentos ?? DEFAULT_MAX_INTENTOS;
    this.backoffBaseMs = deps.backoffBaseMs ?? DEFAULT_BACKOFF_BASE_MS;

    // Ver el doc-comment de `escucharOnline` en `UploadQueueDeps` para la
    // decisión completa. Guardado detrás de `typeof window` porque este
    // módulo, aunque tiene 'use client', puede evaluarse en el registro de
    // módulos de un test (jsdom SÍ tiene `window`) o, en teoría, de un
    // entorno sin DOM — sin la guarda, construir la cola ahí reventaría.
    if (deps.escucharOnline && typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.reintentar();
      });
    }
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
    this.entradas.push({ id: this.siguienteId++, item, estado: 'pendiente', intentos: 0 });
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
    const llena = this.entradas.length >= this.profundidadMaxima;
    // `'fallidos'` gana sobre `'subiendo'` cuando se dan los dos a la vez —
    // ver el doc-comment de `motivoLlena` en `UploadQueueEstado`: es el caso
    // donde SÍ hay una acción humana posible (reintentar/descartar), así que
    // es el mensaje que la UI debe priorizar mostrar.
    const motivoLlena: UploadQueueEstado['motivoLlena'] = !llena
      ? null
      : fallidos > 0
        ? 'fallidos'
        : 'subiendo';
    return { enVuelo, pendientes, fallidos, llena, motivoLlena };
  }

  /**
   * Items que agotaron los reintentos, con su blob intacto y el `id` que
   * `reintentar(id)`/`descartar(id)` necesitan para apuntar a UNO en
   * particular. Existe para que nada dependa de leer el estado interno de
   * la cola para verificar que el blob sobrevive a un fallo terminal, y
   * para que una UI de recuperación (fuera de esta Task) pueda listarlos.
   */
  listarFallidos(): UploadQueueFallido[] {
    return this.entradas
      .filter((e) => e.estado === 'fallido')
      .map((e) => ({ id: e.id, item: e.item }));
  }

  /**
   * Vuelve a poner en cola uno o todos los fallidos — la salida a la trampa
   * que documentaba `encolar()`: un fallido ocupa cupo de profundidad para
   * siempre si nadie hace algo con él. El blob nunca se tocó (sigue en
   * `entrada.item`, ver `listarFallidos()`), así que reintentar es literal:
   * se resetean `estado`/`intentos` y se lo vuelve a correr por el mismo
   * camino que un pendiente nuevo.
   *
   * Sin `id`: reintenta TODOS los fallidos — es el caso que dispara
   * `escucharOnline` (spec: "se cayó la red, fallaron, la red volvió").
   * Con `id`: apunta a uno solo — para una UI que deja al operador elegir
   * cuál reintentar y cuál descartar por separado.
   *
   * Devuelve cuántos se reencolaron (0 si `id` no matchea ningún fallido, o
   * si no había fallidos).
   */
  reintentar(id?: number): number {
    let reencolados = 0;
    for (const entrada of this.entradas) {
      if (entrada.estado !== 'fallido') continue;
      if (id != null && entrada.id !== id) continue;
      entrada.estado = 'pendiente';
      entrada.intentos = 0;
      reencolados++;
    }
    if (reencolados > 0) {
      this.notificar();
      this.procesar();
    }
    return reencolados;
  }

  /**
   * Saca un fallido definitivamente y libera su cupo de profundidad — la
   * ÚNICA forma de recuperar memoria de un video que ya no se va a poder
   * subir (spec de la review: "sin esto no hay forma de recuperar memoria").
   * Solo actúa sobre fallidos: no hay forma de "descartar" algo en vuelo o
   * pendiente desde esta Task (cancelar un PUT en curso es un problema
   * distinto, no pedido acá).
   *
   * Devuelve `true` si encontró y sacó el fallido con ese `id`, `false` si
   * no existe o no está en estado `fallido`.
   */
  descartar(id: number): boolean {
    const idx = this.entradas.findIndex((e) => e.id === id && e.estado === 'fallido');
    if (idx === -1) return false;
    this.entradas.splice(idx, 1);
    this.notificar();
    // El cupo que libera es de PROFUNDIDAD, no de concurrencia (un fallido
    // ya no ocupaba un lugar "en vuelo" activo — ver `subirConReintentos`).
    // `procesar()` acá es defensivo, no estrictamente necesario hoy: no hay
    // forma de que queden `pendiente` sin arrancar mientras hay cupo, salvo
    // que se agregue alguna en el futuro. Barato de llamar, no hace daño.
    this.procesar();
    return true;
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
   * `subirConReintentos` decide qué hacer con eso.
   *
   * `POST .../complete` (fix de review post-F4-Task-5, C3, CRÍTICO — dos
   * rondas): cuando el servidor verifica con `HeadObject` y RECHAZA (un
   * PUT truncado por un corte de wifi en planta, spec §8: "un dispositivo
   * no puede declarar nada verificado"), responde con un código de error
   * (422) — nunca 200. La primera versión de este fix miraba el `status`
   * del BODY (`res.ok` con `{"status":"failed"}` adentro) para distinguir
   * los dos casos; eso era parchear el síntoma del lado equivocado — dos
   * capas en desacuerdo sobre qué significa "éxito" (HTTP 200 vs. body
   * "failed") es justo lo que hacía perder el blob. Con el contrato HTTP
   * arreglado del lado del servidor, acá alcanza con la regla general:
   * `!ok` es fallo, sin condicionales leyendo el body. */
  /**
   * Prefijo de recurso de esta entrada. Una foto lleva su número en la ruta
   * (`/photos/3/techo`); un video no tiene numeración dentro de la toma
   * (`/videos/techo`) porque hay uno solo por cámara.
   */
  private rutaDe(item: UploadQueueItem): string {
    const base = `${this.baseUrl}/inspections/${item.inspectionId}/takes/${item.takeNumber}`;
    return item.photoNumber != null
      ? `${base}/photos/${item.photoNumber}/${item.cameraLabel}`
      : `${base}/videos/${item.cameraLabel}`;
  }

  private async subirUnaVez(item: UploadQueueItem): Promise<void> {
    const apiHeaders = {
      'Content-Type': 'application/json',
      'X-Device-Token': item.token,
    };
    const ruta = this.rutaDe(item);
    const esFoto = item.photoNumber != null;

    const urlRes = await this.fetchImpl(
      `${ruta}/upload-url`,
      {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ content_type: item.mimeType }),
      }
    );
    if (!urlRes.ok) {
      throw new Error(
        urlRes.status === 401 || urlRes.status === 403
          ? 'El servidor no autorizó la subida: este dispositivo perdió su vinculación.'
          : urlRes.status === 404
            ? 'El servidor no encontró la inspección: puede haberse cerrado o abortado.'
            : `El servidor no autorizó la subida (error ${urlRes.status}).`
      );
    }
    const { upload_url: uploadUrl, thumb_upload_url: thumbUploadUrl } =
      (await urlRes.json()) as { upload_url: string; thumb_upload_url?: string };

    // Directo a S3 — spec §3/§8: "el video nunca pasa por la API". Sin
    // `X-Device-Token`: la autorización ya está en la firma de la URL.
    const putRes = await this.fetchImpl(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': item.mimeType },
      body: item.blob,
    });
    if (!putRes.ok) {
      // Falla la transferencia a S3, no la API. Casi siempre es red del
      // teléfono; el video sigue intacto en la cola y se reintenta.
      throw new Error(
        `No se pudo subir el archivo a S3 (error ${putRes.status}). El video sigue guardado y se va a reintentar.`
      );
    }

    // La miniatura va DESPUÉS de la foto y ANTES del complete, en el mismo
    // ciclo de reintentos: si falla, esta subida entera se reintenta. El
    // backend no verifica una foto sin miniatura, así que confirmar acá
    // dejaría la foto subida pero nunca válida — y el controlador esperando
    // una vista previa que no va a llegar.
    if (esFoto && item.thumbBlob && thumbUploadUrl) {
      const thumbRes = await this.fetchImpl(thumbUploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': item.thumbBlob.type || item.mimeType },
        body: item.thumbBlob,
      });
      if (!thumbRes.ok) {
        throw new Error(
          `No se pudo subir la vista previa a S3 (error ${thumbRes.status}). La foto sigue guardada y se va a reintentar.`
        );
      }
    }

    const completeRes = await this.fetchImpl(
      `${ruta}/complete`,
      {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(
          esFoto
            ? { bytes: item.blob.size, content_type: item.mimeType }
            : {
                bytes: item.blob.size,
                duration_s:
                  item.durationMs != null ? Math.round(item.durationMs / 1000) : 0,
                content_type: item.mimeType,
              }
        ),
      }
    );
    if (!completeRes.ok) {
      // 422 acá es el caso importante: el servidor comparó los bytes que
      // llegaron a S3 contra los declarados y NO coinciden — el archivo subió
      // truncado. Tiene que reintentarse, nunca darse por bueno: es la
      // diferencia entre evidencia que falta y evidencia que miente.
      throw new Error(
        completeRes.status === 422
          ? 'El video llegó incompleto a S3 y el servidor lo rechazó. Se va a reintentar con el archivo original.'
          : `El servidor no pudo confirmar el video (error ${completeRes.status}). Se va a reintentar.`
      );
    }
  }
}

/**
 * El singleton real que usan las vistas (Task 4/5). Vive en el módulo, no en
 * ningún componente — sobrevive a cualquier cantidad de montajes/
 * desmontajes/re-renders mientras la pestaña siga abierta. Ver el
 * doc-comment del módulo, arriba, para por qué esto es un requisito y no un
 * detalle de implementación.
 */
export const uploadQueue = new UploadQueue({ escucharOnline: true });

export function encolar(item: UploadQueueItem): boolean {
  return uploadQueue.encolar(item);
}

export function suscribir(cb: UploadQueueListener): () => void {
  return uploadQueue.suscribir(cb);
}

/** Ver `UploadQueue.reintentar` — delega al singleton, mismo criterio que
 * `encolar`/`suscribir`. */
export function reintentar(id?: number): number {
  return uploadQueue.reintentar(id);
}

/** Ver `UploadQueue.descartar` — delega al singleton. */
export function descartar(id: number): boolean {
  return uploadQueue.descartar(id);
}

/** Ver `UploadQueue.listarFallidos` — delega al singleton. */
export function listarFallidos(): UploadQueueFallido[] {
  return uploadQueue.listarFallidos();
}
