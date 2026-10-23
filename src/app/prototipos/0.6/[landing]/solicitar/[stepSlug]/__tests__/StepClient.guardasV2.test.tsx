/**
 * BAL-4969 (casuísticas): las guardas del paso en Diseño 2 NO mandan a la
 * intro de Diseño 1 (`/solicitar`). La persona se queda en el paso, ve el
 * aviso con su salida y "Continuar" queda bloqueado. Diseño 1 sigue igual.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockLayout: { disenoSolicitud: 1 | 2; disenoResuelto: boolean; campanaAbierta: boolean } = { disenoSolicitud: 2, disenoResuelto: true, campanaAbierta: true };
const mockProducto = {
  selectedProduct: { id: 1, name: 'Laptop Test' } as { id: number; name: string } | null,
  isOverQuotaLimit: false,
  unavailableProductIds: [] as string[],
  appliedCoupon: null as null | { code: string },
  selectedInsurances: [] as { id: string }[],
};
const mockFlujo = { isCouponRequired: false };
const mockClearInsurance = jest.fn();

const PASO = {
  code: 'personal_data',
  url_slug: 'datos-personales',
  name: 'Datos personales',
  title: 'Datos Personales',
  description: '',
  order: 0,
  is_summary_step: false,
  fields: [],
  motivational: null,
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useParams: () => ({ landing: 'pago-diferido', stepSlug: 'datos-personales' }),
  usePathname: () => '/prototipos/0.6/pago-diferido/solicitar/datos-personales',
  useSearchParams: () => new URLSearchParams(''),
}));
jest.mock('../../hooks/useSubmitApplication', () => ({
  useSubmitApplication: () => ({ submit: jest.fn(), isSubmitting: false, submitMessage: '', submitStage: 'idle', submitSucceeded: false }),
}));
jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    shouldShowComplementos: false,
    isCouponRequired: mockFlujo.isCouponRequired,
    isEnabled: () => false,
    kycEnabled: false,
    isKycStepEnabled: () => false,
    envioAnticipadoStep: null,
    firmaPorAceptacion: false,
    isLoading: false,
  }),
}));
jest.mock('../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    getStepByUrlSlug: () => PASO,
    getNavigation: () => ({ currentIndex: 0, prevStep: null, nextStep: null, isFirst: true, isLast: false }),
    steps: [PASO],
    isLoading: false,
    error: null,
  }),
}));
jest.mock('../../context/WizardContext', () => ({
  useWizard: () => ({
    formData: {},
    setFieldError: jest.fn(),
    markStepCompleted: jest.fn(),
    getFieldValue: () => '',
    getFieldLabel: () => undefined,
    getAllDynamicOptions: () => ({}),
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: {},
    footerData: {},
    agreementData: null,
    landingId: 170,
    isLoading: false,
    hasError: false,
    newsletterData: null,
    disenoSolicitud: mockLayout.disenoSolicitud,
    disenoResuelto: mockLayout.disenoResuelto,
    campanaAbierta: mockLayout.campanaAbierta,
  }),
}));
jest.mock('../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedProduct: mockProducto.selectedProduct,
    isHydrated: true,
    appliedCoupon: mockProducto.appliedCoupon,
    hasUnifiedTerms: () => true,
    cartProducts: [],
    isOverQuotaLimit: mockProducto.isOverQuotaLimit,
    unavailableProductIds: mockProducto.unavailableProductIds,
    isValidatingAvailability: false,
    getAllProducts: () => (mockProducto.selectedProduct ? [mockProducto.selectedProduct] : []),
    selectedAccessories: [],
    selectedInsurances: mockProducto.selectedInsurances,
    clearInsurance: mockClearInsurance,
    getTotalMonthlyPayment: () => 650,
    maxMonthlyQuota: 600,
    isProductBarExpanded: false,
    setIsProductBarExpanded: jest.fn(),
    updateProductInitial: jest.fn(),
    getInitialOptionsForProduct: () => [],
    getAvailableTerms: () => [],
    updateAllProductsToTerm: jest.fn(),
  }),
}));
jest.mock('@/app/prototipos/0.6/hooks/useLeadGuard', () => ({ useLeadGuard: () => true }));
jest.mock('../../hooks/useLeadPrefill', () => ({ useLeadPrefill: jest.fn(), leadLockKey: (c: string) => `_lead_locked_${c}` }));
jest.mock('../../context/EventTrackerContext', () => ({ useEventTrackerOptional: () => ({ track: jest.fn() }) }));
jest.mock('../../context/SessionContext', () => ({ useSessionOptional: () => ({ sessionUuid: null }) }));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('../../components/solicitar/wizard/DynamicWizardStep', () => ({
  DynamicWizardStep: () => <div data-testid="cuerpo-del-paso" />,
}));
jest.mock('@/app/prototipos/0.6/components/zona-gamer/GamerNavbar', () => ({ GamerNavbar: () => null }));
jest.mock('@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter', () => ({ GamerNewsletter: () => null }));
jest.mock('@/app/prototipos/0.6/components/diseno-2', () => ({
  ShellV2: (props: { canProceed?: boolean; children: (t: ReadonlySet<string>) => React.ReactNode }) => (
    <div data-testid="shell-v2" data-puede={props.canProceed === false ? 'no' : 'si'}>
      {props.children(new Set())}
    </div>
  ),
  TransicionDelWizard: () => null,
  BarraInferiorV2Spacer: () => null,
  AvisoV2: () => null,
}));

import StepClient from '../StepClient';

const SOLICITAR = '/prototipos/0.6/pago-diferido/solicitar/';
const fueALaIntro = () =>
  [...mockPush.mock.calls, ...mockReplace.mock.calls].some(([url]) => url === SOLICITAR);

beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  mockClearInsurance.mockClear();
  mockLayout.disenoSolicitud = 2;
  mockLayout.disenoResuelto = true;
  mockLayout.campanaAbierta = true;
  mockProducto.selectedProduct = { id: 1, name: 'Laptop Test' };
  mockProducto.isOverQuotaLimit = false;
  mockProducto.unavailableProductIds = [];
  mockProducto.appliedCoupon = null;
  mockProducto.selectedInsurances = [];
  mockFlujo.isCouponRequired = false;
  Element.prototype.scrollIntoView = jest.fn();
  window.scrollTo = jest.fn();
  sessionStorage.clear();
});

describe('Guardas del paso en Diseño 2', () => {
  it('tope de cuota: aviso en el paso, Continuar bloqueado y nunca la intro de Diseño 1', async () => {
    mockProducto.isOverQuotaLimit = true;
    render(<StepClient />);
    expect(await screen.findByText('Tu cuota pasa el límite de S/600 al mes')).toBeInTheDocument();
    expect(screen.getByTestId('shell-v2')).toHaveAttribute('data-puede', 'no');
    expect(screen.getByRole('button', { name: 'Cambiar plazo' })).toBeInTheDocument();
    expect(fueALaIntro()).toBe(false);
  });

  it('tope por protecciones: "Quitar protecciones" las suelta', async () => {
    mockProducto.isOverQuotaLimit = true;
    mockProducto.selectedInsurances = [{ id: 'ins-1' }];
    render(<StepClient />);
    fireEvent.click(await screen.findByRole('button', { name: 'Quitar protecciones' }));
    expect(mockClearInsurance).toHaveBeenCalled();
    expect(fueALaIntro()).toBe(false);
  });

  it('sin stock: aviso con "Elegir otro equipo" que lleva al catálogo', async () => {
    mockProducto.unavailableProductIds = ['1'];
    render(<StepClient />);
    fireEvent.click(await screen.findByRole('button', { name: 'Elegir otro equipo' }));
    expect(mockPush).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/catalogo');
    expect(fueALaIntro()).toBe(false);
  });

  it('cupón obligatorio sin cupón: vuelve al origen del modal, no a la intro', async () => {
    mockFlujo.isCouponRequired = true;
    sessionStorage.setItem('baldecash-pago-diferido-diseno2-origen', '/prototipos/0.6/pago-diferido/producto/x');
    render(<StepClient />);
    fireEvent.click(await screen.findByRole('button', { name: 'Ingresar cupón' }));
    expect(mockPush).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/producto/x');
    expect(fueALaIntro()).toBe(false);
  });

  it('sin producto: aviso "Elegir un equipo", sin redirigir a la intro', async () => {
    mockProducto.selectedProduct = null;
    render(<StepClient />);
    expect(await screen.findByText('Todavía no elegiste tu equipo')).toBeInTheDocument();
    expect(fueALaIntro()).toBe(false);
  });

  it('sin guardas: no hay aviso y se puede continuar', async () => {
    render(<StepClient />);
    expect(await screen.findByTestId('shell-v2')).toHaveAttribute('data-puede', 'si');
    expect(document.querySelector('[data-aviso-guarda-v2]')).toBeNull();
  });

  it('mientras el diseño no se resolvió, ninguna guarda redirige', async () => {
    mockLayout.disenoSolicitud = 1;
    mockLayout.disenoResuelto = false;
    mockProducto.isOverQuotaLimit = true;
    render(<StepClient />);
    await screen.findAllByTestId('cuerpo-del-paso');
    expect(fueALaIntro()).toBe(false);
  });

  it('cupo de campaña lleno: avisa en el paso (antes de llenar todo) sin bloquear, como Diseño 1', async () => {
    mockLayout.campanaAbierta = false;
    render(<StepClient />);
    expect(await screen.findByText('Por ahora no estamos recibiendo más solicitudes')).toBeInTheDocument();
    expect(screen.getByTestId('shell-v2')).toHaveAttribute('data-puede', 'si');
  });

  it('Diseño 1 sigue mandando a la intro con el tope superado', async () => {
    mockLayout.disenoSolicitud = 1;
    mockProducto.isOverQuotaLimit = true;
    render(<StepClient />);
    await screen.findAllByTestId('cuerpo-del-paso');
    expect(fueALaIntro()).toBe(true);
  });
});
