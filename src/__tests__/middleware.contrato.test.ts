/**
 * @jest-environment node
 *
 * Link corto de contrato: `baldecash.com/contrato/{codigo}` rebota a ws2
 * (`api.baldecash.com/contrato/{codigo}`), que hace el 302 a Keynua.
 * Reemplaza a t.ly en el link de firma que manda el legacy por WhatsApp.
 */
import { NextRequest } from 'next/server';

async function correrMiddleware(url: string) {
  jest.resetModules();
  process.env.NEXT_PUBLIC_APP_BASE_PATH = '';
  const { middleware } = await import('../middleware');
  return middleware(new NextRequest(new URL(url)));
}

describe('middleware · link corto de contrato', () => {
  it('manda /contrato/{codigo} a ws2 con 302', async () => {
    const res = await correrMiddleware('https://baldecash.com/contrato/ABCD2345');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://api.baldecash.com/contrato/ABCD2345');
  });

  it('acepta la barra final', async () => {
    const res = await correrMiddleware('https://www.baldecash.com/contrato/ABCD2345/');
    expect(res.headers.get('location')).toBe('https://api.baldecash.com/contrato/ABCD2345');
  });

  it('no redirige /contrato sin codigo', async () => {
    const res = await correrMiddleware('https://www.baldecash.com/contrato');
    expect(res.headers.get('location')).not.toBe('https://api.baldecash.com/contrato/');
  });

  it('no redirige subrutas mas profundas', async () => {
    const res = await correrMiddleware('https://www.baldecash.com/contrato/ABCD2345/extra');
    expect(res.headers.get('location') ?? '').not.toContain('api.baldecash.com/contrato');
  });
});
