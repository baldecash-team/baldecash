import { config } from '../config';

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; reason?: string } };

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(`${config.apiBaseUrl}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', ...init.headers },
    });
    if (!res.ok) {
      const text = await res.text();
      const error: { code: string; message: string; reason?: string } = {
        code: `http_${res.status}`,
        message: text,
      };
      try {
        const parsed = JSON.parse(text);
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.detail &&
          typeof parsed.detail === 'object' &&
          typeof parsed.detail.message === 'string'
        ) {
          error.message = parsed.detail.message;
          if (typeof parsed.detail.reason === 'string') {
            error.reason = parsed.detail.reason;
          }
        }
      } catch {
        // not valid JSON — keep raw text as message
      }
      return { ok: false, error };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (e) {
    return { ok: false, error: { code: 'network', message: String(e) } };
  } finally {
    clearTimeout(t);
  }
}
