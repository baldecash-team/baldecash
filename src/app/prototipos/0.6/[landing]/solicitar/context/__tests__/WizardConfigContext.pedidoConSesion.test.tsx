/**
 * Cuándo y con qué uuid se pide el wizard (varios formularios por landing).
 *
 * El backend reparte el formulario y lo deja guardado en la fila de la
 * sesión; si la fila todavía no existe, sirve el sorteo por hash sin guardar
 * nada (BAL-4857). Por eso el wizard:
 *
 *   - espera a la API de sesión: pide con el uuid del contexto, que aparece
 *     cuando `initSession` terminó; si tarda más de 3s, pide con el uuid que
 *     `initSession` ya dejó en localStorage;
 *   - se pide UNA vez por formulario mostrado: que la sesión aparezca o cambie
 *     después no lo vuelve a pedir (cambiaría el formulario a mitad del
 *     llenado);
 *   - nunca genera el uuid ni lo escribe: eso es de `initSession`.
 */
import React from 'react';
import { act, render } from '@testing-library/react';
import {
  WizardConfigProvider,
  decidirPedidoDeWizard,
  useWizardConfig,
} from '../WizardConfigContext';
import { useSessionOptional } from '../SessionContext';
import { getWizardConfig, getWizardConfigById } from '../../../../services/wizardApi';

jest.mock('../../../../services/wizardApi', () => ({
  ...jest.requireActual('../../../../services/wizardApi'),
  getWizardConfig: jest.fn(),
  getWizardConfigById: jest.fn(),
}));

// Solo se simula el hook: `leerUuidDeSesionGuardado` y `sesionYaConvertida`
// son los reales, contra el localStorage de jsdom.
jest.mock('../SessionContext', () => ({
  ...jest.requireActual('../SessionContext'),
  useSessionOptional: jest.fn(),
}));

const previewMock = {
  isHydrated: true,
  landingId: null as number | null,
  previewKey: null as string | null,
  isPreviewingLanding: (_slug: string) => false,
};
jest.mock('../../../../context/PreviewContext', () => ({
  usePreview: () => previewMock,
}));

const pedirWizard = getWizardConfig as jest.Mock;
const pedirWizardPorId = getWizardConfigById as jest.Mock;
const sesionMock = useSessionOptional as jest.Mock;

const SESSION_KEY = 'baldecash-ucv-wizard-session-uuid';
const CONVERTED_KEY = 'baldecash-ucv-wizard-session-converted';

/** Lo único del contexto de sesión que mira el wizard. */
const sesion = (sessionUuid: string | null, isCreating = false) => ({ sessionUuid, isCreating });

let wizard: ReturnType<typeof useWizardConfig>;
function Sonda() {
  wizard = useWizardConfig();
  return null;
}

const arbol = (slug = 'ucv') => (
  <WizardConfigProvider slug={slug}>
    <Sonda />
  </WizardConfigProvider>
);

/** Deja resolver las promesas pendientes (la respuesta simulada del wizard). */
const asentar = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const avanzar = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
  await asentar();
};

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  previewMock.isHydrated = true;
  previewMock.landingId = null;
  previewMock.previewKey = null;
  previewMock.isPreviewingLanding = () => false;
  sesionMock.mockReset();
  pedirWizardPorId.mockReset();
  pedirWizard.mockReset();
  // Cada uuid recibe "su" formulario: así se nota si config cambia.
  pedirWizard.mockImplementation(async (slug: string, _key: unknown, uuid?: string | null) => ({
    steps: [],
    form_code: `${slug}:${uuid ?? 'principal'}`,
  }));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('WizardConfigProvider: equipo elegido para el reparto parejo del A/B', () => {
  it('con equipo elegido en localStorage, pide el wizard con su productId', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-guardado');
    localStorage.setItem('baldecash-ucv-solicitar-selected-product', JSON.stringify({ id: 518 }));
    sesionMock.mockReturnValue(sesion('uuid-guardado'));

    render(arbol());
    await asentar();

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-guardado', { productId: 518 });
  });

  it('con un equipo corrupto en localStorage, pide el wizard de siempre', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-guardado');
    localStorage.setItem('baldecash-ucv-solicitar-selected-product', '{no es json');
    sesionMock.mockReturnValue(sesion('uuid-guardado'));

    render(arbol());
    await asentar();

    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-guardado');
  });
});

describe('WizardConfigProvider: pedido del wizard según la sesión', () => {
  it('con uuid en localStorage pero la API de sesión sin terminar, NO pide todavía', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-guardado');
    sesionMock.mockReturnValue(sesion(null, true));

    render(arbol());
    await avanzar(2999);

    expect(pedirWizard).not.toHaveBeenCalled();
    expect(wizard.isLoading).toBe(true);
  });

  it('con el uuid en el contexto (la API de sesión terminó), pide de inmediato con ese uuid', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-guardado');
    sesionMock.mockReturnValue(sesion('uuid-guardado'));

    render(arbol());
    await asentar();

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-guardado');
    expect(wizard.config?.form_code).toBe('ucv:uuid-guardado');
  });

  it('cuando después cambia el uuid del contexto, NO vuelve a pedir y config no cambia', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-guardado');
    sesionMock.mockReturnValue(sesion('uuid-guardado'));

    const { rerender } = render(arbol());
    await asentar();
    const configInicial = wizard.config;
    expect(configInicial).not.toBeNull();

    // Aunque el uuid cambie de valor: el formulario mostrado no se toca.
    sesionMock.mockReturnValue(sesion('otro-uuid'));
    rerender(arbol());
    await avanzar(6000);

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(wizard.config).toBe(configInicial);
    expect(wizard.isLoading).toBe(false);
  });

  it('el respaldo de 3s no reemplaza un wizard ya pedido sin sesión cuando el uuid llega tarde', async () => {
    sesionMock.mockReturnValue(sesion(null));

    const { rerender } = render(arbol());
    await avanzar(3000);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
    const configInicial = wizard.config;

    sesionMock.mockReturnValue(sesion('uuid-tardio'));
    rerender(arbol());
    await avanzar(6000);

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(wizard.config).toBe(configInicial);
  });

  it('sin uuid en ningún lado no pide hasta que aparece en el contexto; ahí pide una vez con él', async () => {
    sesionMock.mockReturnValue(sesion(null));

    const { rerender } = render(arbol());
    await avanzar(1000);
    expect(pedirWizard).not.toHaveBeenCalled();
    expect(wizard.isLoading).toBe(true);

    sesionMock.mockReturnValue(sesion('uuid-contexto'));
    rerender(arbol());
    await avanzar(6000);

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-contexto');
  });

  it('sin uuid: espera a que la API de sesión termine aunque initSession ya lo haya guardado', async () => {
    sesionMock.mockReturnValue(sesion(null));

    const { rerender } = render(arbol());
    await asentar();
    expect(pedirWizard).not.toHaveBeenCalled();

    // Lo que hace `initSession` antes de llamar a la API: guarda el uuid y
    // marca `isCreating`. La fila de la sesión todavía no existe.
    localStorage.setItem(SESSION_KEY, 'uuid-recien-nacido');
    sesionMock.mockReturnValue(sesion(null, true));
    rerender(arbol());
    await asentar();
    expect(pedirWizard).not.toHaveBeenCalled();

    // La API respondió: el uuid llega al contexto.
    sesionMock.mockReturnValue(sesion('uuid-recien-nacido'));
    rerender(arbol());
    await asentar();

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-recien-nacido');
  });

  it('respaldo de 3s: si el uuid nunca llega al contexto pero está en localStorage, lo usa', async () => {
    sesionMock.mockReturnValue(sesion(null));

    render(arbol());
    await avanzar(1000);
    // Aparece en storage sin que nada vuelva a renderizar al wizard.
    localStorage.setItem(SESSION_KEY, 'uuid-en-storage');

    await avanzar(1999);
    expect(pedirWizard).not.toHaveBeenCalled();

    await avanzar(1);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-en-storage');

    await avanzar(20000);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
  });

  it('respaldo de 3s: sin uuid en ningún lado, pide sin sesión una sola vez', async () => {
    sesionMock.mockReturnValue(sesion(null));

    render(arbol());
    await avanzar(2999);
    expect(pedirWizard).not.toHaveBeenCalled();

    await avanzar(1);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, null);
    expect(wizard.config?.form_code).toBe('ucv:principal');

    await avanzar(20000);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
  });

  it('el wizard nunca genera ni escribe el uuid (eso es de initSession)', async () => {
    sesionMock.mockReturnValue(sesion(null));

    render(arbol());
    await avanzar(6000);

    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('sin provider de sesión, pide de inmediato sin sesión', async () => {
    sesionMock.mockReturnValue(undefined);

    render(arbol());
    await asentar();

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, null);

    await avanzar(6000);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
  });

  it('si cambia el slug, vuelve a pedir (con el uuid de esa landing)', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-ucv');
    localStorage.setItem('baldecash-upn-wizard-session-uuid', 'uuid-upn');
    sesionMock.mockReturnValue(sesion('uuid-ucv'));

    const { rerender } = render(arbol('ucv'));
    await asentar();
    expect(pedirWizard).toHaveBeenCalledTimes(1);

    sesionMock.mockReturnValue(sesion('uuid-upn'));
    rerender(arbol('upn'));
    await asentar();

    expect(pedirWizard).toHaveBeenCalledTimes(2);
    expect(pedirWizard).toHaveBeenLastCalledWith('upn', null, 'uuid-upn');
    expect(wizard.config?.form_code).toBe('upn:uuid-upn');
  });

  it('si cambia el estado de preview, vuelve a pedir', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-guardado');
    sesionMock.mockReturnValue(sesion('uuid-guardado'));
    pedirWizardPorId.mockResolvedValue({ steps: [], form_code: 'preview' });

    const { rerender } = render(arbol());
    await asentar();
    expect(pedirWizard).toHaveBeenCalledTimes(1);

    previewMock.isPreviewingLanding = () => true;
    previewMock.landingId = 217;
    previewMock.previewKey = 'clave';
    rerender(arbol());
    await asentar();

    expect(pedirWizardPorId).toHaveBeenCalledTimes(1);
    expect(pedirWizardPorId).toHaveBeenCalledWith(217, 'clave', 'uuid-guardado');
    expect(wizard.config?.form_code).toBe('preview');
  });

  it('sesión que ya envió una solicitud: espera al uuid nuevo en vez de pedir con el viejo', async () => {
    // Al montar, el layout de /solicitar va a soltar esta sesión: su effect
    // corre DESPUÉS del de este provider (el hijo va primero).
    localStorage.setItem(SESSION_KEY, 'uuid-viejo');
    localStorage.setItem(CONVERTED_KEY, 'uuid-viejo');
    sesionMock.mockReturnValue(sesion('uuid-viejo'));

    const { rerender } = render(arbol());
    await asentar();
    expect(pedirWizard).not.toHaveBeenCalled();

    // `renovarSesionSiConvertida`: suelta la marca, el uuid y el estado.
    localStorage.removeItem(CONVERTED_KEY);
    localStorage.removeItem(SESSION_KEY);
    sesionMock.mockReturnValue(sesion(null));
    rerender(arbol());
    await asentar();
    expect(pedirWizard).not.toHaveBeenCalled();

    // `initSession` arranca con el uuid nuevo: todavía no se pide.
    localStorage.setItem(SESSION_KEY, 'uuid-nuevo');
    sesionMock.mockReturnValue(sesion(null, true));
    rerender(arbol());
    await asentar();
    expect(pedirWizard).not.toHaveBeenCalled();

    // La API de sesión terminó.
    sesionMock.mockReturnValue(sesion('uuid-nuevo'));
    rerender(arbol());
    await asentar();

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-nuevo');
  });
});

describe('WizardConfigProvider con el SessionProvider real', () => {
  const real = jest.requireActual('../SessionContext') as typeof import('../SessionContext');

  /** Hace lo del layout de /solicitar: renovar la sesión convertida al montar. */
  function Renovador({ children }: { children: React.ReactNode }) {
    const s = real.useSessionOptional();
    React.useEffect(() => {
      s?.renovarSesionSiConvertida();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <>{children}</>;
  }

  const arbolReal = () => (
    <real.SessionProvider landingSlug="ucv">
      <Renovador>{arbol()}</Renovador>
    </real.SessionProvider>
  );

  beforeEach(() => {
    sesionMock.mockImplementation(real.useSessionOptional);
    // Por defecto la API de sesión no responde nunca: el wizard no puede
    // quedarse esperándola para siempre.
    global.fetch = jest.fn(() => new Promise(() => {})) as unknown as typeof fetch;
  });

  it('navegador limpio: espera a que la API de sesión responda y pide con su uuid', async () => {
    global.fetch = jest.fn(async (_url: unknown, init?: { body?: string }) => {
      const { uuid } = JSON.parse(init?.body ?? '{}');
      return { ok: true, json: async () => ({ session_uuid: uuid, session_id: 7 }) };
    }) as unknown as typeof fetch;

    render(arbolReal());
    for (let i = 0; i < 5; i++) await asentar();

    const uuid = localStorage.getItem(SESSION_KEY);
    expect(uuid).toBeTruthy();
    expect(global.fetch).toHaveBeenCalled();
    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, uuid);

    await avanzar(10000);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
  });

  it('navegador limpio con la API de sesión colgada: a los 3s pide con el uuid que initSession guardó', async () => {
    render(arbolReal());
    await asentar();
    expect(pedirWizard).not.toHaveBeenCalled();

    await avanzar(3000);

    const uuid = localStorage.getItem(SESSION_KEY);
    expect(uuid).toBeTruthy();
    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, uuid);

    await avanzar(10000);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
  });

  it('sesión ya convertida: el wizard se pide con el uuid de la sesión renovada, no con el viejo', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-viejo');
    localStorage.setItem(CONVERTED_KEY, 'uuid-viejo');

    render(arbolReal());
    await avanzar(3000);

    const uuid = localStorage.getItem(SESSION_KEY);
    expect(uuid).toBeTruthy();
    expect(uuid).not.toBe('uuid-viejo');
    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, uuid);
  });
});

describe('decidirPedidoDeWizard', () => {
  it('sin provider de sesión, pide ya y sin sesión', () => {
    expect(
      decidirPedidoDeWizard({ haySesionProvider: false, sessionUuid: null, uuidGuardado: 'x' }),
    ).toEqual({ pedir: true, uuid: null });
  });

  it('prefiere el uuid del contexto sobre el guardado', () => {
    expect(
      decidirPedidoDeWizard({ haySesionProvider: true, sessionUuid: 'ctx', uuidGuardado: 'guardado' }),
    ).toEqual({ pedir: true, uuid: 'ctx' });
  });

  it('sin uuid en el contexto, espera aunque haya uno guardado (la sesión puede no existir aún)', () => {
    expect(
      decidirPedidoDeWizard({ haySesionProvider: true, sessionUuid: null, uuidGuardado: 'guardado' }),
    ).toEqual({ pedir: false, uuid: null });
  });

  it('sin ningún uuid, espera', () => {
    expect(
      decidirPedidoDeWizard({ haySesionProvider: true, sessionUuid: null, uuidGuardado: null }),
    ).toEqual({ pedir: false, uuid: null });
  });

  it('con renovación pendiente, espera aunque haya uuid', () => {
    expect(
      decidirPedidoDeWizard({
        haySesionProvider: true,
        sessionUuid: 'viejo',
        uuidGuardado: 'viejo',
        renovacionPendiente: true,
      }),
    ).toEqual({ pedir: false, uuid: null });
  });

  it('con la espera agotada pide con el uuid que haya, o sin sesión', () => {
    expect(
      decidirPedidoDeWizard({
        haySesionProvider: true,
        sessionUuid: null,
        uuidGuardado: 'guardado',
        esperaAgotada: true,
      }),
    ).toEqual({ pedir: true, uuid: 'guardado' });
    expect(
      decidirPedidoDeWizard({
        haySesionProvider: true,
        sessionUuid: null,
        uuidGuardado: null,
        esperaAgotada: true,
      }),
    ).toEqual({ pedir: true, uuid: null });
  });
});
