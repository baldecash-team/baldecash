/**
 * `os_version` real vía User-Agent Client Hints.
 *
 * Los navegadores congelaron la versión del sistema dentro del user agent, así
 * que hoy la sesión guarda "Android 10" para casi cualquier Android moderno y
 * "Windows 10" para Windows 11: el campo se ve normal y miente. La versión
 * verdadera solo llega si se pide por Client Hints.
 */
import { render, waitFor } from '@testing-library/react';
import { SessionProvider } from '../SessionContext';

type NavegadorConHints = Navigator & {
  userAgentData?: {
    platform?: string;
    getHighEntropyValues: (hints: string[]) => Promise<Record<string, unknown>>;
  };
};

function payloadDeSesion(): Record<string, unknown> {
  const llamada = (global.fetch as jest.Mock).mock.calls.find(([url]) =>
    String(url).includes('/tracking/session')
  );
  return JSON.parse((llamada?.[1] as RequestInit).body as string);
}

function conClientHints(values: Record<string, unknown> | null) {
  const nav = navigator as NavegadorConHints;
  if (values === null) {
    delete nav.userAgentData;
    return;
  }
  nav.userAgentData = {
    platform: values.platform as string | undefined,
    getHighEntropyValues: jest.fn().mockResolvedValue(values),
  };
}

describe('os_version de la sesión', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ session_uuid: 'u', session_id: 1 }),
      })
    ) as unknown as typeof fetch;
    window.localStorage.clear();
  });

  afterEach(() => {
    conClientHints(null);
  });

  it('manda la versión comercial de Windows, no la congelada del user agent', async () => {
    conClientHints({ platform: 'Windows', platformVersion: '15.0.0' });

    render(
      <SessionProvider landingSlug="home">
        <div />
      </SessionProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(payloadDeSesion().os_version).toBe('11');
  });

  it('manda la versión real de Android', async () => {
    conClientHints({ platform: 'Android', platformVersion: '16.0.0' });

    render(
      <SessionProvider landingSlug="home">
        <div />
      </SessionProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(payloadDeSesion().os_version).toBe('16.0.0');
  });

  it('sin Client Hints (Safari) cae al user agent y sigue creando la sesión', async () => {
    conClientHints(null);

    render(
      <SessionProvider landingSlug="home">
        <div />
      </SessionProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const payload = payloadDeSesion();
    expect(payload.landing_slug).toBe('home');
    expect(payload).toHaveProperty('os_version');
  });
});
