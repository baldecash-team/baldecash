/**
 * Qué hace el paso regular al pulsar el botón de avanzar.
 *
 * Es un test de CARACTERIZACIÓN: no describe un comportamiento nuevo, fija el
 * que ya existe, para que la extracción de `usePasoDelWizard` sea un movimiento
 * puro. Lo que protege es el arranque del contrato: en renueva-* la solicitud
 * se crea al cerrar el paso 1 (envío anticipado) y de ahí sale el contrato, así
 * que los flags de `submitApplication` no pueden cambiar sin que esto se ponga
 * rojo.
 *
 * El botón dice "Enviar Solicitud", no "Continuar": `enviaEnEstePaso` (con
 * `envioAnticipadoStep: 1` y este paso en `currentIndex === 0`) hace que
 * `isActuallyLastRegularStep` sea `true` en `StepClient`, y tanto
 * `WizardNavigation` como `MobileStickyCta` muestran "Enviar Solicitud" con
 * `isLastStep=true` (ver sus respectivos `.tsx`). "Continuar" es el rótulo de
 * un paso que solo avanza, no el de este.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockSubmit = jest.fn().mockResolvedValue(true);
const mockPush = jest.fn();

const PASO_REGULAR = {
  code: 'datos_personales_pruebav2',
  url_slug: 'datos-personales',
  title: 'Datos personales',
  description: 'Contanos quién sos',
  order: 0,
  is_summary_step: false,
  fields: [],
  motivational: null,
};
const PASO_RESUMEN = {
  code: 'summary_resumen_1a',
  url_slug: 'resumen',
  title: 'Resumen',
  description: '',
  order: 1,
  is_summary_step: true,
  fields: [],
  motivational: null,
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useParams: () => ({ landing: 'renueva-tu-equipo-1', stepSlug: 'datos-personales' }),
  usePathname: () => '/prototipos/0.6/renueva-tu-equipo-1/solicitar/datos-personales',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('../../hooks/useSubmitApplication', () => ({
  useSubmitApplication: () => ({
    submit: mockSubmit,
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
    isEnabled: (t: string) => t !== 'otp_verification',
    kycEnabled: true,
    isKycStepEnabled: (t: string) => t === 'contract',
    envioAnticipadoStep: 1,
    firmaPorAceptacion: true,
    isLoading: false,
  }),
}));

jest.mock('../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    getStepByUrlSlug: (slug: string) =>
      slug === 'datos-personales' ? PASO_REGULAR : PASO_RESUMEN,
    getNavigation: () => ({
      currentIndex: 0,
      prevStep: null,
      nextStep: PASO_RESUMEN,
      isFirst: true,
      isLast: false,
    }),
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
    landingId: 178,
    isLoading: false,
    hasError: false,
    newsletterData: null,
  }),
}));

// El brief solo cubría los campos que `StepClient` lee directo. `WizardLayout`
// monta ademas `SelectedProductBar` (siempre, no solo con complementos), que
// desestructura muchos más campos de `useProduct` — sin ellos el render
// explota antes de llegar al botón. Se agregan con valores neutros: la barra
// de producto no es lo que este test ejercita.
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

jest.mock('@/app/prototipos/0.6/hooks/useLeadGuard', () => ({
  useLeadGuard: () => true,
}));
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
// El cuerpo del paso no es lo que se prueba acá: sin campos, `validateStep`
// devuelve null y el foco queda en qué pasa después de validar.
jest.mock('../../components/solicitar/wizard/DynamicWizardStep', () => ({
  DynamicWizardStep: () => <div data-testid="cuerpo-del-paso" />,
}));

import StepClient from '../StepClient';

beforeEach(() => {
  mockSubmit.mockClear();
  mockSubmit.mockResolvedValue(true);
  mockPush.mockClear();
  Element.prototype.scrollIntoView = jest.fn();
  // `useScrollToTop` (montado por `StepClient`) llama a `window.scrollTo` en
  // cada render. jsdom no lo implementa y sin este stub cada test deja un
  // "Error: Not implemented: window.scrollTo" en consola — no hace fallar el
  // test, pero es ruido que tapa fallas reales.
  window.scrollTo = jest.fn();
});

describe('paso regular de renueva-*: qué pasa al continuar', () => {
  it('crea la solicitud con los flags del contrato y se queda en el wizard', async () => {
    render(<StepClient />);
    const botones = await screen.findAllByText('Enviar Solicitud');
    await userEvent.click(botones[0].closest('button')!);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      insuranceId: null,
      otpEnabled: false,
      kycEnabled: true,
      stayInWizard: true,
      conContrato: true,
    });
  });

  it('al resolver el envío navega al paso siguiente, que es el resumen', async () => {
    render(<StepClient />);
    const botones = await screen.findAllByText('Enviar Solicitud');
    await userEvent.click(botones[0].closest('button')!);

    expect(mockPush).toHaveBeenCalledWith(
      '/prototipos/0.6/renueva-tu-equipo-1/solicitar/resumen'
    );
  });

  it('el pestillo impide que un doble click cree dos solicitudes', async () => {
    render(<StepClient />);
    const botones = await screen.findAllByText('Enviar Solicitud');
    const boton = botones[0].closest('button')!;
    await userEvent.click(boton);
    await userEvent.click(boton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
