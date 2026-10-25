/**
 * BAL-4969 (I-1): con el color de la landing, el kit de Diseño 2 necesita un
 * texto legible SOBRE el primary (`--color-on-primary`) y un primary legible
 * SOBRE blanco (`--color-primary-text`).
 */
import { colorSobrePrimary, contrasteWcag, primaryParaTexto, TEXTO_OSCURO_V2 } from '../colorContrast';
import { admiteDiseno2 } from '../theme';

describe('contrasteWcag', () => {
  it('blanco contra negro es 21:1 y un color consigo mismo 1:1', () => {
    expect(contrasteWcag('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
    expect(contrasteWcag('#4654CD', '#4654cd')).toBeCloseTo(1, 5);
  });
});

describe('colores de texto para el primary de la landing', () => {
  it('el morado por defecto: texto blanco encima y el mismo color para texto', () => {
    expect(colorSobrePrimary('#4654CD')).toBe('#FFFFFF');
    expect(primaryParaTexto('#4654CD')).toBe('#4654CD');
    expect(primaryParaTexto('#4654cd')).toBe('#4654CD');
  });

  it.each(['#76B900', '#FFE066'])('%s (claro): texto oscuro encima y un primary-text oscurecido ≥ 4.5:1', (claro) => {
    expect(colorSobrePrimary(claro)).toBe(TEXTO_OSCURO_V2);
    expect(contrasteWcag(TEXTO_OSCURO_V2, claro)).toBeGreaterThan(contrasteWcag('#FFFFFF', claro));
    const texto = primaryParaTexto(claro);
    expect(texto).not.toBe(claro);
    expect(contrasteWcag(texto, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });

  it('el oscurecido es el primer paso que cumple (no se pasa de negro)', () => {
    const texto = primaryParaTexto('#76B900');
    // Un 5 % menos de negro ya no llegaría: se quedó en el mínimo que cumple.
    expect(contrasteWcag(texto, '#FFFFFF')).toBeLessThan(5.2);
  });

  it('un hex inválido no rompe: blanco encima y el valor tal cual', () => {
    expect(colorSobrePrimary('rojo')).toBe('#FFFFFF');
    expect(primaryParaTexto('rojo')).toBe('rojo');
  });

  it('acepta hex de 3 dígitos', () => {
    expect(colorSobrePrimary('#fff')).toBe(TEXTO_OSCURO_V2);
    expect(primaryParaTexto('#000')).toBe('#000000');
  });
});

describe('admiteDiseno2 (BAL-4969, I-2; BAL-5076)', () => {
  it('solo zona gamer queda fuera; las landings de tema oscuro entran (Diseño 2 oscuro, BAL-5076)', () => {
    expect(admiteDiseno2('zona-gamer')).toBe(false);
    expect(admiteDiseno2('nvidia')).toBe(true);
    expect(admiteDiseno2('pago-diferido')).toBe(true);
    expect(admiteDiseno2('home')).toBe(true);
  });
});
