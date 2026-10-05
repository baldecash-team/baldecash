import { isValidEmail, normalizeEmail, sanitizeEmailInput } from './emailValidation';

/**
 * Origen: prod 2026-08-07. Un postulante pegó el hipervínculo
 * `mailto:cgonzalesas@isise.edu.pe` en el campo de correo. La regex que traía
 * el wizard (`^[^\s@]+@[^\s@]+\.[^\s@]+$`) lo daba por bueno porque `:` es un
 * carácter válido para `[^\s@]`, el dato viajó al backend y Mailgun respondió
 * 400 "to parameter is not a valid address".
 */
describe('normalizeEmail', () => {
  it.each([
    ['mailto:cgonzalesas@isise.edu.pe', 'cgonzalesas@isise.edu.pe'],
    ['MAILTO:Ana@UNI.EDU.PE', 'ana@uni.edu.pe'],
    ['  juan@uni.edu.pe  ', 'juan@uni.edu.pe'],
    ['<juan@uni.edu.pe>', 'juan@uni.edu.pe'],
    ['juan@uni.edu.pe.', 'juan@uni.edu.pe'],
    ['juan​@uni.edu.pe ', 'juan@uni.edu.pe'],
    ['', ''],
  ])('normaliza %s -> %s', (raw, expected) => {
    expect(normalizeEmail(raw)).toBe(expected);
  });
});

describe('isValidEmail', () => {
  it.each([
    'juan@uni.edu.pe',
    'juan.perez+etiqueta@uni.edu.pe',
    'mailto:juan@uni.edu.pe', // se normaliza y queda válido
  ])('acepta %s', (value) => {
    expect(isValidEmail(value)).toBe(true);
  });

  it.each([
    '',
    'juan',
    'juan@',
    '@uni.edu.pe',
    'juan@uni', // sin TLD
    'juan perez@uni.edu.pe',
    'juan@@uni.edu.pe',
    'juan@uni..edu.pe',
    'http://uni.edu.pe',
    'mailto:juan@uni', // normalizado sigue sin TLD
  ])('rechaza %s', (value) => {
    expect(isValidEmail(value)).toBe(false);
  });
});

describe('sanitizeEmailInput', () => {
  it('limpia el hipervínculo al pegarlo, sin estorbar mientras se escribe', () => {
    expect(sanitizeEmailInput('mailto:cgonzalesas@isise.edu.pe')).toBe('cgonzalesas@isise.edu.pe');
    expect(sanitizeEmailInput('  juan@uni.edu.pe  ')).toBe('juan@uni.edu.pe');
    expect(sanitizeEmailInput('juan @uni.edu.pe')).toBe('juan @uni.edu.pe'); // ambiguo: no se adivina
    expect(sanitizeEmailInput('juan@uni.edu.')).toBe('juan@uni.edu.'); // en progreso: no se toca
    expect(sanitizeEmailInput('JUAN@UNI.EDU.PE')).toBe('JUAN@UNI.EDU.PE'); // el caso lo decide el submit
  });
});
