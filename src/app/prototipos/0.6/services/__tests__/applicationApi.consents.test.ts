/// <reference types="jest" />
/**
 * BAL-5007: el bloque `consents` viaja en la RAÍZ del JSON del campo
 * `form_data` del multipart, al lado de `session_uuid` — no adentro del
 * `form_data` del wizard. Es lo que parsea ws2.
 */
import { submitApplication } from '../applicationApi';

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

const baseRequest = {
  session_uuid: 's-1',
  form_data: { nombres: 'Ana' },
  product_data: {},
} as unknown as Parameters<typeof submitApplication>[0];

function leerFormDataEnviado(mock: jest.Mock): Record<string, unknown> {
  const body = mock.mock.calls[0][1].body as FormData;
  return JSON.parse(body.get('form_data') as string);
}

describe('submitApplication: consents', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it('va en la raíz del JSON, con promos en false tal cual', async () => {
    const mock = jest.fn().mockResolvedValue(ok({ success: true }));
    global.fetch = mock as unknown as typeof fetch;

    await submitApplication({
      ...baseRequest,
      consents: { terms: true, privacy: true, promos: false },
    });

    const sent = leerFormDataEnviado(mock);
    expect(sent.consents).toEqual({ terms: true, privacy: true, promos: false });
    expect(sent.form_data).toEqual({ nombres: 'Ana' });
  });

  it('sin dato no manda la clave', async () => {
    const mock = jest.fn().mockResolvedValue(ok({ success: true }));
    global.fetch = mock as unknown as typeof fetch;

    await submitApplication(baseRequest);

    const sent = leerFormDataEnviado(mock);
    expect('consents' in sent).toBe(false);
  });
});
