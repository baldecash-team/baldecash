import { render, screen } from '@testing-library/react';

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

let mockProductContextValue = baseProductContextValue;

jest.mock('../context/ProductContext', () => ({
  useProduct: () => mockProductContextValue,
}));
let landingActual = 'home';
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: landingActual }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/prototipos/0.6/home/solicitar',
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
jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    isEnabled: () => true,
    sectionsBeforeWizard: [],
    isLoading: false,
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
jest.mock('../components/solicitar/product', () => ({
  SelectedProductBar: () => null,
  SelectedProductSpacer: () => null,
}));

// El único export real del módulo es `WizardPreviewPage` (default,
// solicitarClient.tsx:863) — el componente que renderiza el botón
// (`WizardPreviewContent`, línea 110) NO está exportado, se monta vía
// <Suspense> dentro de WizardPreviewPage. Por eso se importa el default y se
// usa `findByText` (no `getByText`) para esperar a que el Suspense resuelva.
import SolicitarClientPage from '../solicitarClient';

describe('boton Comenzar Solicitud — gating por isLoadingAccessories', () => {
  afterEach(() => {
    mockProductContextValue = baseProductContextValue;
    landingActual = 'home';
  });

  test('esta habilitado cuando isLoadingAccessories es false y no hay otras restricciones', async () => {
    render(<SolicitarClientPage />);
    const button = await screen.findByText('Comenzar Solicitud');
    expect(button.closest('button')).not.toBeDisabled();
  });

  test('esta deshabilitado cuando isLoadingAccessories es true', async () => {
    mockProductContextValue = { ...baseProductContextValue, isLoadingAccessories: true };
    render(<SolicitarClientPage />);
    const button = await screen.findByText('Comenzar Solicitud');
    expect(button.closest('button')).toBeDisabled();
  });
});

describe('tarjetas informativas de la intro', () => {
  afterEach(() => {
    landingActual = 'home';
  });

  it('una landing normal las muestra', async () => {
    render(<SolicitarClientPage />);
    expect(await screen.findByText('Tiempo estimado')).toBeInTheDocument();
    expect(screen.getByText('Proceso simple')).toBeInTheDocument();
    expect(screen.getByText('Datos protegidos')).toBeInTheDocument();
    expect(screen.getByText('Lo que necesitarás')).toBeInTheDocument();
  });

  it('renueva-* no las muestra: anuncian pasos que ya no existen', async () => {
    landingActual = 'renueva-tu-equipo-1';
    render(<SolicitarClientPage />);
    // Se espera a que el Suspense resuelva por algo que SÍ está en ambas.
    // Ancla deliberada: "Términos y Condiciones" está en las dos landings y
    // sobrevive a la Task 7, que en renueva-* cambia el botón "Comenzar
    // Solicitud" por "Continuar". Anclar en el botón dejaría este test rojo
    // más adelante por un cambio esperado, y un test así se termina borrando.
    await screen.findByText('Términos y Condiciones');
    expect(screen.queryByText('Tiempo estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('Proceso simple')).not.toBeInTheDocument();
    expect(screen.queryByText('Datos protegidos')).not.toBeInTheDocument();
    expect(screen.queryByText('Lo que necesitarás')).not.toBeInTheDocument();
  });
});
