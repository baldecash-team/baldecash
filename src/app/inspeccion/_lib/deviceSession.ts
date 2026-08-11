'use client';

/**
 * Identidad del dispositivo dentro de una estación de inspección.
 *
 * El teléfono se vincula una sola vez abriendo una URL con un código; a partir
 * de ahí la sesión vive en localStorage. No hay login por sesión: los teléfonos
 * son dispositivos permanentes de la estación.
 *
 * Las cuatro funciones tratan "sin `window`" (SSR/Server Component) como
 * "sin sesión": las lecturas devuelven null, las escrituras son no-op. Ninguna
 * lanza — hoy nada las llama desde el servidor, pero el módulo es lo bastante
 * chico como para no dejar esa guarda como deuda para quien lo importe después.
 */
const STORAGE_KEY = 'inspeccion.device';
const DEVICE_ID_KEY = 'inspeccion.deviceId';

export type DeviceKind = 'escaner' | 'camara';

export interface DeviceSession {
  deviceId: string;
  token: string;
  stationId: string;
  kind: DeviceKind;
  label: string | null;
}

export function getDeviceSession(): DeviceSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeviceSession;
    if (!parsed?.deviceId || !parsed?.token || !parsed?.stationId) return null;
    return parsed;
  } catch {
    // localStorage corrupto o bloqueado: se trata como "no vinculado".
    return null;
  }
}

export function setDeviceSession(session: DeviceSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearDeviceSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function generateDeviceId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/**
 * Id estable de este navegador. Sobrevive a re-vinculaciones, así que
 * re-vincular el mismo teléfono actualiza su fila en vez de duplicarla.
 *
 * Sin `window` no hay dónde persistir: devuelve un id nuevo en cada llamada
 * en vez de lanzar (no es "estable" en ese caso, pero tampoco rompe SSR).
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return generateDeviceId();

  const existente = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existente) return existente;

  const nuevo = generateDeviceId();
  window.localStorage.setItem(DEVICE_ID_KEY, nuevo);
  return nuevo;
}
