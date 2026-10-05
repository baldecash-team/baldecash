/**
 * Qué landings entran al formulario embebido de segundo financiamiento.
 *
 * Los slugs son los de la tabla `landing` en prod al 2026-09-18. Si mañana se
 * crea otra `renueva-*` entra sola, que es lo buscado; lo que este test impide
 * es que entre una landing que no lo es.
 */
import { isSecondFinancingLanding } from '../theme';

describe('isSecondFinancingLanding', () => {
  it.each([
    'renueva-tu-laptop',
    'renueva-tu-equipo',
    'renueva-tu-equipo-1',
    'renueva-tu-equipo-2',
    'renueva-tu-equipo-3',
    'renueva-tu-equipo-1-a',
    'test-renueva-tu-equipo-1',
  ])('entra: %s', (slug) => {
    expect(isSecondFinancingLanding(slug)).toBe(true);
  });

  it.each([
    'home',
    'copia-home',
    'reacondicionados',
    'convenio-ucv-landing',
    'senati',
    'renuevame',
  ])('no entra: %s', (slug) => {
    expect(isSecondFinancingLanding(slug)).toBe(false);
  });
});
