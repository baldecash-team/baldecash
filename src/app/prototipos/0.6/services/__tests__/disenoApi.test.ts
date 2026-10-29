import * as Sentry from '@sentry/nextjs';
import { pedirDisenoDeLaSesion } from '../disenoApi';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn(), captureMessage: jest.fn() }));

/**
 * `GET /public/landing/{slug}/diseno` (BAL-5296): asigna el formulario de la
 * sesión si falta y devuelve el diseño de ese formulario. Ante cualquier falla
 * devuelve null y la web sigue con el diseño de la landing.
 */
describe('pedirDisenoDeLaSesion', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve form y diseño', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ form_id: 19, solicitud_design: 2 }) }) as unknown as typeof fetch;
    await expect(pedirDisenoDeLaSesion('home', 'u-1', 5)).resolves.toEqual({ formId: 19, disenoSolicitud: 2 });
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/public/landing/home/diseno?');
    expect(url).toContain('session_uuid=u-1');
    expect(url).toContain('product_id=5');
  });

  it('sin productId no manda product_id', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ form_id: null, solicitud_design: 1 }) }) as unknown as typeof fetch;
    await expect(pedirDisenoDeLaSesion('home', 'u-1')).resolves.toEqual({ formId: null, disenoSolicitud: 1 });
    expect((global.fetch as jest.Mock).mock.calls[0][0]).not.toContain('product_id');
  });

  it('error de red → null (la web sigue con el de la landing) y a Sentry', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('x')) as unknown as typeof fetch;
    await expect(pedirDisenoDeLaSesion('home', 'u-1')).resolves.toBeNull();
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ tags: expect.objectContaining({ landing: 'home' }) }));
  });

  it('HTTP no ok → null', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }) as unknown as typeof fetch;
    await expect(pedirDisenoDeLaSesion('home', 'u-1')).resolves.toBeNull();
  });

  it('un diseño raro → null', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ form_id: 3, solicitud_design: 7 }) }) as unknown as typeof fetch;
    await expect(pedirDisenoDeLaSesion('home', 'u-1')).resolves.toBeNull();
  });

  it('acepta la respuesta envuelta en data', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { form_id: 1, solicitud_design: 1 } }) }) as unknown as typeof fetch;
    await expect(pedirDisenoDeLaSesion('home', 'u-1')).resolves.toEqual({ formId: 1, disenoSolicitud: 1 });
  });

  it('pasado el tiempo máximo (2,5 s) se corta y devuelve null', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn((_url: string, init?: RequestInit) => new Promise((_res, rej) => {
      init?.signal?.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    })) as unknown as typeof fetch;
    const p = pedirDisenoDeLaSesion('home', 'u-1');
    jest.advanceTimersByTime(2500);
    await expect(p).resolves.toBeNull();
    jest.useRealTimers();
  });
});
