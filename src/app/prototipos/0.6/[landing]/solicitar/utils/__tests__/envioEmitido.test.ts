/**
 * `application_submitted` se emite UNA vez por solicitud.
 *
 * La confirmación lo emite al montarse. Si la pantalla se reabre —recarga, la
 * pestaña restaurada, "atrás" desde el catálogo— lo volvía a emitir, y si para
 * entonces la sesión de tracking ya era otra (la del siguiente alumno del
 * stand), ws2 ataba esa sesión a la solicitud vieja.
 */
import { reclamarEmisionDelEnvio } from '../envioEmitido';

const LANDING = 'ucv';

beforeEach(() => {
  localStorage.clear();
});

describe('reclamarEmisionDelEnvio', () => {
  it('la primera vez concede la emisión', () => {
    expect(reclamarEmisionDelEnvio(LANDING, 'APP-2026-1')).toBe(true);
  });

  it('la segunda vez con el mismo código la niega', () => {
    reclamarEmisionDelEnvio(LANDING, 'APP-2026-1');
    expect(reclamarEmisionDelEnvio(LANDING, 'APP-2026-1')).toBe(false);
  });

  it('otra solicitud en el mismo equipo vuelve a emitir', () => {
    reclamarEmisionDelEnvio(LANDING, 'APP-2026-1');
    expect(reclamarEmisionDelEnvio(LANDING, 'APP-2026-2')).toBe(true);
  });

  it('es por landing: la hermana no hereda la marca', () => {
    reclamarEmisionDelEnvio(LANDING, 'APP-2026-1');
    expect(reclamarEmisionDelEnvio('ucv-express', 'APP-2026-1')).toBe(true);
  });

  it('sin storage emite igual (como antes)', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage bloqueado');
    });
    expect(reclamarEmisionDelEnvio(LANDING, 'APP-2026-1')).toBe(true);
    spy.mockRestore();
  });
});
