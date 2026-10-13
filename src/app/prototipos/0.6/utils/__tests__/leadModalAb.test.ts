import {
  normalizeShowPercent,
  peekLeadModalVariant,
  resolveLeadModalVariant,
} from '../leadModalAb';

const CLAVE = 'baldecash-lead-modal-ab-senati';

beforeEach(() => {
  localStorage.clear();
});

describe('normalizeShowPercent', () => {
  it('ausente, null o vacío valen 100: las landings viejas no cambian', () => {
    expect(normalizeShowPercent(undefined)).toBe(100);
    expect(normalizeShowPercent(null)).toBe(100);
    expect(normalizeShowPercent('')).toBe(100);
    expect(normalizeShowPercent('abc')).toBe(100);
  });

  it('recorta al rango 0..100 y redondea', () => {
    expect(normalizeShowPercent(250)).toBe(100);
    expect(normalizeShowPercent(-5)).toBe(0);
    expect(normalizeShowPercent(33.6)).toBe(34);
    expect(normalizeShowPercent('40')).toBe(40);
  });

  it('el 0 es un valor válido, no un vacío', () => {
    expect(normalizeShowPercent(0)).toBe(0);
  });
});

describe('resolveLeadModalVariant', () => {
  it('con 100% no hay test: lo ve, no sortea y no guarda nada', () => {
    const random = jest.fn(() => 0.99);

    const r = resolveLeadModalVariant('senati', 100, random);

    expect(r).toEqual({ variant: 'modal', enTest: false, esNueva: false, percent: 100 });
    expect(random).not.toHaveBeenCalled();
    expect(localStorage.getItem(CLAVE)).toBeNull();
  });

  it('sin porcentaje configurado se comporta como 100%', () => {
    expect(resolveLeadModalVariant('senati', undefined).enTest).toBe(false);
  });

  it('cae en "modal" cuando el dado sale por debajo del porcentaje', () => {
    const r = resolveLeadModalVariant('senati', 30, () => 0.29);

    expect(r).toEqual({ variant: 'modal', enTest: true, esNueva: true, percent: 30 });
  });

  it('cae en "control" cuando el dado sale en el porcentaje o por encima', () => {
    const r = resolveLeadModalVariant('senati', 30, () => 0.3);

    expect(r).toEqual({ variant: 'control', enTest: true, esNueva: true, percent: 30 });
  });

  it('con 0% nadie lo ve', () => {
    expect(resolveLeadModalVariant('senati', 0, () => 0).variant).toBe('control');
  });

  it('guarda el grupo y el porcentaje con el que se sorteó', () => {
    resolveLeadModalVariant('senati', 30, () => 0.9);

    expect(JSON.parse(localStorage.getItem(CLAVE) as string)).toEqual({
      variant: 'control',
      percent: 30,
    });
  });

  it('la segunda visita conserva el grupo y no vuelve a sortear', () => {
    resolveLeadModalVariant('senati', 30, () => 0.9);
    const random = jest.fn(() => 0.01);

    const r = resolveLeadModalVariant('senati', 30, random);

    expect(r).toEqual({ variant: 'control', enTest: true, esNueva: false, percent: 30 });
    expect(random).not.toHaveBeenCalled();
  });

  it('si el admin cambia el porcentaje, se vuelve a sortear', () => {
    resolveLeadModalVariant('senati', 30, () => 0.9);

    const r = resolveLeadModalVariant('senati', 80, () => 0.5);

    expect(r).toEqual({ variant: 'modal', enTest: true, esNueva: true, percent: 80 });
  });

  it('cada landing tiene su propio sorteo', () => {
    resolveLeadModalVariant('senati', 30, () => 0.9);

    const r = resolveLeadModalVariant('home', 30, () => 0.1);

    expect(r.variant).toBe('modal');
    expect(r.esNueva).toBe(true);
  });

  it('un valor guardado corrupto se descarta y se sortea de nuevo', () => {
    localStorage.setItem(CLAVE, '{no es json');

    const r = resolveLeadModalVariant('senati', 30, () => 0.1);

    expect(r).toEqual({ variant: 'modal', enTest: true, esNueva: true, percent: 30 });
  });
});

describe('peekLeadModalVariant', () => {
  it('sin sorteo guardado devuelve null y no escribe nada', () => {
    expect(peekLeadModalVariant('senati', 30)).toBeNull();
    expect(localStorage.getItem(CLAVE)).toBeNull();
  });

  it('devuelve el grupo guardado si se sorteó con el mismo porcentaje', () => {
    resolveLeadModalVariant('senati', 30, () => 0.9);

    expect(peekLeadModalVariant('senati', 30)).toBe('control');
  });

  it('un sorteo hecho con otro porcentaje no cuenta', () => {
    resolveLeadModalVariant('senati', 30, () => 0.9);

    expect(peekLeadModalVariant('senati', 80)).toBeNull();
  });

  it('con 100% no hay test: null aunque haya un sorteo viejo guardado', () => {
    localStorage.setItem(CLAVE, JSON.stringify({ variant: 'modal', percent: 100 }));

    expect(peekLeadModalVariant('senati', 100)).toBeNull();
    expect(peekLeadModalVariant('senati', undefined)).toBeNull();
  });
});
