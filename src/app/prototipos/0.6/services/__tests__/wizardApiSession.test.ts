/**
 * Formularios múltiples por landing: el backend sirve el formulario que le
 * tocó a la sesión cuando la web le manda `session_uuid`. Sin sesión, sigue
 * respondiendo el formulario principal de siempre.
 */
import { getWizardConfig, getWizardConfigById } from '../wizardApi';

const conFetch = () => {
  const mock = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ steps: [], form_id: 19 }) });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
};

describe('wizard con varios formularios por landing', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('manda el uuid de la sesión para que el backend sirva su formulario', async () => {
    const mock = conFetch();
    await getWizardConfig('prueba-formulario', null, 'uuid-123');
    expect(String(mock.mock.calls[0][0])).toContain('session_uuid=uuid-123');
  });

  it('con sesión no cachea: dos sesiones pueden tener formularios distintos', async () => {
    const mock = conFetch();
    await getWizardConfig('prueba-formulario', null, 'uuid-123');
    expect(mock.mock.calls[0][1]).toMatchObject({ cache: 'no-store' });
  });

  it('sin sesión pide como siempre', async () => {
    const mock = conFetch();
    await getWizardConfig('prueba-formulario');
    expect(String(mock.mock.calls[0][0])).not.toContain('session_uuid');
  });

  it('en preview por id también manda la sesión', async () => {
    const mock = conFetch();
    await getWizardConfigById(217, 'clave', 'uuid-123');
    const url = String(mock.mock.calls[0][0]);
    expect(url).toContain('preview_key=clave');
    expect(url).toContain('session_uuid=uuid-123');
  });

  it("en vista previa del borrador manda form_id y draft", async () => {
    const mock = conFetch();
    await getWizardConfigById(217, "clave", "uuid-123", { formId: 19, borrador: true });
    const url = String(mock.mock.calls[0][0]);
    expect(url).toContain("form_id=19");
    expect(url).toContain("draft=1");
  });

  it("por slug con llave también manda form_id y draft", async () => {
    const mock = conFetch();
    await getWizardConfig("prueba-formulario", "clave", null, { formId: 19, borrador: true });
    const url = String(mock.mock.calls[0][0]);
    expect(url).toContain("form_id=19");
    expect(url).toContain("draft=1");
  });

  it("sin llave no manda form_id ni draft", async () => {
    const mock = conFetch();
    await getWizardConfig("prueba-formulario", null, null, { formId: 19, borrador: true });
    const url = String(mock.mock.calls[0][0]);
    expect(url).not.toContain("form_id");
    expect(url).not.toContain("draft");
  });
});
