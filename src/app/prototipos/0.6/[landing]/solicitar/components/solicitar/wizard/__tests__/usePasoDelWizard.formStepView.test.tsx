/**
 * `form_step_view` se emite UNA vez al montar un paso del wizard (BAL-4969,
 * medición Diseño 1 vs Diseño 2), con las propiedades `step_slug`,
 * `step_index`, `total_steps` y `diseno`. No se repite en un re-render,
 * aunque `getStepByUrlSlug` (como `adaptarPasoDiseno2` en Diseño 2) devuelva
 * un objeto `step` NUEVO en cada render: la guarda es por slug, no por
 * referencia.
 */
import { renderHook } from '@testing-library/react';

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
      prevStep: null,
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
  localStorage.clear();
  window.scrollTo = jest.fn();
});

describe('usePasoDelWizard: form_step_view', () => {
  it('emite form_step_view una vez al montar, con step_slug/step_index/total_steps/diseno', () => {
    renderHook(() => usePasoDelWizard({ stepSlug: 'datos-personales', flujo }));

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('form_step_view', {
      step_slug: 'datos-personales',
      step_index: 0,
      total_steps: 2,
      diseno: 1,
    });
  });

  it('en Diseño 2 manda diseno: 2', () => {
    renderHook(() => usePasoDelWizard({ stepSlug: 'datos-personales', flujo, diseno2: false }));
    expect(track).toHaveBeenCalledWith('form_step_view', expect.objectContaining({ diseno: 1 }));
    track.mockClear();

    renderHook(() => usePasoDelWizard({ stepSlug: 'datos-personales', flujo, diseno2: true }));
    expect(track).toHaveBeenCalledWith('form_step_view', expect.objectContaining({ diseno: 2 }));
  });

  it('no se repite en un re-render aunque el objeto `step` sea uno nuevo', () => {
    const { rerender } = renderHook(
      ({ slug }: { slug: string }) => usePasoDelWizard({ stepSlug: slug, flujo }),
      { initialProps: { slug: 'datos-personales' } },
    );

    expect(track).toHaveBeenCalledTimes(1);

    rerender({ slug: 'datos-personales' });
    rerender({ slug: 'datos-personales' });

    expect(track).toHaveBeenCalledTimes(1);
  });
});
