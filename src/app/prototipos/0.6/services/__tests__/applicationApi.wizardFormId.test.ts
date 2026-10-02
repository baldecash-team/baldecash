/// <reference types="jest" />
/**
 * Formularios múltiples por landing: el submit tiene que decirle al backend
 * QUÉ formulario se le mostró a la persona (`wizard_form_id`), para que la
 * solicitud se guarde con ese formulario aunque el reparto cambie mientras la
 * persona todavía lo está llenando. Viaja dentro del JSON del campo
 * `form_data` del multipart, igual que `session_uuid` y `juicyscore_session_id`.
 */
import { submitApplication } from '../applicationApi';

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

const baseRequest = {
  session_uuid: 's-1',
  form_data: {},
  product_data: {},
} as unknown as Parameters<typeof submitApplication>[0];

/** Extrae y parsea el JSON que viajó en el campo `form_data` del FormData enviado. */
function leerFormDataEnviado(mock: jest.Mock): Record<string, unknown> {
  const body = mock.mock.calls[0][1].body as FormData;
  return JSON.parse(body.get('form_data') as string);
}

describe('submitApplication: wizard_form_id', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it('incluye wizard_form_id cuando se pasa', async () => {
    const mock = jest.fn().mockResolvedValue(ok({ success: true }));
    global.fetch = mock as unknown as typeof fetch;

    await submitApplication({ ...baseRequest, wizard_form_id: 42 });

    const sent = leerFormDataEnviado(mock);
    expect(sent.wizard_form_id).toBe(42);
  });

  it('no incluye la clave wizard_form_id cuando no se pasa', async () => {
    const mock = jest.fn().mockResolvedValue(ok({ success: true }));
    global.fetch = mock as unknown as typeof fetch;

    await submitApplication(baseRequest);

    const sent = leerFormDataEnviado(mock);
    expect('wizard_form_id' in sent).toBe(false);
  });
});
