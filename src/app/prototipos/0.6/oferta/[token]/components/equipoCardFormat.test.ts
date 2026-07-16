import { cuotaSuffix, plazoUnit, inicialText, monthlyFactor } from './equipoCardFormat';

describe('equipoCardFormat', () => {
  test('monthlyFactor lleva a mensual: quincenal x2, semanal x4 (BAL-2379)', () => {
    expect(monthlyFactor('mensual')).toBe(1);
    expect(monthlyFactor('quincenal')).toBe(2);
    expect(monthlyFactor('semanal')).toBe(4);
    expect(monthlyFactor('QUINCENAL')).toBe(2); // case-insensitive
    expect(monthlyFactor(undefined)).toBe(1);
    expect(monthlyFactor(null)).toBe(1);
  });

  test('cuotaSuffix por frecuencia', () => {
    expect(cuotaSuffix('semanal')).toBe('/sem');
    expect(cuotaSuffix('quincenal')).toBe('/qcn');
    expect(cuotaSuffix('mensual')).toBe('/mes');
    expect(cuotaSuffix(undefined)).toBe('/mes');
    expect(cuotaSuffix(null)).toBe('/mes');
  });

  test('plazoUnit singular/plural por frecuencia', () => {
    expect(plazoUnit(1, 'semanal')).toBe('semana');
    expect(plazoUnit(48, 'semanal')).toBe('semanas');
    expect(plazoUnit(1, 'quincenal')).toBe('quincena');
    expect(plazoUnit(12, 'quincenal')).toBe('quincenas');
    expect(plazoUnit(12, 'mensual')).toBe('meses');
    expect(plazoUnit(1, 'mensual')).toBe('mes');
    expect(plazoUnit(24, undefined)).toBe('meses');
  });

  test('inicialText prioriza monto (S/) sobre porcentaje', () => {
    expect(inicialText(270, 25)).toBe(' · inicial S/270');
    expect(inicialText(null, 25)).toBe(' · inicial 25%');
    expect(inicialText(undefined, 20)).toBe(' · inicial 20%');
    expect(inicialText(0, 0)).toBe(' · sin inicial');
    expect(inicialText(null, null)).toBe(' · sin inicial');
    expect(inicialText(0, 25)).toBe(' · inicial 25%'); // monto 0 → cae al %
  });
});
