/**
 * @jest-environment node
 *
 * En produccion el middleware reescribe TODO a /prototipos/0.6{path}, salvo una
 * allowlist. Las vistas de la estacion de inspeccion viven en la RAIZ, asi que
 * si /inspeccion se cae de esa lista el rewrite las manda al catch-all
 * [[...slug]] de landings y devuelven 404 — que fue exactamente lo que paso en
 * el primer deploy: toda la vinculacion por QR quedo rota en produccion.
 *
 * `next/server` (NextRequest/NextResponse) usa las Web APIs Request/Response/
 * Headers, que el entorno `jsdom` global de este repo (jest.config.js) NO
 * expone — falla con "ReferenceError: Request is not defined" al importar
 * `next/server`. Este archivo se corre en el entorno `node` de Jest en su
 * lugar (docblock de arriba, por-archivo), donde esas globals SI existen de
 * forma nativa (Node 18+).
 */
import { NextRequest } from 'next/server';

// isProduction se calcula al importar el modulo, asi que hay que fijar la env
// ANTES del import y recargar el modulo en cada caso.
async function correrMiddleware(pathname: string, appBasePath: string) {
  jest.resetModules();
  process.env.NEXT_PUBLIC_APP_BASE_PATH = appBasePath;
  const { middleware } = await import('../middleware');
  return middleware(new NextRequest(new URL(`https://www.baldecash.com${pathname}`)));
}

describe('middleware · rutas de inspeccion en produccion', () => {
  const envOriginal = process.env.NEXT_PUBLIC_APP_BASE_PATH;
  afterAll(() => { process.env.NEXT_PUBLIC_APP_BASE_PATH = envOriginal; });

  it('NO reescribe /inspeccion/camara a /prototipos/0.6', async () => {
    const res = await correrMiddleware('/inspeccion/camara/', '');
    // Un rewrite se delata por el header interno que apunta al destino.
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('NO reescribe /inspeccion/escaner a /prototipos/0.6', async () => {
    const res = await correrMiddleware('/inspeccion/escaner/', '');
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('conserva el codigo de emparejamiento del query string', async () => {
    const res = await correrMiddleware('/inspeccion/camara/?p=A7K2M9', '');
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('sigue reescribiendo una ruta que NO esta en la allowlist', async () => {
    // Guarda de que el test de arriba prueba algo: si el middleware dejara de
    // reescribir todo, los tres primeros pasarian por el motivo equivocado.
    const res = await correrMiddleware('/una-landing-cualquiera/', '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/una-landing-cualquiera');
  });
});
