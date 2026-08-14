import { gamerTermMonths, gamerDisplayTerm, gamerNativeTerm } from '../gamerPricing';

/**
 * Zona Gamer mostraba `maxTermMonths` junto a la cuota del hook, que
 * corresponde a otro plazo (BAL-3001).
 *
 * Hoy no se nota: los 23 productos de `zona-gamer` tienen hook == maximo y
 * todos son mensuales. Estos tests usan productos con hook DISTINTO y con
 * frecuencia semanal — los casos que hoy no existen en esa landing — para que
 * el defecto no pueda volver en silencio.
 */

describe('gamerTermMonths — plazo en meses (CartItem.months)', () => {
  it('prefiere el plazo del hook al maximo', () => {
    expect(gamerTermMonths({ hookTermMonths: 24, maxTermMonths: 36 })).toBe(24);
  });

  it('cae al maximo cuando no hay hook', () => {
    expect(gamerTermMonths({ maxTermMonths: 36 })).toBe(36);
  });

  it('cae al maximo cuando el hook es null', () => {
    expect(gamerTermMonths({ hookTermMonths: null, maxTermMonths: 36 })).toBe(36);
  });

  // `CartItem.months` es TermMonths — meses siempre, es lo que usan el display
  // y el matching (catalog.ts:982-984). La frecuencia se refleja en `term`.
  it('no convierte por frecuencia', () => {
    expect(gamerTermMonths({ hookTermMonths: 24, paymentFrequency: 'semanal' })).toBe(24);
  });

  it('usa 24 como ultimo recurso', () => {
    expect(gamerTermMonths({})).toBe(24);
  });
});

/**
 * `CartItem.term` son las cuotas en la frecuencia NATIVA — semanas en semanal,
 * quincenas en quincenal (catalog.ts:983). Los tres sitios del carrito ponian
 * ahi `maxTermMonths`: meses crudos, y ademas del plazo equivocado.
 */
describe('gamerNativeTerm — cuotas en la frecuencia nativa (CartItem.term)', () => {
  it('cuenta semanas en semanal', () => {
    expect(gamerNativeTerm({ hookTermMonths: 24, paymentFrequency: 'semanal' })).toBe(96);
  });

  it('cuenta quincenas en quincenal', () => {
    expect(gamerNativeTerm({ hookTermMonths: 24, paymentFrequency: 'quincenal' })).toBe(48);
  });

  it('en mensual coincide con los meses', () => {
    expect(gamerNativeTerm({ hookTermMonths: 24, paymentFrequency: 'mensual' })).toBe(24);
  });

  it('parte del plazo del hook, no del maximo', () => {
    expect(gamerNativeTerm({ hookTermMonths: 24, maxTermMonths: 36 })).toBe(24);
  });
});

describe('gamerDisplayTerm — plazo para mostrar', () => {
  it('muestra el plazo del hook, no el maximo', () => {
    expect(gamerDisplayTerm({ hookTermMonths: 24, maxTermMonths: 36 })).toBe(24);
  });

  // Igual que la card (ProductCard.tsx:316-319). Zona Gamer hoy es 100%
  // mensual, pero el helper debe estar aplicado para que un producto semanal
  // futuro no muestre los meses crudos.
  it('divide por 4 en semanal', () => {
    expect(gamerDisplayTerm({ hookTermMonths: 24, paymentFrequency: 'semanal' })).toBe(6);
  });

  it('divide por 2 en quincenal', () => {
    expect(gamerDisplayTerm({ hookTermMonths: 24, paymentFrequency: 'quincenal' })).toBe(12);
  });

  it('deja el plazo tal cual en mensual', () => {
    expect(gamerDisplayTerm({ hookTermMonths: 24, paymentFrequency: 'mensual' })).toBe(24);
  });

  // Los 23 productos de zona-gamer caen aca: hook == maximo, mensual. El
  // arreglo no debe cambiarles nada.
  it('no altera los productos que hoy tiene zona-gamer', () => {
    expect(gamerDisplayTerm({ hookTermMonths: 36, maxTermMonths: 36, paymentFrequency: 'mensual' })).toBe(36);
  });
});
