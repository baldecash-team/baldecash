/**
 * La sesión viaja con el código de visitante en `fingerprint_hash`, para unir
 * las visitas de un mismo navegador (ver utils/visitorId.ts).
 */
import { render, waitFor } from '@testing-library/react';
import { SessionProvider } from '../SessionContext';
import { __resetPatchDedupe } from '@/app/prototipos/0.6/services/sessionApi';

const KEY = 'baldecash-visitor-id';

function llamadas(metodo: 'POST' | 'PATCH') {
  return (global.fetch as jest.Mock).mock.calls.filter(
    ([url, init]) =>
      String(url).includes('/tracking/session') && (init as RequestInit).method === metodo
  );
}

function payloadDeSesion(): Record<string, unknown> {
  return JSON.parse((llamadas('POST')[0][1] as RequestInit).body as string);
}

function respuestaDeSesion(recovered: boolean) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ session_uuid: 'u-1', session_id: 1, recovered }),
    })
  ) as unknown as typeof fetch;
}

function montar() {
  return render(
    <SessionProvider landingSlug="home">
      <div />
    </SessionProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  __resetPatchDedupe();
});

describe('código de visitante en la sesión', () => {
  it('manda el código guardado del navegador en fingerprint_hash', async () => {
    window.localStorage.setItem(KEY, 'codigo-del-lunes');
    respuestaDeSesion(false);

    montar();

    await waitFor(() => expect(llamadas('POST')).toHaveLength(1));
    expect(payloadDeSesion().fingerprint_hash).toBe('codigo-del-lunes');
  });

  it('en la primera visita crea el código y lo manda', async () => {
    respuestaDeSesion(false);

    montar();

    await waitFor(() => expect(llamadas('POST')).toHaveLength(1));
    const codigo = window.localStorage.getItem(KEY);
    expect(codigo).toBeTruthy();
    expect(payloadDeSesion().fingerprint_hash).toBe(codigo);
  });

  it('sesión nueva: no hace PATCH, el código ya fue en el POST', async () => {
    respuestaDeSesion(false);

    montar();

    await waitFor(() => expect(llamadas('POST')).toHaveLength(1));
    expect(llamadas('PATCH')).toHaveLength(0);
  });

  it('sesión recuperada: completa el código por PATCH, porque el POST no lo rellena', async () => {
    window.localStorage.setItem(KEY, 'codigo-del-lunes');
    respuestaDeSesion(true);

    montar();

    await waitFor(() => expect(llamadas('PATCH')).toHaveLength(1));
    const [url, init] = llamadas('PATCH')[0];
    expect(String(url)).toContain('/public/tracking/session/u-1');
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      fingerprint_hash: 'codigo-del-lunes',
    });
  });
});
