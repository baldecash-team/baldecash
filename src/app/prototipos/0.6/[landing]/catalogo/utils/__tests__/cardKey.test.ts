import { cardKey } from '../cardKey';

describe('cardKey', () => {
  it('el suelto y sus combos comparten id pero dan claves distintas', () => {
    const suelto = { id: '518', slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835' };
    const combo166 = { id: '518', slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835-combo-166' };
    const combo48 = { id: '518', slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835-combo-48' };

    expect(cardKey(suelto)).not.toBe(cardKey(combo166));
    expect(cardKey(combo166)).not.toBe(cardKey(combo48));
    expect(new Set([cardKey(suelto), cardKey(combo166), cardKey(combo48)]).size).toBe(3);
  });

  it('la misma tarjeta da siempre la misma clave', () => {
    const a = { id: '518', slug: 'ipad-combo-166' };
    const b = { id: '518', slug: 'ipad-combo-166' };
    expect(cardKey(a)).toBe(cardKey(b));
  });

  it('acepta un item guardado, que usa productId en vez de id', () => {
    const guardado = { productId: '518', slug: 'ipad-combo-166' };
    const tarjeta = { id: '518', slug: 'ipad-combo-166' };
    expect(cardKey(guardado)).toBe(cardKey(tarjeta));
  });

  it('sin slug cae al id: un favorito viejo sigue teniendo clave', () => {
    expect(cardKey({ productId: '518' })).toBe('518');
    expect(cardKey({ id: '518' })).toBe('518');
  });

  it('slug vacio se trata como ausente', () => {
    expect(cardKey({ id: '518', slug: '' })).toBe('518');
    expect(cardKey({ id: '518', slug: '   ' })).toBe('518');
  });

  it('sin slug ni id devuelve cadena vacia, no revienta', () => {
    expect(cardKey({})).toBe('');
  });
});
