/**
 * BAL-4395 — el campo «Monto» muestra la coma de miles mientras el cliente
 * escribe, pero lo que se guarda en form_data es el número limpio de siempre
 * («2500»), porque el legacy y ws2 lo leen así.
 */
import {
  limpiarMonto,
  formatearMonto,
  contarSignificativos,
  posicionEnFormateado,
  normalizarPegado,
  tieneCentimos,
} from '../montoFormato';

describe('limpiarMonto — lo que se guarda', () => {
  it.each([
    ['2500', '2500'],
    ['2,500', '2500'],
    ['1,234,567.5', '1234567.5'],
    ['S/ 2,500.50', '2500.50'],
    ['S/. 2,500.50', '2500.50'],
    ['  3 000 ', '3000'],
    ['abc', ''],
    ['', ''],
    ['2500.', '2500.'],
    ['.5', '0.5'],
    ['0050', '50'],
    ['0', '0'],
    ['12.345', '12.34'],
    ['1.2.3', '1.23'],
  ])('%p -> %p', (entrada, esperado) => {
    expect(limpiarMonto(entrada)).toBe(esperado);
  });

  it('acepta números y vacíos que vengan guardados', () => {
    expect(limpiarMonto(2500)).toBe('2500');
    expect(limpiarMonto(null)).toBe('');
    expect(limpiarMonto(undefined)).toBe('');
  });
});

describe('formatearMonto — lo que ve el cliente', () => {
  it.each([
    ['', ''],
    ['0', '0'],
    ['999', '999'],
    ['2500', '2,500'],
    ['1234567.5', '1,234,567.5'],
    ['2500.', '2,500.'],
    ['2500.00', '2,500.00'],
    ['2,500', '2,500'],
  ])('%p -> %p', (entrada, esperado) => {
    expect(formatearMonto(entrada)).toBe(esperado);
  });

  it('coincide con el formato es-PE (coma de miles, punto decimal)', () => {
    const esPE = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
    for (const n of [7, 1500, 2500, 98765, 1234567.5, 1000000]) {
      expect(formatearMonto(String(n))).toBe(esPE.format(n));
    }
  });
});

describe('cursor', () => {
  it('cuenta dígitos y punto antes del cursor, ignorando comas', () => {
    expect(contarSignificativos('12,500', 4)).toBe(3);
    expect(contarSignificativos('S/ 1.5', 6)).toBe(3);
  });

  it('ubica la posición tras N significativos en el texto con comas', () => {
    expect(posicionEnFormateado('12,500', 3)).toBe(4);
    expect(posicionEnFormateado('12,500', 2)).toBe(2);
    expect(posicionEnFormateado('12,500', 0)).toBe(0);
    expect(posicionEnFormateado('12,500', 99)).toBe(6);
  });
});

// Hallazgo de revisión BAL-4395: en Perú se pega mucho con punto de miles y
// coma decimal. Sin esto «2.500» se guardaba «2.50» (mil veces menos).
describe('normalizarPegado — formato peruano con punto de miles', () => {
  it.each([
    ['2.500', '2500'],
    ['1.234.567', '1234567'],
    ['2.500,50', '2500.50'],
    ['S/. 2.500', '2500'],
    ['S/ 1.234.567,5', '1234567.5'],
    ['2500,50', '2500.50'],
    ['2,5', '2.5'],
  ])('%s -> %s', (pegado, esperado) => {
    expect(limpiarMonto(normalizarPegado(pegado))).toBe(esperado);
  });

  it.each([
    ['S/ 2,500.50', '2500.50'],
    ['2,500', '2500'],
    ['1,234,567', '1234567'],
    ['2.5', '2.5'],
    ['2500.50', '2500.50'],
    ['12.3456', '12.34'],
  ])('lo que no es formato peruano queda igual: %s -> %s', (pegado, esperado) => {
    expect(limpiarMonto(normalizarPegado(pegado))).toBe(esperado);
  });
});

// BAL-4400: campo «sin decimales» (decimal_places = 0).
describe('limpiarMonto con 0 decimales — solo soles enteros', () => {
  it.each([
    ['2500', '2500'],
    ['2,500', '2500'],
    ['2500.50', '2500'],
    ['S/. 2500', '2500'],
    ['.5', '0'],
    ['', ''],
  ])('%p -> %p', (entrada, esperado) => {
    expect(limpiarMonto(entrada, 0)).toBe(esperado);
  });

  it('sin segundo argumento sigue aceptando hasta 2 decimales (como hoy)', () => {
    expect(limpiarMonto('2500.505')).toBe('2500.50');
  });
});

describe('tieneCentimos', () => {
  it.each([
    ['2500', false],
    ['2500.', false],
    ['2500.00', false],
    ['2500.0', false],
    ['2500.5', true],
    ['2500.05', true],
  ])('%p -> %p', (limpio, esperado) => {
    expect(tieneCentimos(limpio)).toBe(esperado);
  });
});
