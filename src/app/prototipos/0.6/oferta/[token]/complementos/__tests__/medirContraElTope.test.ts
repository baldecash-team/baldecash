import { medirContraElTope } from '../medirContraElTope';

/**
 * BAL-4910: con el tope de efectivo solo cuenta la cuota del equipo; con el
 * tope del motor (o cualquier otro) cuenta el total, como siempre.
 */
describe('medirContraElTope', () => {
  // Equipo S/180 + seguro S/25 = S/205 contra un tope de S/200.
  const base = { tope: 200, cuotaEquipo: 180, cuotaTotal: 205 };

  test('efectivo: el total pasa el tope pero el equipo no → se puede confirmar', () => {
    const m = medirContraElTope({ ...base, soloEquipo: true });
    expect(m.seExcede).toBe(false);
    expect(m.restante).toBe(20);
  });

  test('efectivo: un seguro que pasa el total igual se puede marcar', () => {
    const m = medirContraElTope({ tope: 200, cuotaEquipo: 180, cuotaTotal: 180, soloEquipo: true });
    expect(m.cabe(25)).toBe(true);
  });

  test('efectivo: si el equipo solo pasa el tope, se bloquea', () => {
    const m = medirContraElTope({ tope: 200, cuotaEquipo: 210, cuotaTotal: 210, soloEquipo: true });
    expect(m.seExcede).toBe(true);
  });

  test('control, tope del motor: el mismo total se pasa y bloquea', () => {
    const m = medirContraElTope({ ...base, soloEquipo: false });
    expect(m.seExcede).toBe(true);
    expect(m.restante).toBe(-5);
  });

  test('control, tope del motor: el seguro que hace pasar el total no cabe', () => {
    const m = medirContraElTope({ tope: 200, cuotaEquipo: 180, cuotaTotal: 180, soloEquipo: false });
    expect(m.cabe(25)).toBe(false);
    expect(m.cabe(20)).toBe(true);
    // Tolerancia de redondeo de S/0.50.
    expect(m.cabe(20.4)).toBe(true);
  });

  test('sin tope todo cabe y nada se excede', () => {
    const m = medirContraElTope({ tope: null, cuotaEquipo: 900, cuotaTotal: 999, soloEquipo: false });
    expect(m.seExcede).toBe(false);
    expect(m.cabe(500)).toBe(true);
    expect(m.restante).toBe(Infinity);
  });
});
