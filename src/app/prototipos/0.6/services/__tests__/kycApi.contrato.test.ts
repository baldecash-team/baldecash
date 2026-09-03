/// <reference types="jest" />
/**
 * El contrato de datos del paso de firma.
 *
 * Lo que se protege: que una respuesta de un backend viejo (sin `modo`) no
 * rompa el paso, y que el 409 de `step-complete` se distinga de un fallo de
 * red — uno significa "recargá el contrato" y el otro "reintentá".
 */
import { getContrato, completeKycStep } from '../kycApi';

const okJson = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) } as Response);

describe('getContrato', () => {
  beforeEach(() => { global.fetch = jest.fn(); });

  it('devuelve el contrato listo tal cual', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({
      modo: 'aceptacion', estado: 'listo', disponible: true,
      url: 'https://s3/c.pdf', hash: 'a'.repeat(64), external_id: 'kyc-1',
    }));

    const r = await getContrato({ applicationCode: 'APP-1', documentNumber: '70020010' });

    expect(r).toMatchObject({ modo: 'aceptacion', estado: 'listo', hash: 'a'.repeat(64) });
  });

  it('propaga el motivo del error', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({
      modo: 'aceptacion', estado: 'error', motivo: 'sin_registro', disponible: false,
    }));

    const r = await getContrato({ applicationCode: 'APP-1', documentNumber: '7' });

    expect(r).toMatchObject({ estado: 'error', motivo: 'sin_registro' });
  });

  it('manda el DNI o el token, nunca los dos', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ modo: 'emitido', estado: 'generando', disponible: false }));

    await getContrato({ applicationCode: 'APP-1', documentNumber: '70020010', resumeToken: 'TOK' });

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('resume_token=TOK');
    expect(url).not.toContain('document_number');
  });

  it('pide el reintento cuando se lo piden', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ modo: 'aceptacion', estado: 'generando', disponible: false }));

    await getContrato({ applicationCode: 'APP-1', documentNumber: '7', reintentar: true });

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('reintentar=1');
  });

  it('adapta una respuesta vieja sin modo ni estado', async () => {
    // Backend anterior a este cambio: solo `disponible` + `html`.
    (global.fetch as jest.Mock).mockReturnValue(okJson({ disponible: true, html: '<p>Contrato</p>' }));

    const r = await getContrato({ applicationCode: 'APP-1', documentNumber: '7' });

    expect(r).toMatchObject({ modo: 'emitido', estado: 'listo', html: '<p>Contrato</p>' });
  });

  it('un disponible false sin estado es generando', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ disponible: false }));
    expect(await getContrato({ applicationCode: 'A', documentNumber: '7' })).toMatchObject({
      modo: 'emitido', estado: 'generando',
    });
  });

  it('ante error de red devuelve null', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));
    expect(await getContrato({ applicationCode: 'A', documentNumber: '7' })).toBeNull();
  });
});

describe('completeKycStep', () => {
  beforeEach(() => { global.fetch = jest.fn(); });

  it('manda el hash del contrato aceptado', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ is_complete: false }));

    await completeKycStep({
      applicationCode: 'APP-1', stepType: 'contract',
      documentNumber: '70020010', contractHash: 'b'.repeat(64),
    });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.contract_hash).toBe('b'.repeat(64));
  });

  it('sin hash no manda el campo', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ is_complete: false }));

    await completeKycStep({ applicationCode: 'APP-1', stepType: 'dni_selfie', documentNumber: '7' });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect('contract_hash' in body).toBe(false);
  });

  it('el 409 se distingue de un fallo', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      okJson({ detail: { reason: 'contract_outdated' } }, 409));

    const r = await completeKycStep({
      applicationCode: 'APP-1', stepType: 'contract', documentNumber: '7', contractHash: 'x',
    });

    expect(r).toEqual({ state: null, outdated: true });
  });

  it('un 500 no es outdated', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({}, 500));
    expect(await completeKycStep({ applicationCode: 'A', stepType: 'contract', documentNumber: '7' }))
      .toEqual({ state: null, outdated: false });
  });

  it('el estado vuelve envuelto', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ is_complete: true, steps: [] }));
    const r = await completeKycStep({ applicationCode: 'A', stepType: 'contract', documentNumber: '7' });
    expect(r.outdated).toBe(false);
    expect(r.state).toMatchObject({ is_complete: true });
  });
});
