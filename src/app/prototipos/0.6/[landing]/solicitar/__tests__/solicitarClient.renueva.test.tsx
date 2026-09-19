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

// El cuerpo del paso se prueba en StepClient.pasoRegular.test.tsx; acá solo
// importa que la intro lo monte.
jest.mock('../components/solicitar/wizard', () => ({
  ...jest.requireActual('../components/solicitar/wizard'),
  PasoDelWizard: () => <div data-testid="formulario-embebido" />,
  usePasoDelWizard: () => ({
    step: { code: 'p1', url_slug: 'datos-personales', title: 'Datos personales', order: 0, fields: [] },
    handleNext: jest.fn(),
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
    overlays: null,
  }),
}));

// El único export real del módulo es `WizardPreviewPage` (default,
// solicitarClient.tsx:863) — el componente que renderiza el botón
// (`WizardPreviewContent`, línea 110) NO está exportado, se monta vía
// <Suspense> dentro de WizardPreviewPage. Por eso se importa el default y se
// usa `findByText` (no `getByText`) para esperar a que el Suspense resuelva.
import SolicitarClientPage from '../solicitarClient';

afterEach(() => {
  landingActual = 'renueva-tu-equipo-1';
});

describe('intro de renueva-*', () => {
  it('monta el formulario embebido', async () => {
    render(<SolicitarClientPage />);
    expect(await screen.findByTestId('formulario-embebido')).toBeInTheDocument();
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
