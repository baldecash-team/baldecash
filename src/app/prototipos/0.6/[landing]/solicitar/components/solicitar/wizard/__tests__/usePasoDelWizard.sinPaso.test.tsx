/**
 * El hook montado SIN paso resuelto tiene que quedarse quieto.
 *
 * La intro (`solicitarClient`) lo monta en todas las landings —el orden de
 * hooks de React no admite llamarlo solo en `renueva-*`— y le pasa el slug
 * vacío cuando no corresponde. En ese estado no pinta nada, así que tampoco
 * puede salir a la red: la intro ya pide `fetchLandingConfig` por su cuenta y
 * ese servicio no tiene caché de cliente, o sea que una consulta de más es un
 * GET de más en una landing que no cambió de comportamiento.
 */
import { renderHook, waitFor } from '@testing-library/react';

const PASO = {
  code: 'datos_personales',
  url_slug: 'datos-personales',
  title: 'Datos personales',
  description: '',
  order: 0,
  is_summary_step: false,
  fields: [],
  motivational: null,
};

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

jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    getStepByUrlSlug: (slug: string) => (slug === 'datos-personales' ? PASO : undefined),
    getNavigation: () => ({
      currentIndex: 0,
      prevStep: null,
      nextStep: null,
      isFirst: true,
      isLast: true,
    }),
    steps: [PASO],
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

jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => null,
}));
jest.mock('../../../../context/SessionContext', () => ({
  useSessionOptional: () => ({ sessionUuid: null }),
}));

jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn().mockResolvedValue({
    layout: { has_catalog: true },
    features: { has_coupon: true, vip_countdown: true },
  }),
}));

import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';
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
  (fetchLandingConfig as jest.Mock).mockClear();
  localStorage.clear();
  // Token VIP guardado: es la única condición que dispara la consulta de
  // `vip_countdown` dentro del hook.
  localStorage.setItem('baldecash-vip-token-home', 'tok-123');
  window.scrollTo = jest.fn();
});

describe('usePasoDelWizard sin paso resuelto', () => {
  it('no consulta la config de la landing aunque haya token VIP', async () => {
    const { result } = renderHook(() => usePasoDelWizard({ stepSlug: '', flujo }));

    expect(result.current.step).toBeNull();
    // Se espera un tick por si el efecto llegara tarde; la afirmación es que
    // nunca sale.
    await waitFor(() => expect(result.current.step).toBeNull());
    expect(fetchLandingConfig).not.toHaveBeenCalled();
  });

  it('con el paso resuelto sí la consulta, una sola vez', async () => {
    renderHook(() => usePasoDelWizard({ stepSlug: 'datos-personales', flujo }));

    await waitFor(() => expect(fetchLandingConfig).toHaveBeenCalledTimes(1));
  });
});
