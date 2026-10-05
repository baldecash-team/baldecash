/**
 * @jest-environment node
 *
 * URLs cortas de campana: `baldecash.com/idat30` rebota al link de difusion
 * `api.baldecash.com/r/idat30`, que estampa las UTMs y cuenta el clic.
 *
 * Lo que se imprime en un banner es la URL del dominio principal, pero la que
 * mide es la del link corto. El alias existe para que el papel no tenga que
 * decir `api.baldecash.com`.
 *
 * Dos cosas se prueban a proposito y no son adorno:
 *
 * 1. **302, no 301.** El destino de una campana se reapunta sin reimprimir el
 *    banner — es la razon de ser del link corto. Un 301 lo cachea el navegador
 *    de por vida y a quien ya lo abrio le seguiria yendo al destino viejo.
 *    `LEGACY_REDIRECTS` si usa 301 porque son mudanzas definitivas de Webflow.
 *
 * 2. **Una landing real sigue sirviendose.** Este archivo decide el ruteo de
 *    todo el sitio: el riesgo no es que el alias falle, es que se coma una
 *    landing. Ver middleware.verificar.test.ts, donde eso ya paso en produccion.
 *
 * Sobre el entorno `node`: ver la explicacion en middleware.inspeccion.test.ts.
 */
import { NextRequest } from 'next/server';

async function correrMiddleware(url: string, appBasePath: string) {
  jest.resetModules();
  process.env.NEXT_PUBLIC_APP_BASE_PATH = appBasePath;
  const { middleware } = await import('../middleware');
  return middleware(new NextRequest(new URL(url)));
}

describe('middleware · URLs cortas de campana', () => {
  const envOriginal = process.env.NEXT_PUBLIC_APP_BASE_PATH;
  afterAll(() => { process.env.NEXT_PUBLIC_APP_BASE_PATH = envOriginal; });

  it('manda /idat30 al link de difusion', async () => {
    const res = await correrMiddleware('https://www.baldecash.com/idat30', '');
    expect(res.headers.get('location')).toBe('https://api.baldecash.com/r/idat30');
  });

  it('rebota con 302 para poder reapuntar el destino despues', async () => {
    const res = await correrMiddleware('https://www.baldecash.com/idat30', '');
    expect(res.status).toBe(302);
  });

  it('acepta la barra final, igual que los redirects de Webflow', async () => {
    const res = await correrMiddleware('https://www.baldecash.com/idat30/', '');
    expect(res.headers.get('location')).toBe('https://api.baldecash.com/r/idat30');
  });

  it('conserva el querystring que traiga la visita', async () => {
    const res = await correrMiddleware('https://www.baldecash.com/idat30?fbclid=abc', '');
    expect(res.headers.get('location')).toBe('https://api.baldecash.com/r/idat30?fbclid=abc');
  });

  it('NO toca la landing de IDAT', async () => {
    const res = await correrMiddleware('https://www.baldecash.com/idat/', '');
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-rewrite')).toContain('/prototipos/0.6/idat');
  });
});
