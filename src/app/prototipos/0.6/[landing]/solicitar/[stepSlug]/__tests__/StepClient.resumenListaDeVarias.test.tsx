/**
 * BAL-4354 — el Resumen muestra lo marcado en una lista de varias con sus
 * textos («Deportes, Tecnología»). Antes se veía solo la primera (`value[0]`).
 * Mismo montaje que `StepClient.pasoRegular.test.tsx`, parado en el Resumen.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockSubmit = jest.fn().mockResolvedValue(true);
const mockPush = jest.fn();

const PASO_REGULAR = {
  code: 'datos_personales_pruebav2',
  url_slug: 'datos-personales',
  title: 'Datos personales',
  description: 'Contanos quién sos',
  order: 0,
  is_summary_step: false,
  fields: [
    {
      id: 127,
      code: 'zz_4354_intereses',
      label: 'ZZ-4354 Intereses',
      type: 'select',
      allow_multiple: true,
      required: false,
      readonly: false,
      hidden: false,
      grid_columns: 12,
      grid_columns_mobile: 12,
      options: [
        { value: 'deportes', label: 'Deportes' },
        { value: 'tecnologia', label: 'Tecnología' },
        { value: 'musica', label: 'Música' },
      ],
      validations: [],
      dependency_groups: [],
      max_files: null,
    },
  ],
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
  useParams: () => ({ landing: 'renueva-tu-equipo-1', stepSlug: 'resumen' }),
  usePathname: () => '/prototipos/0.6/renueva-tu-equipo-1/solicitar/resumen',
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
      currentIndex: 1,
      prevStep: PASO_REGULAR,
      nextStep: null,
      isFirst: false,
      isLast: true,
    }),
    steps: [PASO_REGULAR, PASO_RESUMEN],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../context/WizardContext', () => ({
  useWizard: () => ({
    formData: {
      zz_4354_intereses: { value: ['deportes', 'tecnologia'], touched: true, label: 'Deportes, Tecnología' },
    },
    setFieldError: jest.fn(),
    markStepCompleted: jest.fn(),
    getFieldValue: (c: string) => (c === 'zz_4354_intereses' ? ['deportes', 'tecnologia'] : ''),
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

describe('Resumen de una lista de varias', () => {
  it('muestra todas las marcadas con su texto', async () => {
    render(<StepClient />);
    expect(await screen.findByText('Deportes, Tecnología')).toBeInTheDocument();
  });
});
