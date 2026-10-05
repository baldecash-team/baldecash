import { normalizeCondition, sameCondition } from '../condition';

describe('normalizeCondition', () => {
  it('mapea variantes de nuevo → nueva', () => {
    expect(normalizeCondition('nuevo')).toBe('nueva');
    expect(normalizeCondition('nueva')).toBe('nueva');
    expect(normalizeCondition('new')).toBe('nueva');
  });

  it('mapea variantes de reacondicionado → reacondicionada', () => {
    expect(normalizeCondition('reacondicionado')).toBe('reacondicionada');
    expect(normalizeCondition('reacondicionada')).toBe('reacondicionada');
    expect(normalizeCondition('refurbished')).toBe('reacondicionada');
  });

  it('vacío/otros quedan como están (lowercased)', () => {
    expect(normalizeCondition(null)).toBe('');
    expect(normalizeCondition('  ')).toBe('');
    expect(normalizeCondition('open_box')).toBe('open_box');
  });
});

describe('sameCondition', () => {
  it('equivalencia pese a nuevo/nueva y reacondicionado/reacondicionada', () => {
    expect(sameCondition('nuevo', 'nueva')).toBe(true);
    expect(sameCondition('reacondicionado', 'reacondicionada')).toBe(true);
    expect(sameCondition('refurbished', 'reacondicionada')).toBe(true);
  });

  it('distintas condiciones no son equivalentes', () => {
    expect(sameCondition('nueva', 'reacondicionada')).toBe(false);
  });

  it('vacío nunca es equivalente', () => {
    expect(sameCondition(null, null)).toBe(false);
    expect(sameCondition('', 'nueva')).toBe(false);
  });
});
