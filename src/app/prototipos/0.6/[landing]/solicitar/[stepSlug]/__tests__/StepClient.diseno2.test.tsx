/**
 * BAL-4959: con la landing en Diseño 2 el paso se pinta dentro de `ShellV2`;
 * con Diseño 1 (o sin la clave) sale el layout de siempre.
 *
 * `ShellV2` y `TransicionPaso` van mockeados: lo que se prueba es la elección
 * del marco en `StepClient` y que el marco recibe los handlers de siempre, no
 * cómo se ve el marco (eso lo cubren sus propios tests y Playwright).
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';

const mockPush = jest.fn();
const mockLayout: { disenoSolicitud: 1 | 2 | undefined; landing: string } = { disenoSolicitud: 2, landing: 'pago-diferido' };
const mockStep = { slug: 'datos-personales' };

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

jest.mock('../../hooks/useSubmitApplication', () => ({
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

jest.mock('../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    getStepByUrlSlug: (slug: string) => (slug === 'datos-personales' ? PASO_REGULAR : PASO_RESUMEN),
    getNavigation: (code: string) =>
      code === 'personal_data'
        ? { currentIndex: 0, prevStep: null, nextStep: PASO_RESUMEN, isFirst: true, isLast: false }
        : { currentIndex: 1, prevStep: PASO_REGULAR, nextStep: null, isFirst: false, isLast: true },
    steps: [PASO_REGULAR, PASO_RESUMEN],
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
  }),
}));

jest.mock('../../context/ProductContext', () => ({
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
jest.mock('../../hooks/useLeadPrefill', () => ({ useLeadPrefill: jest.fn() }));
jest.mock('../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn() }),
}));
jest.mock('../../context/SessionContext', () => ({
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
jest.mock('../../components/solicitar/wizard/DynamicWizardStep', () => ({
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
}));

import StepClient from '../StepClient';

beforeEach(() => {
  mockPush.mockClear();
  mockStep.slug = 'datos-personales';
  Element.prototype.scrollIntoView = jest.fn();
  window.scrollTo = jest.fn();
});

describe('StepClient elige el marco según el diseño de la landing', () => {
  it('Diseño 2: el paso regular se pinta dentro de ShellV2, con los campos tocados', async () => {
    mockLayout.disenoSolicitud = 2;
    render(<StepClient />);
    expect(await screen.findByTestId('shell-v2')).toBeInTheDocument();
    expect(screen.getByTestId('cuerpo-del-paso')).toHaveAttribute('data-con-tocados', 'si');
    // Nada del layout de Diseño 1.
    expect(screen.queryByText('Producto seleccionado')).not.toBeInTheDocument();
    expect(screen.queryByText('Continuar')).not.toBeInTheDocument();
  });

  it('Diseño 2: continuar pasa por la transición "¡Un paso más!" y después navega', async () => {
    jest.useFakeTimers();
    try {
      mockLayout.disenoSolicitud = 2;
      render(<StepClient />);
      const boton = await screen.findByText('v2-continuar');
      act(() => {
        boton.click();
      });
      expect(screen.getByTestId('transicion-v2')).toHaveTextContent('1 de 2');
      expect(mockPush).not.toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/solicitar/preferencias');
    } finally {
      jest.useRealTimers();
    }
  });

  it('Diseño 2: el resumen también va dentro de ShellV2', async () => {
    mockLayout.disenoSolicitud = 2;
    mockStep.slug = 'preferencias';
    render(<StepClient />);
    expect(await screen.findByTestId('shell-v2')).toBeInTheDocument();
    expect(screen.getByText('Resumen de tu solicitud')).toBeInTheDocument();
  });

  it('Diseño 1: el layout de siempre, sin ShellV2', async () => {
    mockLayout.disenoSolicitud = 1;
    render(<StepClient />);
    expect((await screen.findAllByText('Continuar')).length).toBeGreaterThan(0);
    expect(screen.queryByTestId('shell-v2')).not.toBeInTheDocument();
    expect(screen.getByTestId('cuerpo-del-paso')).toHaveAttribute('data-con-tocados', 'no');
  });

  it('sin la clave en el contexto (mocks viejos) cae en Diseño 1', async () => {
    mockLayout.disenoSolicitud = undefined;
    render(<StepClient />);
    expect((await screen.findAllByText('Continuar')).length).toBeGreaterThan(0);
    expect(screen.queryByTestId('shell-v2')).not.toBeInTheDocument();
  });

  it('zona-gamer queda en Diseño 1 aunque traiga el 2', async () => {
    mockLayout.disenoSolicitud = 2;
    mockLayout.landing = 'zona-gamer';
    try {
      render(<StepClient />);
      await screen.findAllByTestId('cuerpo-del-paso');
      expect(screen.queryByTestId('shell-v2')).not.toBeInTheDocument();
    } finally {
      mockLayout.landing = 'pago-diferido';
    }
  });
});
