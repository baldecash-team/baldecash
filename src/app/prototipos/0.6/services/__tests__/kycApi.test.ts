import { compareFaces } from '../kycApi';

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
