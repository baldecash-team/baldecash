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
// Las tres secciones de la portada salen del contexto del layout, que es
// donde se decide «ausencia = encendido». Acá se controlan a mano.
let mockSecciones: Record<string, boolean | undefined> = {};
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: {},
    footerData: {},
    agreementData: null,
    isLoading: false,
    hasError: false,
    puedeCambiarPlazo: true,
    mostrarImagenProducto: true,
    ...mockSecciones,
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
// La intro monta el paso del formulario (embebido en renueva-*, inerte en el
// resto), y `usePasoDelWizard` exige el `WizardProvider` que este test no
// levanta: sin el mock, el render tira "useWizard must be used within a
// WizardProvider" antes de llegar al botón. Lo que este archivo prueba es el
// botón de la intro, no el paso.
jest.mock('../components/solicitar/wizard', () => ({
  ...jest.requireActual('../components/solicitar/wizard'),
  PasoDelWizard: () => null,
  usePasoDelWizard: () => ({
    step: null,
    handleNext: jest.fn(),
    handleBack: jest.fn(),
    handleStepClick: jest.fn(),
    esElQueEnvia: false,
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
  }),
}));

import SolicitarClientPage from '../solicitarClient';

/**
 * Secciones de la portada de «Solicitar» que se ocultan por landing
 * (BAL-4700) desde «Características» del panel:
 *   - mostrarProductoSeleccionado -> recuadro «Producto seleccionado»
 *   - mostrarDatosRapidos         -> «Tiempo estimado · Proceso simple · Datos protegidos»
 *   - mostrarRequisitos           -> «Lo que necesitarás»
 */
const ancla = () => screen.findByText('Comenzar Solicitud');

describe('secciones de la portada por landing', () => {
  afterEach(() => {
    mockSecciones = {};
    mockProductContextValue = baseProductContextValue;
  });

  it('con las tres encendidas se ve todo, como hoy', async () => {
    mockSecciones = { mostrarProductoSeleccionado: true, mostrarDatosRapidos: true, mostrarRequisitos: true };
    render(<SolicitarClientPage />);
    await ancla();
    expect(screen.getByText('Producto seleccionado')).toBeInTheDocument();
    expect(screen.getByText('Tiempo estimado')).toBeInTheDocument();
    expect(screen.getByText('Proceso simple')).toBeInTheDocument();
    expect(screen.getByText('Datos protegidos')).toBeInTheDocument();
    expect(screen.getByText('Lo que necesitarás')).toBeInTheDocument();
  });

  it('si el contexto no las trae, se ven (ausencia = encendido)', async () => {
    render(<SolicitarClientPage />);
    await ancla();
    expect(screen.getByText('Producto seleccionado')).toBeInTheDocument();
    expect(screen.getByText('Tiempo estimado')).toBeInTheDocument();
    expect(screen.getByText('Lo que necesitarás')).toBeInTheDocument();
  });

  it('apagar «producto seleccionado» quita solo el recuadro del producto', async () => {
    mockSecciones = { mostrarProductoSeleccionado: false };
    const { container } = render(<SolicitarClientPage />);
    await ancla();
    expect(screen.queryByText('Producto seleccionado')).not.toBeInTheDocument();
    expect(container.querySelector('#term-selector-section')).toBeNull();
    expect(screen.getByText('Tiempo estimado')).toBeInTheDocument();
    expect(screen.getByText('Lo que necesitarás')).toBeInTheDocument();
  });

  it('apagar «tiempo, pasos y seguridad» quita las tres tarjetas y nada más', async () => {
    mockSecciones = { mostrarDatosRapidos: false };
    render(<SolicitarClientPage />);
    await ancla();
    expect(screen.queryByText('Tiempo estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('Proceso simple')).not.toBeInTheDocument();
    expect(screen.queryByText('Datos protegidos')).not.toBeInTheDocument();
    expect(screen.queryByText('100% Seguro')).not.toBeInTheDocument();
    expect(screen.getByText('Producto seleccionado')).toBeInTheDocument();
    expect(screen.getByText('Lo que necesitarás')).toBeInTheDocument();
  });

  it('apagar «lo que necesitarás» quita solo los requisitos', async () => {
    mockSecciones = { mostrarRequisitos: false };
    render(<SolicitarClientPage />);
    await ancla();
    expect(screen.queryByText('Lo que necesitarás')).not.toBeInTheDocument();
    expect(screen.queryByText('Documento de identidad')).not.toBeInTheDocument();
    expect(screen.getByText('Producto seleccionado')).toBeInTheDocument();
    expect(screen.getByText('Tiempo estimado')).toBeInTheDocument();
  });

  it('las tres apagadas: el botón sigue ahí', async () => {
    mockSecciones = { mostrarProductoSeleccionado: false, mostrarDatosRapidos: false, mostrarRequisitos: false };
    render(<SolicitarClientPage />);
    const boton = await ancla();
    expect(boton.closest('button')).not.toBeDisabled();
    expect(screen.queryByText('Producto seleccionado')).not.toBeInTheDocument();
    expect(screen.queryByText('Tiempo estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('Lo que necesitarás')).not.toBeInTheDocument();
  });

  it('con la cuota excedida el recuadro vuelve: ahí está el aviso que hay que resolver', async () => {
    mockSecciones = { mostrarProductoSeleccionado: false };
    mockProductContextValue = { ...baseProductContextValue, isOverQuotaLimit: true };
    render(<SolicitarClientPage />);
    await ancla();
    expect(screen.getByText('Cuota mensual excedida')).toBeInTheDocument();
  });
});
