import {
  getKycProgress,
  completeKycStep,
  pauseKyc,
  resumeKyc,
} from '../kycApi';

const okJson = (body: unknown) =>
  Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response);
const errJson = (status: number, body: unknown) =>
  Promise.resolve({ ok: false, status, json: () => Promise.resolve(body) } as Response);

const STATE = {
  application_code: 'APP-1',
  landing_slug: 'copia-home',
  steps: [{ type: 'dni_selfie', status: 'pending', completed_at: null }],
  next_step: 'dni_selfie',
  next_step_index: 0,
  is_complete: false,
  kyc_enabled: true,
  resume: { enabled: true, ttl_hours: 72 },
};

afterEach(() => jest.restoreAllMocks());

describe('getKycProgress', () => {
  it('devuelve el estado del API', async () => {
    global.fetch = jest.fn().mockReturnValue(okJson(STATE));
    await expect(getKycProgress('APP-1')).resolves.toEqual(STATE);
  });

  it('devuelve null ante error de red en vez de lanzar', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    await expect(getKycProgress('APP-1')).resolves.toBeNull();
  });
});

describe('completeKycStep', () => {
  it('manda document_number cuando se le pasa el DNI', async () => {
    const fetchMock = jest.fn().mockReturnValue(okJson(STATE));
    global.fetch = fetchMock;

    await completeKycStep({ applicationCode: 'APP-1', stepType: 'dni_selfie', documentNumber: '48509924' });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({
      application_code: 'APP-1',
      step_type: 'dni_selfie',
      document_number: '48509924',
    });
    expect(body.resume_token).toBeUndefined();
  });

  it('manda resume_token cuando se le pasa el token', async () => {
    const fetchMock = jest.fn().mockReturnValue(okJson(STATE));
    global.fetch = fetchMock;

    await completeKycStep({ applicationCode: 'APP-1', stepType: 'dni_selfie', resumeToken: 'TOK' });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.resume_token).toBe('TOK');
    expect(body.document_number).toBeUndefined();
  });

  it('nunca manda las dos pruebas juntas (el backend responde 422)', async () => {
    const fetchMock = jest.fn().mockReturnValue(okJson(STATE));
    global.fetch = fetchMock;

    await completeKycStep({
      applicationCode: 'APP-1', stepType: 'dni_selfie',
      documentNumber: '48509924', resumeToken: 'TOK',
    });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(Number(!!body.document_number) + Number(!!body.resume_token)).toBe(1);
  });
});

describe('pauseKyc', () => {
  it('devuelve el telefono enmascarado', async () => {
    global.fetch = jest.fn().mockReturnValue(
      okJson({ masked_phone: '***-***-777', expires_at: '2026-08-03T00:00:00', ttl_hours: 72 }),
    );
    await expect(pauseKyc({ applicationCode: 'APP-1', documentNumber: '48509924' }))
      .resolves.toMatchObject({ masked_phone: '***-***-777' });
  });

  it('propaga el reason del backend para que la UI distinga los casos', async () => {
    global.fetch = jest.fn().mockReturnValue(
      errJson(403, { detail: { reason: 'ownership_check_failed', message: 'No coincide.' } }),
    );
    await expect(pauseKyc({ applicationCode: 'APP-1', documentNumber: '00000000' }))
      .resolves.toMatchObject({ reason: 'ownership_check_failed' });
  });
});

// Fix final (minor): FastAPI devuelve los 422 de validación con `detail` como
// ARRAY de `{loc,msg,type}`. Como los arrays son `typeof 'object'`, caían en la
// rama de `{reason,message}` y salían como `reason:'unknown'` —
// indistinguibles de un 500. Ahora tienen reason propio.
describe('toError con detail de validación (array de FastAPI)', () => {
  const validationDetail = {
    detail: [{ loc: ['body', 'document_number'], msg: 'field required', type: 'value_error.missing' }],
  };

  it('pauseKyc: reason validation_error, no unknown', async () => {
    global.fetch = jest.fn().mockReturnValue(errJson(422, validationDetail));
    await expect(pauseKyc({ applicationCode: 'APP-1', documentNumber: '' }))
      .resolves.toMatchObject({ reason: 'validation_error' });
  });

  it('resumeKyc: mismo trato', async () => {
    global.fetch = jest.fn().mockReturnValue(errJson(422, validationDetail));
    const r = await resumeKyc('TOK');
    expect(r).toMatchObject({ reason: 'validation_error' });
    // El mensaje es accionable en español, nunca el `msg` técnico del backend.
    expect((r as { error: string }).error).not.toContain('field required');
  });

  it('un detail objeto sigue mandando su propio reason', async () => {
    global.fetch = jest.fn().mockReturnValue(
      errJson(410, { detail: { reason: 'expired', message: 'Este enlace expiró.' } }),
    );
    await expect(resumeKyc('TOK')).resolves.toMatchObject({ reason: 'expired' });
  });
});

describe('resumeKyc', () => {
  it('devuelve el estado con expires_at', async () => {
    global.fetch = jest.fn().mockReturnValue(okJson({ ...STATE, expires_at: '2026-08-03T00:00:00' }));
    await expect(resumeKyc('TOK')).resolves.toMatchObject({ next_step: 'dni_selfie' });
  });

  it('distingue un link vencido de uno invalido', async () => {
    global.fetch = jest.fn().mockReturnValue(
      errJson(410, { detail: { reason: 'expired', message: 'Este enlace expiró.' } }),
    );
    await expect(resumeKyc('TOK')).resolves.toMatchObject({ reason: 'expired' });
  });
});
