import { render, screen } from '@testing-library/react';
import { CouponInput } from '../CouponInput';
import { CouponDocumentStatus } from '../CouponDocumentStatus';

/**
 * Cupón de lista cerrada (solo documentos invitados).
 *
 * La caja decía «Aplicado» apenas el código era válido, sin conocer el
 * documento. Quien no estaba invitado se enteraba al enviar la solicitud, al
 * final del formulario. Ahora la caja avisa que falta confirmarlo, y cuando el
 * documento decide, dice qué pasó.
 */

let cuponActual: Record<string, unknown> | null = null;
let avisoDeRetiro: { code: string; rejection: 'not_invited' | 'user_limit' } | null = null;

const contexto = () => ({
  appliedCoupon: cuponActual,
  setAppliedCoupon: jest.fn(),
  clearCoupon: jest.fn(),
  removedCouponNotice: avisoDeRetiro,
  selectedProduct: { id: '1', term: 24, months: 24 },
  cartProducts: [],
  getDiscountAmount: () => 24,
});

jest.mock('../../../../context/ProductContext', () => ({
  useProduct: () => contexto(),
  useProductOptional: () => contexto(),
}));

jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({ config: { landing_id: 1 } }),
}));

jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn() }),
}));

const CUPON = {
  code: 'INVITADOS',
  discount: 10,
  couponType: 'percent_quotas',
  quotasAffected: 1,
  label: '10% de descuento en 1 cuotas',
};

const AVISO = 'Solo para documentos invitados. Lo confirmaremos cuando ingreses tu documento.';

beforeEach(() => {
  cuponActual = null;
  avisoDeRetiro = null;
  sessionStorage.clear();
});

describe('caja del cupón', () => {
  test('lista cerrada sin documento: avisa y no dice «Aplicado»', () => {
    cuponActual = { ...CUPON, restrictedToDocumentList: true, requiresDocument: true };
    render(<CouponInput />);

    expect(screen.getByText(AVISO)).toBeInTheDocument();
    expect(screen.getByText('Por confirmar')).toBeInTheDocument();
    expect(screen.queryByText('Aplicado')).not.toBeInTheDocument();
    // El alcance del descuento sigue diciéndose igual.
    expect(screen.getByText('Descuento en tu primera cuota')).toBeInTheDocument();
  });

  test('lista cerrada por link sin documento: tampoco «Aplicado automáticamente»', () => {
    cuponActual = { ...CUPON, lockedFromUrl: true, restrictedToDocumentList: true, requiresDocument: true };
    render(<CouponInput />);

    expect(screen.getByText('Por confirmar')).toBeInTheDocument();
    expect(screen.queryByText('Aplicado automáticamente')).not.toBeInTheDocument();
  });

  test('lista cerrada ya confirmada: «Aplicado» y «Confirmado para tu documento»', () => {
    cuponActual = { ...CUPON, restrictedToDocumentList: true };
    render(<CouponInput />);

    expect(screen.getByText('Aplicado')).toBeInTheDocument();
    expect(screen.getByText('Confirmado para tu documento')).toBeInTheDocument();
    expect(screen.queryByText(AVISO)).not.toBeInTheDocument();
  });

  test('cupón abierto: la caja queda como siempre', () => {
    cuponActual = { ...CUPON };
    render(<CouponInput />);

    expect(screen.getByText('Aplicado')).toBeInTheDocument();
    expect(screen.queryByText(AVISO)).not.toBeInTheDocument();
    expect(screen.queryByText('Confirmado para tu documento')).not.toBeInTheDocument();
    expect(screen.queryByText('Por confirmar')).not.toBeInTheDocument();
  });

  test('cupón retirado por no estar invitado: dice por qué y que puede seguir sin cupón', () => {
    avisoDeRetiro = { code: 'INVITADOS', rejection: 'not_invited' };
    render(<CouponInput />);

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveTextContent('El cupón INVITADOS es solo para documentos invitados');
    expect(aviso).toHaveTextContent('tu documento no está en la lista');
    expect(aviso).toHaveTextContent('continuar tu solicitud sin cupón');
    // Vuelve la caja para escribir otro código.
    expect(screen.getByPlaceholderText('Ingresa tu código')).toBeInTheDocument();
  });

  test('cupón retirado por tope de usos', () => {
    avisoDeRetiro = { code: 'UNAVEZ', rejection: 'user_limit' };
    render(<CouponInput />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ya usaste el cupón UNAVEZ el máximo de veces permitido'
    );
  });

  test('landing con cupón obligatorio: no promete seguir sin cupón', () => {
    avisoDeRetiro = { code: 'INVITADOS', rejection: 'not_invited' };
    render(<CouponInput isRequired />);

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveTextContent('necesitas ingresar un cupón válido para tu documento');
    expect(aviso).not.toHaveTextContent('sin cupón');
    expect(screen.getByText('Obligatorio')).toBeInTheDocument();
  });
});

describe('debajo del campo de documento', () => {
  test('cupón confirmado para el documento', () => {
    cuponActual = { ...CUPON, restrictedToDocumentList: true };
    render(<CouponDocumentStatus documentComplete />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Cupón INVITADOS confirmado para tu documento.'
    );
  });

  test('con el documento a medio escribir todavía no confirma nada', () => {
    cuponActual = { ...CUPON, restrictedToDocumentList: true };
    const { container } = render(<CouponDocumentStatus documentComplete={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('cupón pendiente de confirmar: el campo no dice nada todavía', () => {
    cuponActual = { ...CUPON, restrictedToDocumentList: true, requiresDocument: true };
    const { container } = render(<CouponDocumentStatus documentComplete />);
    expect(container).toBeEmptyDOMElement();
  });

  test('cupón abierto: nada', () => {
    cuponActual = { ...CUPON };
    const { container } = render(<CouponDocumentStatus documentComplete />);
    expect(container).toBeEmptyDOMElement();
  });

  test('cupón retirado: el aviso sale donde el cliente está mirando', () => {
    avisoDeRetiro = { code: 'INVITADOS', rejection: 'not_invited' };
    render(<CouponDocumentStatus documentComplete />);

    const aviso = screen.getByRole('alert');
    expect(aviso).toHaveTextContent('tu documento no está en la lista');
    expect(aviso).toHaveTextContent('continuar tu solicitud sin cupón');
  });
});
