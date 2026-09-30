import { formatearFechaIso, obtenerPrimeraFechaPago } from '../primeraFechaPago';

describe('obtenerPrimeraFechaPago', () => {
  const conFetch = (impl: jest.Mock) => { global.fetch = impl as unknown as typeof fetch; return impl; };

  it('devuelve la fecha que calcula el backend', async () => {
    const fetchMock = conFetch(jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ date: '2026-12-18', deferred: true }),
    }));
    await expect(obtenerPrimeraFechaPago('renueva-tu-equipo-1', 18)).resolves.toBe('2026-12-18');
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      '/public/landing/renueva-tu-equipo-1/first-payment-date?payment_day=18',
    );
  });

  it('devuelve null si el backend falla, para usar el cálculo local', async () => {
    conFetch(jest.fn().mockResolvedValue({ ok: false }));
    await expect(obtenerPrimeraFechaPago('x', 18)).resolves.toBeNull();
  });

  it('devuelve null si no hay red', async () => {
    conFetch(jest.fn().mockRejectedValue(new Error('offline')));
    await expect(obtenerPrimeraFechaPago('x', 18)).resolves.toBeNull();
  });
});

describe('formatearFechaIso', () => {
  it('escribe la fecha como el texto de siempre, sin correr el día', () => {
    expect(formatearFechaIso('2026-12-18')).toBe('18 de diciembre del 2026');
    expect(formatearFechaIso('2026-10-03')).toBe('3 de octubre del 2026');
  });

  it('rechaza lo que no es una fecha ISO', () => {
    expect(formatearFechaIso('18/12/2026')).toBeNull();
    expect(formatearFechaIso('2026-13-01')).toBeNull();
  });
});
