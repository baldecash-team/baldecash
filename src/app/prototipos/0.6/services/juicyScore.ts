/**
 * JuicyScore — antifraude por dispositivo. Etapa 1 (frontend).
 *
 * El pixel `js.js` recolecta señales del dispositivo/navegador y emite un
 * `session_id`. Nosotros lo guardamos y lo mandamos junto con la solicitud; el
 * scoring real (GetScore) lo hace el backend server-to-server con ese id.
 * Referencia: "JuicyScore APIv17 Description", §2 Frontend configuration.
 *
 * Toda la integración está apagada mientras no exista
 * `NEXT_PUBLIC_JUICYSCORE_API_KEY`: sin token no se inyecta script, no se toca
 * `window` y el submit viaja exactamente igual que antes.
 */

/** Host de TEST. La doc separa entornos por dominio: jcsc.dev vs jcsc.online. */
const DEFAULT_HOST = 'https://sandbox.jcsc.dev';

/** id del <script> inyectado. Sirve de candado de idempotencia. */
export const JUICY_SCRIPT_ID = 'juicyscore-pixel';

/**
 * Tope para esperar a que el pixel publique su API en `window`. La doc
 * recomienda no pasar de 5s para la recolección de la sesión.
 */
const DEFAULT_API_WAIT_MS = 5000;

/** Intervalo del sondeo mientras esperamos que aparezca `window.juicyScoreApi`. */
const POLL_INTERVAL_MS = 100;

interface JuicyScoreApi {
  /** Resuelve apenas nace la sesión (script cargado). */
  getSessionId?: () => Promise<string>;
  /** Resuelve cuando ya hay data suficiente para scorear (2 transports). */
  getCompletedSessionId?: (timeoutMs: number) => Promise<unknown>;
  /** Regenera la sesión en SPAs que viven mucho sin recargar. */
  restart?: () => Promise<boolean>;
}

declare global {
  interface Window {
    juicyLabConfig?: Record<string, unknown>;
    juicyScoreApi?: JuicyScoreApi;
    jslabApi?: {
      manuallyComplete?: EventTarget;
      manuallyStopPing?: EventTarget;
    };
  }
}

export interface JuicyScoreConfig {
  apiKey: string;
  host: string;
}

/**
 * Lee la configuración de entorno. `null` significa "integración apagada", que
 * es el estado por defecto en local, en preview y en cualquier deploy sin token.
 */
export function getJuicyScoreConfig(): JuicyScoreConfig | null {
  const apiKey = (process.env.NEXT_PUBLIC_JUICYSCORE_API_KEY || '').trim();
  if (!apiKey) return null;

  const host = (process.env.NEXT_PUBLIC_JUICYSCORE_HOST || DEFAULT_HOST)
    .trim()
    .replace(/\/+$/, '');

  return { apiKey, host };
}

export function buildJuicyScriptUrl({ apiKey, host }: JuicyScoreConfig): string {
  const params = new URLSearchParams({
    apiKey,
    // Generación acelerada de sesión: la doc la recomienda para redes malas,
    // que es el escenario típico de nuestros postulantes en móvil.
    sessionGen: '1',
  });
  return `${host}/static/js.js?${params.toString()}`;
}

/**
 * Inyecta el pixel una sola vez por documento.
 *
 * No usamos `next/script` a propósito: `window.juicyLabConfig` tiene que existir
 * *antes* de que js.js ejecute, y con dos <Script> el orden no está garantizado.
 * Acá el orden es explícito, igual que en el snippet oficial de la doc.
 *
 * @returns true si el pixel quedó montado (o ya lo estaba).
 */
export function loadJuicyPixel(): boolean {
  if (typeof document === 'undefined') return false;

  const config = getJuicyScoreConfig();
  if (!config) return false;

  if (document.getElementById(JUICY_SCRIPT_ID)) return true;

  window.juicyLabConfig = {
    apiKey: config.apiKey,
    // Sin selectores de botones: la doc prohíbe selectores compuestos y los
    // botones del wizard cambian por paso. El fin del formulario se marca a
    // mano con markJuicyComplete().
    useTracer: false,
    scriptLoadRetries: 2,
    scriptParams: { sessionGen: '1' },
  };

  const script = document.createElement('script');
  script.id = JUICY_SCRIPT_ID;
  script.type = 'text/javascript';
  script.src = buildJuicyScriptUrl(config);
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.onerror = () => {
    // Adblocker o CDN caído. Se registra y se sigue: el wizard no depende de esto.
    console.warn('[JuicyScore] no se pudo cargar el pixel');
  };

  document.head.appendChild(script);
  return true;
}

// ── Persistencia del session_id ────────────────────────────────────────────

const getStorageKey = (landing: string) => `baldecash-${landing}-juicy-session`;

/**
 * `sessionStorage` tira excepción en WebKit sandboxeado (preview de links de
 * Apple Mail, modo privado con storage deshabilitado) aun con `window` definido.
 * Mismo blindaje que usa SessionContext con localStorage.
 */
function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage no disponible — se pierde el id, no la solicitud.
  }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // idem
  }
}

export function readJuicySessionId(landing: string): string | null {
  return safeGet(getStorageKey(landing)) || null;
}

export function clearJuicySessionId(landing: string): void {
  safeRemove(getStorageKey(landing));
}

// ── Captura de la sesión ───────────────────────────────────────────────────

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Espera a que js.js publique su API en `window`, sondeando hasta el timeout.
 */
async function waitForJuicyApi(timeoutMs: number): Promise<JuicyScoreApi | null> {
  if (typeof window === 'undefined') return null;

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (typeof window.juicyScoreApi?.getSessionId === 'function') {
      return window.juicyScoreApi;
    }
    await wait(POLL_INTERVAL_MS);
  }
  return typeof window.juicyScoreApi?.getSessionId === 'function'
    ? window.juicyScoreApi
    : null;
}

interface CaptureOptions {
  /** Cuánto esperar a que el pixel exista. Default 5s (recomendación de la doc). */
  timeoutMs?: number;
}

/**
 * Obtiene el `session_id` del pixel y lo persiste para la landing.
 *
 * Nunca lanza: cualquier fallo devuelve null y el flujo sigue sin JuicyScore.
 */
export async function captureJuicySessionId(
  landing: string,
  options: CaptureOptions = {}
): Promise<string | null> {
  const { timeoutMs = DEFAULT_API_WAIT_MS } = options;

  try {
    const api = await waitForJuicyApi(timeoutMs);
    if (!api?.getSessionId) return null;

    const sessionId = await api.getSessionId();
    if (typeof sessionId !== 'string' || !sessionId) return null;

    safeSet(getStorageKey(landing), sessionId);
    return sessionId;
  } catch {
    return null;
  }
}

/**
 * Espera (best-effort) a que se junte data suficiente para un scoring de calidad.
 * No bloquea nada: es solo una señal para diagnóstico.
 */
export async function waitForCompletedJuicySession(
  timeoutMs = DEFAULT_API_WAIT_MS
): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    const api = window.juicyScoreApi;
    if (!api?.getCompletedSessionId) return false;
    await api.getCompletedSessionId(timeoutMs);
    return true;
  } catch {
    return false;
  }
}

/**
 * Marca el formulario como completado (equivalente al `completeButton` de la
 * config, que no podemos usar con selectores dinámicos). APIv17 §2.1.4.
 */
export function markJuicyComplete(): void {
  try {
    window.jslabApi?.manuallyComplete?.dispatchEvent(new Event('click'));
  } catch {
    // El pixel no está cargado o el navegador no lo permite: irrelevante.
  }
}

/**
 * Arranca una sesión nueva tras enviar una solicitud.
 *
 * Sin esto, un usuario que llena una segunda solicitud en la misma pestaña
 * mandaría el `session_id` de la primera: el wizard se resetea pero el pixel no,
 * porque nunca hubo recarga de página. `restart()` es la vía que la doc da para
 * SPAs (APIv17 §2.2).
 */
export async function restartJuicySession(landing: string): Promise<string | null> {
  clearJuicySessionId(landing);
  try {
    if (typeof window === 'undefined') return null;
    const api = window.juicyScoreApi;
    if (!api?.restart) return null;
    await api.restart();
    return await captureJuicySessionId(landing);
  } catch {
    return null;
  }
}
