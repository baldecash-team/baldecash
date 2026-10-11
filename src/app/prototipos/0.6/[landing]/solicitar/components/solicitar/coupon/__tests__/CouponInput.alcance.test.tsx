import { render, screen } from '@testing-library/react';
import { CouponInput } from '../CouponInput';

/**
 * La caja del cupón aplicado decía lo mismo tres veces —el texto del backend
 * («10% de descuento en 1 cuotas»), «solo en 1.ª cuota» y «Descuento solo en tu
 * primera cuota. No se puede quitar en esta campaña.»— y las dos frases fijas
 * salían también para un cupón de monto fijo en TODAS las cuotas, donde eran
 * falsas.
 *
 * Ahora dice una sola cosa, armada con el alcance real del cupón.
 */

let cuponActual: Record<string, unknown> | null = null;
let descuento = 0;

jest.mock('../../../../context/ProductContext', () => ({
  useProduct: () => ({
    appliedCoupon: cuponActual,
    setAppliedCoupon: jest.fn(),
    clearCoupon: jest.fn(),
    selectedProduct: { id: '1', term: 24, months: 24 },
    cartProducts: [],
    getDiscountAmount: () => descuento,
  }),
}));

jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({ config: { landing_id: 1 } }),
}));

jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn() }),
}));

beforeEach(() => {
  cuponActual = null;
  descuento = 0;
  sessionStorage.clear();
});

const FRASES_VIEJAS = [/solo en 1\.ª cuota/i, /Descuento solo en tu primera cuota/i, /No se puede quitar en esta campaña/i];

test('porcentaje en 1 cuota: un solo mensaje, «Descuento en tu primera cuota»', () => {
  cuponActual = {
    code: 'CAMPA10',
    discount: 10,
    couponType: 'percent_quotas',
    quotasAffected: 1,
    label: '10% de descuento en 1 cuotas',
    lockedFromUrl: true,
  };
  descuento = 24;
  render(<CouponInput />);

  expect(screen.getByText('Descuento en tu primera cuota')).toBeInTheDocument();
  expect(screen.getByText('-S/24')).toBeInTheDocument();
  // El texto del backend no se repite al lado del nuestro.
  expect(screen.queryByText('10% de descuento en 1 cuotas')).not.toBeInTheDocument();
  for (const frase of FRASES_VIEJAS) expect(screen.queryByText(frase)).not.toBeInTheDocument();
  // «cuota» aparece una sola vez en toda la caja.
  expect(screen.getAllByText(/cuota/i)).toHaveLength(1);
});

test('porcentaje en 3 cuotas: «Descuento en tus primeras 3 cuotas»', () => {
  cuponActual = {
    code: 'CAMPA3Q',
    discount: 10,
    couponType: 'percent_quotas',
    quotasAffected: 3,
    label: '10% de descuento en 3 cuotas',
    lockedFromUrl: true,
  };
  descuento = 24;
  render(<CouponInput />);

  expect(screen.getByText('Descuento en tus primeras 3 cuotas')).toBeInTheDocument();
  expect(screen.getAllByText(/cuota/i)).toHaveLength(1);
});

test('monto fijo con cuotas vacías: «Descuento en todas tus cuotas», nunca «primera cuota»', () => {
  cuponActual = {
    code: 'FIJO10',
    discount: 10,
    couponType: 'fixed',
    label: 'Descuento de S/10',
    lockedFromUrl: true,
  };
  descuento = 10;
  render(<CouponInput />);

  expect(screen.getByText('Descuento en todas tus cuotas')).toBeInTheDocument();
  expect(screen.getByText('-S/10')).toBeInTheDocument();
  expect(screen.queryByText(/primera cuota/i)).not.toBeInTheDocument();
  for (const frase of FRASES_VIEJAS) expect(screen.queryByText(frase)).not.toBeInTheDocument();
});

test('cupón de regalo: muestra el regalo y ningún texto de descuento', () => {
  cuponActual = {
    code: 'REGALO',
    discount: 0,
    couponType: 'free_accessory',
    giftName: 'Mochila Nova',
    giftQuantity: 1,
    label: 'Periférico de regalo: Mochila Nova',
    lockedFromUrl: true,
  };
  render(<CouponInput />);

  expect(screen.getByText('+ Mochila Nova')).toBeInTheDocument();
  expect(screen.queryByText(/Descuento/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/cuota/i)).not.toBeInTheDocument();
});

test('cupón escrito a mano (no llegó por link): mismo mensaje único', () => {
  cuponActual = {
    code: 'MANUAL',
    discount: 10,
    couponType: 'percent_quotas',
    quotasAffected: 1,
    label: '10% de descuento en 1 cuotas',
  };
  descuento = 12;
  render(<CouponInput />);

  expect(screen.getByText('Aplicado')).toBeInTheDocument();
  expect(screen.getByText('Descuento en tu primera cuota')).toBeInTheDocument();
  expect(screen.getAllByText(/cuota/i)).toHaveLength(1);
});
