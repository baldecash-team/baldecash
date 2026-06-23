/**
 * Helpers para invalidar el estado de acceso del gate de locker-truck.
 *
 * El gate de locker-truck (LockertruckOverlayGate en [landing]/layout.tsx) NO
 * usa el token VIP para conceder acceso: se apoya en dos señales propias:
 *   - eval cache (localStorage): `baldecash-lockertruck-eval-<slug>`
 *   - gate pass  (sessionStorage): `baldecash-gate-pass-<slug>`
 *
 * Cuando se limpia la sesión VIP (clearVipData) hay que limpiar TAMBIÉN estas
 * señales. Si no, queda una desincronización: el gate sigue admitiendo al
 * usuario (porque el eval cache persiste 7 días) pero la API responde 403 al
 * faltar el token VIP, y handleVip403 recarga en loop infinito.
 *
 * IMPORTANTE: estas keys deben coincidir con `getEvalCacheKey()` y la key de
 * gate-pass (`baldecash-gate-pass-<slug>`) definidas en
 * src/app/prototipos/0.6/[landing]/layout.tsx.
 */
const EVAL_TTL_MS = 24 * 60 * 60 * 1000;

export function hasLockertruckEvalCache(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(`baldecash-lockertruck-eval-${slug}`);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return typeof parsed.ts === 'number' && Date.now() - parsed.ts < EVAL_TTL_MS;
  } catch {
    return false;
  }
}

export function clearLockertruckGate(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`baldecash-lockertruck-eval-${slug}`);
    sessionStorage.removeItem(`baldecash-gate-pass-${slug}`);
  } catch {
    // Silently fail (storage no disponible / modo privado)
  }
}
