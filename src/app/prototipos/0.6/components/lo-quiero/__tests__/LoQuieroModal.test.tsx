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

const mockTrackModal = jest.fn();
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    track: (...a: unknown[]) => mockTrackModal(...a),
    trackAccessoryAdd: jest.fn(),
    trackAccessoryRemove: jest.fn(),
    trackAccessoryView: jest.fn(),
  }),
}));

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));

let mockCuponObligatorio = false;
jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({ isLoading: false, isEnabled: () => true, isCouponRequired: mockCuponObligatorio }),
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
let mockSobreTope = false;
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
        isOverQuotaLimit: mockSobreTope,
        maxMonthlyQuota: mockSobreTope ? 300 : null,
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
  mockCuponObligatorio = false;
  mockSobreTope = false;
  mockTrackModal.mockClear();
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
    const promos = await screen.findByRole('checkbox', { name: /Quiero recibir promociones/ });
    fireEvent.click(screen.getByText(/Quiero recibir promociones/));
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
    fireEvent.click(screen.getByText(/Quiero recibir promociones/));
    expect(casilla).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(continuar);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('datos-personales')));
    expect(mockGuardarConsent).toHaveBeenCalledWith('pago-diferido', {
      acceptTerms: true,
      acceptPrivacy: true,
      acceptPromos: true,
    });
  });

  it('después de Continuar, un clic en Volver (doble clic) no registra un cierre falso', async () => {
    pintar();
    await screen.findByRole('checkbox', { name: FRASE });
    fireEvent.click(screen.getByText(/Acepto los/));
    fireEvent.click(screen.getByRole('button', { name: /Continuar a mis datos/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    const eventos = mockTrackModal.mock.calls.map((c) => c[0]);
    expect(eventos).toContain('lo_quiero_modal_continue');
    expect(eventos).not.toContain('lo_quiero_modal_close');
  });

  it('caja de Términos de Brenda: ámbar con brillo, naranja con sacudida que se repite, verde al marcar', async () => {
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: FRASE });
    const caja = document.querySelector('[data-terminos-v2]')!;
    expect(caja).toHaveAttribute('data-terminos-v2', 'neutra');
    expect(caja).toHaveClass('border-[var(--d2-aviso-borde)]', 'bg-[var(--d2-aviso-suave)]', 'd2-brillo-consentimiento', 'rounded-[10px]', 'border-[1.5px]');

    const continuar = await screen.findByRole('button', { name: /Continuar a mis datos/ });
    fireEvent.click(continuar);
    expect(caja).toHaveAttribute('data-terminos-v2', 'error');
    expect(caja).toHaveClass('border-[var(--d2-error)]', 'bg-[var(--d2-error-suave)]', 'd2-sacudida-a');
    expect(screen.getByRole('alert')).toHaveTextContent('Marca la casilla para continuar.');
    fireEvent.click(continuar);
    expect(caja).toHaveClass('d2-sacudida-b');

    fireEvent.click(casilla);
    expect(caja).toHaveAttribute('data-terminos-v2', 'marcada');
    expect(caja).toHaveClass('border-[var(--d2-ok)]', 'bg-[var(--d2-ok-suave-3)]');
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
    const fila = await screen.findByRole('button', { name: /Agregar cupón/ });
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

  it('cupón válido: el modal chico se cierra solo y al lado del total sale "✓ Cupón X" con "Quitar"', async () => {
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
    expect(screen.getByRole('status')).toHaveTextContent('Cupón BALDE20');
    const quitar = screen.getByRole('button', { name: 'Quitar cupón BALDE20' });
    expect(quitar).toHaveTextContent('Quitar');
    await waitFor(() => expect(quitar).toHaveFocus());

    fireEvent.click(quitar);
    expect(await screen.findByRole('button', { name: /Agregar cupón/ })).toBeInTheDocument();
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
    expect(await screen.findByText(/Cupón SENATI30/)).toBeInTheDocument();
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
    // Sin la línea aparte "Equipo S/x + accesorios S/y" (prototipo): la
    // leyenda cuenta los accesorios.
    expect(screen.queryByText(/Equipo S\/70\.50 \+ accesorios/)).not.toBeInTheDocument();
    expect(screen.getByText(/24 meses · sin inicial · 1 accesorio/)).toBeInTheDocument();
  });
});

describe('LoQuieroModal · como el prototipo (verificación final, BAL-4969)', () => {
  const ACC = (id: string, name: string, category: Record<string, string> | null) => ({
    id, name, description: '', price: 60, monthlyQuota: 5, image: '', category,
    isRecommended: true, compatibleWith: [], term: 24,
  });

  it.each([
    ['laptop', 'laptop'],
    ['tablet', 'tablet'],
    ['celular', 'celular'],
    ['otro', 'equipo'],
  ])('el título usa el tipo real del producto (%s → %s)', async (tipo, palabra) => {
    mockProducto = producto({ type: tipo });
    mockAccesorios = [ACC('a1', 'Mouse', null)];
    pintar();
    expect(await screen.findByRole('heading', { name: `¿Quieres complementar tu ${palabra}?` })).toBeInTheDocument();
  });

  it('«Continuar» queda bloqueado mientras cargan los accesorios y se habilita al terminar', async () => {
    const { getLandingAccessories } = jest.requireMock('@/app/prototipos/0.6/services/landingApi');
    let soltar: (v: unknown) => void = () => {};
    (getLandingAccessories as jest.Mock).mockImplementationOnce(() => new Promise((r) => { soltar = r; }));
    pintar();
    const boton = await screen.findByRole('button', { name: /Cargando|Continuar/ });
    await waitFor(() => expect(boton).toBeDisabled());
    await act(async () => { soltar([ACC('a1', 'Mouse', null)]); });
    await waitFor(() => expect(screen.getByRole('button', { name: /Continuar a mis datos/ })).not.toBeDisabled());
  });

  it('con más de 8 accesorios, el último espacio es «+N más»; al abrir salen todos y «Ver menos» los vuelve a esconder', async () => {
    mockAccesorios = Array.from({ length: 12 }, (_, i) => ACC(`a${i}`, `Accesorio ${i}`, null));
    Element.prototype.scrollIntoView = jest.fn();
    pintar();
    const mas = await screen.findByRole('button', { name: 'Ver 5 accesorios más' });
    expect(screen.queryByText('Accesorio 7')).not.toBeInTheDocument();
    fireEvent.click(mas);
    expect(await screen.findByText('Accesorio 11')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /accesorios más/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ver menos/ }));
    expect(screen.queryByText('Accesorio 11')).not.toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('con 8 o menos no hay tarjeta «+N más»', async () => {
    mockAccesorios = Array.from({ length: 8 }, (_, i) => ACC(`a${i}`, `Accesorio ${i}`, null));
    pintar();
    expect(await screen.findByText('Accesorio 7')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /accesorios más/ })).not.toBeInTheDocument();
  });

  it('las tarjetas de accesorios no llevan la etiqueta de categoría', async () => {
    mockAccesorios = [ACC('a1', 'Mochila Nova', { slug: 'mochila', name: 'Mochila' }), ACC('a2', 'Mouse', null)];
    pintar();
    await screen.findByText('Mochila Nova');
    expect(screen.queryByText('Mochila')).not.toBeInTheDocument();
  });
});

describe('LoQuieroModal · aviso del equipo y sin accesorios (BAL-4958)', () => {
  it('reacondicionado: la caja de Brenda va dentro del modal con el grado real', async () => {
    render(<LoQuieroModal isOpen onClose={mockOnClose} origen="catalogo" avisos={[{ tipo: 'reacondicionado', grado: 'A' }]} />);
    const aviso = await screen.findByRole('note');
    expect(aviso).toHaveTextContent('Equipo reacondicionado · Grado A');
    expect(aviso).toHaveTextContent('Revisado, probado y reparado por técnicos certificados. Puede tener señales mínimas de uso.');
  });

  it('entrega programada: "Este equipo llega a partir del {fecha}."', async () => {
    render(<LoQuieroModal isOpen onClose={mockOnClose} origen="ficha" avisos={[{ tipo: 'entrega', desde: '20 de noviembre' }]} />);
    const aviso = await screen.findByRole('note');
    expect(aviso).toHaveTextContent('Entrega programada');
    expect(aviso).toHaveTextContent('Este equipo llega a partir del 20 de noviembre.');
  });

  it('sin accesorios: la tarjeta del equipo y el subtítulo nuevo, sin franja vacía', async () => {
    mockProducto = producto({ specs: { processor: 'Ryzen 3', ram: '8GB', storage: '256GB' } });
    pintar();
    const tarjeta = await waitFor(() => {
      const t = document.querySelector('[data-tarjeta-equipo]');
      expect(t).not.toBeNull();
      return t as HTMLElement;
    });
    expect(tarjeta).toHaveTextContent('Laptop Lenovo V15');
    expect(tarjeta).toHaveTextContent('Ryzen 3 · 8GB · 256GB');
    expect(screen.getByText('Un paso más y empiezas tu solicitud')).toBeInTheDocument();
    expect(screen.getByText('Revisa tu equipo y acepta los términos para continuar.')).toBeInTheDocument();
  });
});

describe('E2E BAL-4969 (bug 3): la apertura se registra una vez', () => {
  it('bajo StrictMode (doble montaje de desarrollo) lo_quiero_modal_open sale UNA vez', () => {
    mockTrackModal.mockClear();
    render(
      <React.StrictMode>
        <LoQuieroModal isOpen onClose={mockOnClose} origen="catalogo" />
      </React.StrictMode>,
    );
    const aperturas = mockTrackModal.mock.calls.filter(([e]) => e === 'lo_quiero_modal_open');
    expect(aperturas).toHaveLength(1);
  });
});

describe('LoQuieroModal · eventos que faltaban (BAL-5207)', () => {
  const ACC = (id: string, name: string) => ({
    id, name, description: '', price: 60, monthlyQuota: 5, image: '', category: null,
    isRecommended: true, compatibleWith: [], term: 24,
  });
  const llamadas = (evento: string) => mockTrackModal.mock.calls.filter((c) => c[0] === evento).map((c) => c[1]);

  it('«Continuar» con los términos sin marcar emite lo_quiero_modal_continue_blocked con reason "terms"', async () => {
    pintar();
    await screen.findByRole('checkbox', { name: FRASE });
    fireEvent.click(await screen.findByRole('button', { name: /Continuar a mis datos/ }));
    expect(llamadas('lo_quiero_modal_continue_blocked')).toEqual([{ reason: 'terms', product_id: '1528' }]);
    expect(llamadas('lo_quiero_modal_continue')).toEqual([]);
  });

  it('cupón obligatorio sin cupón: reason "coupon_required"', async () => {
    mockCuponObligatorio = true;
    pintar();
    await screen.findByRole('checkbox', { name: FRASE });
    fireEvent.click(screen.getByText(/Acepto los/));
    fireEvent.click(await screen.findByRole('button', { name: /Continuar a mis datos/ }));
    expect(llamadas('lo_quiero_modal_continue_blocked')).toEqual([{ reason: 'coupon_required', product_id: '1528' }]);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('cuota sobre el tope: el botón se ve apagado pero el clic se registra con reason "over_quota" y no avanza', async () => {
    mockSobreTope = true;
    pintar();
    await screen.findByRole('checkbox', { name: FRASE });
    fireEvent.click(screen.getByText(/Acepto los/));
    const boton = await screen.findByRole('button', { name: /Continuar a mis datos/ });
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(boton);
    expect(llamadas('lo_quiero_modal_continue_blocked')).toEqual([{ reason: 'over_quota', product_id: '1528' }]);
    expect(llamadas('lo_quiero_modal_continue')).toEqual([]);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('con todo en regla no emite continue_blocked', async () => {
    pintar();
    await screen.findByRole('checkbox', { name: FRASE });
    fireEvent.click(screen.getByText(/Acepto los/));
    fireEvent.click(await screen.findByRole('button', { name: /Continuar a mis datos/ }));
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    expect(llamadas('lo_quiero_modal_continue_blocked')).toEqual([]);
  });

  it('«+N más» emite accessories_expand con hidden_count; «Ver menos» emite accessories_collapse', async () => {
    mockAccesorios = Array.from({ length: 12 }, (_, i) => ACC(`a${i}`, `Accesorio ${i}`));
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: 'Ver 5 accesorios más' }));
    expect(llamadas('lo_quiero_modal_accessories_expand')).toEqual([{ hidden_count: 5, product_id: '1528' }]);
    fireEvent.click(await screen.findByRole('button', { name: /Ver menos/ }));
    expect(llamadas('lo_quiero_modal_accessories_collapse')).toEqual([{ product_id: '1528' }]);
  });
});

describe('LoQuieroModal · accesorios vistos (BAL-5276, punto 2)', () => {
  const ACC = (id: string) => ({
    id, name: `Accesorio ${id}`, description: '', price: 60, monthlyQuota: 5, image: '', category: null,
    isRecommended: true, compatibleWith: [], term: 24,
  });
  const impresiones = () => mockTrackModal.mock.calls.filter((c) => c[0] === 'accessory_impression').map((c) => c[1]);

  it('al abrir registra una vez los accesorios de la grilla, en orden, con origen lo_quiero', async () => {
    mockAccesorios = ['a1', 'a2', 'a3'].map(ACC);
    pintar();
    await screen.findByText('Accesorio a3');
    await waitFor(() => expect(impresiones()).toHaveLength(1));
    expect(impresiones()[0]).toEqual({
      accessory_ids: 'a1,a2,a3',
      count: 3,
      page: 1,
      origen: 'lo_quiero',
      vista: 'grilla',
      product_id: '1528',
      diseno: 2,
    });
  });

  it('«Ver todos» registra una vez más la lista completa; volver a abrir y cerrar no repite', async () => {
    mockAccesorios = Array.from({ length: 12 }, (_, i) => ACC(`a${i}`));
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: 'Ver 5 accesorios más' }));
    await screen.findByText('Accesorio a11');
    fireEvent.click(screen.getByRole('button', { name: /Ver menos/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Ver 5 accesorios más' }));
    const lista = impresiones();
    expect(lista).toHaveLength(2);
    expect(lista[0]).toMatchObject({ vista: 'grilla', count: 7 });
    expect(lista[1]).toMatchObject({ vista: 'todos', count: 12 });
  });

  it('sin accesorios no registra impresión', async () => {
    mockAccesorios = [];
    pintar();
    await screen.findByRole('button', { name: /Continuar a mis datos/ });
    expect(impresiones()).toHaveLength(0);
  });
});
