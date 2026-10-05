import { normalizeSearchQuery } from '../searchQuery';

describe('normalizeSearchQuery', () => {
  it('recorta espacios y pasa a minusculas', () => {
    expect(normalizeSearchQuery('  Impresora HP  ')).toBe('impresora hp');
  });

  it('colapsa espacios internos repetidos', () => {
    expect(normalizeSearchQuery('laptop    gamer')).toBe('laptop gamer');
  });

  it('corta a 60 caracteres', () => {
    const largo = 'a'.repeat(80);
    expect(normalizeSearchQuery(largo)).toHaveLength(60);
  });

  it('descarta cadenas que parecen documento o telefono', () => {
    expect(normalizeSearchQuery('12345678')).toBeUndefined();
    expect(normalizeSearchQuery(' 987654321 ')).toBeUndefined();
  });

  it('conserva numeros cortos, que son parte del catalogo', () => {
    expect(normalizeSearchQuery('iphone 13')).toBe('iphone 13');
    expect(normalizeSearchQuery('14')).toBe('14');
  });

  it('devuelve undefined cuando no queda nada util', () => {
    expect(normalizeSearchQuery('')).toBeUndefined();
    expect(normalizeSearchQuery('   ')).toBeUndefined();
    expect(normalizeSearchQuery(undefined)).toBeUndefined();
  });
});
