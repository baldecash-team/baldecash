/**
 * El traspaso del token del formulario de entrega entre el cierre del KYC y la
 * pantalla final.
 *
 * `/completar` lo devuelve, pero ahí mismo el flujo navega a la confirmación,
 * así que hay que llevarlo de una pantalla a la otra. Mismo mecanismo que la
 * constancia, y por la misma razón: en `localStorage` y no en la URL, porque un
 * token en la barra de direcciones queda en el historial, en el Referer y en
 * cualquier log intermedio — y este abre un formulario con la dirección de
 * alguien adentro.
 *
 * Es una comodidad, no el canal: si no está —otro dispositivo, modo privado—
 * la pantalla final simplemente no muestra el formulario, y la persona
 * coordina su entrega desde el enlace que le llega por WhatsApp.
 */
const PREFIJO = 'bc_kyc_entrega';

function clave(landing: string, code: string): string {
  return `${PREFIJO}:${landing}:${code}`;
}

export function guardarEntregaToken(landing: string, code: string, token: string): void {
  if (!landing || !code || !token) return;
  try {
    window.localStorage.setItem(clave(landing, code), token);
  } catch {
    // Modo privado, cuota llena, cookies bloqueadas.
  }
}

export function leerEntregaToken(landing: string, code: string): string | null {
  if (!landing || !code) return null;
  try {
    return window.localStorage.getItem(clave(landing, code));
  } catch {
    return null;
  }
}

/** El formulario ya se completó: el token no tiene que volver a aparecer. */
export function olvidarEntregaToken(landing: string, code: string): void {
  if (!landing || !code) return;
  try {
    window.localStorage.removeItem(clave(landing, code));
  } catch {
    // Igual que arriba: si no se puede limpiar, no se rompe nada.
  }
}
