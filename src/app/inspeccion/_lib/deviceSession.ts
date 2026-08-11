/**
 * Identidad del dispositivo dentro de una estación de inspección.
 *
 * El teléfono se vincula una sola vez abriendo una URL con un código; a partir
 * de ahí la sesión vive en localStorage. No hay login por sesión: los teléfonos
 * son dispositivos permanentes de la estación.
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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearDeviceSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Id estable de este navegador. Sobrevive a re-vinculaciones, así que
 * re-vincular el mismo teléfono actualiza su fila en vez de duplicarla.
 */
export function getOrCreateDeviceId(): string {
  const existente = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existente) return existente;

  const nuevo =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

  window.localStorage.setItem(DEVICE_ID_KEY, nuevo);
  return nuevo;
}
