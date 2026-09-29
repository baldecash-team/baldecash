/**
 * Tests de la capa JuicyScore (etapa 1: frontend).
 *
 * Reglas que se cubren acá:
 * - Sin `NEXT_PUBLIC_JUICYSCORE_API_KEY` la integración es un no-op total: no se
 *   inyecta script, no se toca `window`, no se manda nada en el submit. Es lo que
 *   permite mergear esto sin token configurado.
 * - Nada de JuicyScore puede tumbar el wizard: si el script no carga (adblocker,
 *   caída del CDN) o la promesa se rechaza, la solicitud se envía igual.
 */

const scope = {
  setLevel: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
};
jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn((cb: (s: typeof scope) => void) => cb(scope)),
  captureMessage: jest.fn(),
}));

import * as Sentry from '@sentry/nextjs';
import {
  getJuicyScoreConfig,
  buildJuicyScriptUrl,
  loadJuicyPixel,
  captureJuicySessionId,
  readJuicySessionId,
  clearJuicySessionId,
  markJuicyComplete,
  restartJuicySession,
  resolveJuicySessionIdForSubmit,
  _resetJuicyPixelState,
  JUICY_SCRIPT_ID,
} from './juicyScore';

const API_KEY_ENV = 'NEXT_PUBLIC_JUICYSCORE_API_KEY';
const HOST_ENV = 'NEXT_PUBLIC_JUICYSCORE_HOST';

function resetDom() {
  document.getElementById(JUICY_SCRIPT_ID)?.remove();
  delete window.juicyLabConfig;
  delete window.juicyScoreApi;
  delete window.jslabApi;
  window.sessionStorage.clear();
  _resetJuicyPixelState();
}

describe('getJuicyScoreConfig', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env[API_KEY_ENV] = original[API_KEY_ENV];
    process.env[HOST_ENV] = original[HOST_ENV];
  });

  it('devuelve null cuando no hay apiKey configurado', () => {
    delete process.env[API_KEY_ENV];
    expect(getJuicyScoreConfig()).toBeNull();
  });

  it('devuelve null cuando el apiKey es solo espacios', () => {
    process.env[API_KEY_ENV] = '   ';
    expect(getJuicyScoreConfig()).toBeNull();
  });

  it('cae al host de test cuando no se especifica uno', () => {
    process.env[API_KEY_ENV] = 'test-key-0123456789012345678';
    delete process.env[HOST_ENV];
    expect(getJuicyScoreConfig()).toEqual({
      apiKey: 'test-key-0123456789012345678',
      host: 'https://sandbox.jcsc.dev',
    });
  });

  it('normaliza el host quitando el slash final', () => {
    process.env[API_KEY_ENV] = 'prod-key-012345678901234';
    process.env[HOST_ENV] = 'https://score.jcsc.online/';
    expect(getJuicyScoreConfig()?.host).toBe('https://score.jcsc.online');
  });
});

describe('buildJuicyScriptUrl', () => {
  it('arma la URL de js.js con apiKey y sessionGen', () => {
    const url = buildJuicyScriptUrl({
      apiKey: 'abc123',
      host: 'https://sandbox.jcsc.dev',
    });
    expect(url).toBe('https://sandbox.jcsc.dev/static/js.js?apiKey=abc123&sessionGen=1');
  });
});

describe('loadJuicyPixel', () => {
  const original = process.env[API_KEY_ENV];

  beforeEach(resetDom);
  afterEach(() => {
    process.env[API_KEY_ENV] = original;
    resetDom();
  });

  it('no inyecta nada cuando falta el apiKey', () => {
    delete process.env[API_KEY_ENV];
    expect(loadJuicyPixel()).toBe(false);
    expect(document.getElementById(JUICY_SCRIPT_ID)).toBeNull();
    expect(window.juicyLabConfig).toBeUndefined();
  });

  it('inyecta el script y publica juicyLabConfig con el apiKey', () => {
    process.env[API_KEY_ENV] = 'test-key-0123456789012345678';
    expect(loadJuicyPixel()).toBe(true);

    const script = document.getElementById(JUICY_SCRIPT_ID) as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.src).toContain('/static/js.js?apiKey=test-key-0123456789012345678');
    expect(script?.async).toBe(true);
    expect(window.juicyLabConfig).toEqual(
      expect.objectContaining({ apiKey: 'test-key-0123456789012345678' })
    );
  });

  // React monta dos veces en StrictMode y el layout del wizard se re-renderiza
  // en cada paso: dos js.js en la página generarían dos sesiones distintas.
  it('es idempotente: no duplica el script en montajes repetidos', () => {
    process.env[API_KEY_ENV] = 'test-key-0123456789012345678';
    loadJuicyPixel();
    loadJuicyPixel();
    expect(document.querySelectorAll(`#${JUICY_SCRIPT_ID}`)).toHaveLength(1);
  });
});

describe('captureJuicySessionId', () => {
  beforeEach(resetDom);
  afterEach(resetDom);

  it('guarda el session_id que emite el pixel', async () => {
    window.juicyScoreApi = {
      getSessionId: () => Promise.resolve('w.20260813-abc.A_GS'),
    };

    const id = await captureJuicySessionId('copia-home', { timeoutMs: 200 });

    expect(id).toBe('w.20260813-abc.A_GS');
    expect(readJuicySessionId('copia-home')).toBe('w.20260813-abc.A_GS');
  });

  it('aísla el session_id por landing', async () => {
    window.juicyScoreApi = { getSessionId: () => Promise.resolve('sesion-A') };
    await captureJuicySessionId('senati', { timeoutMs: 200 });

    expect(readJuicySessionId('senati')).toBe('sesion-A');
    expect(readJuicySessionId('otra-landing')).toBeNull();
  });

  // Adblocker, CDN caído, red del usuario: el pixel nunca aparece en window.
  it('devuelve null sin colgarse cuando el script nunca carga', async () => {
    const id = await captureJuicySessionId('copia-home', { timeoutMs: 100 });
    expect(id).toBeNull();
    expect(readJuicySessionId('copia-home')).toBeNull();
  });

  it('devuelve null cuando getSessionId se rechaza', async () => {
    window.juicyScoreApi = {
      getSessionId: () => Promise.reject(new Error('boom')),
    };
    await expect(captureJuicySessionId('copia-home', { timeoutMs: 200 })).resolves.toBeNull();
  });

  it('ignora un session_id vacío', async () => {
    window.juicyScoreApi = { getSessionId: () => Promise.resolve('') };
    await expect(captureJuicySessionId('copia-home', { timeoutMs: 200 })).resolves.toBeNull();
  });
});

describe('readJuicySessionId / clearJuicySessionId', () => {
  beforeEach(resetDom);
  afterEach(resetDom);

  it('devuelve null cuando no hay nada guardado', () => {
    expect(readJuicySessionId('copia-home')).toBeNull();
  });

  it('borra solo la landing indicada', async () => {
    window.juicyScoreApi = { getSessionId: () => Promise.resolve('sesion-A') };
    await captureJuicySessionId('copia-home', { timeoutMs: 200 });

    clearJuicySessionId('copia-home');
    expect(readJuicySessionId('copia-home')).toBeNull();
  });
});

describe('markJuicyComplete', () => {
  beforeEach(resetDom);
  afterEach(resetDom);

  /**
   * La doc pide marcar el fin del formulario con `completeButton`, pero prohíbe
   * selectores compuestos y nuestros botones cambian por paso. La vía soportada
   * para SPAs es emular el click sobre `jslabApi.manuallyComplete` (APIv17 §2.1.4).
   */
  it('emula el click de completado sobre jslabApi', () => {
    const target = new EventTarget();
    const listener = jest.fn();
    target.addEventListener('click', listener);
    window.jslabApi = { manuallyComplete: target };

    markJuicyComplete();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('no explota cuando el pixel no está cargado', () => {
    expect(() => markJuicyComplete()).not.toThrow();
  });
});

describe('restartJuicySession', () => {
  beforeEach(resetDom);
  afterEach(resetDom);

  /**
   * El wizard se resetea al enviar, pero el pixel no: sin recarga de página, una
   * segunda solicitud en la misma pestaña reutilizaría el session_id de la primera.
   */
  it('descarta la sesión anterior y guarda la nueva', async () => {
    let current = 'sesion-1';
    window.juicyScoreApi = {
      getSessionId: () => Promise.resolve(current),
      restart: () => {
        current = 'sesion-2';
        return Promise.resolve(true);
      },
    };
    await captureJuicySessionId('copia-home', { timeoutMs: 200 });
    expect(readJuicySessionId('copia-home')).toBe('sesion-1');

    const next = await restartJuicySession('copia-home');

    expect(next).toBe('sesion-2');
    expect(readJuicySessionId('copia-home')).toBe('sesion-2');
  });

  it('deja la sesión limpia cuando el pixel no está cargado', async () => {
    window.juicyScoreApi = { getSessionId: () => Promise.resolve('sesion-1') };
    await captureJuicySessionId('copia-home', { timeoutMs: 200 });
    delete window.juicyScoreApi;

    await expect(restartJuicySession('copia-home')).resolves.toBeNull();
    expect(readJuicySessionId('copia-home')).toBeNull();
  });
});

describe('resolveJuicySessionIdForSubmit', () => {
  const original = process.env[API_KEY_ENV];

  beforeEach(() => {
    resetDom();
    jest.clearAllMocks();
    process.env[API_KEY_ENV] = 'test-key-0123456789012345678';
  });
  afterEach(() => {
    process.env[API_KEY_ENV] = original;
    resetDom();
  });

  function tagsReportados(): Record<string, string> {
    return Object.fromEntries(scope.setTag.mock.calls as [string, string][]);
  }

  it('sin integración configurada no hace nada', async () => {
    delete process.env[API_KEY_ENV];
    await expect(resolveJuicySessionIdForSubmit('copia-home', { timeoutMs: 50 })).resolves.toBeNull();
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('usa el id capturado al montar sin reportar nada', async () => {
    window.juicyScoreApi = { getSessionId: () => Promise.resolve('sesion-A') };
    await captureJuicySessionId('copia-home', { timeoutMs: 200 });

    await expect(resolveJuicySessionIdForSubmit('copia-home')).resolves.toBe('sesion-A');
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  // El caso que perdíamos: js.js tardó más que la ventana de 5s del montaje y
  // publicó su API después. Al enviar se pide de nuevo.
  it('recupera el id de un pixel que cargó tarde y lo reporta como recuperado', async () => {
    loadJuicyPixel();
    window.juicyScoreApi = { getSessionId: () => Promise.resolve('sesion-tardia') };

    await expect(resolveJuicySessionIdForSubmit('copia-home', { timeoutMs: 200 })).resolves.toBe(
      'sesion-tardia'
    );
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'juicyscore: session_id recuperado al enviar (script_loading)'
    );
    expect(tagsReportados()).toEqual(
      expect.objectContaining({ modulo: 'juicyscore-pixel', recuperado: 'true' })
    );
  });

  it('reporta script_error cuando el <script> no cargó', async () => {
    loadJuicyPixel();
    const script = document.getElementById(JUICY_SCRIPT_ID) as HTMLScriptElement;
    script.onerror?.(new Event('error'));

    await expect(resolveJuicySessionIdForSubmit('copia-home', { timeoutMs: 100 })).resolves.toBeNull();
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'juicyscore: solicitud sin session_id (script_error)'
    );
    expect(tagsReportados()).toEqual(expect.objectContaining({ recuperado: 'false' }));
  });

  it('reporta api_missing cuando el script cargó pero no publicó su API', async () => {
    loadJuicyPixel();
    const script = document.getElementById(JUICY_SCRIPT_ID) as HTMLScriptElement;
    script.onload?.(new Event('load'));

    await resolveJuicySessionIdForSubmit('copia-home', { timeoutMs: 100 });
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'juicyscore: solicitud sin session_id (api_missing)'
    );
  });

  // getSessionId no trae timeout propio: si se cuelga, el submit no puede
  // quedarse esperando para siempre.
  it('no cuelga el envío cuando getSessionId nunca resuelve', async () => {
    loadJuicyPixel();
    const script = document.getElementById(JUICY_SCRIPT_ID) as HTMLScriptElement;
    script.onload?.(new Event('load'));
    window.juicyScoreApi = { getSessionId: () => new Promise<string>(() => {}) };

    await expect(resolveJuicySessionIdForSubmit('copia-home', { timeoutMs: 100 })).resolves.toBeNull();
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'juicyscore: solicitud sin session_id (no_session_id)'
    );
  });

  it('nunca lanza aunque Sentry falle', async () => {
    (Sentry.withScope as jest.Mock).mockImplementationOnce(() => {
      throw new Error('sentry caído');
    });
    await expect(resolveJuicySessionIdForSubmit('copia-home', { timeoutMs: 50 })).resolves.toBeNull();
  });
});
