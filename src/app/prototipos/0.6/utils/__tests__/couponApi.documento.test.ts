/**
 * El validador público acepta el documento del cliente y avisa cuando un cupón
 * es de lista cerrada. Acá se revisa que la web mande y lea eso bien.
 */
import { validateCoupon } from '../couponApi';

const respuesta = (body: unknown) =>
  Promise.resolve({ json: () => Promise.resolve(body) } as Response);

const VALIDO = {
  valid: true,
  code: 'INVITADOS',
  coupon_type: 'percent_quotas',
  value: '10.00',
  quotas_affected: 1,
  label: '10% de descuento',
  error_message: null,
};

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
});

const cuerpoEnviado = () => JSON.parse(fetchMock.mock.calls[0][1].body);

test('sin documento no manda la clave: la petición es la de siempre', async () => {
  fetchMock.mockReturnValue(respuesta(VALIDO));
  await validateCoupon({ code: ' invitados ', landingId: 5, productId: 7 });

  expect(cuerpoEnviado()).toEqual({ code: 'invitados', product_id: 7, landing_id: 5 });
});

test('con documento lo manda como `document_number`', async () => {
  fetchMock.mockReturnValue(respuesta(VALIDO));
  await validateCoupon({ code: 'INVITADOS', documentNumber: '12345678' });

  expect(cuerpoEnviado()).toEqual({ code: 'INVITADOS', document_number: '12345678' });
});

test('lista cerrada sin documento: el cupón queda marcado como pendiente', async () => {
  fetchMock.mockReturnValue(
    respuesta({ ...VALIDO, restricted_to_document_list: true, requires_document: true })
  );
  const result = await validateCoupon({ code: 'INVITADOS' });

  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.coupon.restrictedToDocumentList).toBe(true);
  expect(result.coupon.requiresDocument).toBe(true);
});

test('lista cerrada con documento invitado: confirmada, sin pendiente', async () => {
  fetchMock.mockReturnValue(
    respuesta({ ...VALIDO, restricted_to_document_list: true, requires_document: false })
  );
  const result = await validateCoupon({ code: 'INVITADOS', documentNumber: '12345678' });

  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.coupon.restrictedToDocumentList).toBe(true);
  expect(result.coupon.requiresDocument).toBeUndefined();
});

test('cupón abierto: no aparecen claves nuevas', async () => {
  fetchMock.mockReturnValue(
    respuesta({ ...VALIDO, restricted_to_document_list: false, requires_document: false })
  );
  const result = await validateCoupon({ code: 'ABIERTO' });

  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect('restrictedToDocumentList' in result.coupon).toBe(false);
  expect('requiresDocument' in result.coupon).toBe(false);
});

test('rechazo: devuelve los motivos además del mensaje', async () => {
  fetchMock.mockReturnValue(
    respuesta({
      valid: false,
      code: null,
      error_message: 'Este cupón no está disponible para tu documento',
      error_codes: ['document_not_allowed'],
    })
  );
  const result = await validateCoupon({ code: 'INVITADOS', documentNumber: '99999999' });

  expect(result).toEqual({
    ok: false,
    error: 'Este cupón no está disponible para tu documento',
    errorCodes: ['document_not_allowed'],
  });
});

test('fallo de red: sin motivos, para que nadie retire el cupón por error', async () => {
  fetchMock.mockRejectedValue(new Error('offline'));
  const result = await validateCoupon({ code: 'INVITADOS', documentNumber: '12345678' });

  expect(result).toEqual({ ok: false });
});
