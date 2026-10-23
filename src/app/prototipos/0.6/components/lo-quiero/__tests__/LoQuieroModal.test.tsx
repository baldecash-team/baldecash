/**
 * BAL-4958: pie en "lista simple" (términos con los enlaces dentro de la
 * frase, promociones y la fila del cupón, que abre un modal propio).
 *
 * BAL-4969 (ronda pre-PR):
 * - QA F10 · Falla 1: tocar la frase de la casilla de términos la marca; solo
 *   los enlaces abren su página, y no viven dentro del `role="checkbox"`.
 * - I6: la cuota se escribe con `formatCuotaDeLanding`, como el panel (en
 *   Family Farms muestra los centavos; en el resto, entera como siempre).
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
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

let mockTieneCupon = false;
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn(() => Promise.resolve({ features: { has_coupon: mockTieneCupon } })),
}));

// La validación es la de siempre (`CouponInput` real); solo se simula la API.
const mockValidar = jest.fn();
jest.mock('@/app/prototipos/0.6/utils/couponApi', () => ({
  validateCoupon: (...args: unknown[]) => mockValidar(...args),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ deferredPayment: { enabled: false } }),
}));

let mockProducto: Record<string, unknown> = {};
let mockElegidos: Array<Record<string, unknown>> = [];
// El cupón aplicado vive en un mini store: aplicarlo o quitarlo repinta.
let mockCupon: Record<string, unknown> | null = null;
const mockOyentes = new Set<() => void>();
function mockPonerCupon(c: Record<string, unknown> | null) {
  mockCupon = c;
  mockOyentes.forEach((l) => l());
}
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext', () => {
  const R = jest.requireActual('react');
  return {
    ProductProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useProductOptional: () => ({}),
    useProduct: () => {
      const cupon = R.useSyncExternalStore(
        (l: () => void) => {
          mockOyentes.add(l);
          return () => mockOyentes.delete(l);
        },
        () => mockCupon,
      );
      return {
        selectedProduct: mockProducto,
        setSelectedProduct: jest.fn(),
        selectedAccessories: mockElegidos,
        toggleAccessory: jest.fn(),
        clearAccessories: jest.fn(),
        appliedCoupon: cupon,
        setAppliedCoupon: (c: Record<string, unknown>) => mockPonerCupon(c),
        clearCoupon: () => mockPonerCupon(null),
        removedCouponNotice: null,
        cartProducts: [],
        getDiscountAmount: () => 0,
        isOverQuotaLimit: false,
        maxMonthlyQuota: null,
      };
    },
  };
});

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext', () => ({
  WizardConfigProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useWizardConfig: () => ({
    config: { landing_id: 216 },
    steps: [{ id: 1, code: 'p1', url_slug: 'datos-personales', order: 1, is_summary_step: false, fields: [] }],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext', () => ({
  useSessionOptional: () => null,
}));

const mockGuardarConsent = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/utils/consentStorage', () => ({
  readConsentStorage: () => ({ acceptTerms: false, acceptPrivacy: false, acceptPromos: false }),
  saveConsentStorage: (...args: unknown[]) => mockGuardarConsent(...args),
}));

jest.mock('../useMesPrimeraCuota', () => ({ useMesPrimeraCuota: () => null }));
jest.mock('@/app/prototipos/0.6/components/diseno-2/origenDiseno2', () => ({ guardarOrigenDiseno2: jest.fn() }));

import { LoQuieroModal } from '../LoQuieroModal';
import { DURACION_SALIDA_MS } from '@/app/prototipos/0.6/components/diseno-2/movimiento';

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

const mockOnClose = jest.fn();
function pintar() {
  return render(<LoQuieroModal isOpen onClose={mockOnClose} origen="catalogo" />);
}

const FRASE = 'Acepto los Términos y la Política de privacidad';

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
  mockOnClose.mockClear();
  mockValidar.mockReset();
  mockGuardarConsent.mockClear();
  mockTieneCupon = false;
  mockCupon = null;
  localStorage.clear();
  sessionStorage.clear();
});

describe('LoQuieroModal · casilla de términos (lista simple, BAL-4958)', () => {
  it('arranca neutra; tocar el texto la marca y la desmarca', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: FRASE });
    expect(casilla).toHaveAttribute('aria-checked', 'false');
    expect(casilla).not.toHaveAttribute('aria-invalid', 'true');

    fireEvent.click(screen.getByText(/Acepto los/));
    expect(casilla).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByText(/y la/));
    expect(casilla).toHaveAttribute('aria-checked', 'false');
  });

  it('tocar la casilla misma la marca (el clic no cae en un enlace)', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: FRASE });
    fireEvent.click(casilla);
    expect(casilla).toHaveAttribute('aria-checked', 'true');
  });

  it('los enlaces van dentro de la frase, abren su documento y NO marcan la casilla', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: FRASE });
    const terminos = screen.getByRole('link', { name: 'Términos' });
    const privacidad = screen.getByRole('link', { name: 'Política de privacidad' });

    // Dentro del texto de la fila, pero fuera del control.
    expect(document.getElementById('lo-quiero-terminos-texto')).toContainElement(terminos);
    expect(casilla).not.toContainElement(terminos);
    expect(casilla).not.toContainElement(privacidad);
    expect(terminos).toHaveAttribute('target', '_blank');
    expect(terminos).toHaveAttribute('href', expect.stringContaining('terminos-y-condiciones'));
    expect(privacidad).toHaveAttribute('href', expect.stringContaining('politica-de-privacidad'));

    fireEvent.click(privacidad);
    fireEvent.click(terminos);
    expect(casilla).toHaveAttribute('aria-checked', 'false');
  });

  it('ya no existe la línea aparte "Leer Términos · Política de privacidad"', async () => {
    pintar();
    await screen.findByRole('checkbox', { name: FRASE });
    expect(screen.queryByText('Leer')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('promociones es su propia casilla, con el texto como clic', async () => {
    pintar();
    const promos = await screen.findByRole('checkbox', { name: 'Quiero recibir promociones' });
    fireEvent.click(screen.getByText('Quiero recibir promociones'));
    expect(promos).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: FRASE })).toHaveAttribute('aria-checked', 'false');
  });

  it('sin marcar, Continuar avisa; marcada, guarda los consentimientos como siempre y navega', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: FRASE });
    const continuar = await screen.findByRole('button', { name: /Continuar a mis datos/ });

    fireEvent.click(continuar);
    expect(await screen.findByText('Marca la casilla para continuar.')).toBeInTheDocument();
    expect(casilla).toHaveAttribute('aria-invalid', 'true');
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText(/Acepto los/));
    fireEvent.click(screen.getByText('Quiero recibir promociones'));
    expect(casilla).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(continuar);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('datos-personales')));
    expect(mockGuardarConsent).toHaveBeenCalledWith('pago-diferido', {
      acceptTerms: true,
      acceptPrivacy: true,
      acceptPromos: true,
    });
  });

  it('caja de Términos de Brenda: ámbar con brillo, naranja con sacudida que se repite, verde al marcar', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: FRASE });
    const caja = document.querySelector('[data-terminos-v2]')!;
    expect(caja).toHaveAttribute('data-terminos-v2', 'neutra');
    expect(caja).toHaveClass('border-[#F2B632]', 'bg-[#FFF6D8]', 'd2-brillo-consentimiento', 'rounded-[10px]', 'border-[1.5px]');

    const continuar = await screen.findByRole('button', { name: /Continuar a mis datos/ });
    fireEvent.click(continuar);
    expect(caja).toHaveAttribute('data-terminos-v2', 'error');
    expect(caja).toHaveClass('border-[#C2410C]', 'bg-[#FFF1EB]', 'd2-sacudida-a');
    expect(screen.getByRole('alert')).toHaveTextContent('Marca la casilla para continuar.');
    fireEvent.click(continuar);
    expect(caja).toHaveClass('d2-sacudida-b');

    fireEvent.click(casilla);
    expect(caja).toHaveAttribute('data-terminos-v2', 'marcada');
    expect(caja).toHaveClass('border-[#0E8C78]', 'bg-[#E8F7F2]');
    expect(screen.queryByText('Marca la casilla para continuar.')).not.toBeInTheDocument();
  });
});

describe('LoQuieroModal · "Ver detalle" de cada accesorio (BAL-4958)', () => {
  it('cada tarjeta tiene su enlace "Ver detalle"; abre la hoja con cuota, descripción, Cerrar y Agregar', async () => {
    mockAccesorios = [
      {
        id: 'a1',
        name: 'Mouse Logitech M170',
        description: 'Inalámbrico con receptor USB. Batería de 12 meses.',
        price: 60,
        monthlyQuota: 5,
        image: '',
        category: null,
        isRecommended: true,
        compatibleWith: [],
        term: 12,
      },
    ];
    pintar();
    const ver = await screen.findByRole('button', { name: /Ver detalle de Mouse Logitech M170/ });
    expect(ver).toHaveTextContent('Ver detalle');
    expect(ver).toHaveClass('min-h-[44px]', 'underline');

    fireEvent.click(ver);
    const hoja = await screen.findByRole('dialog', { name: /Mouse Logitech M170/ });
    expect(within(hoja).getByText(/en 12 cuotas/)).toBeInTheDocument();
    expect(within(hoja).getByText(/Inalámbrico con receptor USB/)).toBeInTheDocument();
    expect(within(hoja).getByRole('button', { name: 'Agregar a mi solicitud' })).toBeInTheDocument();

    fireEvent.click(within(hoja).getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /Mouse Logitech M170/ })).not.toBeInTheDocument());
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

describe('LoQuieroModal · modal del cupón (BAL-4958)', () => {
  async function abrirCupon() {
    mockTieneCupon = true;
    pintar();
    const fila = await screen.findByRole('button', { name: /¿Tienes un cupón\?/ });
    fireEvent.click(fila);
    const dialogo = await screen.findByRole('dialog', { name: 'Ingresa tu cupón' });
    return { fila, dialogo };
  }

  it('la fila abre un modal chico con el foco en el input', async () => {
    const { dialogo } = await abrirCupon();
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    const input = within(dialogo).getByRole('textbox', { name: 'Código de cupón' });
    expect(input).toHaveFocus();
    expect(within(dialogo).getByRole('button', { name: 'Aplicar' })).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Cerrar cupón' })).toBeInTheDocument();
  });

  it('cupón inválido: el error sale dentro del modal chico, que sigue abierto', async () => {
    mockValidar.mockResolvedValue({ ok: false, error: 'Cupón no válido o expirado' });
    const { dialogo } = await abrirCupon();
    fireEvent.change(within(dialogo).getByRole('textbox'), { target: { value: 'nope' } });
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Aplicar' }));

    expect(await within(dialogo).findByText('Cupón no válido o expirado')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Ingresa tu cupón' })).toBeInTheDocument();
    expect(mockValidar).toHaveBeenCalledWith(expect.objectContaining({ code: 'NOPE', landingId: 216 }));
  });

  it('mientras valida muestra el loading', async () => {
    let resolver: (v: unknown) => void = () => {};
    mockValidar.mockReturnValue(new Promise((r) => (resolver = r)));
    const { dialogo } = await abrirCupon();
    fireEvent.change(within(dialogo).getByRole('textbox'), { target: { value: 'baldecash' } });
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Aplicar' }));
    expect(await within(dialogo).findByLabelText('Validando')).toBeInTheDocument();
    await act(async () => resolver({ ok: false, error: 'x' }));
  });

  it('cupón válido: el modal chico se cierra solo y la fila dice "Cupón X aplicado · Quitar"', async () => {
    mockValidar.mockResolvedValue({
      ok: true,
      coupon: { code: 'BALDE20', discount: 20, couponType: 'fixed_quotas', label: 'S/20' },
    });
    const { dialogo } = await abrirCupon();
    fireEvent.change(within(dialogo).getByRole('textbox'), { target: { value: 'balde20' } });
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Aplicar' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Ingresa tu cupón' })).not.toBeInTheDocument());
    // El modal de "Lo quiero" sigue abierto.
    expect(screen.getByRole('dialog', { name: /complementar|Un paso más/ })).toBeInTheDocument();
    expect(screen.getByText('BALDE20')).toBeInTheDocument();
    expect(screen.getByText(/aplicado/)).toBeInTheDocument();
    const quitar = screen.getByRole('button', { name: 'Quitar cupón BALDE20' });
    expect(quitar).toHaveTextContent('Quitar');
    await waitFor(() => expect(quitar).toHaveFocus());

    fireEvent.click(quitar);
    expect(await screen.findByRole('button', { name: /¿Tienes un cupón\?/ })).toBeInTheDocument();
  });

  it('Escape cierra solo el modal del cupón, no el de "Lo quiero", y el foco vuelve a la fila', async () => {
    const { fila } = await abrirCupon();
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Ingresa tu cupón' })).not.toBeInTheDocument());
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: /complementar|Un paso más/ })).toBeInTheDocument();
    await waitFor(() => expect(fila).toHaveFocus());

    // Un segundo Escape sí cierra "Lo quiero" (después de su animación de
    // salida, BAL-4969), y una sola vez aunque se insista.
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, DURACION_SALIDA_MS + 50));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('el botón de cerrar del modal chico tampoco cierra "Lo quiero"', async () => {
    const { dialogo } = await abrirCupon();
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Cerrar cupón' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Ingresa tu cupón' })).not.toBeInTheDocument());
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('un cupón de campaña (del link) se muestra aplicado, sin "Quitar"', async () => {
    mockTieneCupon = true;
    mockCupon = { code: 'SENATI30', discount: 30, couponType: 'percent_quotas', label: '30%', lockedFromUrl: true };
    pintar();
    expect(await screen.findByText('SENATI30')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Quitar cupón/ })).not.toBeInTheDocument();
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
