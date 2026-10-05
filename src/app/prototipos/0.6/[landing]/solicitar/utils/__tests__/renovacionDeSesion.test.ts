/**
 * Cuándo renovar la sesión de tracking al entrar al subárbol de `/solicitar`.
 *
 * El layout renueva la sesión convertida al montarse, porque "volver a entrar"
 * es "otra solicitud". Salvo en la confirmación: reabrir la pantalla de
 * "solicitud recibida" no es una solicitud nueva, y renovar ahí abría una
 * sesión que nacía en la confirmación y volvía a emitir `application_submitted`
 * con el código viejo — ws2 la ataba a la solicitud de la persona anterior.
 */
import { debeRenovarSesionAlEntrar } from '../renovacionDeSesion';

describe('debeRenovarSesionAlEntrar', () => {
  it('renueva al entrar al formulario', () => {
    expect(debeRenovarSesionAlEntrar('/ucv/solicitar')).toBe(true);
    expect(debeRenovarSesionAlEntrar('/ucv/solicitar/')).toBe(true);
    expect(debeRenovarSesionAlEntrar('/ucv/solicitar/datos-personales')).toBe(true);
    expect(debeRenovarSesionAlEntrar('/prototipos/0.6/ucv/solicitar/complementos')).toBe(true);
  });

  it('NO renueva al reabrir la confirmación', () => {
    expect(debeRenovarSesionAlEntrar('/ucv/solicitar/confirmacion')).toBe(false);
    expect(debeRenovarSesionAlEntrar('/ucv/solicitar/confirmacion/')).toBe(false);
    expect(debeRenovarSesionAlEntrar('/prototipos/0.6/ucv/solicitar/confirmacion/')).toBe(false);
  });

  it('sin pathname conserva el comportamiento anterior', () => {
    expect(debeRenovarSesionAlEntrar(null)).toBe(true);
  });
});
