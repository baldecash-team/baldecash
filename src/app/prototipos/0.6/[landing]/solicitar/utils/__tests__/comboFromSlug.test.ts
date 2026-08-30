import { comboIdFromSlug, resolveComboId } from '../comboFromSlug';

describe('comboIdFromSlug', () => {
  it('lee el id del sufijo -combo-{id}', () => {
    expect(comboIdFromSlug('lenovo-v15-g4-iru-lpleba0000767-combo-37')).toBe(37);
    expect(comboIdFromSlug('ipad-11-combo-166')).toBe(166);
  });

  it('devuelve undefined para el slug del producto suelto', () => {
    expect(comboIdFromSlug('lenovo-v15-g4-iru-lpleba0000767')).toBeUndefined();
    expect(comboIdFromSlug('laptop-v15-g5-irl-8-512-reacondicionado-grado-a-1228')).toBeUndefined();
  });

  it('no confunde un sufijo que no es un id', () => {
    expect(comboIdFromSlug('mochila-para-combo-escolar')).toBeUndefined();
    expect(comboIdFromSlug('algo-combo-0')).toBeUndefined();
  });

  it('tolera slug vacio o ausente', () => {
    expect(comboIdFromSlug(undefined)).toBeUndefined();
    expect(comboIdFromSlug(null)).toBeUndefined();
    expect(comboIdFromSlug('')).toBeUndefined();
  });
});

describe('resolveComboId', () => {
  it('prefiere el comboId explicito sobre el slug', () => {
    expect(resolveComboId({ comboId: 52, slug: 'x-combo-37' })).toBe(52);
  });

  it('cae al slug cuando el punto de entrada olvido copiar comboId', () => {
    expect(resolveComboId({ slug: 'lenovo-v15-g4-iru-lpleba0000767-combo-37' })).toBe(37);
  });

  it('devuelve null (no undefined) para el producto suelto', () => {
    expect(resolveComboId({ slug: 'lenovo-v15-g4-iru-lpleba0000767' })).toBeNull();
    expect(resolveComboId(null)).toBeNull();
  });
});
