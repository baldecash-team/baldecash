/**
 * Si al entrar al subárbol de `/solicitar` corresponde renovar una sesión de
 * tracking que ya convirtió.
 *
 * Entrar al formulario es "otra solicitud" y renueva. Reabrir la confirmación
 * no lo es: es la misma persona (o la promotora) mirando la pantalla de
 * "solicitud recibida". Renovar ahí abría una sesión que nacía en la
 * confirmación, y esa pantalla volvía a emitir `application_submitted` con el
 * código viejo sobre la sesión nueva — ws2 la ataba a la solicitud anterior
 * (16 sesiones así en 30 días, todas con `entry_url` en `/confirmacion`).
 *
 * Sin pathname (SSR, test) se conserva el comportamiento de siempre.
 */
export function debeRenovarSesionAlEntrar(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  return !/\/solicitar\/confirmacion(?:\/|$)/.test(pathname);
}
