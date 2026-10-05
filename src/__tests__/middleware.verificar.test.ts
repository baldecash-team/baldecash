/**
 * @jest-environment node
 *
 * La pagina de verificacion de una constancia vive en la RAIZ
 * (`src/app/verificar/[token]`), porque su URL es la que va IMPRESA en el QR
 * del documento. En produccion el middleware reescribe todo a
 * /prototipos/0.6{path} salvo una allowlist, asi que si /verificar se cae de
 * esa lista el rewrite la manda al catch-all [[...slug]] de landings y
 * cualquier QR emitido devuelve 404.
 *
 * No es hipotetico: paso en produccion. Y es la segunda vez que pasa lo mismo
 * —la primera fue /inspeccion, con su propio test al lado de este—, que es el
 * motivo de que esto se pruebe en vez de confiar en la lista.
 *
 * Sobre el entorno `node`: ver la explicacion en middleware.inspeccion.test.ts.
 */
import { NextRequest } from 'next/server';

async function correrMiddleware(pathname: string, appBasePath: string) {
  jest.resetModules();
  process.env.NEXT_PUBLIC_APP_BASE_PATH = appBasePath;
  const { middleware } = await import('../middleware');
  return middleware(new NextRequest(new URL(`https://www.baldecash.com${pathname}`)));
}

describe('middleware · la pagina del QR de la constancia', () => {
  const envOriginal = process.env.NEXT_PUBLIC_APP_BASE_PATH;
  afterAll(() => { process.env.NEXT_PUBLIC_APP_BASE_PATH = envOriginal; });

  it('NO reescribe /verificar/<token> a /prototipos/0.6', async () => {
    const res = await correrMiddleware('/verificar/TzuxFVR1iruSC1FYdIk7RU0GJw-2dmus/', '');
    // Un rewrite se delata por el header interno que apunta al destino.
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('sigue reescribiendo una ruta que NO esta en la allowlist', async () => {
    // Guarda de que el test de arriba prueba algo: si el middleware dejara de
    // reescribir todo, pasaria por el motivo equivocado.
    const res = await correrMiddleware('/renueva-tu-equipo-1-a/', '');
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6');
  });
});
