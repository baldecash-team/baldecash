/**
 * BAL-5207: `form_step_complete`, `form_step_back` y
 * `form_step_validation_error` llevan `diseno` (1 o 2), igual que
 * `form_step_view`. Sin él no se puede comparar el embudo de Diseño 1 con el
 * de Diseño 2.
 */
import { renderHook, act } from '@testing-library/react';

let mockPrev: { code: string; url_slug: string } | null = null;
const paso = (overrides: Partial<Record<string, unknown>> = {}) => ({
  code: 'datos_personales',
  url_slug: 'datos-personales',
  title: 'Datos personales',
  description: '',
  order: 0,
  is_summary_step: false,
  fields: [],
  motivational: null,
  ...overrides,
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useParams: () => ({ landing: 'home' }),
  usePathname: () => '/prototipos/0.6/home/solicitar',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('../../../../hooks/useSubmitApplication', () => ({
  useSubmitApplication: () => ({
    submit: jest.fn(),
    isSubmitting: false,
    submitMessage: '',
    submitStage: 'idle',
    submitSucceeded: false,
  }),
}));

// Devuelve un objeto NUEVO en cada llamada a propósito: así el test
// reproduce lo que pasa en Diseño 2, donde `adaptarPasoDiseno2` arma un
// `step` nuevo por render aunque sea el mismo paso.
jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    getStepByUrlSlug: (slug: string) => (slug === 'datos-personales' ? paso() : undefined),
    getNavigation: () => ({
      currentIndex: 0,
      prevStep: mockPrev,
      nextStep: null,
      isFirst: true,
      isLast: false,
    }),
    steps: [paso(), paso({ code: 'datos_academicos', url_slug: 'datos-academicos', order: 1 })],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../../../context/WizardContext', () => ({
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

const track = jest.fn();
jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track, flush: jest.fn() }),
}));
jest.mock('../../../../context/SessionContext', () => ({
  useSessionOptional: () => ({ sessionUuid: null }),
}));

jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn().mockResolvedValue({
    layout: { has_catalog: true },
    features: { has_coupon: true },
  }),
}));


// Valida como la API salvo cuando el test pide un error.
let mockErrorDeValidacion: string | null = null;
jest.mock('@/app/prototipos/0.6/services/wizardApi', () => {
  const real = jest.requireActual('@/app/prototipos/0.6/services/wizardApi');
  return { ...real, validateStep: () => mockErrorDeValidacion };
});
// Diseño 2 lleva el foco al campo; acá no hay DOM que enfocar.
jest.mock('@/app/prototipos/0.6/components/diseno-2/useGuiaDeCampos', () => ({
  ...jest.requireActual('@/app/prototipos/0.6/components/diseno-2/useGuiaDeCampos'),
  irAlPrimerErrorV2: jest.fn(),
}));

import { usePasoDelWizard } from '../usePasoDelWizard';

const flujo = {
  shouldShowComplementos: false,
  isCouponRequired: false,
  isEnabled: () => false,
  kycEnabled: false,
  isKycStepEnabled: () => false,
  envioAnticipadoStep: null,
  firmaPorAceptacion: false,
  isLoading: false,
} as unknown as Parameters<typeof usePasoDelWizard>[0]['flujo'];

beforeEach(() => {
  track.mockClear();
  mockErrorDeValidacion = null;
  mockPrev = null;
  localStorage.clear();
  window.scrollTo = jest.fn();
});

describe.each([
  [false, 1],
  [true, 2],
])('usePasoDelWizard con diseno2=%s: los eventos del paso llevan diseno: %s', (diseno2, diseno) => {
  it('form_step_complete', () => {
    const { result } = renderHook(() => usePasoDelWizard({ stepSlug: 'datos-personales', flujo, diseno2 }));
    act(() => result.current.handleNext());
    expect(track).toHaveBeenCalledWith('form_step_complete', {
      step_code: 'datos_personales',
      step_title: 'Datos personales',
      next_step: 'complementos_or_submit',
      diseno,
    });
  });

  it('form_step_validation_error', () => {
    mockErrorDeValidacion = 'first_name';
    const { result } = renderHook(() => usePasoDelWizard({ stepSlug: 'datos-personales', flujo, diseno2 }));
    act(() => result.current.handleNext());
    expect(track).toHaveBeenCalledWith('form_step_validation_error', {
      step_code: 'datos_personales',
      step_title: 'Datos personales',
      error_field: 'first_name',
      diseno,
    });
    expect(track).not.toHaveBeenCalledWith('form_step_complete', expect.anything());
  });

  it('form_step_back (primer paso: prev_step "preview")', () => {
    const { result } = renderHook(() => usePasoDelWizard({ stepSlug: 'datos-personales', flujo, diseno2 }));
    act(() => result.current.handleBack());
    expect(track).toHaveBeenCalledWith('form_step_back', {
      step_code: 'datos_personales',
      prev_step: 'preview',
      diseno,
    });
  });

  it('form_step_back (con paso anterior)', () => {
    mockPrev = { code: 'datos_contacto', url_slug: 'datos-contacto' };
    const { result } = renderHook(() => usePasoDelWizard({ stepSlug: 'datos-personales', flujo, diseno2 }));
    act(() => result.current.handleBack());
    expect(track).toHaveBeenCalledWith('form_step_back', {
      step_code: 'datos_personales',
      prev_step: 'datos_contacto',
      diseno,
    });
  });
});
