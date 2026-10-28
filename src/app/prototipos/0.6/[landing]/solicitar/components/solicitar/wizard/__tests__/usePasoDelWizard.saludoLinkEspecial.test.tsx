/**
 * El panel lateral (escritorio) saluda con el nombre que encontró la búsqueda
 * del DNI («Hola {Nombre}, qué bueno verte por aquí»). Con la misma regla que
 * el saludo del Paso 1: si el link especial bloqueó el DNI (no es el del link
 * o el link ya no sirve) o el DNI está fuera de la lista de invitados, no se
 * muestra el nombre de esa persona; ni en el título del panel ni en el
 * `firstName` que usa la tarjeta VIP.
 */
import { renderHook } from '@testing-library/react';

const MOTIVACIONAL = {
  title: 'Cuéntanos de ti',
  highlight: '',
  title_end: '',
  subtitle: 'Solo te tomará un minuto.',
  illustration: '',
};

const paso = () => ({
  code: 'datos_personales',
  url_slug: 'datos-personales',
  title: 'Datos personales',
  description: '',
  order: 0,
  is_summary_step: false,
  fields: [{ code: 'document_number', type: 'document_number', label: 'DNI' }],
  motivational: MOTIVACIONAL,
});

let formData: Record<string, { value: string }> = {};

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
    getStepByUrlSlug: (slug: string) => (slug === 'datos-personales' ? paso() : undefined),
    getNavigation: () => ({ currentIndex: 0, prevStep: null, nextStep: null, isFirst: true, isLast: false }),
    steps: [paso()],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    formData,
    setFieldError: jest.fn(),
    markStepCompleted: jest.fn(),
    getFieldValue: () => '',
    getFieldLabel: () => undefined,
    getAllDynamicOptions: () => ({}),
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));

jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn(), flush: jest.fn() }),
}));
jest.mock('../../../../context/SessionContext', () => ({
  useSessionOptional: () => ({ sessionUuid: null }),
}));

jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn().mockResolvedValue({ layout: { has_catalog: true }, features: {} }),
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

const conDni = (extra: Record<string, string>) => {
  formData = Object.fromEntries(
    Object.entries({
      document_number: '99999900',
      _prefill_status_document_number: 'found',
      first_name: 'BRENDA',
      ...extra,
    }).map(([k, v]) => [k, { value: v }]),
  );
};

const render = () => renderHook(() => usePasoDelWizard({ stepSlug: 'datos-personales', flujo })).result.current;

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = jest.fn();
});

describe('usePasoDelWizard: saludo del panel lateral', () => {
  it('sin link especial ni lista de invitados: saluda con el nombre encontrado', () => {
    conDni({});
    const paso = render();
    expect(paso.motivational?.title).toContain('Brenda');
    expect(paso.firstName).toBe('BRENDA');
  });

  it('link especial que bloqueó el DNI: ni título con nombre ni firstName', () => {
    conDni({ _special_link_blocked: 'true' });
    const paso = render();
    expect(paso.motivational).toEqual(MOTIVACIONAL);
    expect(paso.motivational?.title).not.toContain('Brenda');
    expect(paso.firstName).toBe('');
  });

  it('DNI fuera de la lista de invitados: tampoco saluda', () => {
    conDni({ _whitelist_blocked: 'true' });
    const paso = render();
    expect(paso.motivational).toEqual(MOTIVACIONAL);
    expect(paso.firstName).toBe('');
  });

  it('link especial que coincide (sin bloqueo): saluda normal', () => {
    conDni({ _special_link_blocked: '' });
    const paso = render();
    expect(paso.motivational?.title).toContain('Brenda');
  });
});
