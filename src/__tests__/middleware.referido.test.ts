/**
 * @jest-environment node
 *
 * La landing normal se sirve estática (ISR). Para no convertirla en un render
 * por request sólo por una franja que ve una fracción del tráfico, el middleware
 * manda a una ruta gemela dinámica ÚNICAMENTE las URLs cuyo `utm_term` trae un
 * `__promo_`.
 *
 * Lo que se protege acá es el equilibrio de esa decisión: que el tráfico
 * orgánico NO caiga en la ruta dinámica (si cayera, el ISR se pierde para todos
 * y en silencio), y que las páginas que no son landings —/seguros, /inspeccion,
 * /api— no terminen en el catch-all de landings.
 *
 * Ver `middleware.inspeccion.test.ts` para el porqué del entorno `node`.
 */
import { NextRequest } from 'next/server';

async function cargarMiddleware(appBasePath: string) {
  jest.resetModules();
  process.env.NEXT_PUBLIC_APP_BASE_PATH = appBasePath;
  const { middleware } = await import('../middleware');
  return middleware;
}

async function correrMiddleware(urlRelativa: string, appBasePath: string) {
  const middleware = await cargarMiddleware(appBasePath);
  return middleware(new NextRequest(new URL(`https://www.baldecash.com${urlRelativa}`)));
}

/** Un link de activación real: la llave es el `__promo_`, no `promotor=`. */
const REFERIDO =
  '?utm_source=qr&utm_medium=offline&utm_term=punto_upn__promo_4a2eji__act_8x7idb';

describe('middleware · franja de referido en produccion', () => {
  const envOriginal = process.env.NEXT_PUBLIC_APP_BASE_PATH;
  afterAll(() => { process.env.NEXT_PUBLIC_APP_BASE_PATH = envOriginal; });

  it('manda la landing con __promo_ a la ruta gemela dinamica', async () => {
    const res = await correrMiddleware(`/upn/${REFERIDO}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido/upn');
  });

  it('manda la raiz con __promo_ a la gemela de home', async () => {
    const res = await correrMiddleware(`/${REFERIDO}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido/home');
  });

  it('conserva el utm_term en el rewrite', async () => {
    const res = await correrMiddleware(`/upn/${REFERIDO}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('promo_4a2eji');
  });

  it('NO dispara por el parametro promotor', async () => {
    // `ws2_promotor_code` está vacía en las 271 filas, así que el hub no manda
    // `promotor=`. Disparar por él dejaría la franja muda y de paso volvería
    // dinámico un tráfico que no lleva franja.
    const res = await correrMiddleware('/upn/?promotor=jperez', '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/upn');
    expect(res.headers.get('x-middleware-rewrite')).not.toContain('/referido/');
  });

  it('NO dispara con un utm_term sin __promo_', async () => {
    const res = await correrMiddleware('/upn/?utm_term=punto_upn__act_8x7idb', '');
    expect(res.headers.get('x-middleware-rewrite')).not.toContain('/referido/');
  });

  it('el trafico organico sigue yendo a la ruta estatica', async () => {
    // El test que sostiene toda la decision de diseño: si esto empezara a
    // apuntar a /referido/, la landing dejaria de servirse del CDN para TODOS
    // y no lo notariamos hasta ver la factura o el TTFB.
    const res = await correrMiddleware('/upn/', '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/upn');
    expect(res.headers.get('x-middleware-rewrite')).not.toContain('/referido/');
  });

  it('no aplica a subrutas de la landing, solo a la raiz', async () => {
    const res = await correrMiddleware(`/upn/catalogo/${REFERIDO}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/upn/catalogo');
    expect(res.headers.get('x-middleware-rewrite')).not.toContain('/referido/');
  });

  it('no secuestra paginas que no son landings', async () => {
    for (const ruta of ['/seguros/', '/inspeccion/camara/', '/multiasistencia/']) {
      const res = await correrMiddleware(`${ruta}${REFERIDO}`, '');
      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    }
  });

  it('no reescribe /referido como si fuera una landing', async () => {
    const res = await correrMiddleware(`/referido/${REFERIDO}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido');
    expect(res.headers.get('x-middleware-rewrite')).not.toContain('/referido/referido');
  });
});

describe('middleware · rate limit de la franja', () => {
  const envOriginal = process.env.NEXT_PUBLIC_APP_BASE_PATH;
  afterAll(() => { process.env.NEXT_PUBLIC_APP_BASE_PATH = envOriginal; });

  /** El contador vive en memoria del módulo, así que NO se recarga entre pedidos. */
  function pedir(
    middleware: (r: NextRequest) => Response,
    token: string,
    ip: string,
  ) {
    const url = new URL(
      `https://www.baldecash.com/upn/?utm_term=punto_x__promo_${token}__act_y`,
    );
    return middleware(new NextRequest(url, { headers: { 'x-forwarded-for': ip } }));
  }

  it('un barrido de tokens desde una IP deja de recibir la franja', async () => {
    // `tokenOpaco` es un hash público sin secreto sobre un id de rango chico:
    // quien tenga el algoritmo genera los tokens válidos y podría cosechar los
    // teléfonos del equipo de campo. Este límite es la única barrera real.
    const middleware = await cargarMiddleware('');
    const destinos: (string | null)[] = [];
    for (let i = 0; i < 30; i++) {
      destinos.push(
        pedir(middleware, `tok${i}`, '9.9.9.9').headers.get('x-middleware-rewrite'),
      );
    }
    const conFranja = destinos.filter((d) => d?.includes('/referido/'));
    expect(conFranja.length).toBeLessThanOrEqual(20);
    expect(conFranja.length).toBeGreaterThan(0);
  });

  it('pasado el limite NO devuelve 429: sirve la landing estatica sin franja', async () => {
    // Un 429 sobre la pagina de mas trafico del negocio seria un daño mayor que
    // el que se quiere evitar. El cosechador ve una landing normal.
    const middleware = await cargarMiddleware('');
    let ultima: Response | null = null;
    for (let i = 0; i < 30; i++) ultima = pedir(middleware, `t${i}`, '8.8.8.8');
    expect(ultima!.status).toBe(200);
    expect(ultima!.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/upn');
    expect(ultima!.headers.get('x-middleware-rewrite')).not.toContain('/referido/');
  });

  it('el limite es por IP: otra IP no queda castigada', async () => {
    const middleware = await cargarMiddleware('');
    for (let i = 0; i < 30; i++) pedir(middleware, `t${i}`, '1.1.1.1');
    const otra = pedir(middleware, 'tok', '2.2.2.2');
    expect(otra.headers.get('x-middleware-rewrite')).toContain('/referido/upn');
  });
});

describe('middleware · franja de referido en desarrollo', () => {
  const envOriginal = process.env.NEXT_PUBLIC_APP_BASE_PATH;
  afterAll(() => { process.env.NEXT_PUBLIC_APP_BASE_PATH = envOriginal; });

  it('tambien reescribe bajo /prototipos/0.6, para poder probarla en local', async () => {
    const res = await correrMiddleware(`/prototipos/0.6/upn/${REFERIDO}`, '/prototipos/0.6');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido/upn');
  });

  it('sin __promo_ no toca nada en desarrollo', async () => {
    const res = await correrMiddleware('/prototipos/0.6/upn/', '/prototipos/0.6');
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });
});
