/// <reference types="jest" />
/**
 * El progreso KYC pasa a leerse del API (BD como fuente de verdad).
 *
 * `localStorage` deja de ser la fuente de verdad — solo cruza de dispositivo
 * si el API responde. Si el API falla, se cae al valor guardado localmente
 * para no dejar al cliente sin flujo.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Next.js (SWC) compila los exports del módulo como propiedades no
// configurables → `jest.spyOn(namespace, 'fn')` revienta con "Cannot redefine
// property". Se mockea el módulo completo (parcial, sobre el real) en su
// lugar — mismo patrón que confirmacionClient.test.tsx.
jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return {
    ...actual,
    getKycProgress: jest.fn(),
    completeKycStep: jest.fn(),
    // El sub-paso de contrato pide el documento emitido al montar y sin él no
    // ofrece aceptar nada. Acá el contrato es solo el vehículo para avanzar el
    // flujo, así que se da por emitido.
    getContrato: jest.fn().mockResolvedValue({ disponible: true, html: '<p>Contrato</p>' }),
  };
});

import KycClient from '../kycClient';
import { getKycProgress, completeKycStep } from '@/app/prototipos/0.6/services/kycApi';

const mockGetKycProgress = getKycProgress as jest.MockedFunction<typeof getKycProgress>;
const mockCompleteKycStep = completeKycStep as jest.MockedFunction<typeof completeKycStep>;

// `useSearchParams`/`useSolicitarFlow` mockeados vía jest.fn() (no un valor
// fijo) para poder variar `?code=` y `kycSteps` por test — necesario para
// probar la ruta tokenizada, que NO manda `?code=` en la URL a propósito.
const mockUseSearchParams = jest.fn(() => new URLSearchParams('code=APP-1'));
const mockKycSteps = jest.fn(() => [{ type: 'dni_selfie' }, { type: 'contract' }]);
const mockRouterReplace = jest.fn();
const mockTrack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace, push: jest.fn() }),
  useParams: () => ({ landing: 'copia-home' }),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    kycEnabled: true,
    kycSteps: mockKycSteps(),
    isLoading: false,
  }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

// Mock LayoutContext (KycChrome depende de él para navbar/footer).
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: { logo: '/logo.png' },
    footerData: {},
    agreementData: null,
    isLoading: false,
    hasError: false,
  }),
}));

jest.mock('@/app/prototipos/_shared', () => ({
  CubeGridSpinner: () => <div data-testid="spinner">Loading...</div>,
}));

jest.mock('@/app/prototipos/0.6/components/NotFoundContent', () => ({
  NotFoundContent: () => <div>Not Found</div>,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar', () => ({
  NvidiaNavbar: () => <nav data-testid="nvidia-navbar">NvidiaNavbar</nav>,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

const state = (next: string, idx: number) => ({
  application_code: 'APP-1', landing_slug: 'copia-home',
  steps: [
    { type: 'dni_selfie', status: idx > 0 ? 'completed' : 'pending', completed_at: null },
    { type: 'contract', status: 'pending', completed_at: null },
  ],
  next_step: next, next_step_index: idx, is_complete: false,
  kyc_enabled: true, resume: { enabled: true, ttl_hours: 72 },
});

// Flujo por link: desde el fix de campañas por invitación (landing con la
// sección `kyc` apagada + invitación por solicitud), los sub-pasos salen de
// `initialState.steps` — NO de la config pública de la landing (que en esas
// campañas dice `enabled:false` y no tiene pasos). Este fixture es lo que
// devolvería `resume` para una solicitud cuyo único sub-paso es el contrato,
// alineado con el "Paso 1 de 1" que asertan los tests de la ruta tokenizada.
const linkState = (next: string, idx: number) => ({
  ...state(next, idx),
  steps: [{ type: 'contract', status: 'pending', completed_at: null }],
});

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
  mockUseSearchParams.mockReturnValue(new URLSearchParams('code=APP-1'));
  mockKycSteps.mockReturnValue([{ type: 'dni_selfie' }, { type: 'contract' }]);
});

afterEach(() => jest.restoreAllMocks());

it('arranca en el sub-paso que dice el API, no en el de localStorage', async () => {
  window.localStorage.setItem('baldecash-copia-home-kyc-step-APP-1', '0');
  mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

  render(<KycClient />);

  await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
});

it('cae al localStorage si el API falla', async () => {
  window.localStorage.setItem('baldecash-copia-home-kyc-step-APP-1', '1');
  mockGetKycProgress.mockResolvedValue(null);

  render(<KycClient />);

  await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
});

// Regresión: un ref-guard síncrono (`restoredRef.current = true` antes del
// fetch) bloqueaba el remount de StrictMode (mount→cleanup→mount en dev) sin
// relanzar el fetch, y el fetch original llegaba cancelado — la restauración
// nunca se aplicaba. Sin StrictMode el bug no se ve (por eso "funcionaba" en
// build de producción), así que el test tiene que forzar el doble montaje.
it('restaura desde el API incluso bajo StrictMode (mount→cleanup→mount)', async () => {
  mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

  render(
    <React.StrictMode>
      <KycClient />
    </React.StrictMode>,
  );

  await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
});

// Regresión: `code` salía solo de `searchParams.get('code')`, así que la ruta
// tokenizada `/kyc/[token]` (Task 5) — que NO manda `?code=` a propósito —
// dejaba `code` en `undefined`: sin restauración, sin `completeKycStep` y sin
// `application_code` en los eventos. El fix deriva `code` de `initialState`
// cuando no hay query param.
it('usa el application_code de `initialState` cuando no hay `?code=` en la URL (ruta tokenizada)', async () => {
  mockUseSearchParams.mockReturnValue(new URLSearchParams()); // sin ?code=
  mockKycSteps.mockReturnValue([{ type: 'contract' }]); // 1 sub-paso: alcanza con 1 click para avanzar
  mockCompleteKycStep.mockResolvedValue(state('contract', 0) as never);

  const initialState = linkState('contract', 0); // next_step_index=0 → arranca directo en 'contract'

  render(<KycClient initialState={initialState as never} resumeToken="tok-abc" />);

  // (a) arranca en el sub-paso que dice `initialState`, no pide getKycProgress de nuevo.
  await waitFor(() => expect(screen.getByText(/Paso 1 de 1/)).toBeInTheDocument());
  expect(mockGetKycProgress).not.toHaveBeenCalled();

  const user = userEvent.setup();
  await user.click(screen.getByText('He leído y acepto el contrato'));
  await user.click(screen.getByRole('button', { name: 'Continuar' }));

  // (b) completeKycStep se llama con el código derivado de `initialState` y el
  // `resumeToken` como prueba (NUNCA el DNI cuando hay token).
  await waitFor(() => expect(mockCompleteKycStep).toHaveBeenCalledWith({
    applicationCode: 'APP-1',
    stepType: 'contract',
    resumeToken: 'tok-abc',
    documentNumber: undefined,
  }));

  // (c) los eventos del orquestador llevan `application_code` con ese mismo código.
  expect(mockTrack).toHaveBeenCalledWith(
    'kyc_step_complete',
    expect.objectContaining({ application_code: 'APP-1' }),
  );
  expect(mockTrack).toHaveBeenCalledWith(
    'kyc_completed',
    expect.objectContaining({ application_code: 'APP-1' }),
  );
});

// Fix final C-2 — reconciliación: el índice remoto se aplicaba a secas y
// además pisaba la caché local. Como `completeKycStep` es fire-and-forget, un
// POST caído (offline, 429, ownership_locked) deja el remoto ATRÁS del local:
// el siguiente montaje rebobinaba al cliente (que tenía que re-capturar DNI y
// selfie) y le borraba el avance guardado. Ahora se toma el máximo.
describe('reconciliación remoto vs local', () => {
  it('remoto 0 + local 1 → NO rebobina (se queda en el sub-paso 2)', async () => {
    window.localStorage.setItem('baldecash-copia-home-kyc-step-APP-1', '1');
    mockGetKycProgress.mockResolvedValue(state('dni_selfie', 0) as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
    // Y la caché conserva el avance: el remoto viejo no la pisa con 0.
    expect(window.localStorage.getItem('baldecash-copia-home-kyc-step-APP-1')).toBe('1');
  });

  it('remoto 1 + local 0 → el API sigue ganando (cruce de dispositivo)', async () => {
    window.localStorage.setItem('baldecash-copia-home-kyc-step-APP-1', '0');
    mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
    expect(window.localStorage.getItem('baldecash-copia-home-kyc-step-APP-1')).toBe('1');
  });
});

// Fix final C-1 — prueba de titularidad en sesión: el DNI se leía SOLO de la
// key del form de leads, que la única landing con el feature prendido en prod
// (`copia-home`, tipo `institutional`) nunca escribe. Hay 3 fuentes reales.
describe('DNI del wizard (prueba de titularidad en sesión)', () => {
  const setupUnPaso = () => {
    mockKycSteps.mockReturnValue([{ type: 'contract' }]);
    mockGetKycProgress.mockResolvedValue(state('contract', 0) as never);
    mockCompleteKycStep.mockResolvedValue(state('contract', 0) as never);
  };

  const avanzar = async () => {
    const user = userEvent.setup();
    // El contrato se pide al montar y la casilla recién aparece cuando llegó:
    // sin esta espera el click corre contra un paso que todavía dice
    // «se está generando».
    await screen.findByText('He leído y acepto el contrato');
    await user.click(screen.getByText('He leído y acepto el contrato'));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
  };

  it('fuente 2: blob del wizard estándar (el caso real de copia-home)', async () => {
    window.localStorage.setItem(
      'baldecash-wizard-copia-home-data',
      JSON.stringify({
        document_number: { value: '48509924', touched: true, label: 'DNI' },
        first_name: { value: 'Ana', touched: true },
      }),
    );
    setupUnPaso();

    render(<KycClient />);

    // (a) el botón de pausa se ofrece (antes nunca aparecía en esta landing).
    // `waitFor` porque `resume.enabled` llega con la respuesta del API.
    await waitFor(() => expect(
      screen.getByRole('button', { name: /continuar en otro momento/i }),
    ).toBeInTheDocument());
    // (b) y el DNI viaja como prueba en step-complete (antes: 422 missing_proof)
    await avanzar();
    await waitFor(() => expect(mockCompleteKycStep).toHaveBeenCalledWith(
      expect.objectContaining({ documentNumber: '48509924' }),
    ));
  });

  it('fuente 1: prefill del form de leads', async () => {
    window.localStorage.setItem('baldecash-copia-home-wizard-field-document_number', '11111111');
    setupUnPaso();

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 1 de 1/)).toBeInTheDocument());
    await avanzar();
    await waitFor(() => expect(mockCompleteKycStep).toHaveBeenCalledWith(
      expect.objectContaining({ documentNumber: '11111111' }),
    ));
  });

  it('fuente 3: gate de DNI de las landings VIP', async () => {
    window.localStorage.setItem('baldecash-dni-copia-home', '22222222');
    setupUnPaso();

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 1 de 1/)).toBeInTheDocument());
    await avanzar();
    await waitFor(() => expect(mockCompleteKycStep).toHaveBeenCalledWith(
      expect.objectContaining({ documentNumber: '22222222' }),
    ));
  });

  it('ninguna fuente: el botón de pausa sigue disponible y step-complete NO se llama sin prueba', async () => {
    // 2 sub-pasos + índice remoto 1: llegar a "Paso 2 de 2" prueba que la
    // respuesta del API ya se aplicó, así la presencia del botón no es un
    // falso verde por afirmarla antes de que resuelva el fetch.
    //
    // El DNI de localStorage no es requisito para el botón: sin él, es
    // `PausarModal` quien se lo pide al usuario.
    //
    // Y sin ninguna prueba NO se llama al backend. Antes se llamaba con
    // `documentNumber: undefined`, el backend respondía 422 `missing_proof` y
    // —al ser fire-and-forget— el avance se perdía sin que nadie se enterara.
    // Ahora se emite un evento `error` para que quede rastro.
    mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /continuar en otro momento/i })).toBeInTheDocument();
    await avanzar();

    expect(mockCompleteKycStep).not.toHaveBeenCalled();
    expect(mockTrack).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({ scope: 'kyc_step_persist', reason: 'no_proof' }),
    );
  });

  it('blob corrupto o con valor vacío: no lanza y sigue buscando en las otras fuentes', async () => {
    window.localStorage.setItem('baldecash-wizard-copia-home-data', '{no es json');
    window.localStorage.setItem('baldecash-dni-copia-home', '33333333');
    setupUnPaso();

    render(<KycClient />);

    // Si `JSON.parse` propagara, el render entero reventaría acá.
    await waitFor(() => expect(screen.getByText(/Paso 1 de 1/)).toBeInTheDocument());
    await avanzar();
    await waitFor(() => expect(mockCompleteKycStep).toHaveBeenCalledWith(
      expect.objectContaining({ documentNumber: '33333333' }),
    ));
  });

  it('blob con document_number vacío: no lo toma como prueba (pero el botón de pausa sigue disponible)', async () => {
    window.localStorage.setItem(
      'baldecash-wizard-copia-home-data',
      JSON.stringify({ document_number: { value: '   ', touched: false } }),
    );
    mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
    // El DNI en blanco no cuenta como prueba para `step-complete` (ver test de
    // "ninguna fuente" más abajo), pero el botón de pausa ya no depende de eso:
    // el modal le pide el DNI al usuario si hace falta.
    expect(screen.getByRole('button', { name: /continuar en otro momento/i })).toBeInTheDocument();
  });
});

// Fix final I-1 — la ruta tokenizada vive fuera de EventTrackerProvider, así
// que sin un sink inyectado NINGÚN evento kyc_* se emitía ahí: ni los del
// orquestador ni los de los sub-pasos. Con `onTrack`, el mismo catálogo de
// eventos sale por el token del link.
describe('onTrack (sink de eventos de la ruta tokenizada)', () => {
  it('emite kyc_step_complete con application_code por el sink, no por el contexto', async () => {
    const onTrack = jest.fn();
    mockUseSearchParams.mockReturnValue(new URLSearchParams()); // ruta tokenizada: sin ?code=
    mockKycSteps.mockReturnValue([{ type: 'contract' }]);
    mockCompleteKycStep.mockResolvedValue(state('contract', 0) as never);

    render(
      <KycClient
        initialState={linkState('contract', 0) as never}
        resumeToken="tok-abc"
        onTrack={onTrack}
      />,
    );

    await waitFor(() => expect(screen.getByText(/Paso 1 de 1/)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByText('He leído y acepto el contrato'));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onTrack).toHaveBeenCalledWith(
      'kyc_step_complete',
      expect.objectContaining({ application_code: 'APP-1', step: 'contract' }),
    );
    expect(onTrack).toHaveBeenCalledWith('kyc_started', expect.objectContaining({ application_code: 'APP-1' }));
    expect(onTrack).toHaveBeenCalledWith('kyc_completed', expect.objectContaining({ application_code: 'APP-1' }));
    // El tracker del contexto queda fuera del camino cuando hay sink.
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('el sink también llega a los sub-pasos (kyc_contract_view)', async () => {
    const onTrack = jest.fn();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockKycSteps.mockReturnValue([{ type: 'contract' }]);

    render(
      <KycClient
        initialState={linkState('contract', 0) as never}
        resumeToken="tok-abc"
        onTrack={onTrack}
      />,
    );

    await waitFor(() => expect(onTrack).toHaveBeenCalledWith(
      'kyc_contract_view',
      expect.objectContaining({ application_code: 'APP-1' }),
    ));
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('sin onTrack, los eventos siguen saliendo por el contexto (flujo en sesión)', async () => {
    mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

    render(<KycClient />);

    await waitFor(() => expect(mockTrack).toHaveBeenCalledWith(
      'kyc_started',
      expect.objectContaining({ application_code: 'APP-1' }),
    ));
  });
});

// Regla de visibilidad del botón "Continuar en otro momento" (Task 4, y
// rediseño posterior sobre el DNI de localStorage): antes exigíamos DNI de
// localStorage como "prueba de titularidad en sesión", pero eso dejaba sin
// botón a CUALQUIER solicitante que llegara a KYC sin el estado del wizard
// en ese navegador — no era un edge case. Ahora el botón se ofrece con solo
// 3 condiciones (resume.enabled + code + sin resumeToken); el DNI, si hace
// falta, se pide dentro del propio modal (ver PausarModal.test.tsx).
describe('botón "Continuar en otro momento"', () => {
  it('se muestra cuando resume.enabled + hay DNI en localStorage + sin resumeToken', async () => {
    window.localStorage.setItem('baldecash-copia-home-wizard-field-document_number', '48509924');
    mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /continuar en otro momento/i })).toBeInTheDocument();
  });

  it('se muestra AUNQUE no haya DNI en localStorage: el modal se lo pide al usuario', async () => {
    mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /continuar en otro momento/i })).toBeInTheDocument();
  });

  it('se oculta si resume.enabled es false', async () => {
    window.localStorage.setItem('baldecash-copia-home-wizard-field-document_number', '48509924');
    mockGetKycProgress.mockResolvedValue({
      ...state('contract', 1),
      resume: { enabled: false, ttl_hours: 72 },
    } as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /continuar en otro momento/i })).not.toBeInTheDocument();
  });

  it('TAMBIÉN se muestra entrando por el link: el que ya tiene vence', async () => {
    // Antes se ocultaba con `resumeToken` presente —"ya tiene un link"—, pero
    // eso hacía que el botón apareciera y desapareciera según cómo hubiera
    // entrado la persona. Y el link vence a las 72 h: quien retoma sobre la
    // hora necesita pedir uno nuevo justamente desde acá.
    window.localStorage.setItem('baldecash-copia-home-wizard-field-document_number', '48509924');
    mockUseSearchParams.mockReturnValue(new URLSearchParams()); // ruta tokenizada: sin ?code=
    mockKycSteps.mockReturnValue([{ type: 'contract' }]);
    const initialState = linkState('contract', 0);

    render(<KycClient initialState={initialState as never} resumeToken="tok-abc" />);

    await waitFor(() => expect(screen.getByText(/Paso 1 de 1/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /continuar en otro momento/i })).toBeInTheDocument();
  });

  // Fix round 1 — MINOR del reviewer: de los 4 eventos kyc_* de esta task,
  // `kyc_pause_click` (el que dispara kycClient.tsx al abrir el modal) era el
  // único sin test que verificara `application_code`.
  it('kyc_pause_click lleva application_code al abrir el modal', async () => {
    window.localStorage.setItem('baldecash-copia-home-wizard-field-document_number', '48509924');
    mockGetKycProgress.mockResolvedValue(state('contract', 1) as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /continuar en otro momento/i }));

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_pause_click',
      expect.objectContaining({ application_code: 'APP-1' }),
    );
  });
});

/**
 * El paso de pago al cargar el KYC.
 *
 * El link se mintea con la aprobacion y ahora viaja en el estado, asi que el
 * paso puede existir desde el arranque. Antes solo aparecia al final —cuando
 * `/completar` devolvia el link— y por eso ponerlo primero en la config de la
 * landing no lo adelantaba.
 */
describe('paso de pago desde el estado', () => {
  it('con link en el estado, el paso de pago existe al cargar', async () => {
    mockKycSteps.mockReturnValue([
      { type: 'dni_selfie' }, { type: 'contract' }, { type: 'payment' },
    ] as never);
    mockGetKycProgress.mockResolvedValue({
      ...state('dni_selfie', 0),
      link_pago: 'https://zona.baldecash.com/magic/abc',
    } as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument());
  });

  it('respeta el orden configurado: pago primero es el primero', async () => {
    // La landing puede poner el pago antes que el resto; la lista tiene que
    // seguir ese orden en vez de empujarlo siempre al final.
    mockKycSteps.mockReturnValue([
      { type: 'payment' }, { type: 'dni_selfie' }, { type: 'contract' },
    ] as never);
    mockGetKycProgress.mockResolvedValue({
      ...state('dni_selfie', 0),
      link_pago: 'https://zona.baldecash.com/magic/abc',
    } as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 1 de 3/)).toBeInTheDocument());
    expect(screen.getByText('Paga tu cuota inicial')).toBeInTheDocument();
  });

  it('sin link el paso no aparece aunque este configurado', async () => {
    mockKycSteps.mockReturnValue([
      { type: 'dni_selfie' }, { type: 'contract' }, { type: 'payment' },
    ] as never);
    mockGetKycProgress.mockResolvedValue(state('dni_selfie', 0) as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 1 de 2/)).toBeInTheDocument());
  });
});

/**
 * El link de pago que llega mientras la persona avanza.
 *
 * La aprobacion tarda unos segundos, asi que si el KYC carga antes de que el
 * link se persista, el estado inicial viene sin el. `completeKycStep` devuelve
 * un estado fresco en CADA avance y hasta ahora se tiraba: el paso de pago
 * quedaba invisible hasta el final del flujo, aunque el link ya existiera.
 */
describe('el link de pago que aparece despues de cargar', () => {
  it('lo toma de la respuesta de step-complete y suma el paso de pago', async () => {
    // Con pasos por delante: al completar el contrato quedan `documents` y
    // `payment`, asi que el link llega a tiempo para entrar en la lista. (En el
    // ULTIMO paso no aplica: ahi el flujo llama a `cerrarKyc`, que consigue el
    // link por el veredicto.)
    mockKycSteps.mockReturnValue([
      { type: 'contract' }, { type: 'documents' }, { type: 'payment' },
    ] as never);
    // Sin prueba de titularidad `completeKycStep` ni se llama.
    window.localStorage.setItem('baldecash-dni-copia-home', '48509924');
    mockGetKycProgress.mockResolvedValue(state('contract', 0) as never);
    mockCompleteKycStep.mockResolvedValue({
      ...state('contract', 0),
      link_pago: 'https://zona.baldecash.com/magic/abc',
    } as never);

    render(<KycClient />);

    // Sin link, el contador arranca sin contar el pago.
    await waitFor(() => expect(screen.getByText(/Paso 1 de 2/)).toBeInTheDocument());

    const user = userEvent.setup();
    await screen.findByText('He leído y acepto el contrato');
    await user.click(screen.getByText('He leído y acepto el contrato'));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // El paso de pago entra en la lista sin pedir nada extra.
    await waitFor(() => expect(mockCompleteKycStep).toHaveBeenCalled());
    await waitFor(() => {
      const txt = document.body.textContent || '';
      expect(txt).toMatch(/Paso \d+ de 3/);
    });
  });

  it('sin link en la respuesta, nada cambia', async () => {
    mockKycSteps.mockReturnValue([{ type: 'contract' }, { type: 'payment' }] as never);
    mockGetKycProgress.mockResolvedValue(state('contract', 0) as never);
    mockCompleteKycStep.mockResolvedValue(state('contract', 0) as never);

    render(<KycClient />);

    await waitFor(() => expect(screen.getByText(/Paso 1 de 1/)).toBeInTheDocument());
    expect(screen.queryByText('Paga tu cuota inicial')).not.toBeInTheDocument();
  });
});
