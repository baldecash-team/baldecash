/**
 * `uploadQueue` — la cola de subida en segundo plano (spec §8.1, plan F4
 * Task 3, "el corazón de la fase").
 *
 * Cada test instancia su propia `UploadQueue` (no el singleton exportado)
 * con `fetchImpl`/`profundidadMaxima`/`maxIntentos`/`backoffBaseMs`
 * inyectados — así corren aislados entre sí y sin depender de segundos
 * reales de backoff. El singleton (`uploadQueue`, `encolar`, `suscribir`)
 * se prueba aparte, al final, solo para confirmar que delega a una cola
 * real y persiste entre módulos.
 */
import { waitFor } from '@testing-library/react';
import { UploadQueue, type UploadQueueEstado, type UploadQueueItem } from '../uploadQueue';

function crearBlob(bytes = 1024): Blob {
  return new Blob([new Uint8Array(bytes)], { type: 'video/webm' });
}

function crearItem(overrides: Partial<UploadQueueItem> = {}): UploadQueueItem {
  return {
    inspectionId: 1,
    takeNumber: 1,
    cameraLabel: 'techo',
    blob: crearBlob(),
    mimeType: 'video/webm',
    token: 'device-token',
    ...overrides,
  };
}

/** Respuesta `Response`-like mínima: solo lo que la cola lee (`ok`,
 * `status`, `json()`). Evita depender de un polyfill de `Response` real. */
function ok(body: unknown = {}): Response {
  return { ok: true, status: 200, json: async () => body } as Response;
}

function noOk(status = 500): Response {
  return { ok: false, status, json: async () => ({}) } as Response;
}

/** Fetch fake que resuelve upload-url y complete con éxito por default, y
 * deja el PUT a S3 como el único paso configurable por test (es el que
 * spec §10 dice que puede fallar y reintentar). */
function fetchFeliz(putImpl: (url: string, init: RequestInit) => Promise<Response>) {
  return jest.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    if (typeof url === 'string' && url.includes('/upload-url')) {
      return ok({ upload_url: 'https://s3.example.com/bucket/key', s3_key: 'key', expires_in: 3600 });
    }
    if (typeof url === 'string' && url.includes('/complete')) {
      return ok({ status: 'verified' });
    }
    // Lo que queda es el PUT directo a S3 (URL de S3, no de la API).
    return putImpl(url, init as RequestInit ?? { method });
  }) as unknown as typeof fetch;
}

describe('uploadQueue', () => {
  it('encolar dos items los sube en orden (FIFO)', async () => {
    const llamadas: string[] = [];
    const fetchImpl = jest.fn(async (url: string, init?: RequestInit) => {
      llamadas.push(`${init?.method ?? 'GET'} ${url}`);
      // La URL firmada de S3 NO debe contener "/takes/N/" — si la
      // reutilizara, el PUT a S3 de item1 y de item2 se confundirían con
      // sus propias llamadas de API al filtrar por ese patrón más abajo.
      const takeMatch = /\/takes\/(\d+)\//.exec(url);
      if (url.includes('/upload-url')) {
        return ok({ upload_url: `https://s3.example.com/objeto-take-${takeMatch?.[1]}` });
      }
      if (url.includes('/complete')) return ok({ status: 'verified' });
      return ok({}); // el PUT a S3 (URL sin "/takes/")
    }) as unknown as typeof fetch;

    // profundidadMaxima=2 (el default): ambos items arrancan concurrentes,
    // que es justamente el caso que hay que probar — "en orden" significa
    // que se DESPACHAN en el orden en que se encolaron, no que uno espera al
    // otro. `procesar()` recorre `entradas` en orden de inserción y llama al
    // fetch de cada uno sincrónicamente antes de yield-ear al siguiente
    // `await`, así que el orden de llamadas queda determinado aunque las dos
    // subidas corran en simultáneo.
    const queue = new UploadQueue({ fetchImpl, profundidadMaxima: 2, maxIntentos: 1 });

    const item1 = crearItem({ takeNumber: 1 });
    const item2 = crearItem({ takeNumber: 2 });
    expect(queue.encolar(item1)).toBe(true);
    expect(queue.encolar(item2)).toBe(true);

    await waitFor(() => {
      const estado = queue.estadoActual();
      expect(estado.enVuelo + estado.pendientes + estado.fallidos).toBe(0);
    });

    // Lo mínimo e inequívoco que "en orden" puede significar con dos
    // subidas concurrentes: el PRIMER llamado de red de item1 (su
    // upload-url) ocurre antes que el primero de item2 — se despachan FIFO,
    // no en un orden arbitrario que dependiera de qué promesa resuelve
    // primero.
    const primerIndiceTake1 = llamadas.findIndex((l) => l.includes('/takes/1/'));
    const primerIndiceTake2 = llamadas.findIndex((l) => l.includes('/takes/2/'));
    expect(primerIndiceTake1).toBeGreaterThanOrEqual(0);
    expect(primerIndiceTake2).toBeGreaterThan(primerIndiceTake1);

    // Ambas terminan subiendo sus dos llamadas (upload-url + complete) —
    // ninguna se perdió por correr concurrente con la otra.
    const indicesTake1 = llamadas
      .map((l, i) => (l.includes('/takes/1/') ? i : -1))
      .filter((i) => i >= 0);
    const indicesTake2 = llamadas
      .map((l, i) => (l.includes('/takes/2/') ? i : -1))
      .filter((i) => i >= 0);
    expect(indicesTake1).toHaveLength(2); // upload-url + complete
    expect(indicesTake2).toHaveLength(2);
  });

  it('un PUT que falla reintenta con backoff y no pierde el item', async () => {
    let intentosPut = 0;
    const fetchImpl = fetchFeliz(async () => {
      intentosPut++;
      if (intentosPut === 1) return noOk(503); // falla la primera vez
      return ok({}); // segunda vez, éxito
    });

    const queue = new UploadQueue({
      fetchImpl,
      profundidadMaxima: 2,
      maxIntentos: 3,
      backoffBaseMs: 5, // real pero minúsculo — no hace falta fake timers
    });

    const item = crearItem();
    expect(queue.encolar(item)).toBe(true);

    // Mientras reintenta, el item sigue "en vuelo" (no se pierde, no pasa a
    // fallido) — se verifica el estado intermedio antes de esperar el final.
    await waitFor(() => expect(intentosPut).toBeGreaterThanOrEqual(1));
    expect(queue.estadoActual().fallidos).toBe(0);

    await waitFor(() => {
      const estado = queue.estadoActual();
      expect(estado).toEqual<UploadQueueEstado>({ enVuelo: 0, pendientes: 0, fallidos: 0 });
    });

    expect(intentosPut).toBe(2);
    expect(queue.listarFallidos()).toHaveLength(0);
  });

  it('tras N fallos queda marcado fallido SIN perder el blob', async () => {
    const fetchImpl = fetchFeliz(async () => noOk(500)); // el PUT siempre falla

    const queue = new UploadQueue({
      fetchImpl,
      profundidadMaxima: 2,
      maxIntentos: 2, // 1 intento inicial + 1 reintento, después fallido
      backoffBaseMs: 5,
    });

    const blobOriginal = crearBlob(2048);
    const item = crearItem({ blob: blobOriginal });
    queue.encolar(item);

    await waitFor(() => {
      expect(queue.estadoActual()).toEqual<UploadQueueEstado>({
        enVuelo: 0,
        pendientes: 0,
        fallidos: 1,
      });
    });

    const fallidos = queue.listarFallidos();
    expect(fallidos).toHaveLength(1);
    // Identidad, no solo igualdad de tamaño: es LITERALMENTE el mismo blob,
    // no uno reconstruido — "sin perder el blob" del spec.
    expect(fallidos[0].blob).toBe(blobOriginal);
    expect(fallidos[0].blob.size).toBe(2048);
  });

  it('REGLA CRÍTICA: la cola sobrevive a un re-render — montar/desmontar un consumidor no cancela un PUT en vuelo', async () => {
    // El PUT queda colgado hasta que el test decide resolverlo — simula la
    // ventana de tiempo real en la que un componente de React se
    // re-renderiza mientras la subida sigue en curso.
    // Definite-assignment (no `| null`): el executor de `Promise` corre
    // SINCRÓNICAMENTE por spec, así que para cuando el `new Promise(...)`
    // termina de construirse `resolverPut` ya está asignado — pero TS no
    // sabe eso a través del closure, y un `(() => void) | null` acá
    // terminaba con un narrowing rarísimo a `never` en el uso de más abajo.
    let resolverPut: () => void = () => {};
    const putPendiente = new Promise<Response>((resolve) => {
      resolverPut = () => resolve(ok({}));
    });
    const fetchImpl = fetchFeliz(() => putPendiente);

    const queue = new UploadQueue({ fetchImpl, profundidadMaxima: 2, maxIntentos: 1 });
    queue.encolar(crearItem());

    await waitFor(() => expect(queue.estadoActual().enVuelo).toBe(1));

    // Simula lo que Task 4 hace: un componente de React se suscribe en un
    // efecto y se desmonta — SIN que eso tenga ninguna vía para tocar la
    // cola, porque `UploadQueue` no depende de React en absoluto. Se simula
    // acá sin renderizar de verdad (no hace falta: la clase no tiene ningún
    // gancho a un ciclo de vida de componente que "montar/desmontar" pudiera
    // disparar) — múltiples suscripciones y desuscripciones, como las que
    // produciría una sucesión de re-renders.
    for (let i = 0; i < 5; i++) {
      const cb = jest.fn();
      const unsub = queue.suscribir(cb);
      unsub();
    }

    // La subida sigue en vuelo pese a los "re-renders" de arriba.
    expect(queue.estadoActual().enVuelo).toBe(1);

    // Ahora sí se resuelve el PUT — recién acá debe completar.
    resolverPut();

    await waitFor(() => {
      expect(queue.estadoActual()).toEqual<UploadQueueEstado>({
        enVuelo: 0,
        pendientes: 0,
        fallidos: 0,
      });
    });
  });

  it('con la profundidad máxima alcanzada, encolar reporta backpressure en vez de aceptar infinito', async () => {
    // El PUT nunca resuelve: las dos primeras subidas quedan "en vuelo" para
    // siempre, ocupando toda la profundidad.
    const fetchImpl = fetchFeliz(() => new Promise<Response>(() => {}));
    const queue = new UploadQueue({ fetchImpl, profundidadMaxima: 2, maxIntentos: 1 });

    expect(queue.encolar(crearItem({ takeNumber: 1 }))).toBe(true);
    expect(queue.encolar(crearItem({ takeNumber: 2 }))).toBe(true);

    await waitFor(() => expect(queue.estadoActual().enVuelo).toBe(2));

    // La tercera es rechazada — backpressure, no una cola infinita.
    expect(queue.encolar(crearItem({ takeNumber: 3 }))).toBe(false);
    expect(queue.estadoActual()).toEqual<UploadQueueEstado>({
      enVuelo: 2,
      pendientes: 0,
      fallidos: 0,
    });

    // Y sigue rechazando mientras la profundidad siga llena, no solo la
    // primera vez.
    expect(queue.encolar(crearItem({ takeNumber: 4 }))).toBe(false);
  });

  it('backpressure también cuenta a los pendientes que todavía no arrancaron', () => {
    const fetchImpl = fetchFeliz(() => new Promise<Response>(() => {}));
    const queue = new UploadQueue({ fetchImpl, profundidadMaxima: 1, maxIntentos: 1 });

    expect(queue.encolar(crearItem({ takeNumber: 1 }))).toBe(true); // arranca, ocupa el único cupo
    expect(queue.encolar(crearItem({ takeNumber: 2 }))).toBe(false); // rechazado: la profundidad ya está llena
  });

  it('backpressure también cuenta a los fallidos: no se liberan solos', async () => {
    const fetchImpl = fetchFeliz(async () => noOk(500));
    const queue = new UploadQueue({
      fetchImpl,
      profundidadMaxima: 1,
      maxIntentos: 1, // falla al primer intento, sin reintentos
      backoffBaseMs: 5,
    });

    queue.encolar(crearItem({ takeNumber: 1 }));
    await waitFor(() => expect(queue.estadoActual().fallidos).toBe(1));

    // El único cupo de profundidad sigue ocupado por el fallido — nadie lo
    // libera automáticamente en esta Task.
    expect(queue.encolar(crearItem({ takeNumber: 2 }))).toBe(false);
  });

  it('la subida manda content_type/bytes/duration_s derivados del item, no constantes', async () => {
    const bodies: Array<{ url: string; body: string; headers: Record<string, string> }> = [];
    const fetchImpl = jest.fn(async (url: string, init?: RequestInit) => {
      bodies.push({
        url,
        body: (init?.body as string) ?? '',
        headers: (init?.headers as Record<string, string>) ?? {},
      });
      if (url.includes('/upload-url')) return ok({ upload_url: 'https://s3.example.com/x' });
      if (url.includes('/complete')) return ok({ status: 'verified' });
      return ok({});
    }) as unknown as typeof fetch;

    const queue = new UploadQueue({ fetchImpl, profundidadMaxima: 2, maxIntentos: 1 });
    const blob = crearBlob(4096);
    queue.encolar(
      crearItem({
        blob,
        mimeType: 'video/mp4;codecs=h264,aac',
        durationMs: 45_000,
        takeNumber: 3,
        cameraLabel: 'pared',
        inspectionId: 42,
        token: 'tok-camara-pared',
      })
    );

    await waitFor(() => expect(queue.estadoActual().enVuelo + queue.estadoActual().pendientes).toBe(0));

    const uploadUrlCall = bodies.find((b) => b.url.includes('/upload-url'));
    expect(uploadUrlCall?.url).toBe(
      'https://api.baldecash.com/api/v1/inspections/42/takes/3/videos/pared/upload-url'
    );
    expect(JSON.parse(uploadUrlCall!.body)).toEqual({ content_type: 'video/mp4;codecs=h264,aac' });
    expect(uploadUrlCall?.headers['X-Device-Token']).toBe('tok-camara-pared');

    const completeCall = bodies.find((b) => b.url.includes('/complete'));
    expect(completeCall?.url).toBe(
      'https://api.baldecash.com/api/v1/inspections/42/takes/3/videos/pared/complete'
    );
    expect(JSON.parse(completeCall!.body)).toEqual({
      bytes: 4096,
      duration_s: 45,
      content_type: 'video/mp4;codecs=h264,aac',
    });
    expect(completeCall?.headers['X-Device-Token']).toBe('tok-camara-pared');

    // El PUT a S3 va SIN el device token (spec: la autorización va en la
    // firma de la URL, no en un header propio de la API).
    const putCall = bodies.find((b) => b.url.startsWith('https://s3.example.com'));
    expect(putCall?.headers['X-Device-Token']).toBeUndefined();
    expect(putCall?.headers['Content-Type']).toBe('video/mp4;codecs=h264,aac');
  });
});

describe('uploadQueue — singleton exportado', () => {
  it('encolar/suscribir sueltos delegan al mismo singleton entre llamadas', async () => {
    // Import dinámico separado del bloque de arriba para no compartir el
    // módulo (y su estado) con los tests que instancian `UploadQueue` propia
    // — el singleton real usa `fetch` global, así que se lo reemplaza acá.
    const originalFetch = global.fetch;
    global.fetch = fetchFeliz(async () => ok({})) as unknown as typeof fetch;

    try {
      const mod = await import('../uploadQueue');
      const estados: UploadQueueEstado[] = [];
      const unsub = mod.suscribir((e) => estados.push(e));

      const aceptado = mod.encolar({
        inspectionId: 1,
        takeNumber: 1,
        cameraLabel: 'techo',
        blob: crearBlob(),
        mimeType: 'video/webm',
        token: 'tok',
      });
      expect(aceptado).toBe(true);

      await waitFor(() => expect(mod.uploadQueue.estadoActual().enVuelo).toBe(0));
      expect(estados.length).toBeGreaterThan(0);

      unsub();
    } finally {
      global.fetch = originalFetch;
    }
  });
});
