/**
 * BAL-5296 — mocks copiados de StepClient.diseno2.test.tsx.
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';

const mockPush = jest.fn();
const mockLayout: { disenoSolicitud: 1 | 2 | undefined; landing: string; disenoPorFormulario?: boolean } = { disenoSolicitud: 1, landing: 'home' };
const mockFijar = jest.fn();
const mockWizardConfig: { solicitud_design?: 1 | 2 } = {};
const mockStep = { slug: 'datos-personales' };
const mockFormData: Record<string, { value: string }> = {};

const PASO_REGULAR = {
  code: 'personal_data',
  url_slug: 'datos-personales',
  name: 'Datos personales',
  title: 'Datos Personales',
  description: 'Información personal',
  order: 0,
  is_summary_step: false,
  fields: [],
  motivational: null,
};
const PASO_RESUMEN = {
  code: 'summary_preferences',
  url_slug: 'preferencias',
  name: 'Resumen',
  title: 'Resumen de tu solicitud',
  description: '',
  order: 1,
  is_summary_step: true,
  fields: [],
  motivational: null,
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useParams: () => ({ landing: mockLayout.landing, stepSlug: mockStep.slug }),
  usePathname: () => `/prototipos/0.6/${mockLayout.landing}/solicitar/${mockStep.slug}`,
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('../hooks/useSubmitApplication', () => ({
  useSubmitApplication: () => ({
    submit: jest.fn().mockResolvedValue(true),
    isSubmitting: false,
    submitMessage: '',
    submitStage: 'idle',
    submitSucceeded: false,
  }),
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    shouldShowComplementos: true,
    isCouponRequired: false,
    isEnabled: () => false,
    kycEnabled: false,
    isKycStepEnabled: () => false,
    envioAnticipadoStep: null,
    firmaPorAceptacion: false,
    isLoading: false,
  }),
}));

jest.mock('../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    getStepByUrlSlug: (slug: string) => (slug === 'datos-personales' ? PASO_REGULAR : PASO_RESUMEN),
    getNavigation: (code: string) =>
      code === 'personal_data'
        ? { currentIndex: 0, prevStep: null, nextStep: PASO_RESUMEN, isFirst: true, isLast: false }
        : { currentIndex: 1, prevStep: PASO_REGULAR, nextStep: null, isFirst: false, isLast: true },
    steps: [PASO_REGULAR, PASO_RESUMEN],
    config: { steps: [PASO_REGULAR, PASO_RESUMEN], ...mockWizardConfig },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../context/WizardContext', () => ({
  useWizard: () => ({
    formData: mockFormData,
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
    disenoPorFormulario: mockLayout.disenoPorFormulario,
    fijarDisenoDeLaSesion: mockFijar,
  }),
}));

jest.mock('../context/ProductContext', () => ({
  useProduct: () => ({
    selectedProduct: { id: 1, name: 'Laptop Test' },
    isHydrated: true,
    appliedCoupon: null,
    hasUnifiedTerms: () => true,
    cartProducts: [],
    isOverQuotaLimit: false,
    unavailableProductIds: [],
    isValidatingAvailability: false,
    isProductBarExpanded: false,
    setIsProductBarExpanded: jest.fn(),
    getAllProducts: () => [{ id: 1, name: 'Laptop Test' }],
    selectedAccessories: [],
    selectedInsurances: [],
    getTotalMonthlyPayment: () => 0,
    maxMonthlyQuota: 0,
    updateProductInitial: jest.fn(),
    getInitialOptionsForProduct: () => [],
    getAvailableTerms: () => [],
    updateAllProductsToTerm: jest.fn(),
  }),
}));

jest.mock('@/app/prototipos/0.6/hooks/useLeadGuard', () => ({ useLeadGuard: () => true }));
jest.mock('../hooks/useLeadPrefill', () => ({
  useLeadPrefill: jest.fn(),
  leadLockKey: (code: string) => `_lead_locked_${code}`,
}));
jest.mock('../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn() }),
}));
jest.mock('../context/SessionContext', () => ({
  useSessionOptional: () => ({ sessionUuid: null }),
}));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn().mockResolvedValue({
    layout: { has_catalog: true },
    features: { has_coupon: true, vip_countdown: false },
  }),
}));
jest.mock('../components/solicitar/wizard/DynamicWizardStep', () => ({
  DynamicWizardStep: ({ camposTocados }: { camposTocados?: ReadonlySet<string> }) => (
    <div data-testid="cuerpo-del-paso" data-con-tocados={camposTocados ? 'si' : 'no'} />
  ),
}));

// La navbar gamer usa APIs de framer-motion que jsdom no trae; no es lo que
// se prueba.
jest.mock('@/app/prototipos/0.6/components/zona-gamer/GamerNavbar', () => ({ GamerNavbar: () => null }));
jest.mock('@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter', () => ({ GamerNewsletter: () => null }));

// El marco de Diseño 2, reducido a lo que importa: qué recibe.
jest.mock('@/app/prototipos/0.6/components/diseno-2', () => ({
  ShellV2: (props: {
    title: string;
    isLastStep?: boolean;
    onNext?: () => void;
    onSubmit?: () => void;
    children: (t: ReadonlySet<string>) => React.ReactNode;
  }) => (
    <div data-testid="shell-v2" data-ultimo={props.isLastStep ? 'si' : 'no'}>
      <h1>{props.title}</h1>
      {props.children(new Set())}
      <button type="button" onClick={props.isLastStep ? props.onSubmit : props.onNext}>
        v2-continuar
      </button>
    </div>
  ),
  TransicionDelWizard: ({ stepNumber, totalSteps }: { stepNumber: number; totalSteps: number }) => (
    <div data-testid="transicion-v2">
      {stepNumber} de {totalSteps}
    </div>
  ),
  BarraInferiorV2Spacer: () => null,
  AvisoV2: jest.requireActual('@/app/prototipos/0.6/components/diseno-2/AvisoV2').AvisoV2,
}));

import StepClient from '../[stepSlug]/StepClient';

/**
 * BAL-5296: con diseño por formulario el wizard dice el diseño del formulario
 * que le tocó a la sesión (`solicitud_design`). El paso pinta ese diseño y lo
 * fija en la sesión. Sin el flag, el de la landing como siempre.
 */
beforeEach(() => {
  mockPush.mockClear();
  mockFijar.mockClear();
  mockStep.slug = 'datos-personales';
  delete mockWizardConfig.solicitud_design;
  mockLayout.disenoPorFormulario = undefined;
  Element.prototype.scrollIntoView = jest.fn();
  window.scrollTo = jest.fn();
});

describe('StepClient sigue el diseño del formulario del wizard', () => {
  it('wizard en 2 con la landing en 1: pinta Diseño 2 y fija la sesión en 2', async () => {
    mockLayout.disenoSolicitud = 1;
    mockLayout.disenoPorFormulario = true;
    mockWizardConfig.solicitud_design = 2;
    render(<StepClient />);
    expect(await screen.findByTestId('shell-v2')).toBeInTheDocument();
    expect(mockFijar).toHaveBeenCalledWith(2);
  });

  it('wizard en 1 con la landing en 2: pinta Diseño 1 y fija la sesión en 1', async () => {
    mockLayout.disenoSolicitud = 2;
    mockLayout.disenoPorFormulario = true;
    mockWizardConfig.solicitud_design = 1;
    render(<StepClient />);
    expect((await screen.findAllByText('Continuar')).length).toBeGreaterThan(0);
    expect(screen.queryByTestId('shell-v2')).not.toBeInTheDocument();
    expect(mockFijar).toHaveBeenCalledWith(1);
  });

  it('no-regresión: sin diseño por formulario manda la landing y no fija nada', async () => {
    mockLayout.disenoSolicitud = 1;
    mockWizardConfig.solicitud_design = 2;
    render(<StepClient />);
    expect((await screen.findAllByText('Continuar')).length).toBeGreaterThan(0);
    expect(screen.queryByTestId('shell-v2')).not.toBeInTheDocument();
    expect(mockFijar).not.toHaveBeenCalled();
  });

  it('zona gamer: el wizard en 2 no pinta Diseño 2', async () => {
    mockLayout.landing = 'zona-gamer';
    mockLayout.disenoSolicitud = 1;
    mockLayout.disenoPorFormulario = true;
    mockWizardConfig.solicitud_design = 2;
    try {
      render(<StepClient />);
      expect((await screen.findAllByText('Continuar')).length).toBeGreaterThan(0);
      expect(screen.queryByTestId('shell-v2')).not.toBeInTheDocument();
    } finally {
      mockLayout.landing = 'home';
    }
  });
});
