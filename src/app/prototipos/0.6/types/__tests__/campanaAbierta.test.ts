/**
 * Si la campaña sigue recibiendo solicitudes.
 *
 * El backend expone `application_cap.abierto` solo en las landings que declaran
 * un cupo. La regla de oro acá es el default: ante la ausencia del bloque, un
 * `undefined` o una respuesta que no llegó, la campaña está ABIERTA. Cerrar una
 * landing por un dato que falta sería peor que el problema que esto resuelve —
 * y el submit igual valida el cupo del lado del servidor.
 */

import { campanaAbierta, DEFAULT_LANDING_CONFIG, type LandingConfig } from '../landingConfig';

const config = (extra: Record<string, unknown> = {}): LandingConfig =>
  ({ ...DEFAULT_LANDING_CONFIG, ...extra }) as LandingConfig;

describe('campanaAbierta', () => {
  it('cerrada cuando el backend dice que ya no recibe', () => {
    expect(campanaAbierta(config({ application_cap: { abierto: false } }))).toBe(false);
  });

  it('abierta cuando todavía hay cupo', () => {
    expect(campanaAbierta(config({ application_cap: { abierto: true } }))).toBe(true);
  });

  it('una landing sin cupo declarado está abierta', () => {
    expect(campanaAbierta(config())).toBe(true);
  });

  it.each([
    ['sin config', null],
    ['config vacía', undefined],
  ])('%s: abierta, nunca se cierra por falta de dato', (_caso, valor) => {
    expect(campanaAbierta(valor as unknown as LandingConfig)).toBe(true);
  });

  it.each([
    [{ application_cap: {} }],
    [{ application_cap: null }],
    [{ application_cap: { abierto: 'no' } }],
  ])('un bloque mal formado no cierra la campaña: %s', (extra) => {
    expect(campanaAbierta(config(extra as Record<string, unknown>))).toBe(true);
  });
});
