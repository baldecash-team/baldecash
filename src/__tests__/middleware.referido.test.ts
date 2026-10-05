/**
 * @jest-environment node
 *
 * La landing normal se sirve estática (ISR). Para no convertirla en un render
 * por request sólo por una franja que ve una fracción del tráfico, el middleware
 * manda a una ruta gemela dinámica ÚNICAMENTE las URLs que traen `?promotor=`
 * o `?ref=` — los dos parámetros con los que un link puede identificar a quien
 * refirió.
 *
 * Lo que se protege acá es el equilibrio de esa decisión: que el tráfico
 * orgánico NO caiga en la ruta dinámica (si cayera, el ISR se pierde para todos
 * y en silencio), y que las páginas que no son landings —/seguros, /inspeccion,
 * /api— no terminen en el catch-all de landings sólo porque alguien les pegó un
 * `?promotor=` en la URL.
 *
 * Ver `middleware.inspeccion.test.ts` para el porqué del entorno `node`.
 */
import { NextRequest } from 'next/server';

async function correrMiddleware(urlRelativa: string, appBasePath: string) {
  jest.resetModules();
  process.env.NEXT_PUBLIC_APP_BASE_PATH = appBasePath;
  const { middleware } = await import('../middleware');
  return middleware(new NextRequest(new URL(`https://www.baldecash.com${urlRelativa}`)));
}

const PROMOTOR = '?promotor=jperez&utm_term=punto_upn__promo_4a2eji__act_8x7idb';

describe('middleware · franja de referido en produccion', () => {
  const envOriginal = process.env.NEXT_PUBLIC_APP_BASE_PATH;
  afterAll(() => { process.env.NEXT_PUBLIC_APP_BASE_PATH = envOriginal; });

  it('manda la landing con ?promotor= a la ruta gemela dinamica', async () => {
    const res = await correrMiddleware(`/upn/${PROMOTOR}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido/upn');
  });

  it('manda la raiz con ?promotor= a la gemela de home', async () => {
    const res = await correrMiddleware(`/${PROMOTOR}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido/home');
  });

  it('conserva el query string en el rewrite', async () => {
    const res = await correrMiddleware(`/upn/${PROMOTOR}`, '');
    const destino = res.headers.get('x-middleware-rewrite') ?? '';
    expect(destino).toContain('promotor=jperez');
    expect(destino).toContain('promo_4a2eji');
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
    const res = await correrMiddleware(`/upn/catalogo/${PROMOTOR}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/upn/catalogo');
    expect(res.headers.get('x-middleware-rewrite')).not.toContain('/referido/');
  });

  it('no secuestra paginas que no son landings', async () => {
    for (const ruta of ['/seguros/', '/inspeccion/camara/', '/multiasistencia/']) {
      const res = await correrMiddleware(`${ruta}${PROMOTOR}`, '');
      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    }
  });

  it('no reescribe /referido como si fuera una landing', async () => {
    // Evita que el segmento interno se coma una landing homonima o se
    // autorreescriba.
    const res = await correrMiddleware(`/referido/${PROMOTOR}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido');
    expect(res.headers.get('x-middleware-rewrite')).not.toContain('/referido/referido');
  });
});

describe('middleware · franja de referido en desarrollo', () => {
  const envOriginal = process.env.NEXT_PUBLIC_APP_BASE_PATH;
  afterAll(() => { process.env.NEXT_PUBLIC_APP_BASE_PATH = envOriginal; });

  it('tambien reescribe bajo /prototipos/0.6, para poder probarla en local', async () => {
    const res = await correrMiddleware(`/prototipos/0.6/upn/${PROMOTOR}`, '/prototipos/0.6');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido/upn');
  });

  it('sin ?promotor= no toca nada en desarrollo', async () => {
    const res = await correrMiddleware('/prototipos/0.6/upn/', '/prototipos/0.6');
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });
});

/**
 * `?ref=` es el código del link corto del hub (`/r/{codigo}`), y es el único que
 * viaja en TODOS los flyers: `promotor` sólo aparece cuando esa promotora tiene
 * correspondencia en ws2. Mirando sólo `promotor`, el tráfico de un QR salía
 * estático del CDN y la franja no se pintaba nunca.
 */
describe('middleware · franja de referido por ?ref=', () => {
  const envOriginal = process.env.NEXT_PUBLIC_APP_BASE_PATH;
  afterAll(() => { process.env.NEXT_PUBLIC_APP_BASE_PATH = envOriginal; });

  const REF = '?ref=ekscah';

  it('manda la landing con ?ref= a la ruta gemela dinamica', async () => {
    const res = await correrMiddleware(`/wiener/${REF}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido/wiener');
  });

  it('la URL real de un flyer termina en la gemela', async () => {
    // Tal cual la emite /r/{codigo} del hub, con las UTMs de la activación.
    const real =
      '/wiener/?utm_campaign=activacion_norbert-wiener_2026_08&utm_source=qr' +
      '&utm_medium=offline&utm_content=qr' +
      '&utm_term=punto_los-olivos__promo_1vlqax8__act_1odsq6r&ref=ekscah';
    const destino = (await correrMiddleware(real, '')).headers.get('x-middleware-rewrite') ?? '';

    expect(destino).toContain('/prototipos/0.6/referido/wiener');
    expect(destino).toContain('ref=ekscah');
    expect(destino).toContain('utm_term=punto_los-olivos__promo_1vlqax8__act_1odsq6r');
  });

  it('manda la raiz con ?ref= a la gemela de home', async () => {
    const res = await correrMiddleware(`/${REF}`, '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/referido/home');
  });

  it('el trafico organico sigue yendo a la ruta estatica', async () => {
    // Mismo test que sostiene la decision del bloque de arriba: agregar `ref`
    // no puede sacar del CDN a nadie que no traiga el parametro.
    const res = await correrMiddleware('/wiener/', '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/wiener');
    expect(res.headers.get('x-middleware-rewrite')).not.toContain('/referido/');
  });

  it('no aplica a subrutas de la landing, solo a la raiz', async () => {
    const res = await correrMiddleware(`/wiener/catalogo/${REF}`, '');
    expect(res.headers.get('x-middleware-rewrite')).not.toContain('/referido/');
  });

  it('no secuestra paginas que no son landings', async () => {
    for (const ruta of ['/seguros/', '/inspeccion/camara/', '/multiasistencia/']) {
      const res = await correrMiddleware(`${ruta}${REF}`, '');
      expect(res.headers.get('x-middleware-rewrite')).toBeNull();
    }
  });
});
