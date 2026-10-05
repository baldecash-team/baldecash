import { render } from '@testing-library/react';
import { CouponInput } from '../CouponInput';

/**
 * El cupón que llega por el link tiene que reportarse igual que el tipeado.
 *
 * `coupon_applied` se emitía SOLO al escribir el código. Cuando el link trae
 * `?coupon=`, quien lo aplica es `useCampaignCoupon` --en el catálogo-- y ese
 * hook no trackea: la persona llega a /solicitar con el cupón puesto, el
 * componente lo pinta como aplicado y no avisa. Los cupones de campaña, que son
 * los que traen los links de los socios, no existían en la instrumentación.
 */

const track = jest.fn();

let cuponActual: Record<string, unknown> | null = null;

jest.mock('../../../../context/ProductContext', () => ({
  useProduct: () => ({
    appliedCoupon: cuponActual,
    setAppliedCoupon: jest.fn(),
    clearCoupon: jest.fn(),
    selectedProduct: null,
    cartProducts: [],
    getDiscountAmount: () => 0,
  }),
}));

jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({ config: { landing_id: 216 } }),
}));

jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track }),
}));

const CUPON_DE_LINK = {
  code: 'SENATI30',
  discount: 30,
  couponType: 'percent_quotas',
  label: '30% de descuento',
  lockedFromUrl: true,
};

beforeEach(() => {
  track.mockClear();
  cuponActual = null;
  sessionStorage.clear();
});

test('emite coupon_applied cuando el cupon llego auto-aplicado por el link', () => {
  cuponActual = CUPON_DE_LINK;
  render(<CouponInput />);

  expect(track).toHaveBeenCalledWith('coupon_applied', {
    coupon_code: 'SENATI30',
    coupon_type: 'percent_quotas',
    discount_value: '30',
    source: 'url',
  });
});

test('no lo emite dos veces si el componente se vuelve a montar', () => {
  // El wizard monta y desmonta este input al moverse entre pasos. Sin la marca
  // en sessionStorage, cada ida y vuelta sumaria un evento del mismo cupon.
  cuponActual = CUPON_DE_LINK;
  const { unmount } = render(<CouponInput />);
  unmount();
  render(<CouponInput />);

  expect(track).toHaveBeenCalledTimes(1);
});

test('un cupon distinto en la misma sesion si se reporta', () => {
  cuponActual = CUPON_DE_LINK;
  const { unmount } = render(<CouponInput />);
  unmount();

  cuponActual = { ...CUPON_DE_LINK, code: 'A365007', discount: 15 };
  render(<CouponInput />);

  expect(track).toHaveBeenCalledTimes(2);
  expect(track).toHaveBeenLastCalledWith('coupon_applied', expect.objectContaining({
    coupon_code: 'A365007',
    discount_value: '15',
    source: 'url',
  }));
});

test('sin cupon aplicado no emite nada', () => {
  cuponActual = null;
  render(<CouponInput />);
  expect(track).not.toHaveBeenCalled();
});

test('un cupon tipeado a mano no entra por esta via', () => {
  // Sin `lockedFromUrl` el efecto no corre: ese caso lo cubre
  // `handleApplyCoupon`, que emite con source 'manual'. Si el efecto tambien
  // disparara, el cupon escrito generaria dos eventos.
  cuponActual = { ...CUPON_DE_LINK, lockedFromUrl: false };
  render(<CouponInput />);
  expect(track).not.toHaveBeenCalled();
});
