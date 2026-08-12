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
// Exportada para que otros módulos de `_lib` (usePresenceChannel.ts) no
// dupliquen el literal del fallback.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/**
 * Traduce los `reason` que devuelve `POST /inspections/pair` (ver
 * `PairingError` en `app/services/inspection_device_service.py`) al motivo real
 * y a la salida.
 *
 * Cada uno de estos cinco tiene una causa concreta y una acción distinta, y
 * mostrando el código crudo el operador no puede distinguirlos: "expired" y
 * "already_used" se resuelven igual (emitir otro código) pero por motivos
 * opuestos, y "label_taken" no se resuelve emitiendo códigos en absoluto.
 */
function mensajeDeVinculacion(reason: string | null, status: number): string {
  switch (reason) {
    case 'expired':
      return 'El código venció. Los códigos duran 10 minutos: emití uno nuevo desde el backoffice y escaneálo enseguida.';
    case 'already_used':
      return 'Este código ya se usó. Cada código sirve para vincular un solo dispositivo — emití uno nuevo.';
    case 'not_found':
      return 'El código no existe. Verificá que lo hayas escaneado completo, o emití uno nuevo.';
    case 'device_id_taken':
      return 'Este dispositivo ya está vinculado a otra estación. Re-vinculalo desde la pantalla del dispositivo antes de asignarlo acá.';
    case 'label_taken':
      return 'Esa cámara ya tiene un dispositivo vinculado y activo. Desvinculá el anterior o usá otra etiqueta de cámara.';
    default:
      if (status === 503) return 'El módulo de inspección está deshabilitado.';
      return `No se pudo vincular el dispositivo (error ${status}). Reintentá con un código nuevo.`;
  }
}

export async function redeemPairingCode(code: string): Promise<DeviceSession> {
  const deviceId = getOrCreateDeviceId();

  const res = await fetch(`${API_BASE_URL}/inspections/pair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, device_id: deviceId }),
  });

  if (!res.ok) {
    let reason: string | null = null;
    try {
      const body = await res.json();
      reason = typeof body?.detail?.reason === 'string' ? body.detail.reason : null;
    } catch {
      // respuesta sin JSON: se cae al mensaje por status
    }
    throw new Error(mensajeDeVinculacion(reason, res.status));
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
