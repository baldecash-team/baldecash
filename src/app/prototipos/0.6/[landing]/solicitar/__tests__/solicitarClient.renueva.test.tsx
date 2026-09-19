import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Sólo el tipo: el módulo está mockeado más abajo y un `import type` se borra
// al compilar, así que no lo carga.
import type { PasoDelWizardControles } from '../components/solicitar/wizard';

const baseProductContextValue: any = {
  selectedProduct: { id: '1', name: 'Laptop Test', slug: 'laptop-test' },
  setSelectedProduct: jest.fn(),
  cartProducts: [],
  setCartProducts: jest.fn(),
  clearCartProducts: jest.fn(),
  selectedAccessories: [],
  setSelectedAccessories: jest.fn(),
  toggleAccessory: jest.fn(),
  clearAccessories: jest.fn(),
  appliedCoupon: null,
  setAppliedCoupon: jest.fn(),
  clearCoupon: jest.fn(),
  selectedInsurance: null,
  selectedInsurances: [],
  setSelectedInsurance: jest.fn(),
  toggleInsurance: jest.fn(),
  clearInsurance: jest.fn(),
  availableMultiasistencia: null,
  setAvailableMultiasistencia: jest.fn(),
  getTotalPrice: () => 1000,
  getTotalMonthlyPayment: () => 100,
  getDiscountAmount: () => 0,
  getDiscountedMonthlyPayment: () => 100,
  isHydrated: true,
  isProductBarExpanded: false,
  setIsProductBarExpanded: jest.fn(),
  isOverQuotaLimit: false,
  maxMonthlyQuota: 5000,
  getAllProducts: () => [{ id: '1', name: 'Laptop Test', slug: 'laptop-test' }],
  hasUnifiedTerms: () => true,
  getAvailableTerms: () => [24],
  updateAllProductsToTerm: jest.fn(),
  updateProductInitial: jest.fn(),
  getInitialOptionsForProduct: () => [],
  syncMissingPaymentPlans: jest.fn(),
  isSyncingPaymentPlans: false,
  unavailableProductIds: [],
  removeUnavailableProducts: jest.fn(),
  isValidatingAvailability: false,
  isLoadingAccessories: false,
  setIsLoadingAccessories: jest.fn(),
};

// `const` y no `let`: este archivo no cambia el carrito entre tests (el
// original sí, para gatear el botón). Se conserva la indirección porque el
// mock de `useProduct` la lee.
const mockProductContextValue = baseProductContextValue;

jest.mock('../context/ProductContext', () => ({
  useProduct: () => mockProductContextValue,
}));
let landingActual = 'renueva-tu-equipo-1';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: landingActual }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => `/prototipos/0.6/${landingActual}/solicitar`,
}));
jest.mock('@/app/prototipos/0.6/hooks/useLeadGuard', () => ({
  useLeadGuard: () => ({ hasLeadAccess: true }),
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: {},
    footerData: {},
    agreementData: null,
    isLoading: false,
    hasError: false,
  }),
}));
jest.mock('../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    config: {},
    steps: [],
    isLoading: false,
    displayStepsCount: 3,
    displayEstimatedMinutes: 5,
  }),
}));
// Mutable: permite arrancar la pantalla en el spinner y soltarla después, que
// es como se ve en el navegador (el gate del render espera este flujo, la
// config del wizard, el layout, la hidratación y la disponibilidad).
let flujoCargando = false;
jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    isEnabled: () => true,
    sectionsBeforeWizard: [],
    isLoading: flujoCargando,
    isCouponRequired: false,
  }),
}));
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn().mockResolvedValue({
    layout: { has_catalog: true },
    // `solicitarClient` lee `cfg.features.has_coupon` para decidir si pinta el
    // cupón. Sin `features` el efecto de config tira TypeError y el render
    // nunca llega al botón.
    features: { has_coupon: true },
  }),
}));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ track: jest.fn(), trackAccessoryAdd: jest.fn(), trackAccessoryRemove: jest.fn() }),
}));
jest.mock('../components/solicitar/sections', () => ({
  SectionRenderer: () => null,
}));
jest.mock('../components/solicitar/coupon', () => ({
  CouponInput: () => null,
}));
// La barra sigue sin pintarse, pero ahora deja ver con qué `offsetInferior` la
// montan: es lo que la levanta por encima del CTA fijo en `renueva-*`.
const propsDeLaBarra: Record<string, unknown>[] = [];
jest.mock('../components/solicitar/product', () => ({
  SelectedProductBar: (props: Record<string, unknown>) => {
    propsDeLaBarra.push(props);
    return null;
  },
  SelectedProductSpacer: () => null,
}));

// El cuerpo del paso se prueba en StepClient.pasoRegular.test.tsx; acá solo
// importa que la intro lo monte y que le entregue el control en el momento
// correcto, así que `handleNext` es un mock estable sobre el que se afirma.
const mockHandleNext = jest.fn();

const pasoBase: PasoDelWizardControles = {
  // Sólo los campos que la intro lee (título, descripción). El paso real tiene
  // muchos más, pero el cuerpo se prueba en StepClient.pasoRegular.test.tsx.
  step: { code: 'p1', url_slug: 'datos-personales', title: 'Datos personales', order: 0, fields: [] } as unknown as PasoDelWizardControles['step'],
  handleNext: mockHandleNext,
  handleBack: jest.fn(),
  handleStepClick: jest.fn(),
  esElQueEnvia: true,
  isSubmitting: false,
  submitStage: 'idle',
  submitMessage: '',
  canProceed: true,
  showErrors: false,
  celebrando: false,
  motivational: null,
  firstName: '',
  submitSucceeded: false,
  overlays: null,
};

let mockPaso: PasoDelWizardControles = pasoBase;

jest.mock('../components/solicitar/wizard', () => ({
  ...jest.requireActual('../components/solicitar/wizard'),
  PasoDelWizard: () => <div data-testid="formulario-embebido" />,
  usePasoDelWizard: () => mockPaso,
}));

// `window.scrollTo` no está implementado en jsdom: sin el mock lanza y además
// no habría cómo afirmar que la pantalla abre sobre el formulario.
const scrollToMock = jest.fn();
window.scrollTo = scrollToMock as unknown as typeof window.scrollTo;

// El único export real del módulo es `WizardPreviewPage` (default,
// solicitarClient.tsx:863) — el componente que renderiza el botón
// (`WizardPreviewContent`, línea 110) NO está exportado, se monta vía
// <Suspense> dentro de WizardPreviewPage. Por eso se importa el default y se
// usa `findByText` (no `getByText`) para esperar a que el Suspense resuelva.
import SolicitarClientPage from '../solicitarClient';

beforeEach(() => {
  scrollToMock.mockClear();
  mockHandleNext.mockClear();
  mockPaso = pasoBase;
  flujoCargando = false;
  // Los consentimientos se guardan por landing en localStorage y arrastran
  // entre tests: se limpian para que cada uno arranque sin aceptar nada.
  localStorage.clear();
  propsDeLaBarra.length = 0;
});

afterEach(() => {
  landingActual = 'renueva-tu-equipo-1';
});

describe('intro de renueva-*', () => {
  it('monta el formulario embebido', async () => {
    render(<SolicitarClientPage />);
    expect(await screen.findByTestId('formulario-embebido')).toBeInTheDocument();
  });

  it('el botón dice "Enviar Solicitud": este paso crea la solicitud', async () => {
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');
    // Dos: el de la página y el CTA fijo de móvil. Misma acción, mismo texto
    // — si dijeran cosas distintas, la pantalla se contradiría a sí misma.
    expect(screen.getAllByText('Enviar Solicitud')).toHaveLength(2);
  });

  it('dice "Continuar" si el paso no es el que envía', async () => {
    mockPaso = { ...pasoBase, esElQueEnvia: false };
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');
    expect(screen.getAllByText('Continuar')).toHaveLength(2);
  });

  it('sin pasos configurados el botón queda deshabilitado, no muerto', async () => {
    mockPaso = { ...pasoBase, step: null };
    render(<SolicitarClientPage />);
    // Sin paso no hay formulario que esperar: se ancla en algo que sí está.
    await screen.findByText('Términos y Condiciones');
    // Los dos botones: si el de la página está muerto y el fijo de móvil vivo,
    // la persona encuentra justo el que no funciona.
    const botones = screen.getAllByText('Enviar Solicitud');
    expect(botones).toHaveLength(2);
    botones.forEach((b) => expect(b.closest('button')).toBeDisabled());
  });

  it('abre la pantalla sobre el formulario aunque llegue después del spinner', async () => {
    const rect = jest
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: 800, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });

    // El caso difícil, y el real: la pantalla arranca en el spinner y el
    // formulario recién aparece en un render posterior. Un efecto con
    // `getElementById` no lo encontraría en el primer render y no volvería a
    // correr —sus dependencias ya no cambian—, así que el scroll no pasaría
    // nunca.
    flujoCargando = true;
    const { rerender } = render(<SolicitarClientPage />);
    flujoCargando = false;
    rerender(<SolicitarClientPage />);

    await screen.findByTestId('formulario-embebido');

    // La ÚLTIMA llamada tiene que ser la del formulario: `useScrollToTop` manda
    // la vista al encabezado al montar, y si corriera después dejaría la
    // pantalla arriba igual. Por eso se mira el final y no "alguna llamada".
    await waitFor(() => {
      expect(scrollToMock.mock.calls.at(-1)?.[0]).toEqual(
        expect.objectContaining({ behavior: 'smooth' }),
      );
    });
    const ultima = scrollToMock.mock.calls.at(-1)?.[0] as { top: number };
    expect(ultima.top).toBeGreaterThan(0);

    rect.mockRestore();
  });

  it('la acción única valida la intro ANTES de entregarle el control al paso', async () => {
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');

    // `[0]` es el botón de la página; el CTA fijo de móvil es el otro y se
    // prueba aparte. Los dos llaman a la misma `handleContinuarEmbebido`.
    await userEvent.click(screen.getAllByText('Enviar Solicitud')[0]);

    // Falta aceptar los términos: el paso no llega a validar sus campos, para
    // que la persona no vea errores en el formulario cuando lo que le falta es
    // un checkbox más abajo.
    expect(mockHandleNext).not.toHaveBeenCalled();
    expect(
      screen.getByText('Debes aceptar los términos y condiciones para continuar'),
    ).toBeInTheDocument();
  });

  it('con la intro en orden, el control pasa al paso', async () => {
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');

    await userEvent.click(screen.getByText(/Acepto los/));
    await userEvent.click(screen.getByText(/Acepto la/));
    await userEvent.click(screen.getAllByText('Enviar Solicitud')[0]);

    expect(mockHandleNext).toHaveBeenCalledTimes(1);
  });

  it('ya no ofrece "Comenzar Solicitud": el formulario está en la página', async () => {
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');
    expect(screen.queryByText('Comenzar Solicitud')).not.toBeInTheDocument();
  });

  it('una landing normal no monta el formulario y conserva su botón', async () => {
    landingActual = 'home';
    render(<SolicitarClientPage />);
    expect(await screen.findByText('Comenzar Solicitud')).toBeInTheDocument();
    expect(screen.queryByTestId('formulario-embebido')).not.toBeInTheDocument();
  });
});

describe('intro de renueva-* — el CTA fijo de móvil', () => {
  /** El CTA fijo es lo único de la pantalla con `z-[45]`. */
  const ctaFijo = () => document.querySelector('[class*="z-[45]"]') as HTMLElement | null;

  it('se monta pegado al borde inferior, con la barra de producto encima', async () => {
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');
    expect(ctaFijo()).not.toBeNull();
    // `debajoDeLaBarra`: el orden inverso al del resto del flujo.
    expect(ctaFijo()!.style.bottom).toBe('0px');
  });

  it('levanta la barra de producto por encima del CTA', async () => {
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');
    expect(propsDeLaBarra.at(-1)?.offsetInferior).toBe('var(--sticky-cta-height, 0px)');
  });

  it('no pinta el botón de atrás: en la intro no hay paso anterior', async () => {
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');
    expect(screen.queryByLabelText('Atrás')).not.toBeInTheDocument();
  });

  it('dispara la misma acción que el botón de la página', async () => {
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');
    await userEvent.click(screen.getByText(/Acepto los/));
    await userEvent.click(screen.getByText(/Acepto la/));

    await userEvent.click(ctaFijo()!.querySelector('button')!);

    expect(mockHandleNext).toHaveBeenCalledTimes(1);
  });

  it('una landing normal no lo monta y no levanta la barra', async () => {
    landingActual = 'home';
    render(<SolicitarClientPage />);
    await screen.findByText('Comenzar Solicitud');
    expect(ctaFijo()).toBeNull();
    expect(propsDeLaBarra.at(-1)?.offsetInferior).toBe('0px');
  });
});
