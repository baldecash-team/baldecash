import { mesesDelProducto, termToMonths } from '../plazoEnMeses';

describe('plazoEnMeses (misma fórmula que el submit, `term_months`)', () => {
  it('termToMonths pasa cuotas a meses según la frecuencia', () => {
    expect(termToMonths(24, 'quincenal')).toBe(12);
    expect(termToMonths(48, 'semanal')).toBe(12);
    expect(termToMonths(24, 'mensual')).toBe(24);
    expect(termToMonths(24)).toBe(24);
  });

  it('mesesDelProducto manda `term` (cuotas) sobre `months`', () => {
    // copia-home guarda months = term en cuotas
    expect(mesesDelProducto({ months: 24, term: 24, paymentFrequency: 'quincenal' })).toBe(12);
    expect(mesesDelProducto({ months: 48, term: 48, paymentFrequency: 'semanal' })).toBe(12);
    // detalle normal: months ya en meses, term en cuotas
    expect(mesesDelProducto({ months: 12, term: 24, paymentFrequency: 'quincenal' })).toBe(12);
    // sin term: months (mensual)
    expect(mesesDelProducto({ months: 24 })).toBe(24);
  });

  it('sin plazo: undefined', () => {
    expect(mesesDelProducto(null)).toBeUndefined();
    expect(mesesDelProducto({})).toBeUndefined();
  });
});
