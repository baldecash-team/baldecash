/// <reference types="jest" />
/**
 * `eleccionEquipoApi` — cliente HTTP de la elección de unidad.
 *
 * Cubre las dos traducciones que hace el módulo: el `detail` del backend a
 * `{reason, error}`, y el default defensivo de `units`.
 */
import { getEleccion, elegirUnidad, isEleccionApiError } from './eleccionEquipoApi';

const respuesta = (status: number, body: unknown) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);

const datos = {
  application: { monthly_payment: 55, link_expires_at: '2026-08-26T15:30:00' },
  product: { product_id: 9, sku: 'MBA-M1', name: 'MacBook Air M1', slug: 'macbook-air-m1' },
  units: [],
  selected_unit_id: null,
};

beforeEach(() => {
  global.fetch = jest.fn() as unknown as typeof fetch;
});

describe('getEleccion', () => {
  it('devuelve la vista tal cual cuando el backend responde bien', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      respuesta(200, { ...datos, units: [{ unit_id: 1, display_number: 1, photos: [], video_url: null }] }),
    );

    const res = await getEleccion('tok');

    expect(isEleccionApiError(res)).toBe(false);
    expect(res).toMatchObject({ units: [{ unit_id: 1 }] });
  });

  it('si el backend omite `units`, cae a lista vacía en vez de dejar la pantalla en blanco', async () => {
    const sinUnits = { ...datos };
    delete (sinUnits as { units?: unknown }).units;
    (global.fetch as jest.Mock).mockReturnValue(respuesta(200, sinUnits));

    const res = await getEleccion('tok');

    expect(isEleccionApiError(res)).toBe(false);
    expect((res as { units: unknown[] }).units).toEqual([]);
  });

  it('traduce el detail del backend a {reason, error}', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      respuesta(404, { detail: { reason: 'expired', message: 'El enlace venció.' } }),
    );

    const res = await getEleccion('tok');

    expect(res).toEqual({ reason: 'expired', error: 'El enlace venció.' });
  });

  it('el array de errores de Pydantic no se confunde con un detail de dominio', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      respuesta(422, { detail: [{ loc: ['body'], msg: 'field required', type: 'x' }] }),
    );

    const res = await getEleccion('tok');

    expect(res).toEqual({
      reason: 'validation_error',
      error: 'Revisa los datos e intenta nuevamente.',
    });
  });

  it('una caída de red se distingue de un rechazo del backend', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

    const res = await getEleccion('tok');

    expect(res).toMatchObject({ reason: 'network' });
  });
});

describe('elegirUnidad', () => {
  it('manda el unit_id en el body', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      respuesta(200, { status: 'selected', unit: { unit_id: 7, display_number: 2 } }),
    );

    const res = await elegirUnidad('tok', 7);

    expect(res).toMatchObject({ status: 'selected' });
    const [, opciones] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(opciones.body)).toEqual({ unit_id: 7 });
  });

  it('el 409 llega como reason unit_unavailable, no como error genérico', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      respuesta(409, {
        detail: { reason: 'unit_unavailable', message: 'Esa unidad ya no está disponible.' },
      }),
    );

    const res = await elegirUnidad('tok', 7);

    expect(res).toEqual({
      reason: 'unit_unavailable',
      error: 'Esa unidad ya no está disponible.',
    });
  });
});
