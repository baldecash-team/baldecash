/**
 * Cuándo y con qué uuid se pide el wizard (varios formularios por landing).
 *
 * El backend elige el formulario con un hash del uuid de la sesión, exista o
 * no la fila todavía. Por eso el wizard:
 *
 *   - no espera a la API de sesión: usa el uuid del contexto o, antes, el que
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

describe('WizardConfigProvider: pedido del wizard según la sesión', () => {
  it('con uuid en localStorage y sin uuid en el contexto, pide de inmediato con ese uuid', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-guardado');
    sesionMock.mockReturnValue(sesion(null));

    render(arbol());
    await asentar();

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-guardado');
    expect(wizard.config?.form_code).toBe('ucv:uuid-guardado');
  });

  it('cuando después llega (o cambia) el uuid del contexto, NO vuelve a pedir y config no cambia', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-guardado');
    sesionMock.mockReturnValue(sesion(null));

    const { rerender } = render(arbol());
    await asentar();
    const configInicial = wizard.config;
    expect(configInicial).not.toBeNull();

    sesionMock.mockReturnValue(sesion('uuid-guardado'));
    rerender(arbol());
    await asentar();

    // Aunque el uuid cambie de valor: el formulario mostrado no se toca.
    sesionMock.mockReturnValue(sesion('otro-uuid'));
    rerender(arbol());
    await avanzar(6000);

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(wizard.config).toBe(configInicial);
    expect(wizard.isLoading).toBe(false);
  });

  it('el respaldo de 5s no reemplaza un wizard ya pedido sin sesión cuando el uuid llega tarde', async () => {
    sesionMock.mockReturnValue(sesion(null));

    const { rerender } = render(arbol());
    await avanzar(5000);
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

  it('sin uuid: en cuanto initSession arranca y lo guarda, pide con él sin esperar a la API', async () => {
    sesionMock.mockReturnValue(sesion(null));

    const { rerender } = render(arbol());
    await asentar();
    expect(pedirWizard).not.toHaveBeenCalled();

    // Lo que hace `initSession` antes de llamar a la API: guarda el uuid y
    // marca `isCreating`. El uuid todavía no está en el contexto.
    localStorage.setItem(SESSION_KEY, 'uuid-recien-nacido');
    sesionMock.mockReturnValue(sesion(null, true));
    rerender(arbol());
    await asentar();

    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-recien-nacido');
  });

  it('respaldo de 5s: si el uuid nunca llega al contexto pero está en localStorage, lo usa', async () => {
    sesionMock.mockReturnValue(sesion(null));

    render(arbol());
    await avanzar(1000);
    // Aparece en storage sin que nada vuelva a renderizar al wizard.
    localStorage.setItem(SESSION_KEY, 'uuid-en-storage');

    await avanzar(3999);
    expect(pedirWizard).not.toHaveBeenCalled();

    await avanzar(1);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
    expect(pedirWizard).toHaveBeenCalledWith('ucv', null, 'uuid-en-storage');

    await avanzar(20000);
    expect(pedirWizard).toHaveBeenCalledTimes(1);
  });

  it('respaldo de 5s: sin uuid en ningún lado, pide sin sesión una sola vez', async () => {
    sesionMock.mockReturnValue(sesion(null));

    render(arbol());
    await avanzar(4999);
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
    sesionMock.mockReturnValue(sesion(null));

    const { rerender } = render(arbol('ucv'));
    await asentar();
    expect(pedirWizard).toHaveBeenCalledTimes(1);

    rerender(arbol('upn'));
    await asentar();

    expect(pedirWizard).toHaveBeenCalledTimes(2);
    expect(pedirWizard).toHaveBeenLastCalledWith('upn', null, 'uuid-upn');
    expect(wizard.config?.form_code).toBe('upn:uuid-upn');
  });

  it('si cambia el estado de preview, vuelve a pedir', async () => {
    localStorage.setItem(SESSION_KEY, 'uuid-guardado');
    sesionMock.mockReturnValue(sesion(null));
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

    // `initSession` arranca con el uuid nuevo.
    localStorage.setItem(SESSION_KEY, 'uuid-nuevo');
    sesionMock.mockReturnValue(sesion(null, true));
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
    // La API de sesión no responde nunca: el wizard no puede depender de ella.
    global.fetch = jest.fn(() => new Promise(() => {})) as unknown as typeof fetch;
  });

  it('navegador limpio: pide el wizard con el uuid que initSession guardó, sin esperar a la API', async () => {
    render(arbolReal());
    await asentar();

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
    await asentar();

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

  it('sin uuid en el contexto, usa el guardado', () => {
    expect(
      decidirPedidoDeWizard({ haySesionProvider: true, sessionUuid: null, uuidGuardado: 'guardado' }),
    ).toEqual({ pedir: true, uuid: 'guardado' });
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
