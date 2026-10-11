/**
 * El cupón se valida antes de conocer el documento del cliente. Un cupón de
 * lista cerrada salía «aplicado» para cualquiera y el rechazo llegaba al enviar
 * la solicitud, al final del formulario.
 *
 * Con el documento escrito, el cupón se revalida: se confirma, o se retira con
 * su motivo. Lo que no dependa del documento no lo toca.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useCouponDocumentCheck } from '../useCouponDocumentCheck';
import { validateCoupon } from '@/app/prototipos/0.6/utils/couponApi';

jest.mock('@/app/prototipos/0.6/utils/couponApi', () => ({
  validateCoupon: jest.fn(),
}));

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));

const setAppliedCoupon = jest.fn();
const removeCouponForDocument = jest.fn();
const track = jest.fn();
let cuponActual: Record<string, unknown> | null = null;

jest.mock('../../context/ProductContext', () => ({
  useProductOptional: () => ({
    appliedCoupon: cuponActual,
    setAppliedCoupon,
    removeCouponForDocument,
    selectedProduct: { id: '77' },
    cartProducts: [],
  }),
}));

jest.mock('../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track }),
}));

const validar = validateCoupon as jest.Mock;

const CUPON_PENDIENTE = {
  code: 'INVITADOS',
  discount: 10,
  label: '10% de descuento',
  couponType: 'percent_quotas',
  lockedFromUrl: true,
  restrictedToDocumentList: true,
  requiresDocument: true,
};

const esperarUnPoco = () => new Promise((r) => setTimeout(r, 30));

beforeEach(() => {
  jest.clearAllMocks();
  cuponActual = { ...CUPON_PENDIENTE };
});

function montar(documentNumber: string | null) {
  return renderHook(
    ({ doc }: { doc: string | null }) =>
      useCouponDocumentCheck({ documentNumber: doc, landingId: 5, debounceMs: 0 }),
    { initialProps: { doc: documentNumber } }
  );
}

test('revalida con el documento, el equipo y la landing', async () => {
  validar.mockResolvedValue({ ok: true, coupon: { ...CUPON_PENDIENTE, requiresDocument: undefined } });
  montar('12345678');

  await waitFor(() => expect(validar).toHaveBeenCalledTimes(1));
  expect(validar).toHaveBeenCalledWith({
    code: 'INVITADOS',
    productId: 77,
    landingId: 5,
    documentNumber: '12345678',
  });
});

test('documento invitado: el cupón queda confirmado y conserva lo demás', async () => {
  validar.mockResolvedValue({
    ok: true,
    coupon: { code: 'INVITADOS', discount: 10, label: 'x', restrictedToDocumentList: true },
  });
  montar('12345678');

  await waitFor(() => expect(setAppliedCoupon).toHaveBeenCalledTimes(1));
  const confirmado = setAppliedCoupon.mock.calls[0][0];
  expect(confirmado.restrictedToDocumentList).toBe(true);
  expect(confirmado.requiresDocument).toBeUndefined();
  // El candado de campaña y el texto del cupón no se pierden al confirmar.
  expect(confirmado.lockedFromUrl).toBe(true);
  expect(confirmado.label).toBe('10% de descuento');
  expect(removeCouponForDocument).not.toHaveBeenCalled();
});

test('documento no invitado: retira el cupón con su motivo', async () => {
  validar.mockResolvedValue({
    ok: false,
    error: 'Este cupón no está disponible para tu documento',
    errorCodes: ['document_not_allowed'],
  });
  montar('99999999');

  await waitFor(() =>
    expect(removeCouponForDocument).toHaveBeenCalledWith({
      code: 'INVITADOS',
      rejection: 'not_invited',
    })
  );
  expect(setAppliedCoupon).not.toHaveBeenCalled();
  expect(track).toHaveBeenCalledWith(
    'coupon_removed',
    expect.objectContaining({ coupon_code: 'INVITADOS', reason: 'not_invited' })
  );
});

test('tope por persona alcanzado: retira el cupón con su motivo', async () => {
  cuponActual = { code: 'UNAVEZ', discount: 10, label: 'x' };
  validar.mockResolvedValue({ ok: false, errorCodes: ['user_limit_reached'] });
  montar('12345678');

  await waitFor(() =>
    expect(removeCouponForDocument).toHaveBeenCalledWith({
      code: 'UNAVEZ',
      rejection: 'user_limit',
    })
  );
});

test('un rechazo que no depende del documento no retira el cupón', async () => {
  validar.mockResolvedValue({ ok: false, error: 'Este cupón ha expirado', errorCodes: ['expired'] });
  montar('12345678');

  await waitFor(() => expect(validar).toHaveBeenCalled());
  await esperarUnPoco();
  expect(removeCouponForDocument).not.toHaveBeenCalled();
  expect(setAppliedCoupon).not.toHaveBeenCalled();
});

test('un fallo de red no retira el cupón', async () => {
  validar.mockResolvedValue({ ok: false });
  montar('12345678');

  await waitFor(() => expect(validar).toHaveBeenCalled());
  await esperarUnPoco();
  expect(removeCouponForDocument).not.toHaveBeenCalled();
});

test('cupón abierto que sigue pasando: no se toca', async () => {
  cuponActual = { code: 'ABIERTO', discount: 10, label: 'x' };
  validar.mockResolvedValue({ ok: true, coupon: { code: 'ABIERTO', discount: 10, label: 'x' } });
  montar('12345678');

  await waitFor(() => expect(validar).toHaveBeenCalled());
  await esperarUnPoco();
  expect(setAppliedCoupon).not.toHaveBeenCalled();
  expect(removeCouponForDocument).not.toHaveBeenCalled();
});

test('sin documento completo no consulta', async () => {
  montar(null);
  await esperarUnPoco();
  expect(validar).not.toHaveBeenCalled();
});

test('sin cupón aplicado no consulta', async () => {
  cuponActual = null;
  montar('12345678');
  await esperarUnPoco();
  expect(validar).not.toHaveBeenCalled();
});

test('el mismo documento no se consulta dos veces; uno distinto sí', async () => {
  validar.mockResolvedValue({ ok: true, coupon: { ...CUPON_PENDIENTE } });
  const { rerender } = montar('12345678');
  await waitFor(() => expect(validar).toHaveBeenCalledTimes(1));

  rerender({ doc: '12345678' });
  await esperarUnPoco();
  expect(validar).toHaveBeenCalledTimes(1);

  rerender({ doc: '87654321' });
  await waitFor(() => expect(validar).toHaveBeenCalledTimes(2));
  expect(validar.mock.calls[1][0].documentNumber).toBe('87654321');
});

test('si el cliente cambió el documento mientras respondía, la respuesta vieja se descarta', async () => {
  let responder: (valor: unknown) => void = () => {};
  validar.mockReturnValueOnce(new Promise((r) => { responder = r; }));
  validar.mockResolvedValue({ ok: true, coupon: { ...CUPON_PENDIENTE } });

  const { rerender } = montar('99999999');
  await waitFor(() => expect(validar).toHaveBeenCalledTimes(1));

  rerender({ doc: '12345678' });
  responder({ ok: false, errorCodes: ['document_not_allowed'] });
  await esperarUnPoco();

  expect(removeCouponForDocument).not.toHaveBeenCalled();
});
