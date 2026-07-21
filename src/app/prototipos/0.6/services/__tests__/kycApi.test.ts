import { compareFaces, getKycUploadUrl, uploadToS3 } from '../kycApi';

describe('compareFaces', () => {
  afterEach(() => { (global.fetch as jest.Mock)?.mockRestore?.(); });

  it('arma el body correcto y devuelve el resultado', async () => {
    const json = { success: true, is_match: true, similarity: 96.5, comparison_id: 7 };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => json }) as unknown as typeof fetch;
    const res = await compareFaces('selfie-b64', 'dni-b64', 42);
    expect(res.is_match).toBe(true);
    const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(opts.body);
    expect(body).toEqual({ source_image: 'selfie-b64', target_image: 'dni-b64', application_id: 42 });
  });

  it('incluye source_key/target_key cuando se pasan (Fase 2b, compare por URL)', async () => {
    const json = { success: true, is_match: true, similarity: 91.2 };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => json }) as unknown as typeof fetch;
    const res = await compareFaces('https://s3/selfie.jpg', 'https://s3/dni.jpg', undefined, {
      source_key: 'kyc/selfie.jpg',
      target_key: 'kyc/dni.jpg',
    });
    expect(res.is_match).toBe(true);
    const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(opts.body);
    expect(body).toEqual({
      source_image: 'https://s3/selfie.jpg',
      target_image: 'https://s3/dni.jpg',
      application_id: undefined,
      source_key: 'kyc/selfie.jpg',
      target_key: 'kyc/dni.jpg',
    });
  });

  it('fail-safe: error de red devuelve success:false', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    const res = await compareFaces('a', 'b');
    expect(res.success).toBe(false);
    expect(res.error).toBeTruthy();
  });

  it('fail-safe: HTTP 400 (error AWS) devuelve success:false con el error del backend', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false, status: 400,
      json: async () => ({ detail: { success: false, error: 'No se detectó un rostro...' } }),
    }) as unknown as typeof fetch;
    const res = await compareFaces('a', 'b');
    expect(res.success).toBe(false);
    expect(res.error).toContain('rostro');
  });
});

describe('getKycUploadUrl', () => {
  afterEach(() => { (global.fetch as jest.Mock)?.mockRestore?.(); });

  it('arma el body correcto y devuelve la upload url', async () => {
    const json = { upload_url: 'https://s3/put?sig=1', file_url: 'https://s3/file.jpg', key: 'kyc/abc.jpg' };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => json }) as unknown as typeof fetch;
    const res = await getKycUploadUrl('APP-123', 'selfie');
    expect(res).toEqual(json);
    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/public/kyc/upload-url');
    const body = JSON.parse(opts.body);
    expect(body).toEqual({ application_code: 'APP-123', kind: 'selfie', content_type: 'image/jpeg' });
  });

  it('respeta el content_type explícito', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ upload_url: 'u', file_url: 'f', key: 'k' }),
    }) as unknown as typeof fetch;
    await getKycUploadUrl('APP-123', 'dni', 'image/png');
    const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(opts.body);
    expect(body.content_type).toBe('image/png');
    expect(body.kind).toBe('dni');
  });

  it('fail-safe: HTTP no-OK devuelve null', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }) as unknown as typeof fetch;
    const res = await getKycUploadUrl('APP-123', 'selfie');
    expect(res).toBeNull();
  });

  it('fail-safe: error de red devuelve null', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    const res = await getKycUploadUrl('APP-123', 'selfie');
    expect(res).toBeNull();
  });
});

describe('uploadToS3', () => {
  afterEach(() => { (global.fetch as jest.Mock)?.mockRestore?.(); });

  it('hace PUT del blob a la url presignada y devuelve true en 2xx', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;
    const blob = new Blob(['fake-bytes'], { type: 'image/jpeg' });
    const res = await uploadToS3('https://s3/put?sig=1', blob);
    expect(res).toBe(true);
    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://s3/put?sig=1');
    expect(opts.method).toBe('PUT');
    expect(opts.body).toBe(blob);
    expect(opts.headers['Content-Type']).toBe('image/jpeg');
  });

  it('fail-safe: HTTP no-OK devuelve false', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;
    const res = await uploadToS3('https://s3/put', new Blob(['x']));
    expect(res).toBe(false);
  });

  it('fail-safe: error de red devuelve false', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    const res = await uploadToS3('https://s3/put', new Blob(['x']));
    expect(res).toBe(false);
  });
});
