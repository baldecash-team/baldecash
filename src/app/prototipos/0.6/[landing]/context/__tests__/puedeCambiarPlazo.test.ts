/**
 * Fija cómo se deriva la visibilidad del selector de plazo desde la
 * configuración de la landing.
 *
 * La regla que importa: **la ausencia significa encendido**. Es el mismo
 * criterio que ya usa el logo de convenio, y existe porque una landing que
 * nunca declaró el ingrediente tiene que verse igual que antes de que el
 * ingrediente existiera.
 *
 * Con `=== true` en vez de `!== false`, toda landing sin el ingrediente
 * perdería su selector de plazo de golpe. Este archivo es la red contra ese
 * cambio de una sola palabra.
 */

/**
 * Réplica de la línea del contexto de la landing. Se prueba la derivación y no
 * el contexto entero porque lo que puede romperse es esta comparación, no el
 * cableado de React.
 */
function derivarPuedeCambiarPlazo(features: { can_change_term?: unknown } | undefined): boolean {
  return features?.can_change_term !== false;
}

describe('derivación del selector de plazo', () => {
  it('el ingrediente apagado oculta el selector', () => {
    expect(derivarPuedeCambiarPlazo({ can_change_term: false })).toBe(false);
  });

  it('el ingrediente encendido lo muestra', () => {
    expect(derivarPuedeCambiarPlazo({ can_change_term: true })).toBe(true);
  });

  it('sin el ingrediente lo muestra, porque la ausencia significa encendido', () => {
    expect(derivarPuedeCambiarPlazo({})).toBe(true);
  });

  it('sin la sección entera de la configuración también lo muestra', () => {
    expect(derivarPuedeCambiarPlazo(undefined)).toBe(true);
  });

  /**
   * Si el backend manda el valor como texto, no se apaga por accidente. Solo el
   * booleano falso apaga; cualquier otra cosa deja el comportamiento de antes.
   */
  it('un valor que no es el booleano falso no apaga el selector', () => {
    expect(derivarPuedeCambiarPlazo({ can_change_term: 'false' })).toBe(true);
    expect(derivarPuedeCambiarPlazo({ can_change_term: 0 })).toBe(true);
    expect(derivarPuedeCambiarPlazo({ can_change_term: null })).toBe(true);
  });
});
