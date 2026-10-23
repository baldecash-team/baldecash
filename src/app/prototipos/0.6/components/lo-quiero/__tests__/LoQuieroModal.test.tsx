/**
 * BAL-4969 (ronda pre-PR):
 * - QA F10 · Falla 1: tocar la frase de la casilla de términos la marca; solo
 *   los enlaces abren su página, y no viven dentro del `role="checkbox"`.
 * - I6: la cuota se escribe con `formatCuotaDeLanding`, como el panel (en
 *   Family Farms muestra los centavos; en el resto, entera como siempre).
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

let mockLanding = 'pago-diferido';
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: mockLanding }),
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn(), captureMessage: jest.fn() }));

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    track: jest.fn(),
    trackAccessoryAdd: jest.fn(),
    trackAccessoryRemove: jest.fn(),
    trackAccessoryView: jest.fn(),
  }),
}));

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({ isLoading: false, isEnabled: () => true, isCouponRequired: false }),
}));

let mockAccesorios: Array<Record<string, unknown>> = [];
jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  getLandingAccessories: jest.fn(() => Promise.resolve(mockAccesorios)),
  resolveEcosistema: () => null,
}));

jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn(() => Promise.resolve({ features: { has_coupon: false } })),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ deferredPayment: { enabled: false } }),
}));

let mockProducto: Record<string, unknown> = {};
let mockElegidos: Array<Record<string, unknown>> = [];
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext', () => ({
  ProductProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProductOptional: () => ({}),
  useProduct: () => ({
    selectedProduct: mockProducto,
    setSelectedProduct: jest.fn(),
    selectedAccessories: mockElegidos,
    toggleAccessory: jest.fn(),
    clearAccessories: jest.fn(),
    appliedCoupon: null,
    isOverQuotaLimit: false,
    maxMonthlyQuota: null,
  }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext', () => ({
  WizardConfigProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useWizardConfig: () => ({
    steps: [{ id: 1, code: 'p1', url_slug: 'datos-personales', order: 1, is_summary_step: false, fields: [] }],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext', () => ({
  useSessionOptional: () => null,
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon', () => ({
  CouponInput: () => null,
}));

jest.mock('../useMesPrimeraCuota', () => ({ useMesPrimeraCuota: () => null }));
jest.mock('@/app/prototipos/0.6/components/diseno-2/origenDiseno2', () => ({ guardarOrigenDiseno2: jest.fn() }));

import { LoQuieroModal } from '../LoQuieroModal';

function producto(over: Record<string, unknown> = {}) {
  return {
    id: '1528',
    name: 'Laptop Lenovo V15',
    shortName: 'Lenovo V15',
    monthlyPayment: 70.5,
    initialAmount: 0,
    term: 24,
    months: 24,
    paymentFrequency: 'mensual',
    type: 'laptop',
    ...over,
  };
}

function pintar() {
  return render(<LoQuieroModal isOpen onClose={jest.fn()} origen="catalogo" />);
}

beforeAll(() => {
  // jsdom no implementa scrollIntoView.
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  mockLanding = 'pago-diferido';
  mockProducto = producto();
  mockElegidos = [];
  mockAccesorios = [];
  mockPush.mockClear();
  localStorage.clear();
});

describe('LoQuieroModal · casilla de términos (QA F10, Falla 1)', () => {
  it('tocar la frase marca la casilla', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: /Acepto Términos y Política de privacidad/ });
    expect(casilla).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(screen.getByText('Acepto Términos y Política de privacidad'));
    expect(casilla).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByText('Acepto Términos y Política de privacidad'));
    expect(casilla).toHaveAttribute('aria-checked', 'false');
  });

  it('los enlaces abren su página sin marcar la casilla y no están dentro del control', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: /Acepto Términos/ });
    const terminos = screen.getByRole('link', { name: 'Términos' });
    const privacidad = screen.getByRole('link', { name: 'Política de privacidad' });

    expect(casilla).not.toContainElement(terminos);
    expect(casilla).not.toContainElement(privacidad);
    expect(terminos).toHaveAttribute('target', '_blank');
    expect(privacidad).toHaveAttribute('href', expect.stringContaining('politica-de-privacidad'));

    fireEvent.click(privacidad);
    fireEvent.click(terminos);
    expect(casilla).toHaveAttribute('aria-checked', 'false');
  });

  it('con teclado (Espacio) también marca', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: /Acepto Términos/ });
    fireEvent.keyDown(casilla, { key: ' ' });
    expect(casilla).toHaveAttribute('aria-checked', 'true');
  });

  it('sin marcar, Continuar avisa; marcada por la frase, navega al primer paso', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: /Acepto Términos/ });
    const continuar = await screen.findByRole('button', { name: /Continuar a mis datos/ });

    fireEvent.click(continuar);
    expect(await screen.findByText('Marca la casilla para continuar.')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Acepto Términos y Política de privacidad'));
    expect(casilla).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(continuar);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('datos-personales')));
  });
});

describe('LoQuieroModal · formato de la cuota (I6)', () => {
  it('Family Farms: la cuota sale con centavos, como el panel', async () => {
    mockLanding = 'family-farms-baldecash-a';
    mockProducto = producto({ monthlyPayment: 70.5 });
    pintar();
    expect(await screen.findByText('S/70.50')).toBeInTheDocument();
  });

  it('el resto de landings: entera, como siempre', async () => {
    mockLanding = 'pago-diferido';
    mockProducto = producto({ monthlyPayment: 70.5 });
    pintar();
    expect(await screen.findByText('S/70')).toBeInTheDocument();
    expect(screen.queryByText('S/70.50')).not.toBeInTheDocument();
  });

  it('el total con accesorios suma sin truncar cada parte antes (Family Farms)', async () => {
    mockLanding = 'family-farms-baldecash-a';
    mockProducto = producto({ monthlyPayment: 70.5 });
    mockElegidos = [{ id: 9, name: 'Mouse', monthlyQuota: 10.25 }];
    pintar();
    expect(await screen.findByText('S/80.75')).toBeInTheDocument();
    expect(screen.getByText(/Equipo S\/70\.50 \+ accesorios S\/10\.25/)).toBeInTheDocument();
  });
});
