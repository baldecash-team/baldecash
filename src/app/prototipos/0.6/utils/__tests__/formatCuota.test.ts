/**
 * Cómo se escribe una cuota, con o sin centavos.
 *
 * Todo el catálogo muestra cuotas enteras porque el motor las redondea con
 * `floor`, así que truncarlas al pintarlas nunca cambió nada. Family Farms es
 * el primer convenio con centavos reales —negocio cotizó S/70,50 y S/41,50— y
 * ahí truncar miente: la tarjeta prometía S/70 y el contrato decía S/70,50.
 */

import {
  formatCuota,
  formatCuotaDeLanding,
  landingMuestraCentavos,
} from '../formatCuota';

describe('qué landings muestran centavos', () => {
  it.each([
    'family-farms-baldecash-a',
    'family-farms-baldecash-b',
    'family-farms-baldecash-c',
  ])('%s sí', (slug) => {
    expect(landingMuestraCentavos(slug)).toBe(true);
  });

  it.each(['home', 'renueva-tu-equipo', 'carrion', 'upc'])('%s no', (slug) => {
    expect(landingMuestraCentavos(slug)).toBe(false);
  });

  it('tolera mayúsculas y espacios', () => {
    expect(landingMuestraCentavos('  Family-Farms-BaldeCash-C ')).toBe(true);
  });

  it('sin slug no muestra centavos', () => {
    expect(landingMuestraCentavos(null)).toBe(false);
    expect(landingMuestraCentavos(undefined)).toBe(false);
    expect(landingMuestraCentavos('')).toBe(false);
  });
});

describe('con centavos', () => {
  it('los muestra cuando existen', () => {
    expect(formatCuota(70.5, { conCentavos: true })).toBe('70.50');
    expect(formatCuota(41.5, { conCentavos: true })).toBe('41.50');
    expect(formatCuota(46.7, { conCentavos: true })).toBe('46.70');
  });

  it('no ensucia los montos redondos', () => {
    // El Tab One cuesta S/25 exactos: no tiene que verse «25.00».
    expect(formatCuota(25, { conCentavos: true })).toBe('25');
    expect(formatCuota(134, { conCentavos: true })).toBe('134');
  });

  it('redondea a dos decimales', () => {
    expect(formatCuota(33.375, { conCentavos: true })).toBe('33.38');
  });
});

describe('sin centavos (el resto del catálogo)', () => {
  it('trunca, como se hacía siempre', () => {
    expect(formatCuota(70.5)).toBe('70');
    expect(formatCuota(70.99)).toBe('70');
  });

  it('los enteros no cambian', () => {
    expect(formatCuota(89)).toBe('89');
  });
});

describe('formatear según la landing', () => {
  it('Family Farms conserva los centavos', () => {
    expect(formatCuotaDeLanding(70.5, 'family-farms-baldecash-c')).toBe('70.50');
  });

  it('el resto los trunca', () => {
    // Es lo que garantiza que home no cambie de forma.
    expect(formatCuotaDeLanding(70.5, 'home')).toBe('70');
  });

  it('sin landing, el comportamiento histórico', () => {
    expect(formatCuotaDeLanding(70.5, null)).toBe('70');
  });
});

describe('valores que no son número', () => {
  it.each([NaN, Infinity, -Infinity])('%p devuelve 0', (valor) => {
    expect(formatCuota(valor, { conCentavos: true })).toBe('0');
  });
});
