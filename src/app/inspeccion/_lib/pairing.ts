/**
 * Canje del código de emparejamiento que llega por la URL.
 *
 * Quien llama es responsable de limpiar el parámetro de la URL después
 * (history.replaceState): el código no debe quedar en el historial.
 */
import {
  getOrCreateDeviceId, setDeviceSession, type DeviceKind, type DeviceSession,
} from './deviceSession';

// Mismo patrón que el resto de los servicios del front (ver kycApi.ts): el
// fallback ya incluye `/api/v1`, así que acá NO se vuelve a agregar.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export async function redeemPairingCode(code: string): Promise<DeviceSession> {
  const deviceId = getOrCreateDeviceId();

  const res = await fetch(`${API_BASE_URL}/inspections/pair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, device_id: deviceId }),
  });

  if (!res.ok) {
    let reason = `http_${res.status}`;
    try {
      const body = await res.json();
      reason = body?.detail?.reason ?? reason;
    } catch {
      // respuesta sin JSON: nos quedamos con el status
    }
    throw new Error(`No se pudo vincular el dispositivo: ${reason}`);
  }

  const body = await res.json();
  const session: DeviceSession = {
    deviceId: body.device_id,
    token: body.token,
    stationId: body.station_id,
    kind: body.kind as DeviceKind,
    label: body.label ?? null,
  };
  setDeviceSession(session);
  return session;
}
